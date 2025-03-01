// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AuthUrlInfo } from '@polkadot/extension-base/background/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useState } from 'react';

import { noop } from '@polkadot/util';

import { ActionContext, InputFilter, PButton, TwoButtons } from '../../components';
import { useIsExtensionPopup } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { removeAuthorization } from '../../messaging';
import DappList from './DappList';

interface Props {
  setDappInfo: React.Dispatch<React.SetStateAction<AuthUrlInfo | undefined>>;
  backToAccountFS?: () => void | undefined;
}

export default function ManageAuthorizedDapps({ backToAccountFS, setDappInfo }: Props): React.ReactElement {
  const isExtensionMode = useIsExtensionPopup();
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const [filter, setFilter] = useState<string>('');
  const [toRemove, setToRemove] = useState<string[]>([]);
  const [isBusy, setBusy] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  const onChangeFilter = useCallback((filter: string) => {
    setFilter(filter);
  }, []);

  const onReset = useCallback(() => {
    setToRemove([]);
  }, []);

  const removeAuthorizedDapps = useCallback(() => {
    setBusy(true);

    Promise
      .all(toRemove.map((url) => removeAuthorization(url).catch(console.error)))
      .then(() => {
        setRefresh(true);
        onReset();
      })
      .catch(console.error)
      .finally(() => setBusy(false));
  }, [onReset, toRemove]);

  const onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <>
      <Typography fontSize='14px' fontWeight={300} m='20px auto' width='90%'>
        {t('Control which visible accounts websites can access. Update or deny access by adjusting the access list or deleting the website entry. Only your visible accounts can be accessed.')}
      </Typography>
      <Grid container item position='relative' px='15px' sx={{ '> div': { width: '100%' } }}>
        <InputFilter
          label={t('Search')}
          onChange={onChangeFilter}
          placeholder={'www.example.com'}
          theme={theme}
          value={filter}
          withReset
        />
      </Grid>
      <DappList
        filter={filter}
        maxHeight={isExtensionMode ? window.innerHeight - 400 : 260}
        refresh={refresh}
        setDappInfo={setDappInfo}
        setRefresh={setRefresh}
        setToRemove={setToRemove}
        toRemove={toRemove}
      />
      {toRemove.length === 0 &&
        <PButton
          _ml={isExtensionMode ? undefined : 3}
          _onClick={isExtensionMode ? onBackClick : backToAccountFS ?? noop}
          _width={isExtensionMode ? undefined : 81}
          text={t('Back')}
        />}
      {toRemove.length > 0 &&
        <TwoButtons
          isBusy={isBusy}
          ml={isExtensionMode ? undefined : '3%'}
          onPrimaryClick={removeAuthorizedDapps}
          onSecondaryClick={onReset}
          primaryBtnText={t('Apply')}
          width={isExtensionMode ? undefined : '81%'}
        />
      }
    </>
  );
}
