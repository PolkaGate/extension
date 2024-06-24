// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsOrder } from '..';
import { Grid } from '@mui/material';
import React, { useState, useCallback, useMemo } from 'react';
import ProfileTab from './ProfileTab';
import { useProfiles } from '../../../hooks';

interface Props {
  orderedAccounts: AccountsOrder[] | undefined;
}

export const HIDDEN_PERCENT = '50%';

export default function ProfileTabs({ orderedAccounts }: Props): React.ReactElement {
  const profiles = useProfiles();
  const [selectedProfile, setSelectedProfile] = useState<string>();
  const [isHovered, setIsHovered] = useState<boolean>();

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  const profilesToShow = useMemo(() => {
    if (!profiles) {
      return undefined;
    }

    return profiles.defaultProfiles.concat(profiles.userDefinedProfiles);
  }, [profiles, profiles?.defaultProfiles.length, profiles?.userDefinedProfiles.length]);

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
          profilesToShow?.map((profile, index) => (
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
