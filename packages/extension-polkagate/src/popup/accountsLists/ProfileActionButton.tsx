// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box } from '@mui/material';
import { AddCircle, Setting2 } from 'iconsax-react';
import React, { memo, useCallback } from 'react';

import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/util/constants';

import { MyTooltip } from '../../components';
import { useSelectedProfile, useTranslation } from '../../hooks';
import { PROFILE_MODE } from './type';

interface Props {
  isInSettingMode: boolean;
  setMode: React.Dispatch<React.SetStateAction<PROFILE_MODE>>;
  isExtension: boolean;
}

function ProfileActionButton ({ isExtension, isInSettingMode, setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const selectedProfile = useSelectedProfile();

  const disabledSettings = selectedProfile === PROFILE_TAGS.LOCAL; // Do not let users to remove or edit the local profile
  const ActionIcon = isInSettingMode ? AddCircle : Setting2;

  const onActionClick = useCallback(() => {
    if (disabledSettings) {
      return; // no settings for local accounts
    }

    isInSettingMode
      ? setMode(PROFILE_MODE.ADD)
      : setMode(PROFILE_MODE.SETTING_MODE);
  }, [disabledSettings, isInSettingMode, setMode]);

  const fsStyle = isExtension ? {} : { position: 'absolute', right: '29px', top: '-42px' };

  return (
    <MyTooltip content={isInSettingMode ? t('Add profile') : t('Profile settings')}>
      <Box alignItems='center' justifyContent='center' onClick={onActionClick} sx={{ '&:hover': { backgroundColor: '#674394' }, bgcolor: '#BFA1FF26', borderRadius: '12px', cursor: disabledSettings ? 'not-allowed' : 'pointer', display: 'flex', height: '32px', width: '32px', ...fsStyle }}>
        <ActionIcon color={disabledSettings ? '#BFA1FF26' : '#AA83DC'} size='18px' variant={isInSettingMode ? 'Bold' : 'Bulk'} />
      </Box>
    </MyTooltip>
  );
}

export default memo(ProfileActionButton);
