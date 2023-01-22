// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Backdrop, Box, ClickAwayListener, Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { threeItemCurveBackgroundBlack, threeItemCurveBackgroundWhite, twoItemCurveBackgroundBlack, twoItemCurveBackgroundWhite } from '../assets/icons';
import { useGenesisHashOptions } from '../hooks';
import { tieAccount } from '../messaging';
import getLogo from '../util/getLogo';

interface Props {
  address: string | undefined;
  currentChainName: string | undefined;
}

function RecentChains({ address, currentChainName }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const SUGGESTED_CHAINS = useMemo(() => (['Polkadot', 'Kusama', 'Westend']), []);
  const chainsToSHow = useMemo(() => SUGGESTED_CHAINS.filter((chainname) => chainname !== currentChainName), [SUGGESTED_CHAINS, currentChainName]);
  const [showRecentChains, setShowRecentChains] = useState<boolean>(false);
  const [notFirstTime, setFirstTime] = useState<boolean>(false);
  const genesisHashes = useGenesisHashOptions();

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

  const twoItemSlide = {
    down: [
      keyframes`
      from{
        z-index: 2;
        transform: scale(1) translate3d(-14px, -30px, 0);
      }
      to{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
    `,
      keyframes`
      from{
        z-index: 2;
        transform: scale(1) translate3d(14px, -30px, 0);
      }
      to{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
    `],
    up: [keyframes`
      from{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
      to{
        z-index: 2;
        transform: scale(1) translate3d(-14px, -30px, 0);
      }
    `,
    keyframes`
      from{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
      to{
        z-index: 2;
        transform: scale(1) translate3d(14px, -30px, 0);
      }
    `
    ]
  };

  const threeItemSlide = {
    down: [
      keyframes`
      from{
        z-index: 2;
        transform: scale(1) translate3d(-28px, -20px, 0);
      }
      to{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
    `,
      keyframes`
      from{
        z-index: 2;
        transform: scale(1) translate3d(0, -31px, 0);
      }
      to{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
    `,
      keyframes`
      from{
        z-index: 2;
        transform: scale(1) translate3d(28px, -20px, 0);
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
        transform: scale(1) translate3d(-28px, -20px, 0);
      }
    `,
      keyframes`
      from{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
      to{
        z-index: 2;
        transform: scale(1) translate3d(0, -31px, 0);
      }
    `,
      keyframes`
      from{
        z-index: 0;
        transform: scale(0) translate3d(0,0,0);
      }
      to{
        z-index: 2;
        transform: scale(1) translate3d(28px, -20px, 0);
      }
    `]
  };

  const toggleRecentChains = useCallback(() => setShowRecentChains(!showRecentChains), [showRecentChains]);
  const closeRecentChains = useCallback(() => setShowRecentChains(false), [setShowRecentChains]);

  const selectNetwork = useCallback((newGenesisHash: string) => {
    const selectedGenesisHash = genesisHashes.find((option) => option.text.replace(' Relay Chain', '')?.replace(' Network', '').toLowerCase() === newGenesisHash)?.value;

    setFirstTime(false);
    address && selectedGenesisHash && tieAccount(address, selectedGenesisHash).catch(console.error);
  }, [address, genesisHashes]);

  return (
    <>
      <Backdrop
        onClick={toggleRecentChains}
        open={showRecentChains}
        sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)', position: 'absolute', zIndex: 1 }}
      >
      </Backdrop>
      <Grid alignItems='center' container height='20px' mr='5px' position='relative' width='20px'>
        {showRecentChains
          ? <ClickAwayListener onClickAway={closeRecentChains}>
            <Grid item onClick={toggleRecentChains} sx={{ cursor: 'pointer', height: '20px', left: 0, position: 'absolute', top: '-2px', width: '20px', zIndex: 2 }}>
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
              src={getLogo(currentChainName)}
              sx={{ borderRadius: '50%', height: '20px', width: '20px' }}
            />
          </Grid>
        }
        <Box
          component='img'
          display={notFirstTime ? 'inherit' : 'none'}
          src={theme.palette.mode === 'dark'
            ? (chainsToSHow.length === 2 ? twoItemCurveBackgroundBlack : threeItemCurveBackgroundBlack) as string
            : (chainsToSHow.length === 2 ? twoItemCurveBackgroundWhite : threeItemCurveBackgroundWhite) as string
          }
          sx={{
            animationDuration: '100ms',
            animationFillMode: 'forwards',
            animationName: `${showRecentChains ? backgroundSlide.up : backgroundSlide.down}`,
            left: chainsToSHow.length === 2 ? '-32px' : '-41px',
            position: 'absolute',
            top: '-20px',
            zIndex: 2
          }}
        />
        {notFirstTime && chainsToSHow.map((chain, index) => {
          return chain !== currentChainName
            ? (
              <Grid
                item
                key={index}
                // eslint-disable-next-line react/jsx-no-bind
                onClick={() => selectNetwork(chain.toLowerCase())}
                position='absolute'
                sx={{
                  animationDuration: '150ms',
                  animationFillMode: 'forwards',
                  animationName: `${showRecentChains
                    ? (chainsToSHow.length === 2 ? twoItemSlide.up[index] : threeItemSlide.up[index])
                    : chainsToSHow.length === 2 ? twoItemSlide.down[index] : threeItemSlide.down[index]}`,
                  cursor: 'pointer',
                  left: 0,
                  top: '-5px'
                }}
              >
                <Avatar
                  src={getLogo(chain)}
                  sx={{
                    border: '0.5px solid',
                    borderColor: 'text.primary',
                    borderRadius: '50%',
                    height: '22px',
                    width: '22px'
                  }}
                />
              </Grid>)
            : undefined;
        })}
      </Grid>
    </>
  );
}

export default React.memo(RecentChains);
