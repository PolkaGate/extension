// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack } from '@mui/material';
import { AddCircle, Setting2 } from 'iconsax-react';
import React, { memo, useCallback, useContext } from 'react';

import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';

import { ActionContext, MyTooltip } from '../../components';
import { useSelectedProfile, useTranslation } from '../../hooks';
import BackButton from './BackButton';
import ProfilesDropDown from './ProfilesDropDown';
import { PROFILE_MODE } from './type';

interface Props {
  mode: PROFILE_MODE;
  setMode: React.Dispatch<React.SetStateAction<PROFILE_MODE>>;
}

function HeaderSection({ mode, setMode }: Props): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const selectedProfile = useSelectedProfile();

  const isInSettingMode = mode === PROFILE_MODE.SETTING_MODE;
  const disabledSettings = selectedProfile === PROFILE_TAGS.LOCAL;

  const backHome = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const onActionClick = useCallback(() => {
    if (disabledSettings) {
      return; // no settings for local accounts
    }

    isInSettingMode
      ? setMode(PROFILE_MODE.ADD)
      : setMode(PROFILE_MODE.SETTING_MODE);
  }, [disabledSettings, isInSettingMode, setMode]);

  const ActionIcon = isInSettingMode ? AddCircle : Setting2;

  return (
    <Stack direction='row' justifyContent='space-between' mt='8px'>
      <Stack columnGap='8px' direction='row'>
        <BackButton
          onClick={backHome}
        />
        <ProfilesDropDown
          mode={mode}
          setMode={setMode}
        />
      </Stack>
      <MyTooltip content={t(isInSettingMode ? 'Add profile' : 'Profile settings')}>
        <Box alignItems='center' justifyContent='center' sx={{ '&:hover': { backgroundColor: '#674394' }, bgcolor: '#BFA1FF26', borderRadius: '12px', cursor: disabledSettings ? 'not-allowed' : 'pointer', display: 'flex', height: '32px', width: '32px' }}>
          <ActionIcon color={disabledSettings ? '#BFA1FF26' : '#AA83DC'} onClick={onActionClick} size='18px' variant={isInSettingMode ? 'Bold' : 'Bulk'} />
        </Box>
      </MyTooltip>
    </Stack>
  );
}

export default memo(HeaderSection);
