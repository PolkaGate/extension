// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { Edit2 } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import { MyTooltip } from '@polkadot/extension-polkagate/src/components';
import useIsHovered from '@polkadot/extension-polkagate/src/hooks/useIsHovered2';
import EditProfile from '@polkadot/extension-polkagate/src/popup/accountsLists/EditProfile';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/util/constants';

import { useTranslation } from '../../hooks';
import useProfileInfo from '../home/useProfileInfo';

interface Props {
  isInSettingMode?: boolean;
  label: string;
  style?: React.CSSProperties;
}

function getExpandedLabel(label: string): string {
  switch (label) {
    case PROFILE_TAGS.LOCAL:
      return 'Local Accounts';
    case PROFILE_TAGS.LEDGER:
      return 'Hardware Accounts';
    default:
      return label;
  }
}

function AccountProfileLabel({ isInSettingMode, label, style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { Icon, bgcolor, color } = useProfileInfo(label);
  const isDefaultProfile = Object.values(PROFILE_TAGS).includes(label);

  const { isHovered, ref } = useIsHovered();

  const [showEditProfile, setShowEditProfile] = React.useState<boolean>(false);

  const canEditProfile = isInSettingMode && !isDefaultProfile;
  const shouldChangeColorOnHover = isHovered && canEditProfile;

  const expandedLabel = useMemo(() => getExpandedLabel(label), [label]);

  const onClick = useCallback(() => {
    canEditProfile && setShowEditProfile(true);
  }, [canEditProfile]);

  return (
    <>
      <Stack
        alignItems='center'
        columnGap='5px'
        direction='row'
        justifyContent='flex-start'
        onClick={onClick}
        ref={ref}
        sx={{ bgcolor: shouldChangeColorOnHover ? 'primary.main' : bgcolor, borderRadius: '9px', cursor: canEditProfile ? 'pointer' : 'default', height: '24px', m: '10px 0 7px 10px', p: '0 7px 0 5px', width: 'fit-content', ...style }}
      >
        <Icon color={shouldChangeColorOnHover ? '#05091C' : color} size='18' variant='Bulk' />
        <Typography color={shouldChangeColorOnHover ? '#05091C' : color} sx={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'noWrap' }} variant='B-2'>
          {
            label
              ? t(expandedLabel)
              : ''
          }
        </Typography>
        {
          canEditProfile &&
          <MyTooltip content={t('Edit profile')}>
            <Edit2 color={shouldChangeColorOnHover ? '#05091C' : '#AA83DC'} size='18' variant='Bulk' />
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
