// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { getProfileColor } from '@polkadot/extension-polkagate/src/util/utils';

import { useIsExtensionPopup, useProfiles, useSelectedProfile, useTranslation } from '../../hooks';

interface Props {
  account: AccountJson | undefined;
  parentName: string | undefined;
  ml?: string;
  right?: string;
}

function AccountLabel({ account, ml, parentName, right }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const isExtensionMode = useIsExtensionPopup();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedProfile = useSelectedProfile();
  const { accountProfiles, defaultProfiles, userDefinedProfiles } = useProfiles(account);

  const containerMaxWidth = useMemo(() => isExtensionMode ? '300px' : '700px', [isExtensionMode]);

  const getColorOfUserDefinedProfile = useCallback((profile: string) => {
    if (userDefinedProfiles.length === 0 && defaultProfiles.length === 0) {
      return theme.palette.nay.main;
    }

    const profiles = defaultProfiles.concat(userDefinedProfiles);
    const index = profiles.findIndex((p) => p === profile);

    return getProfileColor(index, theme);
  }, [defaultProfiles, theme, userDefinedProfiles]);

  const shadow = useCallback((profile: string) => `0px 0px 2px 1px ${getColorOfUserDefinedProfile(profile)}`, [getColorOfUserDefinedProfile]);

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

    if (selectedProfile === undefined) {
      return [];
    }

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
    <Grid
      container
      item
      justifyContent='flex-end'
      ref={scrollContainerRef}
      sx={{ display: 'flex', flexWrap: 'nowrap', fontSize: '10px', height: '18px', left: right ? undefined : ml || '15px', overflowX: 'scroll', position: 'absolute', px: 1, right, top: 0, whiteSpace: 'nowrap', width: containerMaxWidth, zIndex: 1 }}
    >
      {profiles?.map((profile, index) =>
        <Grid
          key={index}
          sx={{
            borderRadius: '0 0 2px 2px',
            boxShadow: shadow(profile),
            color: 'secondary.contrastText',
            fontSize: '11px',
            height: '16px',
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
  );
}

export default React.memo(AccountLabel);
