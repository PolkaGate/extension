// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsOrder } from '..';
import { Grid } from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from '../../../hooks';
import ProfileTab from './ProfileTab';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined;
}

export const HIDDEN_PERCENT = '50%';

export default function ProfileTabs({ orderedAccounts }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [profiles, setProfiles] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>();
  const [isHovered, setIsHovered] = useState<boolean>();

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  useEffect(() => {
    if (!orderedAccounts) {
      return
    }

    const texts = ['All'];
    const hasLocal = orderedAccounts.find(({ account }) => !account.isExternal)
    if (hasLocal) {
      texts.push('Local')
    }

    const hasLedger = orderedAccounts.find(({ account }) => account.isHardware)
    if (hasLedger) {
      texts.push('Ledger')
    }

    const hasWatchOnly = orderedAccounts.find(({ account }) => account.isExternal && !account.isQR && !account.isHardware);
    if (hasWatchOnly) {
      texts.push('Watch-only')
    }

    const hasQrAttached = orderedAccounts.find(({ account: { isQR } }) => isQR);
    if (hasQrAttached) {
      texts.push('QR-attached')
    }

    const userDefinedProfiles = orderedAccounts.map(({ account: { profile } }) => profile as string).filter((item) => !!item);
    const sortedUserDefinedProfiles = [...new Set(userDefinedProfiles)].sort();
    if (sortedUserDefinedProfiles) {
      texts.push(...sortedUserDefinedProfiles)
    }

    setProfiles(texts);
  }, [orderedAccounts]);

  return (
    <Grid container sx={{ position: 'relative', overflow: 'auto', height: '30px', pb: '40px' }}>
      <Grid container item justifyContent='left'
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        columnGap='10px'
        sx={{
          bgcolor: 'backgroundFL.secondary',
          pl: '20px',
          position: 'relative'
        }}>
        {
          profiles.map((profile, index) => (
            <ProfileTab
              selectedProfile={selectedProfile}
              setSelectedProfile={setSelectedProfile}
              key={index}
              index={index}
              isHovered={isHovered}
              text={profile as string}
              orderedAccounts={orderedAccounts}
            />
          ))
        }
      </Grid >
    </Grid>
  );
}
