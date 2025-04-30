// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack } from '@mui/material';
import { AddCircle, Setting2 } from 'iconsax-react';
import React, { memo, useCallback, useContext } from 'react';

import { noop } from '@polkadot/util';

import { ActionContext } from '../../components';
import BackButton from './BackButton';
import ProfilesDropDown from './ProfilesDropDown';
import { PROFILE_MODE } from './type';

interface Props {
  mode: PROFILE_MODE;
  setMode: React.Dispatch<React.SetStateAction<PROFILE_MODE>>;
}

function HeaderSection ({ mode, setMode }: Props): React.ReactElement {
  const onAction = useContext(ActionContext);
  const isInSettingMode = mode === PROFILE_MODE.SETTING_MODE;

  const backHome = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const onActionClick = useCallback(() => {
    console.log('onActionClick')

    isInSettingMode
      ? noop() // on add profile clicked
      : setMode(PROFILE_MODE.SETTING_MODE);
  }, [setMode, isInSettingMode]);

  const ActionIcon = isInSettingMode ? AddCircle : Setting2;
console.log('mode:', mode)

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
      <Box alignItems='center' justifyContent='center' sx={{ '&:hover': { backgroundColor: '#674394' }, bgcolor: '#BFA1FF26', borderRadius: '12px', cursor: 'pointer', display: 'flex', height: '32px', width: '32px' }}>
        <ActionIcon color='#AA83DC' onClick={onActionClick} size='18px' variant={isInSettingMode ? 'Bold' : 'Bulk'} />
      </Box>
    </Stack>
  );
}

export default memo(HeaderSection);
