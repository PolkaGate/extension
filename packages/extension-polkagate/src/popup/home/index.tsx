// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import '@vaadin/icons';

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext, Warning } from '../../components';
import { getStorage, LoginInfo } from '../../components/Loading';
import { useMerkleScience, useTranslation } from '../../hooks';
import { tieAccount, windowOpen } from '../../messaging';
import HeaderBrand from '../../partials/HeaderBrand';
import { NEW_VERSION_ALERT, TEST_NETS } from '../../util/constants';
import Welcome from '../welcome';
import Reset from '../welcome/Reset';
import AccountsTree from './AccountsTree';
import AiBackgroundImage from './AiBackgroundImage';
import Alert from './Alert';
import YouHave from './YouHave';


export default function Home(): React.ReactElement {
  const { t } = useTranslation();
  const { accounts, hierarchy } = useContext(AccountContext);
  const theme = useTheme();

  useMerkleScience(undefined, undefined, true); // to download the data file

  const [hideNumbers, setHideNumbers] = useState<boolean>();
  const [show, setShowAlert] = useState<boolean>(false);
  const [quickActionOpen, setQuickActionOpen] = useState<string | boolean>();
  const [hasActiveRecovery, setHasActiveRecovery] = useState<string | null | undefined>(); // if exists, include the account address
  const [loginInfo, setLoginInfo] = useState<LoginInfo>();
  const [bgImage, setBgImage] = useState<string | undefined>();

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

    getStorage('loginInfo').then(setLoginInfo).catch(console.error);
  }, []);

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
    }), [hierarchy]);

  const onCreate = useCallback((): void => {
    windowOpen('/account/create').catch(console.error);
  }, []);

  const AddNewAccount = () => (
    <Grid alignItems='center' container onClick={onCreate} sx={{ '&:hover': { opacity: 1 }, backgroundColor: 'background.paper', borderColor: 'secondary.main', borderRadius: '10px', borderStyle: 'solid', borderWidth: '0.5px', bottom: '20px', cursor: 'pointer', my: '10px', opacity: '0.7', padding: '8px 7px 8px 22px', position: 'absolute', transition: 'opacity 0.3s ease', width: 'inherit', zIndex: 1 }
    }>
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
          <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '24px', stroke: `${theme.palette.secondary.light}`, strokeWidth: 1.5 }} />
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
      {hierarchy.length === 0
        ? loginInfo?.status === 'forgot'
          ? <Reset />
          : <Welcome />
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
              text={'Polkagate'}
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
          <YouHave hideNumbers={hideNumbers} setHideNumbers={setHideNumbers} />
          <Container disableGutters sx={[{ m: 'auto', maxHeight: `${self.innerHeight - (hasActiveRecovery ? 220 : 165)}px`, mt: '10px', overflowY: 'scroll', p: 0, width: '92%' }]}>
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
          <AiBackgroundImage
            bgImage={bgImage}
            setBgImage={setBgImage}
          />
        </Grid>
      }
    </>
  );
}
