// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';

import { ShowBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import { PoolInfo } from '../../../util/types';

interface Props {
  api?: ApiPromise;
  pool: PoolInfo;
  label: string;
  labelPosition?: 'right' | 'left' | 'center';
  mode: 'Joining' | 'Creating';
  style?: SxProps<Theme> | undefined;
}

export default function ShowPool({ api, label, labelPosition = 'left', mode, pool, style }: Props): React.ReactElement {
  const { t } = useTranslation();

  const poolStaked = (points) => {
    const staked = points ? api?.createType('Balance', points) : undefined;

    return staked;
  };

  return (
    <>
      <Grid
        container
        sx={style}
      >
        <Typography
          fontSize='16px'
          fontWeight={400}
          sx={{
            textAlign: labelPosition
          }}
          width='100%'
        >
          {label}
        </Typography>
        <Grid
          container
          direction='column'
          item
          sx={{
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'secondary.main',
            borderRadius: '5px'
          }}
        >
          <Grid
            container
            item
            lineHeight='35px'
            px='5px'
            sx={{
              borderBottom: '1px solid',
              borderBottomColor: 'secondary.main'
            }}
          >
            <Grid
              fontSize='16px'
              fontWeight={400}
              item
              overflow='hidden'
              textAlign='center'
              textOverflow='ellipsis'
              whiteSpace='nowrap'
              width='92%'
            >
              {pool.metadata}
            </Grid>
            <Grid
              alignItems='center'
              container
              item
              justifyContent='center'
              sx={{
                cursor: 'pointer'
              }}
              width='8%'
            >
              <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
            </Grid>
          </Grid>
          <Grid
            container
            item
            sx={{
              borderBottom: '1px solid',
              borderBottomColor: 'secondary.main'
            }}
          >
            <Typography
              fontSize='12px'
              fontWeight={400}
              lineHeight='30px'
              sx={{
                borderRight: '1px solid',
                borderRightColor: 'secondary.main'
              }}
              textAlign='center'
              width='20%'
            >
              {t<string>('Index')}
            </Typography>
            <Typography
              fontSize='12px'
              fontWeight={400}
              lineHeight='30px'
              sx={{
                borderRight: '1px solid',
                borderRightColor: 'secondary.main'
              }}
              textAlign='center'
              width='36%'
            >
              {t<string>('Staked')}
            </Typography>
            <Typography
              fontSize='12px'
              fontWeight={400}
              lineHeight='30px'
              sx={{
                borderRight: '1px solid',
                borderRightColor: 'secondary.main'
              }}
              textAlign='center'
              width='21%'
            >
              {t<string>('Members')}
            </Typography>
            <Typography
              fontSize='12px'
              fontWeight={400}
              lineHeight='30px'
              textAlign='center'
              width='22%'
            >
              {t<string>('Status')}
            </Typography>
          </Grid>
          <Grid
            container
            fontSize='14px'
            fontWeight={400}
            item
            lineHeight='37px'
            textAlign='center'
          >
            <Grid
              alignItems='center'
              item
              justifyContent='center'
              sx={{
                borderRight: '1px solid',
                borderRightColor: 'secondary.main'
              }}
              width='20%'
            >
              {pool.poolId.toString()}
            </Grid>
            <Grid
              alignItems='center'
              item
              justifyContent='center'
              sx={{
                borderRight: '1px solid',
                borderRightColor: 'secondary.main',
                display: 'flex'
              }}
              width='36%'
            >
              <ShowBalance
                api={api}
                balance={poolStaked(pool.bondedPool?.points)}
                decimalPoint={4}
                height={22}
              />
              {mode === 'Creating' &&
                <Typography>
                  *
                </Typography>
              }
            </Grid>
            <Grid
              alignItems='center'
              item
              justifyContent='center'
              sx={{
                borderRight: '1px solid',
                borderRightColor: 'secondary.main'
              }}
              width='21%'
            >
              {pool.bondedPool?.memberCounter?.toString()}
            </Grid>
            <Grid
              alignItems='center'
              item
              justifyContent='center'
              width='22%'
            >
              {mode}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
