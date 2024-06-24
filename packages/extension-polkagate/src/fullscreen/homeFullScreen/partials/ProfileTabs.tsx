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

  const [profiles, setProfiles] = useState<string[]>([t('All')]);
  const [selectedProfile, setSelectedProfile] = useState<string>();
  const [isHovered, setIsHovered] = useState<boolean>();

  const onMouseEnter= useCallback(()=>setIsHovered(true),[])
  const onMouseLeave= useCallback(()=>setIsHovered(false),[])

  useEffect(() => {
    if (!orderedAccounts) {
      return
    }

    const texts = [t('All')];
    const hasLocal = orderedAccounts.find(({ account }) => !account.isExternal)
    if (hasLocal) {
      texts.push(t('Local'))
    }

    const hasLedger = orderedAccounts.find(({ account }) => account.isHardware)
    if (hasLedger) {
      texts.push(t('Ledger'))
    }

    const hasWatchOnly = orderedAccounts.find(({ account }) => account.isExternal && !account.isQR && !account.isHardware);
    if (hasWatchOnly) {
      texts.push(t('Watch-only'))
    }

    const hasQrAttached = orderedAccounts.find(({ account: { isQR } }) => isQR);
    if (hasQrAttached) {
      texts.push(t('QR-attached'))
    }

    const userDefinedProfiles = orderedAccounts.map(({ account: { profile } }) => profile as string).filter((item) => !!item);
    const sortedUserDefinedProfiles = [...new Set(userDefinedProfiles)].sort();
    if (sortedUserDefinedProfiles) {
      texts.push(...sortedUserDefinedProfiles)
    }

    setProfiles(texts);
  }, [orderedAccounts]);

  return (
    <Grid container sx={{ position: 'relative', overflow: 'hidden', height: '30px', pb: '10px' }}>
      <Grid container item justifyContent='left'
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          bgcolor: 'backgroundFL.secondary',
          maxWidth: '1282px',
          px: '20px',
          position: 'relative',
          transition: 'transform 0.3s ease-in-out',
          transform: `translateY(-${HIDDEN_PERCENT})`,
          '&:hover': {
            transform: 'translateY(0%)'
          }
        }}>
        {
          profiles?.map((profile, index) => (
            <ProfileTab
              selectedProfile={selectedProfile}
              setSelectedProfile={setSelectedProfile}
              key={index}
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

