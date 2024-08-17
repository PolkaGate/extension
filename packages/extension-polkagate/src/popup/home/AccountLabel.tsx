// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { getProfileColor } from '@polkadot/extension-polkagate/src/util/utils';

import { useIsExtensionPopup, useProfiles, useSelectedProfile, useTranslation } from '../../hooks';

interface Props {
  account: AccountJson | undefined;
  parentName: string | undefined;
  ml?: string;
}

export function AccountLabel ({ account, ml, parentName }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const isExtensionMode = useIsExtensionPopup();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedProfile = useSelectedProfile();
  const { accountProfiles, defaultProfiles, userDefinedProfiles } = useProfiles(account);

  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const shadow = useMemo(() => isDarkMode ? '0px 0px 2px 1px rgba(255, 255, 255, 0.15)' : '0px 0px 1px 1px rgba(000, 000, 000, 0.13)', [isDarkMode]);
  const containerMaxWidth = useMemo(() => isExtensionMode ? '300px' : '700px', [isExtensionMode]);

  const getColorOfUserDefinedProfile = useCallback((profile: string) => {
    if (userDefinedProfiles.length === 0 && defaultProfiles.length === 0) {
      return theme.palette.nay.main;
    }

    const profiles = defaultProfiles.concat(userDefinedProfiles);
    const index = profiles.findIndex((p) => p === profile);

    return getProfileColor(index, theme);
  }, [defaultProfiles, theme, userDefinedProfiles]);

  const maybeAccountDefaultProfile = useMemo(() => {
    if (account?.isHardware) {
      if (account?.isGeneric) {
        return t('Ledger-Generic');
      }

      if (account?.isMigration) {
        return t('Ledger-Migration');
      }

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
  }, [account, parentName, t]);

  const profiles = useMemo(() => {
    const profileSet = new Set(accountProfiles);

    if (maybeAccountDefaultProfile) {
      profileSet.add(maybeAccountDefaultProfile);
    }

    if (selectedProfile) {
      profileSet.delete(selectedProfile);
    }

    return Array.from(profileSet);
  }, [accountProfiles, maybeAccountDefaultProfile, selectedProfile]);

  const handleWheel = (event: WheelEvent) => {
    if (scrollContainerRef.current) {
      const { clientWidth, scrollWidth } = scrollContainerRef.current;

      const isScrollable = scrollWidth > clientWidth;

      isScrollable && event.preventDefault();
      scrollContainerRef.current.scrollLeft += (event.deltaY || event.deltaX);
    }
  };

  useEffect(() => {
    const ref = scrollContainerRef.current;

    if (ref) {
      ref.addEventListener('wheel', handleWheel, { passive: false });

      return () => {
        ref.removeEventListener('wheel', handleWheel);
      };
    }

    return undefined;
  }, [profiles.length]);

  return (
    <Grid container item ref={scrollContainerRef} sx={{ display: 'flex', flexWrap: 'nowrap', fontSize: '10px', left: ml || '15px', position: 'absolute', px: 1, top: 0, height: '17px', overflowX: 'scroll', whiteSpace: 'nowrap', width: containerMaxWidth, zIndex: 1 }}>
      {profiles?.map((profile, index) =>
        <Grid
          key={index}
          sx={{
            bgcolor: getColorOfUserDefinedProfile(profile),
            borderRadius: '0 0 5px 5px',
            boxShadow: shadow,
            fontSize: '11px',
            ml: '5px',
            px: 1,
            textWrap: 'nowrap',
            width: 'fit-content'
          }}
        >
          {profile}
        </Grid>
      )}
    </Grid>
  )
};
