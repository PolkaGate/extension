// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { memo, useCallback, useState } from 'react';

import { useIsExtensionPopup, useTranslation } from '@polkadot/extension-polkagate/src/hooks';

import { Motion, SearchField } from '../../components';
import { UserDashboardHeader } from '../../partials';
import BodySection from './BodySection';
import ConfirmationOfAction from './ConfirmationOfAction';
import HeaderSection from './HeaderSection';
import NewProfile from './NewProfile';
import { PROFILE_MODE } from './type';

export function AccountsListManagement({ defaultMode = PROFILE_MODE.NONE, onDone }: { defaultMode?: PROFILE_MODE, onDone?: () => void }): React.ReactElement {
  const isExtension = useIsExtensionPopup();
  const { t } = useTranslation();

  const [searchKeyword, setSearchKeyword] = useState<string>();
  const [mode, setMode] = useState<PROFILE_MODE>(defaultMode);
  const [profileLabelToDelete, setProfileLabelToDelete] = useState<string>();

  const onSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const onApply = useCallback(() => {
    onDone ? onDone() : setMode(PROFILE_MODE.NONE);
  }, [onDone]);

  return (
    <Grid alignContent='flex-start' container item sx={{ height: 'fit-content', position: 'relative' }}>
      <Motion style={{ height: 'calc(100% - 50px)', margin: '0 10px', padding: '0 5px' }} variant='slide'>
        <HeaderSection
          mode={mode}
          setMode={setMode}
        />
        {
          isExtension &&
          <SearchField
            onInputChange={onSearch}
            placeholder={t('🔍 Search accounts')}
            style={{ marginTop: '10px' }}
          />
        }
        <BodySection
          mode={mode}
          onApply={onApply}
          searchKeyword={searchKeyword}
          setMode={setMode}
          setShowDeleteConfirmation={setProfileLabelToDelete}
        />
      </Motion>
      {
        profileLabelToDelete &&
        <ConfirmationOfAction
          label={profileLabelToDelete}
          setPopup={setProfileLabelToDelete}
        />
      }
      {
        mode === PROFILE_MODE.ADD &&
        <NewProfile
          defaultMode={defaultMode}
          setPopup={setMode}
        />
      }
    </Grid>
  );
}

function AccountsLists(): React.ReactElement {
  return (
    <Grid alignContent='flex-start' container sx={{ height: '100%', position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <AccountsListManagement />
    </Grid>
  );
}

export default memo(AccountsLists);
