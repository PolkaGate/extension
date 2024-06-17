// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable react/jsx-first-prop-new-line */

import '@vaadin/icons';

import { Container, Grid, useTheme } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext, Warning } from '../../components';
import { getStorage, type LoginInfo } from '../../components/Loading';
import { useAccountsOrder, useMerkleScience, useTranslation } from '../../hooks';
import { AddNewAccountButton } from '../../partials';
import HeaderBrand from '../../partials/HeaderBrand';
import { EXTENSION_NAME, NEW_VERSION_ALERT } from '../../util/constants';
import Reset from '../passwordManagement/Reset';
import Welcome from '../welcome';
import AccountsTree from './AccountsTree';
import AiBackgroundImage from './AiBackgroundImage';
import Alert from './Alert';
import YouHave from './YouHave';

export default function Home(): React.ReactElement {
  const initialAccountList = useAccountsOrder() as AccountWithChildren[];
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

    getStorage('loginInfo').then((info) => setLoginInfo(info as LoginInfo)).catch(console.error);
  }, []);

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
              showFullScreen
              showMenu
              style={{ '> div div:nth-child(3)': { minWidth: '23%' }, pr: '10px' }}
              text={EXTENSION_NAME}
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
            {initialAccountList?.map((json, index): React.ReactNode => (
              <AccountsTree
                {...json}
                hideNumbers={hideNumbers}
                key={`${index}:${json.address}`}
                quickActionOpen={quickActionOpen}
                setHasActiveRecovery={setHasActiveRecovery}
                setQuickActionOpen={setQuickActionOpen}
              />
            ))}
            {accounts?.length < 4 &&
              <AddNewAccountButton />
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
