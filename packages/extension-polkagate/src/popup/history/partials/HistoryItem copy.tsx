// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { BN } from '@polkadot/util';

import { FormatBalance2 } from '../../../components';
import { useTranslation } from '../../../hooks';
import { SubQueryHistory } from '../../../util/types';
import { toShortAddress, upperCaseFirstChar } from '../../../util/utils';
import Detail from '../Detail';

interface Props {
  address: string;
  anotherDay: boolean;
  info: SubQueryHistory;
  decimal: number | undefined;
  token: string | undefined;
  date?: string;
  path: string | undefined;
  chainName: string | undefined;
}

export default function HistoryItem({ anotherDay, chainName, date, decimal, info, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const _goToDetail = useCallback(() => {
    setShowDetail(true);
  }, []);

  const action = useMemo(() => {
    if (info.transfer) {
      if (info.id.includes('to')) {
        return t('Receive');
      }

      return t('Send');
    }

    if (info.extrinsic) {
      return upperCaseFirstChar(info.extrinsic.module);
    }
  }, [info, t]);

  const subAction = useMemo(() => {
    if (info.transfer) {
      if (info.id.includes('to')) {
        return `${t('From')}: ${toShortAddress(info.transfer.from)}`;
      }

      return `${t('To')}: ${toShortAddress(info.transfer.to)}`;
    }

    if (info.extrinsic) {
      return upperCaseFirstChar(info.extrinsic.call);
    }
  }, [info, t]);

  const success = useMemo((): boolean =>
    !!(info.extrinsic?.success || info.transfer?.success || info.reward?.success)
    , [info]);

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
              {info?.transfer?.amount && decimal && token
                ? <FormatBalance2 decimalPoint={2} decimals={[decimal]} tokens={[token]} value={new BN(info.transfer.amount)} />
                : 'N/A'
              }
            </Typography>
            <Typography fontSize='16px' fontWeight={400} color={success ? 'green' : 'red'}>
              {success ? t<string>('Completed') : t<string>('Failed')}
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
