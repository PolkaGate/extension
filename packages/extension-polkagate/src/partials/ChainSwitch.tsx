// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Backdrop, Box, ClickAwayListener, Grid, keyframes, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { twoItemCurveBackgroundBlack, twoItemCurveBackgroundWhite } from '../assets/icons';
import { useAccount, useChainName, useGenesisHashOptions } from '../hooks';
import { tieAccount } from '../messaging';
import { CROWDLOANS_CHAINS, STAKING_CHAINS } from '../util/constants';
import getLogo from '../util/getLogo';

interface Props {
  address: string | undefined;
  children?: React.ReactNode;
}

function ChainSwitch({ address, children }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { pathname } = useLocation();
  const account = useAccount(address);
  const [showOtherChains, setShowOtherChains] = useState<boolean>(false);
  const [notFirstTime, setFirstTime] = useState<boolean>(false);
  const genesisHashes = useGenesisHashOptions();
  const currentChainNameFromAccount = useChainName(address);
  const [currentChainNameJustSelected, setCurrentChainNameJustSelected] = useState<string>();
  const currentChainName = currentChainNameJustSelected || currentChainNameFromAccount;

  const availableChains = useMemo(() => {
    if (!pathname || !account?.genesisHash) {
      return undefined;
    }

    if (pathname.includes('pool') || pathname.includes('solo')) {
      return STAKING_CHAINS.filter((chain) => chain !== account.genesisHash);
    }

    if (pathname.includes('crowdloans')) {
      return CROWDLOANS_CHAINS.filter((chain) => chain !== account.genesisHash);
    }

    return undefined;
  }, [account?.genesisHash, pathname]);

  const chainNamesToShow = useMemo(() => {
    if (!availableChains || !account?.genesisHash) {
      return undefined;
    }

    const filteredChains = availableChains.map((r) => genesisHashes.find((g) => g.value === r)).filter((chain) => chain?.value !== account.genesisHash);
    const chainNames = filteredChains.map((chain) => chain && chain.text?.replace(' Relay Chain', '')?.replace(' Network', ''));

    return chainNames;
  }, [account?.genesisHash, availableChains, genesisHashes]);

  useEffect(() => {
    showOtherChains && setFirstTime(true);
  }, [showOtherChains]);

  const backgroundSlide = {
    down: keyframes`
    from{
      transform: scale(0) translateY(0);
    }
    to{
      transform: scale(1) translateY(28px);
    }`,
    up: keyframes`
    from{
      transform: scale(1) translateY(28px);
    }
    to{
      transform: scale(0) translateY(0);
    }`
  };

  const twoItemSlide = {
    down: [
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
    up: [keyframes`
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

  const selectNetwork = useCallback((newChainName: string) => {
    const selectedGenesisHash = genesisHashes.find((option) => option.text.replace(' Relay Chain', '')?.replace(' Network', '') === newChainName)?.value;

    setCurrentChainNameJustSelected(newChainName);
    setFirstTime(false);
    address && selectedGenesisHash && tieAccount(address, selectedGenesisHash).catch(console.error);
  }, [address, genesisHashes]);

  const toggleChainSwitch = useCallback(() => chainNamesToShow && chainNamesToShow.length > 1 ? setShowOtherChains(!showOtherChains) : selectNetwork(chainNamesToShow[0]), [chainNamesToShow, selectNetwork, showOtherChains]);
  const closeChainSwitch = useCallback(() => setShowOtherChains(false), [setShowOtherChains]);

  return (
    <>
      <Backdrop
        onClick={toggleChainSwitch}
        open={showOtherChains}
        sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.3)', height: '141px', position: 'absolute', zIndex: 1 }}
      >
      </Backdrop>
      <Grid alignItems='center' container width='fit-content'>
        <Grid container item mr='12px' width='fit-content'>
          {children}
        </Grid>
        <Grid container item sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '50%', p: '5px', width: 'fit-content' }}>
          <Grid container height='28px' item position='relative' width='28px'>
            {showOtherChains
              ? <ClickAwayListener onClickAway={closeChainSwitch}>
                <Grid item onClick={toggleChainSwitch} sx={{ cursor: 'pointer', height: '33px', left: '-6px', position: 'absolute', top: '-6px', width: '33px', zIndex: 2 }}>
                  <FontAwesomeIcon
                    color={theme.palette.secondary.light}
                    fontSize='28px'
                    icon={faCircleXmark}
                    style={{ border: '1px solid', borderColor: theme.palette.secondary.light, padding: '5px', borderRadius: '50%', zIndex: 3 }}
                  />
                </Grid>
              </ClickAwayListener>
              : <Grid item onClick={toggleChainSwitch} sx={{ cursor: 'pointer', left: 0, position: 'absolute', top: 0 }}>
                <Avatar
                  src={getLogo(currentChainName)}
                  sx={{ borderRadius: '50%', filter: (currentChainName === 'Kusama' && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: '28px', width: '28px' }}
                />
              </Grid>
            }
            <Box
              component='img'
              display={notFirstTime ? 'inherit' : 'none'}
              src={theme.palette.mode === 'dark'
                ? twoItemCurveBackgroundBlack as string
                : twoItemCurveBackgroundWhite as string
              }
              sx={{
                animationDuration: '150ms',
                animationFillMode: 'forwards',
                animationName: `${showOtherChains ? backgroundSlide.down : backgroundSlide.up}`,
                left: '-52.5px',
                position: 'absolute',
                top: '0',
                transform: 'rotate(180deg)',
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
                  animationName: `${showOtherChains
                    ? twoItemSlide.down[index]
                    : twoItemSlide.up[index]}`,
                  cursor: 'pointer',
                  left: 0,
                  top: '-5px'
                }}
              >
                <Avatar
                  src={getLogo(name)}
                  sx={{
                    border: 'none',
                    borderRadius: '50%',
                    boxShadow: `0px 0px 5px ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}`,
                    filter: (name === 'Kusama' && theme.palette.mode === 'dark') ? 'invert(1)' : '',
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
