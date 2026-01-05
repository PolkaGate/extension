// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import React, { memo, useCallback, useContext } from 'react';

import { ActionContext } from '../../components';
import { useIsExtensionPopup } from '../../hooks';
import BackButton from './BackButton';
import ProfileActionButton from './ProfileActionButton';
import ProfilesDropDown from './ProfilesDropDown';
import { PROFILE_MODE } from './type';

interface Props {
  mode: PROFILE_MODE;
  setMode: React.Dispatch<React.SetStateAction<PROFILE_MODE>>;
}

function HeaderSection({ mode, setMode }: Props): React.ReactElement {
  const onAction = useContext(ActionContext);
  const isExtension = useIsExtensionPopup();
  const isInSettingMode = mode === PROFILE_MODE.SETTING_MODE;

  const backHome = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <Stack direction='row' justifyContent='space-between' mt='8px'>
      {
        isExtension &&
        <Stack columnGap='8px' direction='row'>
          <BackButton
            onClick={backHome}
          />
          <ProfilesDropDown
            mode={mode}
            setMode={setMode}
          />
        </Stack>
      }
      <ProfileActionButton
        isExtension={isExtension}
        isInSettingMode={isInSettingMode}
        setMode={setMode}
      />
    </Stack>
  );
}

export default memo(HeaderSection);
