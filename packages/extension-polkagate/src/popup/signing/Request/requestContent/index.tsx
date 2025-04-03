// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-no-bind */

import type { Call } from '@polkadot/types/interfaces';
import type { AnyJson } from '@polkadot/types/types';

import { Grid, Stack, Typography } from '@mui/material';
import { ArrowCircleRight } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { useTranslation } from '../../../../components/translate';
import { toTitleCase } from '../../../../util';
import { type ModeData, SIGN_POPUP_MODE } from '../../types';
import Transfer from './Transfer';

interface Decoded {
  args: AnyJson | null;
  method: Call | null;
}

interface ShowTransactionSummaryProps {
  genesisHash: string;
  info: Call;
}

interface Props {
  genesisHash: string;
  setMode: React.Dispatch<React.SetStateAction<ModeData>>
  decoded: Decoded;
}

function ShowTransactionSummary({ genesisHash, info }: ShowTransactionSummaryProps): React.ReactElement<Props> {
  const action = `${info?.section}_${info?.method}`;

  switch (action) {
    case 'balances_transfer':
    case 'balances_transferKeepAlive':
    case 'balances_transferAll':
      const amount = String(info?.args[1]);
      const to = String(info?.args[0]);

      return (
        <Transfer
          amount={amount}
          genesisHash={genesisHash}
          to={to}
        />
      );

    default:
      return (
        <Stack columnGap='10px' direction='row' justifyContent='start'>
          <Typography color='#AA83DC' fontSize='13px' textTransform='uppercase' variant='B-2'>
            {info?.section}
          </Typography>
          <Typography color='#EAEBF1' fontSize='13px' variant='B-3'>
            {toTitleCase(info?.method)}
          </Typography>
        </Stack>
      );
  }
}

function RequestContent({ decoded, genesisHash, setMode }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const isBatchCall = decoded.method?.method.includes('batch');

  const [iconColor, setIconColor] = useState<string[]>([]);

  const txInfo = (isBatchCall ? decoded?.method?.args[0] : [decoded?.method]) as Call[];

  const onShowDetails = useCallback((index: number) => {
    setMode({
      data: txInfo[index],
      title: t('Request Content'),
      type: SIGN_POPUP_MODE.DETAIL
    });
  }, [setMode, t, txInfo]);

  const handleColor = useCallback((color: string, index: number) => {
    setIconColor((prev) => {
      prev[index] = color;

      return [...prev];
    });
  }, []);

  return (
    <Grid container item sx={{ height: '100px', overflowY: 'scroll' }}>
      {decoded?.method && txInfo?.map((info, index) => (
        <Grid alignItems='center' container item justifyContent='space-between' key={index} sx={{ bgcolor: '#05091C', borderRadius: '14px', height: isBatchCall ? '40px' : '58px', mt: '10px', px: '10px' }}>
          <ShowTransactionSummary
            genesisHash={genesisHash}
            info={info}
          />
          <ArrowCircleRight
            color={iconColor?.[index] ?? '#BEAAD8'}
            onClick={() => onShowDetails(index)}
            onMouseEnter={() => handleColor('#f84bb4', index)}
            onMouseLeave={() => handleColor('#BEAAD8', index)}
            size={isBatchCall ? '20' : '32'}
            style={{ cursor: 'pointer' }}
            variant='Bulk'
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default React.memo(RequestContent);
