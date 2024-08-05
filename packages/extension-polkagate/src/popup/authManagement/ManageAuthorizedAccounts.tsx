// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AuthUrlInfo } from '@polkadot/extension-base/background/handlers/State';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useLayoutEffect, useMemo, useState } from 'react';

import { AccountContext, AccountsTable, TwoButtons } from '../../components';
import { useIsExtensionPopup } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { toggleAuthorization, updateAuthorization } from '../../messaging';
import { areArraysEqual } from '../../util/utils';

interface Props {
  info: AuthUrlInfo;
  onBackClick: () => void;
}

export default function ManageAuthorizedAccounts ({ info, onBackClick }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const isExtensionMode = useIsExtensionPopup();
  const { accounts } = useContext(AccountContext);

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const allAccounts = useMemo(() => accounts.map(({ address }) => address), [accounts]);
  const noChanges = useMemo(() => areArraysEqual([selectedAccounts, info?.authorizedAccounts ?? allAccounts]), [allAccounts, info?.authorizedAccounts, selectedAccounts]);
  const needsToggleAuth = useMemo(() => ((info?.authorizedAccounts && info.authorizedAccounts.length === 0) || selectedAccounts.length === 0) && !noChanges, [info.authorizedAccounts, noChanges, selectedAccounts.length]);
  const areAllCheck = useMemo(() => areArraysEqual([allAccounts, selectedAccounts]), [allAccounts, selectedAccounts]);

  useLayoutEffect(() => {
    setSelectedAccounts(info.authorizedAccounts ?? allAccounts);
  }, [allAccounts, info.authorizedAccounts]);

  const onApply = useCallback((): void => {
    // If there are no authorized accounts, it means the dApp is rejected.
    // To allow access, authorized accounts must be added.

    // When the count of authorized accounts is zero, the dApp is considered rejected.
    // Therefore, it should be toggled to an allowed or rejected state.

    if (needsToggleAuth) {
      toggleAuthorization(info.id).catch(console.error);
    }

    updateAuthorization(selectedAccounts, info.id).then(onBackClick).catch(console.error);
  }, [info.id, needsToggleAuth, onBackClick, selectedAccounts]);

  return (
    <>
      <Grid container item justifyContent='space-between' sx={{ m: '15px auto', width: '92%' }}>
        <Typography>
          {t('Manage connections to ')}
        </Typography>
        <Typography sx={{ textDecoration: 'underline' }}>
          {info.id}
        </Typography>
      </Grid>
      <AccountsTable
        areAllCheck={areAllCheck}
        maxHeight={window.innerHeight - 300}
        selectedAccounts={selectedAccounts}
        setSelectedAccounts={setSelectedAccounts}
        style={{ margin: '35px auto 0', width: '92%' }}
      />
      <TwoButtons
        disabled={noChanges}
        ml={isExtensionMode ? undefined : '0'}
        onPrimaryClick={onApply}
        onSecondaryClick={onBackClick}
        primaryBtnText={t('Apply')}
        width={isExtensionMode ? undefined : '88%'}
      />
    </>
  );
}
