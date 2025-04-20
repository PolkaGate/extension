// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsOrder } from '@polkadot/extension-polkagate/util/types';

import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { useAccountsOrder, useProfileAccounts, useProfiles, useSelectedProfile, useTranslation } from '../../hooks';
import { setStorage } from '../../util';
import useProfileInfo from './useProfileInfo';

function Tab ({ initialAccountList, label }: { initialAccountList: AccountsOrder[] | undefined, label: string }): React.ReactElement {
  const { t } = useTranslation();
  const profileAccounts = useProfileAccounts(initialAccountList, label);
  const selectedProfile = useSelectedProfile();
  const profileInfo = useProfileInfo(label);

  const [hovered, setHovered] = useState(false);

  const toggleHover = useCallback(() => setHovered(!hovered), [hovered]);

  const isSelected = selectedProfile === label;

  const onClick = useCallback(() => {
    setStorage('profile', label).catch(console.error);
  }, [label]);

  return (
    <Stack
      direction='column'
      onClick={onClick}
      onMouseEnter={toggleHover} onMouseLeave={toggleHover} sx={{ cursor: 'pointer', width: 'fit-content' }}>
      <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='flex-start' sx={{ mt: '10px' }}>
        <profileInfo.Icon color={isSelected || hovered ? '#FF4FB9' : '#AA83DC'} size='18' variant='Bulk' />
        <Typography color={hovered ? '#FF4FB9' : '#EAEBF1'} variant='B-2' sx={{ textWrap: 'nowrap', transition: 'all 250ms ease-out' }}>
          {t(label)}
        </Typography>
        <Box alignItems='center' sx={{ bgcolor: isSelected ? '#FF4FB926' : '#AA83DC26', borderRadius: '1024px', display: 'flex', height: '19px', px: '10px' }}>
          <Typography color={isSelected ? '#FF4FB9' : '#AA83DC'} variant='B-1'>
            {profileAccounts?.length ?? 0}
          </Typography>
        </Box>
      </Stack>
      {isSelected &&
        <Box sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', height: '2px', mt: '10px', width: '100%' }} />
      }
    </Stack>
  );
}

function ProfileTabsFS (): React.ReactElement {
  const initialAccountList = useAccountsOrder(true);

  const { defaultProfiles, userDefinedProfiles } = useProfiles();

  const profilesToShow = useMemo(() => {
    if (defaultProfiles.length === 0 && userDefinedProfiles.length === 0) {
      return [];
    }

    return defaultProfiles.concat(userDefinedProfiles);
  }, [defaultProfiles, userDefinedProfiles]);

  return (
    <Stack columnGap='20px' direction='row' sx={{ ml: '10px', overflowX: 'scroll', width: '500px' }}>
      {profilesToShow?.map((label, index) => (
        <Tab
          initialAccountList={initialAccountList}
          key={index}
          label={label}
        />
      ))
      }
    </Stack>
  );
}

export default React.memo(ProfileTabsFS);
