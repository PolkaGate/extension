// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { memo, useState } from 'react';

import { Motion } from '../../components';
import { UserDashboardHeader } from '../../partials';
import BodySection from './BodySection';
import ConfirmationOfAction from './ConfirmationOfAction';
import HeaderSection from './HeaderSection';
import { PROFILE_MODE } from './type';

function AccountsLists(): React.ReactElement {
  const [mode, setMode] = useState<PROFILE_MODE>(PROFILE_MODE.NONE);
  const [profileLabelToDelete, setProfileLabelToDelete] = useState<string>();

  return (
    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <Motion style={{ margin: '0 10px', padding: '0 5px' }} variant='slide'>
        <HeaderSection
          mode={mode}
          setMode={setMode}
        />
        <BodySection
          mode={mode}
          setMode={setMode}
          setShowDeleteConfirmation={setProfileLabelToDelete}
        />
      </Motion>
      {profileLabelToDelete &&
        <ConfirmationOfAction
          label={profileLabelToDelete}
          setPopup={setProfileLabelToDelete}
        />}
    </Grid>
  );
}

export default memo(AccountsLists);
