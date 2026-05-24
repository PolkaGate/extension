// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { IconButton, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { MySwitch } from '@polkadot/extension-polkagate/src/components/index';
import { getAndWatchStorage, setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { useTranslation } from '../../../components/translate';
import AiModelManagement from './AiModelManagement';

export default function AiTransactionInfo(): React.ReactElement {
  const { t } = useTranslation();

  const [enabled, setEnabled] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = getAndWatchStorage(STORAGE_KEY.AI_TX_INFO, setEnabled);

    return () => unsubscribe();
  }, []);

  const openModal = useCallback(() => setShowModal(true), []);

  const onChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setStorage(STORAGE_KEY.AI_TX_INFO, checked).catch(console.error);
    checked && openModal();
  }, [openModal]);

  const closeModal = useCallback(() => setShowModal(false), []);
  const onCancel = useCallback(() => {
    closeModal();
    onChange(undefined as unknown as React.ChangeEvent<HTMLInputElement>, false);
  }, [closeModal, onChange]);

  return (
    <Stack direction='column'>
      <Typography color='text.primary' fontSize='22px' m='45px 0 15px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
        {t('AI Transaction Insights')}
      </Typography>
      <Stack alignItems='center' direction='row' gap='5px' justifyContent='center'>
        <MySwitch
          checked={enabled}
          columnGap='8px'
          label={t('Enable AI transaction insights during dApp signing')}
          onChange={onChange}
        />
        {enabled &&
          <IconButton
            onClick={openModal}
            sx={{ alignSelf: 'flex-end', color: 'text.primary', m: 0, p: '6px', width: 'fit-content' }}
            title={t('Manage AI models')}
          >
            <SettingsOutlinedIcon sx={{ fontSize: '20px' }} />
          </IconButton>}
      </Stack>
      {showModal &&
        <AiModelManagement
          onCancel={onCancel}
          onClose={closeModal}
        />
      }
    </Stack>
  );
}
