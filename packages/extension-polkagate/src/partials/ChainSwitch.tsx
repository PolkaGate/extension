// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import type { HexString } from '@polkadot/util/types';

import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Backdrop, ClickAwayListener, Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { GenesisHashOptionsContext } from '../components';
import ThreeItemCurveBackgroundReversed from '../components/SVG/ThreeItemCurveBackgroundReversed';
import TwoItemCurveBackground from '../components/SVG/TwoItemCurveBackground';
import { useInfo, useIsTestnetEnabled } from '../hooks';
import { tieAccount } from '../messaging';
import { CHAINS_WITH_BLACK_LOGO, CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../util/constants';
import getLogo from '../util/getLogo';
import { sanitizeChainName } from '../util/utils';

const BACKGROUND_SLIDE_ANIMATION = {
  DOWN: keyframes`
  from{
    transform: scale(0) translateY(0);
  }
  to{
    transform: scale(1) translateY(28px);
  }`,
  UP: keyframes`
  from{
    transform: scale(1) translateY(28px);
  }
  to{
    transform: scale(0) translateY(0);
  }`
};

const TWO_ITEM_SLIDE_ANIMATION = {
  DOWN: [
    keyframes`
    from{
      z-index: 0;
      transform: scale(0) translate3d(0,0,0);
    }
    to{
      z-index: 2;
      transform: scale(1) translate3d(-22px, 58px, 0);
    }
  `,
    keyframes`
    from{
      z-index: 0;
      transform: scale(0) translate3d(0,0,0);
    }
    to{
      z-index: 2;
      transform: scale(1) translate3d(22px, 58px, 0);
    }
  `],
  UP: [keyframes`
    from{
      z-index: 2;
      transform: scale(1) translate3d(-22px, 58px, 0);
    }
    to{
      z-index: 0;
      transform: scale(0) translate3d(0,0,0);
    }
  `,
  keyframes`
    from{
      z-index: 2;
      transform: scale(1) translate3d(22px, 58px, 0);
    }
    to{
      z-index: 0;
      transform: scale(0) translate3d(0,0,0);
    }
  `
  ]
};

const THREE_ITEM_SLIDE_ANIMATION = {
  DOWN: [
    keyframes`
    to {
      z-index: 2;
      transform: scale(1) translate3d(-38px, 40px, 0);
    }
    from {
      z-index: 0;
      transform: scale(0) translate3d(0,0,0);
    }
  `,
    keyframes`
    to {
      z-index: 2;
      transform: scale(1) translate3d(0, 55px, 0);
    }
    from {
      z-index: 0;
      transform: scale(0) translate3d(0,0,0);
    }
  `,
    keyframes`
    to {
      z-index: 2;
      transform: scale(1) translate3d(38px, 40px, 0);
    }
    from {
      z-index: 0;
      transform: scale(0) translate3d(0,0,0);
    }
  `],
  UP: [
    keyframes`
    to {
      z-index: 0;
      transform: scale(0) translate3d(0,0,0);
    }
    from {
      z-index: 2;
      transform: scale(1) translate3d(-38px, 40px, 0);
    }
  `,
    keyframes`
    to {
      z-index: 0;
      transform: scale(0) translate3d(0,0,0);
    }
    from {
      z-index: 2;
      transform: scale(1) translate3d(0, 55px, 0);
    }
  `,
    keyframes`
    to {
      z-index: 0;
      transform: scale(0) translate3d(0,0,0);
    }
    from {
      z-index: 2;
      transform: scale(1) translate3d(38px, 40px, 0);
    }
  `]
};

interface Props {
  address: string | undefined;
  children?: React.ReactNode;
  invert?: boolean;
  externalChainNamesToShow?: (string | undefined)[] | undefined;
}

function ChainSwitch({ address, children, externalChainNamesToShow, invert }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { pathname } = useLocation();
  const { chainName: currentChainNameFromAccount, genesisHash } = useInfo(address);
  const genesisHashes = useContext(GenesisHashOptionsContext);

  const isTestnetEnabled = useIsTestnetEnabled();

  const [showOtherChains, setShowOtherChains] = useState<boolean>(false);
  const [notFirstTime, setFirstTime] = useState<boolean>(false);
  const [currentChainName, setCurrentChainName] = useState<string | undefined>(currentChainNameFromAccount);

  const isTestnetDisabled = useCallback((name: string | undefined) => !isTestnetEnabled && name?.toLowerCase() === 'westend', [isTestnetEnabled]);

  useEffect(() => {
    currentChainNameFromAccount && setCurrentChainName(currentChainNameFromAccount);
  }, [currentChainNameFromAccount]);

  const availableChains = useMemo(() => {
    if (!pathname || !genesisHash) {
      return undefined;
    }

    if (pathname.includes('pool') || pathname.includes('solo')) {
      return STAKING_CHAINS.filter((chain) => chain !== genesisHash);
    }

    if (pathname.includes('crowdloans')) {
      return CROWDLOANS_CHAINS.filter((chain) => chain !== genesisHash);
    }

    if (pathname.includes('governance')) {
      return GOVERNANCE_CHAINS.filter((chain) => chain !== genesisHash);
    }

    return undefined;
  }, [genesisHash, pathname]);

  const chainNamesToShow = useMemo(() => {
    if (externalChainNamesToShow) {
      return externalChainNamesToShow.filter((name): name is string => !!name);
    }

    if (!availableChains || !genesisHash || !genesisHashes) {
      return undefined;
    }

    return availableChains
      .map((chain) => genesisHashes.find(({ value }) => value === chain))
      .filter((chain) => chain?.value !== genesisHash)
      .map((chain) => chain && sanitizeChainName(chain.text))
      .filter((name): name is string => !!name);
  }, [genesisHash, availableChains, externalChainNamesToShow, genesisHashes]);

  const isThreeItem = useMemo(() => chainNamesToShow && chainNamesToShow.length > 2, [chainNamesToShow]);

  const itemsAnimation = useCallback((index: number) => {
    if (!chainNamesToShow) {
      return undefined;
    } else if (showOtherChains) {
      return isThreeItem
        ? THREE_ITEM_SLIDE_ANIMATION.DOWN[index]
        : TWO_ITEM_SLIDE_ANIMATION.DOWN[index];
    } else {
      return isThreeItem
        ? THREE_ITEM_SLIDE_ANIMATION.UP[index]
        : TWO_ITEM_SLIDE_ANIMATION.UP[index];
    }
  }, [chainNamesToShow, isThreeItem, showOtherChains]);

  useEffect(() => {
    showOtherChains && setFirstTime(true);
  }, [showOtherChains]);

  const selectNetwork = useCallback((newChainName: string) => {
    if (isTestnetDisabled(newChainName)) {
      return;
    }

    const selectedGenesisHash = genesisHashes.find((option) => sanitizeChainName(option.text) === newChainName)?.value as HexString;

    setCurrentChainName(newChainName);
    setFirstTime(false);
    address && selectedGenesisHash && tieAccount(address, selectedGenesisHash).catch((err) => {
      setCurrentChainName(currentChainNameFromAccount);
      console.error(err);
    });
  }, [address, currentChainNameFromAccount, genesisHashes, isTestnetDisabled]);

  const toggleChainSwitch = useCallback(() =>
    chainNamesToShow && (chainNamesToShow.length > 1
      ? setShowOtherChains(!showOtherChains)
      : selectNetwork(chainNamesToShow[0]))
    , [chainNamesToShow, selectNetwork, showOtherChains]);

  const closeChainSwitch = useCallback(() => setShowOtherChains(false), [setShowOtherChains]);

  return (
    <>
      <Backdrop
        onClick={toggleChainSwitch}
        open={showOtherChains}
        sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)', height: '139px', position: 'absolute', zIndex: 1 }}
      >
      </Backdrop>
      <Grid alignItems='center' container width='fit-content'>
        <Grid container item mr='12px' width='fit-content'>
          {children}
        </Grid>
        <Grid container item sx={{ bgcolor: invert ? 'black' : 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '50%', p: '5px', width: 'fit-content' }}>
          <Grid container height='28px' item position='relative' width='28px'>
            {showOtherChains
              ? <ClickAwayListener onClickAway={closeChainSwitch}>
                <Grid item onClick={toggleChainSwitch} sx={{ cursor: 'pointer', height: '33px', left: '-6px', position: 'absolute', top: '-6px', width: '33px', zIndex: 2 }}>
                  <FontAwesomeIcon
                    color={theme.palette.secondary.light}
                    fontSize='28px'
                    icon={faCircleXmark}
                    style={{ border: '1px solid', borderColor: theme.palette.secondary.light, borderRadius: '50%', padding: '5px', zIndex: 3 }}
                  />
                </Grid>
              </ClickAwayListener>
              : <Grid item onClick={toggleChainSwitch} sx={{ cursor: 'pointer', left: 0, position: 'absolute', top: 0 }}>
                <Avatar
                  src={getLogo(currentChainName)}
                  sx={{
                    borderRadius: '50%',
                    filter: (CHAINS_WITH_BLACK_LOGO.includes(currentChainName ?? '') && theme.palette.mode === 'dark') ? 'invert(1)' : '',
                    height: '28px',
                    width: '28px'
                  }}
                />
              </Grid>
            }
            <Grid
              display={notFirstTime ? 'inherit' : 'none'}
              item
              sx={{
                animationDuration: '150ms',
                animationFillMode: 'forwards',
                animationName: `${showOtherChains ? BACKGROUND_SLIDE_ANIMATION.DOWN : BACKGROUND_SLIDE_ANIMATION.UP}`,
                left: '-71px',
                position: 'absolute',
                top: '-18px',
                zIndex: 2
              }}
            >
              {chainNamesToShow && chainNamesToShow.length > 2
                ? <ThreeItemCurveBackgroundReversed mode={theme.palette.mode} />
                : <TwoItemCurveBackground mode={theme.palette.mode} />}
            </Grid>
            {notFirstTime && chainNamesToShow?.map((name, index) => (
              <Grid
                item
                key={index}
                // eslint-disable-next-line react/jsx-no-bind
                onClick={() => selectNetwork(name)}
                position='absolute'
                sx={{
                  animationDuration: '150ms',
                  animationFillMode: 'forwards',
                  animationName: `${itemsAnimation(index)}`,
                  cursor: isTestnetDisabled(name) ? 'default' : 'pointer',
                  left: 0,
                  opacity: isTestnetDisabled(name) ? '0.6' : 1,
                  top: '-5px'
                }}
              >
                <Avatar
                  src={getLogo(name)}
                  sx={{
                    border: 'none',
                    borderRadius: '50%',
                    boxShadow: `0px 0px 5px ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}`,
                    filter: (CHAINS_WITH_BLACK_LOGO.includes(name) && theme.palette.mode === 'dark') ? 'invert(1)' : '',
                    height: '30px',
                    width: '30px'
                  }}
                />
              </Grid>)
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default React.memo(ChainSwitch);
