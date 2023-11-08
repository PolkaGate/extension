// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import '@vaadin/icons';

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Box, Container, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext, Progress, Warning } from '../../components';
import { useMerkleScience, usePrices, useTranslation } from '../../hooks';
import { tieAccount, windowOpen } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';
import { getImage } from '../../util/ai';
import { NEW_VERSION_ALERT, TEST_NETS } from '../../util/constants';
import AddAccount from '../welcome/AddAccount';
import AccountsTree from './AccountsTree';
import Alert from './Alert';
import YouHave from './YouHave';

export default function Home(): React.ReactElement {
  const { t } = useTranslation();
  const { accounts, hierarchy } = useContext(AccountContext);
  const theme = useTheme();

  usePrices(); // update prices for all tokens saved in chainNames
  useMerkleScience(undefined, undefined, true); // to download the data file

  const [hideNumbers, setHideNumbers] = useState<boolean>();
  const [show, setShowAlert] = useState<boolean>(false);
  const [quickActionOpen, setQuickActionOpen] = useState<string | boolean>();
  const [hasActiveRecovery, setHasActiveRecovery] = useState<string | null | undefined>(); // if exists, include the account address
  const [bgImage, setBgImage] = useState<string | null | undefined>();
  const [isFetchingImage, setIsFetchingImage] = useState<boolean>();

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
      setBgImage(res?.backgroundImage?.[theme.palette.mode]);
    });
  }, [theme]);

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

  const _goToCreate = useCallback(
    (): void => {
      windowOpen('/account/create').catch(console.error);
    }, []
  );

  const clearBackground = useCallback((): void => {
    setBgImage(null);
    chrome.storage.local.remove('backgroundImage').catch(console.error);
  }, []);

  const setBackground = useCallback((): void => {
    if (!isFetchingImage) {
      setIsFetchingImage(true);
      getImage(theme).then((img) => {
        setBgImage(img);
        setIsFetchingImage(false);
      }).catch(console.error);
    }
  }, [isFetchingImage, theme]);

  const AddNewAccount = () => (
    <Grid alignItems='center' container onClick={_goToCreate} sx={{
      backgroundColor: 'background.paper',
      borderColor: 'secondary.main',
      borderRadius: '5px',
      borderStyle: 'solid',
      borderWidth: '0.5px',
      cursor: 'pointer',
      my: '10px',
      py: '13.5px',
      pr: '7px',
      pl: '22px'
    }}
    >
      <Grid item xs={1.5}>
        <vaadin-icon icon='vaadin:plus-circle' style={{ height: '36px', color: `${theme.palette.secondary.light}`, width: '36px' }} />
      </Grid>
      <Grid item textAlign='left' xs>
        <Typography fontSize='18px' fontWeight={500} pl='8px' >
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

  return (
    <>
      <Alert
        setShowAlert={setShowAlert}
        show={show}
      />
      {(hierarchy.length === 0)
        ? <AddAccount />
        : (
          <Grid container alignContent='flex-start' sx={{
            background: bgImage && `${theme.palette.mode === 'dark' ? 'linear-gradient( rgba(255, 255, 255, 0),rgba(255, 255, 255, 0.99))' : 'linear-gradient(rgba(255, 255, 255, 0.99), rgba(255, 255, 255, 0))'}` + `, url("data:image/jpeg;base64, ${bgImage}")`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            position: 'relative',
            height: '630px',
            width: '100%' // Set the width to fill the container
          }}>
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
            <Grid container justifyContent='space-between' sx={{ bottom: '33px', position: 'absolute', px: '10px', color:theme.palette.secondary.main }}>
              <Grid item onClick={clearBackground} xs={1}>
                <Typography sx={{ fontSize: '11px', cursor: 'pointer' }}>
                  {t('Clear')}
                </Typography>
              </Grid>
              <Grid alignItems='baseline' container item justifyContent='flex-end' xs>
                <Grid item>
                  {isFetchingImage && <Progress pt='0px' size={10} />}
                </Grid>
                <Grid item onClick={setBackground}>
                  <Typography sx={{ fontSize: '11px', cursor: 'pointer', pl: '5px' }}>
                    {t('Set a new AI generated background')}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )
      }
    </>
  );
}
