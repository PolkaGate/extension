// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { FormatBalance2 } from '../../../components';
import { useTranslation } from '../../../hooks';
import { TransactionDetail } from '../../../util/types';
import { amountToMachine, toShortAddress, upperCaseFirstChar } from '../../../util/utils';
import Detail from '../Detail';

interface Props {
  formatted: string;
  anotherDay: boolean;
  info: TransactionDetail;
  decimal: number | undefined;
  token: string | undefined;
  date?: string;
  path: string | undefined;
  chainName: string | undefined;
}

export default function HistoryItem({ anotherDay, chainName, date, decimal, formatted, info, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const _goToDetail = useCallback(() => {
    setShowDetail(true);
  }, []);

  const action = useMemo(() => upperCaseFirstChar(info.action), [info]);

  const subAction = useMemo(() => {
    if (info?.subAction) {
      return upperCaseFirstChar(info.subAction);
    }

    if (info?.from?.address === formatted) {
      return `${t('To')}: ${info?.to?.name || toShortAddress(info?.to?.address)}`;
    }

    if (info?.to?.address === formatted) {
      return `${t('From')}: ${info?.from?.name || toShortAddress(info?.from?.address)}`;
    }
  }, [formatted, info?.from?.address, info?.from?.name, info.subAction, info?.to, t]);

  return (
    <Container disableGutters sx={{ marginTop: `${anotherDay ? 20 : -0.8}px` }}>
      {anotherDay && <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
        {date}
      </Grid>
      }
      <Grid alignItems='center' container direction='column' item justifyContent='space-between' sx={{ '> .historyItems:last-child': { border: 'none' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px' }}>
        <Grid className='historyItems' container item py='5px' sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light' }}>
          <Grid container direction='column' item pl='10px' textAlign='left' xs={6} sx={{ fontSize: '22px', fontWeight: 300 }}>
            {action}
            <Typography fontSize='16px' fontWeight={200}>
              {subAction}
            </Typography>
          </Grid>
          <Grid container direction='column' item pr='10px' textAlign='right' xs={5}>
            <Typography fontSize='20px' fontWeight={300}>
              {info?.amount && decimal && token
                ? <FormatBalance2 decimalPoint={2} decimals={[decimal]} tokens={[token]} value={amountToMachine(info.amount, decimal)} />
                : 'N/A'
              }
            </Typography>
            <Typography fontSize='16px' fontWeight={400} color={info.success ? 'green' : 'red'}>
              {info.success ? t<string>('Completed') : t<string>('Failed')}
            </Typography>
          </Grid>
          <Grid alignItems='center' container item sx={{ borderLeft: '1px solid', borderLeftColor: 'secondary.light' }} xs={1}>
            <IconButton
              onClick={_goToDetail}
              sx={{ p: 0 }}
            >
              <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '24px', stroke: '#BA2882', strokeWidth: 2 }} />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
      {showDetail && chainName && token && decimal &&
        <Detail
          formatted={formatted}
          chainName={chainName}
          decimal={decimal}
          info={info}
          setShowDetail={setShowDetail}
          showDetail={showDetail}
          token={token}
        />
      }
    </Container>
  );
};
