// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Backdrop, Box, ClickAwayListener, Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { threeItemCurveBackgroundBlack, threeItemCurveBackgroundWhite } from '../assets/icons';
import { useAccount, useGenesisHashOptions } from '../hooks';
import { tieAccount } from '../messaging';
import { CHAINS_WITH_BLACK_LOGO, INITIAL_RECENT_CHAINS_GENESISHASH } from '../util/constants';
import getLogo from '../util/getLogo';
import { sanitizeChainName } from '../util/utils';

interface Props {
  address: string | undefined;
  currentChainName: string | undefined;
}

function RecentChains({ address, currentChainName }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const account = useAccount(address);
  const [showRecentChains, setShowRecentChains] = useState<boolean>(false);
  const [notFirstTime, setFirstTime] = useState<boolean>(false);
  const genesisHashes = useGenesisHashOptions();
  const [recentChains, setRecentChains] = useState<string[]>();
  const [isTestnetEnabled, setIsTestnetEnabled] = useState<boolean>();
  const [currentSelectedChain, setCurrentSelectedChain] = useState<string | undefined>(currentChainName);

  const isTestnetDisabled = useCallback((name: string | undefined) => !isTestnetEnabled && name?.toLowerCase() === 'westend', [isTestnetEnabled]);

  useEffect(() => {
    currentChainName && setCurrentSelectedChain(currentChainName);
  }, [currentChainName]);

  useEffect(() =>
    setIsTestnetEnabled(window.localStorage.getItem('testnet_enabled') === 'true')
    , [showRecentChains]);

  useEffect(() => {
    if (!address || !account) {
      return;
    }

    chrome.storage.local.get('RecentChains', (res) => {
      const allRecentChains = res?.RecentChains;
      const myRecentChains = allRecentChains?.[address] as string[];

      const suggestedRecent = INITIAL_RECENT_CHAINS_GENESISHASH.filter((chain) => account.genesisHash !== chain);

      myRecentChains ? setRecentChains(myRecentChains) : setRecentChains(suggestedRecent);
    });
  }, [account, account?.genesisHash, address]);

  const chainNamesToShow = useMemo(() => {
    if (!(genesisHashes.length) || !(recentChains?.length) || !account) {
      return undefined;
    }

    const filteredChains = recentChains.map((r) => genesisHashes.find((g) => g.value === r)).filter((chain) => chain?.value !== account.genesisHash);
    const chainNames = filteredChains.map((chain) => chain && sanitizeChainName(chain.text));

    return chainNames;
  }, [account, genesisHashes, recentChains]);

  useEffect(() => {
    showRecentChains && setFirstTime(true);
  }, [showRecentChains]);

  const backgroundSlide = {
    down: keyframes`
    from{
      transform: scale(1) translateY(-25px);
    }
    to{
      transform: scale(0) translateY(0);
    }`,
    up: keyframes`
    from{
      transform: scale(0) translateY(0);
    }
    to{
      transform: scale(1) translateY(-25px);
    }`
  };

  const threeItemSlide = {
    down: [
      keyframes`
      from{
        z-index: 2;
        transform: scale(1) translate3d(-26px, -18px, 0);
      }
      to{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
    `,
      keyframes`
      from{
        z-index: 2;
        transform: scale(1) translate3d(0, -30px, 0);
      }
      to{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
    `,
      keyframes`
      from{
        z-index: 2;
        transform: scale(1) translate3d(26px, -18px, 0);
      }
      to{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
    `],
    up: [
      keyframes`
      from{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
      to{
        z-index: 2;
        transform: scale(1) translate3d(-26px, -18px, 0);
      }
    `,
      keyframes`
      from{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
      to{
        z-index: 2;
        transform: scale(1) translate3d(0, -30px, 0);
      }
    `,
      keyframes`
      from{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
      to{
        z-index: 2;
        transform: scale(1) translate3d(26px, -18px, 0);
      }
    `]
  };

  const toggleRecentChains = useCallback(() => setShowRecentChains(!showRecentChains), [showRecentChains]);
  const closeRecentChains = useCallback(() => setShowRecentChains(false), [setShowRecentChains]);

  const selectNetwork = useCallback((newChainName: string) => {
    if (isTestnetDisabled(newChainName)) {
      return;
    }

    const selectedGenesisHash = genesisHashes.find((option) => sanitizeChainName(option.text) === newChainName)?.value;

    setCurrentSelectedChain(newChainName);
    setFirstTime(false);
    address && selectedGenesisHash && tieAccount(address, selectedGenesisHash).catch((error) => {
      setCurrentSelectedChain(currentChainName);
      console.error(error);
    });
  }, [address, currentChainName, genesisHashes, isTestnetDisabled]);

  return (
    <>
      <Backdrop
        onClick={toggleRecentChains}
        open={showRecentChains}
        sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)', borderRadius: '5px', position: 'absolute', zIndex: 1 }}
      >
      </Backdrop>
      <Grid alignItems='center' container height='20px' mr='5px' position='relative' width='20px'>
        {showRecentChains
          ? <ClickAwayListener onClickAway={closeRecentChains}>
            <Grid item onClick={toggleRecentChains} sx={{ cursor: 'pointer', height: '20px', left: 0, position: 'absolute', top: 0, width: '20px', zIndex: 2 }}>
              <FontAwesomeIcon
                color={theme.palette.secondary.light}
                fontSize='20px'
                icon={faCircleXmark}
                style={{ zIndex: 3 }}
              />
            </Grid>
          </ClickAwayListener>
          : <Grid item onClick={toggleRecentChains} sx={{ cursor: 'pointer', left: 0, position: 'absolute', top: 0 }}>
            <Avatar
              src={getLogo(currentSelectedChain)}
              sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(currentSelectedChain) && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: '20px', width: '20px' }}
            />
          </Grid>
        }
        <Box
          component='img'
          display={notFirstTime ? 'inherit' : 'none'}
          src={theme.palette.mode === 'dark'
            ? threeItemCurveBackgroundBlack as string
            : threeItemCurveBackgroundWhite as string
          }
          sx={{
            animationDuration: '150ms',
            animationFillMode: 'forwards',
            animationName: `${showRecentChains ? backgroundSlide.up : backgroundSlide.down}`,
            left: '-41.7px',
            position: 'absolute',
            top: '-18px',
            zIndex: 2
          }}
        />
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
              animationName: `${showRecentChains
                ? threeItemSlide.up[index]
                : threeItemSlide.down[index]}`,
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
                height: '22px',
                width: '22px'
              }}
            />
          </Grid>)
        )}
      </Grid>
    </>
  );
}

export default React.memo(RecentChains);
