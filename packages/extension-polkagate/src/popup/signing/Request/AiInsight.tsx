// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Decoded } from '../types';

import { Stack, Typography } from '@mui/material';
import { Magicpen } from 'iconsax-react';
import React, { useEffect, useRef, useState } from 'react';

import { explainTransactionWithAi } from '@polkadot/extension-polkagate/src/messaging';

import { MyTooltip, Progress } from '../../../components';
import { useChainInfo, useTranslation } from '../../../hooks';
import { processCall } from './util';

interface Props {
  decoded: Decoded;
  url: string;
  genesisHash: string;
}

const CALLS_TO_PROCESS = ['utility.batch', 'utility.batchAll', 'utility.forceBatch', 'proxy.proxy'];

function AiInsight ({ decoded, genesisHash, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const generatingRef = useRef(false);

  const { chain, chainName, decimal, token } = useChainInfo(genesisHash, true);

  const [aiInfo, setInfo] = useState<string>();

  useEffect(() => {
    if (decoded.method === null || generatingRef.current || !chain) {
      return;
    }

    generatingRef.current = true;

    const txMethod = decoded.method.toPrimitive();
    const txKey = `${decoded.method.section}.${decoded.method.method}`.toLowerCase();
    const { meta, method, section } = !decoded.method ? {} : decoded.method;
    let extra: Record<string, unknown> | string | null = null;

    if (CALLS_TO_PROCESS.includes(txKey)) {
      extra = processCall(txMethod, chain);
    }

    explainTransactionWithAi({
      chainName,
      decimal,
      description: meta?.docs,
      extra,
      method,
      requestedDapp: url,
      section,
      ss58Format: chain.ss58Format,
      token,
      txKey,
      ...txMethod
    })
      .then(setInfo)
      .catch(console.error)
      .finally(() => {
        generatingRef.current = false;
      });
  }, [chain, chainName, decimal, decoded.method, token, url]);

  return (
    <MyTooltip content={aiInfo ?? t('Processing…')}>
      <Stack alignItems='center' columnGap='5px' direction='row' style={{ flexWrap: 'nowrap' }}>
        {aiInfo
          ? <Magicpen color='#AA83DC' size={16} variant='Bold' />
          : <Progress
            size={15}
            style={{ margin: 0 }}
            type='puffLoader'
          />
        }
        <Typography color='primary.main' sx={{ cursor: 'default', whiteSpace: 'nowrap' }} variant='B-2'>
          {t('AI insight')}
        </Typography>
      </Stack>
    </MyTooltip>
  );
}

export default React.memo(AiInsight);
