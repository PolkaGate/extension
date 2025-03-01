// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Container, Grid, useTheme } from '@mui/material';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import semver from 'semver';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext, Warning } from '../../components';
import { getStorage, type LoginInfo } from '../../components/Loading';
import { useAccountsOrder, useIsHideNumbers, useManifest, useMerkleScience, useProfileAccounts, useTranslation } from '../../hooks';
import { AddNewAccountButton } from '../../partials';
import Reset from '../passwordManagement/Reset';
import Welcome from '../welcome';
import AccountsTree from './AccountsTree';
import AiBackgroundImage from './AiBackgroundImage';
import ProfileTabs from './ProfileTabs';
import WhatsNew from './WhatsNew';
import YouHave from './YouHave';

export default function Home(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const manifest = useManifest();
  const accountsOrder = useAccountsOrder(true);
  const profileAccounts = useProfileAccounts(accountsOrder);
  const { hierarchy } = useContext(AccountContext);

  useMerkleScience(undefined, undefined, true); // to download the data file

  const { isHideNumbers } = useIsHideNumbers();

  const [show, setShowAlert] = useState<boolean>(false);
  const [quickActionOpen, setQuickActionOpen] = useState<string | boolean>();
  const [hasActiveRecovery, setHasActiveRecovery] = useState<string | null | undefined>(); // if exists, include the account address
  const [loginInfo, setLoginInfo] = useState<LoginInfo>();
  const [bgImage, setBgImage] = useState<string | undefined>();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  const initialAccountList = useMemo((): AccountWithChildren[] => profileAccounts?.map(({ account }) => account) || [], [profileAccounts]);

  useEffect(() => {
    if (!manifest?.version) {
      return;
    }

    try {
      const usingVersion = window.localStorage.getItem('using_version');

      if (!usingVersion) {
        window.localStorage.setItem('using_version', manifest.version);
        setShowAlert(true);
      } else if (semver.lt(usingVersion, manifest.version)) {
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error while checking version:', error);
    }
  }, [manifest?.version]);

  useEffect(() => {
    cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);

    getStorage('loginInfo').then((info) => setLoginInfo(info as LoginInfo)).catch(console.error);
  }, []);

  return (
    <>
      <WhatsNew
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
          height: window.innerHeight,
          position: 'relative'
        }}
        >
          <YouHave />
          {hasActiveRecovery &&
            <Grid container item sx={{ '> div.belowInput .warningImage': { fontSize: '18px' }, '> div.belowInput.danger': { m: 0, position: 'relative' }, height: '55px', pt: '8px', width: '92%' }}>
              <Warning
                fontSize='16px'
                fontWeight={400}
                isBelowInput
                isDanger
                theme={theme}
              >
                {t('Suspicious recovery detected on one or more of your accounts.')}
              </Warning>
            </Grid>
          }
          <ProfileTabs orderedAccounts={accountsOrder} />
          <Container disableGutters sx={[{ m: 'auto', maxHeight: `${self.innerHeight - (hasActiveRecovery ? 252 : 197)}px`, overflowY: 'scroll', pb: '10px', px: '4%' }]}>
            {initialAccountList.map((json, index): React.ReactNode => (
              <AccountsTree
                {...json}
                address={json.address}
                hideNumbers={isHideNumbers}
                key={index}
                quickActionOpen={quickActionOpen}
                setHasActiveRecovery={setHasActiveRecovery}
                setQuickActionOpen={setQuickActionOpen}
              />
            ))}
            {initialAccountList?.length < 4 &&
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
