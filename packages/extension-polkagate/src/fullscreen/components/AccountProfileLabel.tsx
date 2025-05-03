// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { Edit2 } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import EditProfile from '@polkadot/extension-polkagate/src/popup/accountsLists/EditProfile';

import { MyTooltip } from '../../components';
import { useTranslation } from '../../hooks';
import useProfileInfo from '../home/useProfileInfo';

interface Props {
  isInSettingMode?: boolean;
  label: string;
  style?: React.CSSProperties;
}

function AccountProfileLabel ({ isInSettingMode, label, style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { Icon, bgcolor, color } = useProfileInfo(label);
  const isDefaultProfile = Object.values(PROFILE_TAGS).includes(label);

  const [showEditProfile, setShowEditProfile] = React.useState<boolean>(false);

  const expandedLabel = useMemo(() => {
    switch (label) {
      case PROFILE_TAGS.LOCAL:
        return 'Local Accounts';
      case PROFILE_TAGS.LEDGER:
        return 'Hardware Accounts';
      default:
        return label;
    }
  }, [label]);

  const onClick = useCallback(() => {
    isInSettingMode && setShowEditProfile(true);
  }, [isInSettingMode]);

  return (
    <>
      <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='flex-start' onClick={onClick} sx={{ bgcolor, borderRadius: '9px', cursor: isInSettingMode ? 'pointer' : 'default', height: '24px', m: '10px 0 7px 10px', p: '0 7px 0 5px', width: 'fit-content', ...style }}>
        <Icon color={color} size='18' variant='Bulk' />
        <Typography color={color} sx={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'noWrap' }} variant='B-2'>
          {
            label
              ? t(expandedLabel)
              : ''
          }
        </Typography>
        {
          isInSettingMode && !isDefaultProfile &&
          <MyTooltip content={t('Edit profile')}>
            <Edit2 color='#AA83DC' size='18' variant='Bold' />
          </MyTooltip>
        }
      </Stack>
      {
        showEditProfile &&
        <EditProfile
          profileLabel={label}
          setPopup={setShowEditProfile}
        />
      }
    </>
  );
}

export default React.memo(AccountProfileLabel);
