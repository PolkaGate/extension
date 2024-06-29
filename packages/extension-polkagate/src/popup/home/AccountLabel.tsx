// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { useTranslation, useProfiles } from '../../hooks';
import { getProfileColor } from '../../fullscreen/homeFullScreen/partials/ProfileTab';

interface Props {
  account: AccountJson | undefined;
  parentName: string | undefined;
  ml?: string;
}

export function AccountLabel({ account, ml, parentName }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();

  const { accountProfiles, userDefinedProfiles, defaultProfiles } = useProfiles(account);

  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const shadow = useMemo(() => isDarkMode ? '0px 0px 2px 1px rgba(255, 255, 255, 0.15)' : '0px 0px 1px 1px rgba(000, 000, 000, 0.13)', [isDarkMode]);

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
  }, [account, maybeAccountDefaultProfile]);

  return (
    <Grid container item sx={{ display: 'flex', flexWrap: 'nowrap', fontSize: '10px', ml: ml || '15px', position: 'absolute', px: 1, width: '100%', top: 0 }}>
      {profiles?.map((profile, index) =>
        <Grid key={index} sx={{ boxShadow: shadow, borderRadius: '0 0 5px 5px', bgcolor: getColorOfUserDefinedProfile(profile), fontSize: '11px', ml: '5px', px: 1, width: 'fit-content' }}>
          {profile}
        </Grid>
      )}
    </Grid>
  )
};

