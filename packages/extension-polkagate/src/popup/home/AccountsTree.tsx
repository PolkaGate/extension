// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson, AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Backdrop, Container, Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { PButton } from '../../components';
import { useActiveRecoveries, useApi, useTranslation, useProfiles } from '../../hooks';
import { windowOpen } from '../../messaging';
import { SOCIAL_RECOVERY_CHAINS } from '../../util/constants';
import getParentNameSuri from '../../util/getParentNameSuri';
import AccountPreview from './AccountPreview';
import { PROFILE_COLORS, getProfileColor } from '../../fullscreen/homeFullScreen/partials/ProfileTab';

interface Props extends AccountWithChildren {
  parentName?: string;
  quickActionOpen?: string | boolean;
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
  hideNumbers: boolean | undefined;
  setHasActiveRecovery: React.Dispatch<React.SetStateAction<string | null | undefined>>;
}

export function AccountLabel({ account, ml, parentName }: { account: AccountJson | undefined, parentName: string | undefined, ml?: string }): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();

  const { userDefinedProfiles, defaultProfiles } = useProfiles();
  const { userDefinedProfiles: accountProfiles } = useProfiles(account);

  const getColorOfUserDefinedProfile = useCallback((profile: string) => {
    if (userDefinedProfiles.length === 0 && defaultProfiles.length === 0) {
      return theme.palette.nay.main;
    }

    const profiles = defaultProfiles.concat(userDefinedProfiles);
    const index = profiles.findIndex((p) => p === profile);

    return getProfileColor(index, theme);
  }, [account, theme]);


  const maybeAccountDefaultProfile = useMemo(() => {
    if (account?.isHardware) {
      return t('Ledger');
    }

    if (account?.isQR) {
      return t('QR-attached');
    }

    if (account?.isExternal) {
      return t('Watch-only');
    }

    if (account?.parentAddress) {
      return t('Derived from {{parentName}}', { replace: { parentName } });
    }

    return undefined;
  }, [account]);

  const profiles = useMemo(() => {
    if (maybeAccountDefaultProfile) {
      accountProfiles.unshift(maybeAccountDefaultProfile)
    }
    return accountProfiles;
  }, [account]);

  return (
    <Grid container item sx={{ display: 'flex', flexWrap: 'nowrap', fontSize: '10px', ml: ml || '15px', position: 'absolute', px: 1, width: '100%', top: 0 }}>
      {profiles?.map((profile) =>
        <Grid item sx={{ bgcolor: getColorOfUserDefinedProfile(profile), fontSize: '10px', ml: '5px', px: 1, width: 'fit-content' }}>
          {profile}
        </Grid>
      )}
    </Grid>
  )
};

export default function AccountsTree({ hideNumbers, parentName, quickActionOpen, setHasActiveRecovery, setQuickActionOpen, suri, ...account }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const api = useApi(SOCIAL_RECOVERY_CHAINS.includes(account?.genesisHash ?? '') ? account.address : undefined);
  const activeRecovery = useActiveRecoveries(api, account.address);

  useEffect(() => {
    setHasActiveRecovery(activeRecovery ? account?.address : null);
  }, [account?.address, activeRecovery, setHasActiveRecovery]);

  const parentNameSuri = getParentNameSuri(parentName, suri);
  const handleClose = useCallback(() => setQuickActionOpen(undefined), [setQuickActionOpen]);

  const goCloseRecovery = useCallback(() => {
    account.address && windowOpen(`/socialRecovery/${account.address}/true`).catch(console.error);
  }, [account.address]);

  return (
    <>
      <Container
        className='tree'
        disableGutters
        sx={{
          backgroundColor: 'background.paper',
          borderColor: activeRecovery ? 'warning.main' : 'secondary.main',
          borderRadius: '5px',
          borderStyle: account?.parentAddress ? 'dashed' : 'solid',
          borderWidth: activeRecovery ? '2px' : '0.5px',
          mb: '6px',
          position: 'relative'
        }}
      >
        <AccountLabel
          account={account}
          parentName={parentNameSuri}
        />
        <AccountPreview
          {...account}
          hideNumbers={hideNumbers}
          parentName={parentName}
          quickActionOpen={quickActionOpen}
          setQuickActionOpen={setQuickActionOpen}
          suri={suri}
        />
        <Backdrop
          onClick={handleClose}
          open={quickActionOpen !== undefined}
          sx={{ bgcolor: quickActionOpen === account.address ? 'transparent' : theme.palette.mode === 'dark' ? 'rgba(23, 23, 23, 0.8)' : 'rgba(241, 241, 241, 0.7)', borderRadius: '5px', bottom: '-1px', left: '-1px', position: 'absolute', right: '-1px', top: '-1px' }}
        />
        {activeRecovery &&
          <Grid container item pb='10px'>
            <PButton
              _mt='1px'
              _onClick={goCloseRecovery}
              text={t<string>('End Recovery')}
            />
          </Grid>}
      </Container>
      {account?.children?.map((child, index) => (
        <AccountsTree
          key={`${index}:${child.address}`}
          {...child}
          hideNumbers={hideNumbers}
          parentName={account.name}
          quickActionOpen={quickActionOpen}
          setHasActiveRecovery={setHasActiveRecovery}
          setQuickActionOpen={setQuickActionOpen}
        />
      ))}
    </>
  );
}
