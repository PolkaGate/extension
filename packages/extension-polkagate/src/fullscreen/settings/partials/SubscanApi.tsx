// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography, useTheme } from '@mui/material';
import { InfoCircle, Key } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { MyTooltip, PasswordInput } from '@polkadot/extension-polkagate/src/components';
import { useAlerts } from '@polkadot/extension-polkagate/src/hooks';
import { getStorage, setStorage } from '@polkadot/extension-polkagate/src/util';

import { useTranslation } from '../../../components/translate';
import { STORAGE_KEY } from '../../../util/constants';

function isValidSubscanKey(key: string): boolean {
  return /^[a-f0-9]{32}$/i.test(key);
}

export default function SubscanApi(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { notify } = useAlerts();

  const [apiKey, setApiKey] = useState<string>();
  const [isError, setError] = useState<boolean>(false);

  const onChange = useCallback((input: string) => {
    setApiKey(input);

    if (!input) {
      setError(false);

      return;
    }

    if (!isValidSubscanKey(input)) {
      setError(true);

      return;
    }

    setError(false);
    setStorage(STORAGE_KEY.SUBSCAN_API_KEY, input)
      .then(() => {
        notify(t('API key saved successfully'), 'success');
      }).catch(console.error);
  }, [notify, t]);

  useEffect(() => {
    getStorage(STORAGE_KEY.SUBSCAN_API_KEY).then((key) => {
      if (typeof key === 'string') {
        setApiKey(key);
      }
    }).catch(console.error);
  }, []);

  return (
    <Stack direction='column' sx={{ width: '100%' }}>
      <Stack alignItems='center' columnGap='6px' direction='row' m='30px 0 12px'>
        <Typography color={!apiKey ? '#FF4FB9' : 'text.primary'} fontSize='22px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
          {t('Subscan API Key')}
        </Typography>
        <MyTooltip
          content={t('Getting an API key from Subscan is easy and free! Just visit https://pro.subscan.io/ and follow the simple steps.')}
        >
          <InfoCircle color={theme.palette.primary.main} size='16' variant='Bold' />
        </MyTooltip>
      </Stack>
      <PasswordInput
        Icon={Key}
        errorMessage={isError ? t('Invalid API key format.') : ''}
        hasError={isError}
        onPassChange={onChange}
        placeholder={'Paste your Subscan API key'}
        value={apiKey ?? ''}
      />
    </Stack>
  );
}
