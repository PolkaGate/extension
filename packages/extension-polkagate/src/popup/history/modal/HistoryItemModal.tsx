// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { FormatBalance2 } from '../../../components';
import { useTranslation } from '../../../hooks';
import { TransactionDetail } from '../../../util/types';
import { amountToMachine, toShortAddress, upperCaseFirstChar } from '../../../util/utils';

interface Props {
  formatted: string;
  anotherDay: boolean;
  info: TransactionDetail;
  decimal: number | undefined;
  token: string | undefined;
  date?: string;
  path: string | undefined;
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
  setDetailInfo: React.Dispatch<React.SetStateAction<TransactionDetail | undefined>>;
}

export default function HistoryItemModal ({ anotherDay, date, decimal, formatted, info, setDetailInfo, setShowDetail, token }: Props): React.ReactElement {
  const { t } = useTranslation();

  const _goToDetail = useCallback(() => {
    setDetailInfo(info);
    setShowDetail(true);
  }, [info, setDetailInfo, setShowDetail]);

  const action = useMemo(() => upperCaseFirstChar(info.action), [info]);

  const subActionToFrom = useMemo(() => {
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
          <Grid container item sx={{ fontSize: '22px', fontWeight: 300 }} px='10px' xs={11}>
            <Grid container item justifyContent='space-between'>
              <Grid item>
                {action}
              </Grid>
              <Grid item>
                <Typography fontSize='20px' fontWeight={300}>
                  {info?.amount && decimal && token
                    ? <FormatBalance2 decimalPoint={2} decimals={[decimal]} tokens={[info?.token || token]} value={amountToMachine(info.amount, decimal)} />
                    : 'N/A'
                  }
                </Typography>
              </Grid>
            </Grid>
            <Grid container item justifyContent='space-between'>
              <Grid item sx={{ maxWidth: '65%', whiteSpace: 'nowrap', width: 'fit-content' }}>
                <Typography fontSize='16px' fontWeight={200} sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {subActionToFrom}
                </Typography>
              </Grid>
              <Grid item>
                <Typography color={info.success ? 'green' : 'red'} fontSize='16px' fontWeight={400}>
                  {info.success ? t<string>('Completed') : t<string>('Failed')}
                </Typography>
              </Grid>
            </Grid>
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
    </Container>
  );
}
