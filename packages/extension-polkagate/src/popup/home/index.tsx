// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import '@vaadin/icons';

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext, Infotip2, Warning } from '../../components';
import { useMerkleScience, useTranslation } from '../../hooks';
import { tieAccount, windowOpen } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';
import { NEW_VERSION_ALERT, TEST_NETS } from '../../util/constants';
import AddAccount from '../welcome/AddAccount';
import AccountsTree from './AccountsTree';
import Alert from './Alert';
import YouHave from './YouHave';

const imagePath = `https://raw.githubusercontent.com/PolkaGate/backgrounds/main/${process.env.BG_THEME || 'general'}/`;

type BgImage = {
  dark: string;
  light: string;
}

export default function Home(): React.ReactElement {
  const { t } = useTranslation();
  const { accounts, hierarchy } = useContext(AccountContext);
  const theme = useTheme();
  const imgRef = useRef(0);

  // usePrices(); // update prices for all tokens saved in chainNames
  useMerkleScience(undefined, undefined, true); // to download the data file

  const [hideNumbers, setHideNumbers] = useState<boolean>();
  const [show, setShowAlert] = useState<boolean>(false);
  const [quickActionOpen, setQuickActionOpen] = useState<string | boolean>();
  const [hasActiveRecovery, setHasActiveRecovery] = useState<string | null | undefined>(); // if exists, include the account address
  const [bgImage, setBgImage] = useState<string | undefined>();
  const [imageLoadError, setImageLoadError] = useState(false);

  const clearBackground = useCallback((): void => {
    setBgImage(undefined);
    setImageLoadError(true);
    imgRef.current = 0;
    chrome.storage.local.remove('backgroundImage').catch(console.error);
  }, []);

  const testImgUrl = useCallback((url: string) => {
    const testImg = new Image();

    const handleImageError = () => {
      console.log('error handled');
      clearBackground();
    };

    testImg.src = url;
    testImg.onerror = handleImageError;
    testImg.onload = () => setBgImage(url);
  }, [clearBackground]);

  useEffect(() => {
    const isTestnetDisabled = window.localStorage.getItem('testnet_enabled') !== 'true';

    isTestnetDisabled && (
      accounts?.forEach(({ address, genesisHash }) => {
        if (genesisHash && TEST_NETS.includes(genesisHash)) {
          tieAccount(address, null).catch(console.error);
        }
      })
    );
  }, [accounts]);

  useEffect(() => {
    const value = window.localStorage.getItem('inUse_version');

    if (!value) {
      window.localStorage.setItem('inUse_version', NEW_VERSION_ALERT);
    } else if (value !== NEW_VERSION_ALERT) {
      setShowAlert(true);
    }
  }, []);

  useEffect(() => {
    cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
  }, []);

  useEffect(() => {
    chrome.storage.local.get('backgroundImage', (res) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const imgUrl = res?.backgroundImage?.[theme.palette.mode] as string;

      testImgUrl(imgUrl);
    });
  }, [testImgUrl, theme.palette.mode]);

  const sortedAccount = useMemo(() =>
    hierarchy.sort((a, b) => {
      const x = a.name.toLowerCase();
      const y = b.name.toLowerCase();

      if (x < y) {
        return -1;
      }

      if (x > y) {
        return 1;
      }

      return 0;
    })
    , [hierarchy]);

  const onCreate = useCallback(
    (): void => {
      windowOpen('/account/create').catch(console.error);
    }, []
  );

  const setBackground = useCallback((): void => {
    setImageLoadError(false);

    const imageUrl = imagePath + theme.palette.mode + `/${imgRef.current}.jpeg`;

    testImgUrl(imageUrl);
    chrome.storage.local.get('backgroundImage', (res) => {
      const bgImage = (res?.backgroundImage || { dark: '', light: '' }) as BgImage;

      bgImage[theme.palette.mode] = imageUrl;
      chrome.storage.local.set({ backgroundImage: bgImage }).catch(console.error);
    });

    imgRef.current = imgRef.current + 1;
  }, [testImgUrl, theme.palette.mode]);

  const AddNewAccount = () => (
    <Grid alignItems='center' container onClick={onCreate} sx={{
      backgroundColor: 'background.paper',
      borderColor: 'secondary.main',
      borderRadius: '10px',
      borderStyle: 'solid',
      borderWidth: '0.5px',
      bottom: '20px',
      cursor: 'pointer',
      my: '10px',
      pl: '22px',
      position: 'absolute',
      pr: '7px',
      py: '13.5px',
      width: 'inherit',
      zIndex: 1
    }}
    >
      <Grid item xs={1.5}>
        <vaadin-icon icon='vaadin:plus-circle' style={{ height: '36px', color: `${theme.palette.secondary.light}`, width: '36px' }} />
      </Grid>
      <Grid item textAlign='left' xs>
        <Typography fontSize='18px' fontWeight={500} pl='8px'>
          {t('Create a new account')}
        </Typography>
      </Grid>
      <Grid item xs={1}>
        <IconButton sx={{ p: 0 }}>
          <ArrowForwardIosRoundedIcon
            sx={{
              color: 'secondary.light',
              fontSize: '24px',
              stroke: `${theme.palette.secondary.light}`,
              strokeWidth: 1.5
            }}
          />
        </IconButton>
      </Grid>
    </Grid>
  );

  const AiBackgroundLink = () => (
    <Grid container justifyContent='space-between' sx={{ backgroundColor: 'background.default', bottom: '3px', color: theme.palette.text.primary, position: 'absolute', zIndex: 6, p: '0 10px 0' }}>
      <Grid item onClick={clearBackground} xs={1.5}>
        {bgImage && !imageLoadError && <Typography sx={{ cursor: 'pointer', fontSize: '11px', userSelect: 'none' }}>
          {t('Clear')}
        </Typography>
        }
      </Grid>
      <Grid alignItems='baseline' container item justifyContent='flex-end' xs>
        <Grid item onClick={setBackground}>
          <Infotip2 showInfoMark text={t('Click to set an AI-generated background.')}>
            <Typography sx={{ cursor: 'pointer', fontSize: '11px', pl: '5px', userSelect: 'none' }}>
              {t('AI Background')}
            </Typography>
          </Infotip2>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <>
      <Alert
        setShowAlert={setShowAlert}
        show={show}
      />
      {hierarchy.length === 0
        ? <AddAccount />
        : <Grid alignContent='flex-start' container sx={{
          backgroundImage:
            bgImage && (theme.palette.mode === 'dark'
              ? `linear-gradient(180deg, #171717 10.79%, rgba(23, 23, 23, 0.70) 100%), url(${bgImage ?? ''})`
              : `linear-gradient(180deg, #F1F1F1 10.79%, rgba(241, 241, 241, 0.70) 100%), url(${bgImage ?? ''})`),
          backgroundSize: '100% 100%',
          height: window.innerHeight
        }}
        >
          <Grid padding='0px' textAlign='center' xs={12}>
            <HeaderBrand
              showBrand
              showMenu
              text={t<string>('Polkagate')}
            />
          </Grid>
          {hasActiveRecovery &&
            <Grid container item sx={{ '> div.belowInput .warningImage': { fontSize: '18px' }, '> div.belowInput.danger': { m: 0, position: 'relative' }, height: '55px', pt: '8px', width: '92%' }}>
              <Warning
                fontSize='16px'
                fontWeight={400}
                isBelowInput
                isDanger
                theme={theme}
              >
                {t<string>('Suspicious recovery detected on one or more of your accounts.')}
              </Warning>
            </Grid>
          }
          <YouHave
            hideNumbers={hideNumbers}
            setHideNumbers={setHideNumbers}
          />
          <Container
            disableGutters
            sx={[{
              m: 'auto',
              maxHeight: `${self.innerHeight - (hasActiveRecovery ? 220 : 165)}px`,
              mt: '10px',
              overflowY: 'scroll',
              p: 0,
              width: '92%'
            }]}
          >
            {sortedAccount.map((json, index): React.ReactNode => (
              <AccountsTree
                {...json}
                hideNumbers={hideNumbers}
                key={`${index}:${json.address}`}
                quickActionOpen={quickActionOpen}
                setHasActiveRecovery={setHasActiveRecovery}
                setQuickActionOpen={setQuickActionOpen}
              />
            ))}
            {sortedAccount.length < 4 &&
              <AddNewAccount />
            }
          </Container>
          <AiBackgroundLink />
        </Grid>
      }
    </>
  );
}
