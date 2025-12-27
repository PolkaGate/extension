// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Call } from '@polkadot/types/interfaces';
import type { Decoded } from '../types';

import { Stack, Typography } from '@mui/material';
import { Information } from 'iconsax-react';
import React, { useEffect, useState } from 'react';

import { explainTransactionWithAi } from '@polkadot/extension-polkagate/src/messaging';

import { MyTooltip, Progress } from '../../../components';
import { useChainInfo, useTranslation } from '../../../hooks';

interface Props {
  decoded: Decoded;
  url: string;
  genesisHash: string;
}

function AiInsight ({ decoded, genesisHash, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const { chainName, decimal, token } = useChainInfo(genesisHash, true);

  const [aiInfo, setInfo] = useState<string>();

  useEffect(() => {
    if (decoded.method === null) {
      return;
    }

    const txInfo: Call | undefined = (() => {
      if (!decoded.method) {
        return undefined;
      }

      return decoded.method;
    })();

    const extra = txInfo?.argsEntries.map((entry, index) => {
      const [key, _type] = entry; // destructuring to get the key and type from argsEntries
      const value = txInfo.args[index]; // Accessing the corresponding value from args

      return {
        [key]: typeof value === 'object'
          ? JSON.stringify(value, null, 2)
          : ` ${value as string}`
      };
    });

    explainTransactionWithAi({
      chainName,
      decimal,
      decode: decoded.method,
      description: txInfo?.meta.docs,
      extra,
      method: txInfo?.method,
      requestedDapp: url,
      section: txInfo?.section,
      token
    })
      .then(setInfo)
      .catch(console.error);
  }, [chainName, decimal, decoded, token, url]);

  return (
    <MyTooltip content={aiInfo ?? t('Processing…')}>
      <Stack alignItems='center' columnGap='5px' direction='row' style={{ flexWrap: 'nowrap' }}>
        <Typography color='#674394' sx={{ cursor: 'default', whiteSpace: 'nowrap' }} variant='B-2'>
          {t('AI insight')}
        </Typography>
        {aiInfo
          ? <Information color='#674394' size={16} variant='Bold' />
          : <Progress
            size={15}
            style={{ margin: 0 }}
            type='puffLoader'
            />
        }
      </Stack>
    </MyTooltip>
  );
}

export default React.memo(AiInsight);
