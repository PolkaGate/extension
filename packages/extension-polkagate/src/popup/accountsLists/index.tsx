// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { memo, useCallback, useState } from 'react';

import { useIsExtensionPopup, useIsSidePanel, useTranslation } from '@polkadot/extension-polkagate/src/hooks';

import { Motion, SearchField } from '../../components';
import { UserDashboardHeader } from '../../partials';
import BodySection from './BodySection';
import ConfirmationOfAction from './ConfirmationOfAction';
import HeaderSection from './HeaderSection';
import NewProfile from './NewProfile';
import { PROFILE_MODE } from './type';

export function AccountsListManagement({ defaultMode = PROFILE_MODE.NONE, onDone }: { defaultMode?: PROFILE_MODE, onDone?: () => void }): React.ReactElement {
  const isExtension = useIsExtensionPopup();
  const isSidePanel = useIsSidePanel();
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
    <Grid alignContent='flex-start' container item sx={{ flex: isSidePanel ? '1 1 auto' : undefined, height: isSidePanel ? 'auto' : 'fit-content', minHeight: isSidePanel ? 0 : undefined, position: 'relative' }}>
      <Motion style={{ display: isSidePanel ? 'flex' : undefined, flex: isSidePanel ? '1 1 auto' : undefined, flexDirection: isSidePanel ? 'column' : undefined, height: isSidePanel ? 'auto' : 'calc(100% - 50px)', margin: '0 10px', minHeight: isSidePanel ? 0 : undefined, padding: '0 5px' }} variant='slide'>
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
  const isSidePanel = useIsSidePanel();

  return (
    <Grid alignContent='flex-start' container sx={{ flexDirection: isSidePanel ? 'column' : undefined, flexWrap: isSidePanel ? 'nowrap' : undefined, height: '100%', overflow: isSidePanel ? 'hidden' : undefined, position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <AccountsListManagement />
    </Grid>
  );
}

export default memo(AccountsLists);
