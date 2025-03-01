// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import type { HexString } from '@polkadot/util/types';
import type { RecentChainsType } from '../util/types';

import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Backdrop, ClickAwayListener, Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ChainLogo, GenesisHashOptionsContext } from '../components';
import { getStorage } from '../components/Loading';
import ThreeItemCurveBackground from '../components/SVG/ThreeItemCurveBackground';
import { useInfo } from '../hooks';
import { tieAccount } from '../messaging';
import { CHAINS_WITH_BLACK_LOGO, INITIAL_RECENT_CHAINS_GENESISHASH } from '../util/constants';
import getLogo from '../util/getLogo';
import { sanitizeChainName } from '../util/utils';

const BACKGROUND_SLIDE_ANIMATION = {
  DOWN: keyframes`
  from{
    transform: scale(1) translateY(-25px);
  }
  to{
    transform: scale(0) translateY(0);
  }`,
  UP: keyframes`
  from{
    transform: scale(0) translateY(0);
  }
  to{
    transform: scale(1) translateY(-25px);
  }`
};

const THREE_ITEM_SLIDE_ANIMATION = {
  DOWN: [
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
  UP: [
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

interface Props {
  address: string | undefined;
  chainName: string | undefined;
}

function RecentChains({ address, chainName }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { genesisHash } = useInfo(address);
  const genesisHashes = useContext(GenesisHashOptionsContext);

  const [showRecentChains, setShowRecentChains] = useState<boolean>(false);
  // in order to prevent displaying the closing animation
  const [firstTimeCanceler, setFirstTime] = useState<boolean>(false);
  const [recentChains, setRecentChains] = useState<string[]>();
  const [isTestnetEnabled, setIsTestnetEnabled] = useState<boolean>();
  const [currentSelectedChain, setCurrentSelectedChain] = useState<string | undefined>(chainName);

  const isTestnetDisabled = useCallback((name: string | undefined) => !isTestnetEnabled && name?.toLowerCase() === 'westend', [isTestnetEnabled]);

  const initiateRecentChains = useCallback(async (addressKey: string, genesisHash: string) => {
    try {
      const result = await new Promise<{ RecentChains?: RecentChainsType }>((resolve) =>
        chrome.storage.local.get('RecentChains', resolve)
      );

      const allRecentChains = result.RecentChains || {};
      const myRecentChains = allRecentChains[addressKey] || [];

      if (myRecentChains.length === 4) {
        setRecentChains(myRecentChains);
      } else {
        const suggestedRecent = INITIAL_RECENT_CHAINS_GENESISHASH.filter((chain) => genesisHash !== chain);

        setRecentChains(suggestedRecent);

        // Optionally, save the suggested chains back to storage
        allRecentChains[addressKey] = suggestedRecent;
        await new Promise<void>((resolve) =>
          chrome.storage.local.set({ RecentChains: allRecentChains }, resolve)
        );
      }
    } catch (error) {
      console.error('Error initializing recent chains:', error);
      // Optionally, set a default value or handle the error as needed
      setRecentChains([]);
    }
  }, []);

  useEffect(() => {
    showRecentChains && setFirstTime(true);
  }, [showRecentChains]);

  useEffect(() => {
    chainName && setCurrentSelectedChain(chainName);
  }, [chainName]);

  useEffect(() => {
    getStorage('testnet_enabled').then((res) => {
      setIsTestnetEnabled(res as unknown as boolean);
    }).catch(console.error);
  }, [showRecentChains]);

  useEffect(() => {
    if (!address || !genesisHash) {
      return;
    }

    initiateRecentChains(address, genesisHash).catch(console.error);
  }, [genesisHash, address, initiateRecentChains]);

  const chainNamesToShow = useMemo(() => {
    if (!genesisHashes.length || !recentChains?.length || !genesisHash) {
      return undefined;
    }

    const filteredAndSanitized = recentChains
      .filter((recentHash): recentHash is string => recentHash !== genesisHash)
      .map((recentHash) => {
        const chain = genesisHashes.find(({ value }) => value === recentHash);

        return chain ? sanitizeChainName(chain.text) : null;
      })
      .filter((name): name is string => !!name);

    filteredAndSanitized.length > 3 && filteredAndSanitized.shift();

    return filteredAndSanitized.length > 0 ? filteredAndSanitized : undefined;
  }, [genesisHash, genesisHashes, recentChains]);

  const toggleRecentChains = useCallback(() => setShowRecentChains(!showRecentChains), [showRecentChains]);
  const closeRecentChains = useCallback(() => setShowRecentChains(false), [setShowRecentChains]);

  const selectNetwork = useCallback((newChainName: string) => {
    if (isTestnetDisabled(newChainName)) {
      return;
    }

    const selectedGenesisHash = genesisHashes.find((option) => sanitizeChainName(option.text) === newChainName)?.value as HexString;

    setCurrentSelectedChain(newChainName);
    setFirstTime(false);
    address && selectedGenesisHash && tieAccount(address, selectedGenesisHash).catch((error) => {
      setCurrentSelectedChain(chainName);
      console.error(error);
    });
  }, [address, chainName, genesisHashes, isTestnetDisabled]);

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
            <ChainLogo chainName={currentSelectedChain} genesisHash={genesisHash} size={20} />
          </Grid>
        }
        <Grid
          display={firstTimeCanceler ? 'inherit' : 'none'}
          item
          sx={{
            animationDuration: '150ms',
            animationFillMode: 'forwards',
            animationName: `${showRecentChains ? BACKGROUND_SLIDE_ANIMATION.UP : BACKGROUND_SLIDE_ANIMATION.DOWN}`,
            left: '-41.7px',
            position: 'absolute',
            top: '-18px',
            zIndex: 2
          }}
        >
          <ThreeItemCurveBackground mode={theme.palette.mode} />
        </Grid>
        {firstTimeCanceler && chainNamesToShow?.map((name, index) => (
          <Grid item key={index}
            // eslint-disable-next-line react/jsx-no-bind
            onClick={() => selectNetwork(name)}
            sx={{
              animationDuration: '150ms',
              animationFillMode: 'forwards',
              animationName: `${showRecentChains
                ? THREE_ITEM_SLIDE_ANIMATION.UP[index]
                : THREE_ITEM_SLIDE_ANIMATION.DOWN[index]}`,
              cursor: isTestnetDisabled(name) ? 'default' : 'pointer',
              left: 0,
              opacity: isTestnetDisabled(name) ? '0.6' : 1,
              position: 'absolute',
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
