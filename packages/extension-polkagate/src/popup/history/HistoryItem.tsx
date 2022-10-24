// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { identity } from 'sinon-chrome';

import { useTranslation } from '../../hooks';
import { SubQueryHistory } from '../../util/types';

interface Props {
  anotherDay: boolean;
  info: SubQueryHistory;
}

const upperCaseFirstChar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const shorAddress = (addr: string) => addr.slice(0, 4) + '...' + addr.slice(-4);

export default function HistoryItem({ anotherDay, info }: Props): React.ReactElement {
  const { t } = useTranslation();
  const _goToDetail = useCallback(() => {
    return 'ccsdasd';
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
        return `${t('From')}: ${shorAddress(info.transfer.from)}`;
      }

      return `${t('To')}: ${shorAddress(info.transfer.to)}`;
    }

    if (info.extrinsic) {
      return upperCaseFirstChar(info.extrinsic.call);
    }

  }, [info, t]);

  return (
    <Container disableGutters sx={{ marginTop: `${anotherDay ? 20 : 0}px` }} >
      {anotherDay && <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
        {info.timestamp}
      </Grid>
      }
      <Grid
        alignItems='center'
        container
        item
        direction='column'
        justifyContent='space-between'
        sx={{
          '> .historyItems:last-child': {
            border: 'none'
          },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'secondary.light',
          borderRadius: '5px'
        }}
      >
        <Grid
          className='historyItems'
          container
          item
          py='5px'
          sx={{
            borderBottom: '1px solid',
            borderBottomColor: 'secondary.light'
          }}
        >
          <Grid
            container
            direction='column'
            item
            pl='10px'
            textAlign='left'
            xs={5.5}
          >
            <Typography
              fontSize='22px'
              fontWeight={400}
            >
              {action}
            </Typography>
            <Typography
              fontSize='16px'
              fontWeight={300}
            >
              {subAction}
            </Typography>
          </Grid>
          <Grid
            container
            direction='column'
            item
            pr='10px'
            textAlign='right'
            xs={5.5}
          >
            <Typography
              fontSize='20px'
              fontWeight={300}
            >
              amount
            </Typography>
            <Typography
              fontSize='16px'
              fontWeight={400}
              color={info.extrinsic?.success || info.transfer?.success || info.reward?.success ? 'green' : 'red'}
            >
              {(info.extrinsic?.success || info.transfer?.success || info.reward?.success) ? t<string>('Completed') : t<string>('Failed')}
            </Typography>
          </Grid>
          <Grid
            alignItems='center'
            container
            item
            sx={{
              borderLeft: '1px solid',
              borderLeftColor: 'secondary.light'
            }}
            xs={1}
          >
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
};
