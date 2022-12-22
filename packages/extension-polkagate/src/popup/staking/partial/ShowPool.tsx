// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Grid, SxProps, Theme, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity, Infotip, ShowBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import { MyPoolInfo, PoolInfo } from '../../../util/types';
import PoolMoreInfo from './PoolMoreInfo';

interface Props {
  api?: ApiPromise;
  chain?: Chain;
  pool?: MyPoolInfo | PoolInfo;
  label?: string;
  labelPosition?: 'right' | 'left' | 'center';
  mode: 'Joining' | 'Creating' | 'Default';
  style?: SxProps<Theme> | undefined;
  showInfo?: boolean;
}

export default function ShowPool({ api, chain, label, labelPosition = 'left', mode, pool, showInfo, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [isOpenPoolInfo, setOpenPoolInfo] = useState<boolean>(false);

  const openPoolInfo = useCallback(() => setOpenPoolInfo(!isOpenPoolInfo), [isOpenPoolInfo]);

  const poolStaked = pool?.stashIdAccount?.stakingLedger?.active || pool?.bondedPool?.points;
  const poolStatus = pool?.bondedPool?.state;

  return (
    <>
      <Grid container sx={style}>
        <Typography fontSize='16px' fontWeight={400} sx={{ textAlign: labelPosition }} width='100%'>
          {label}
        </Typography>
        <Grid container direction='column' item sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px' }}>
          {pool
            ? <>
              <Grid container item lineHeight='35px' px='5px' sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.main' }}>
                <Grid justifyContent='center' fontSize='16px' fontWeight={400} item overflow='hidden' textAlign='center' textOverflow='ellipsis' whiteSpace='nowrap' width={showInfo ? '92%' : '100%'}>
                  <Infotip text={pool?.metadata ?? t('Unknown')}>
                    {pool?.stashIdAccount?.accountId
                      ? <Identity chain={chain} formatted={pool.stashIdAccount.accountId} identiconSize={25} name={pool?.metadata ?? t('Unknown')} style={{ fontSize: '16px', fontWeight: 400 }} />
                      : <>
                        {pool?.metadata ?? t('Unknown')}
                      </>
                    }
                  </Infotip>
                </Grid>
                {showInfo &&
                  <Grid alignItems='center' container item justifyContent='center' onClick={openPoolInfo} sx={{ cursor: 'pointer' }} width='8%'>
                    <MoreVertIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
                  </Grid>
                }
              </Grid>
              <Grid container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.main', fontWeight: 400 }}>
                <Typography fontSize='12px' lineHeight='30px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} textAlign='center' width='20%'>
                  {t<string>('Index')}
                </Typography>
                <Typography fontSize='12px' lineHeight='30px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} textAlign='center' width='34%'>
                  {t<string>('Staked')}
                </Typography>
                <Typography fontSize='12px' lineHeight='30px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} textAlign='center' width='23%'>
                  {t<string>('Members')}
                </Typography>
                <Typography fontSize='12px' lineHeight='30px' textAlign='center' width='22%'>
                  {t<string>('Status')}
                </Typography>
              </Grid>
              <Grid container fontSize='14px' fontWeight={400} item lineHeight='37px' textAlign='center'>
                <Grid alignItems='center' item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='20%'>
                  {pool.poolId.toString()}
                </Grid>
                <Grid alignItems='center' container item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='34%'>
                  <ShowBalance
                    api={api}
                    balance={poolStaked}
                    decimal={pool?.decimal}
                    decimalPoint={4}
                    height={22}
                    token={pool?.token}
                  />
                </Grid>
                <Grid alignItems='center' item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='23%'>
                  {pool.bondedPool?.memberCounter?.toString()}
                </Grid>
                <Grid alignItems='center' item justifyContent='center' width='22%'>
                  {mode === 'Default' ? poolStatus : mode}
                </Grid>
              </Grid>
            </>
            : <Grid alignItems='center' container justifyContent='center'>
              <Grid item>
                <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={25} />
              </Grid>
              <Typography fontSize='13px' lineHeight='59px' pl='10px'>
                {t<string>('Loading pool information...')}
              </Typography>
            </Grid>
          }
        </Grid>
      </Grid>
      {isOpenPoolInfo && pool && chain &&
        <PoolMoreInfo
          api={api}
          chain={chain}
          pool={pool}
          setShowPoolInfo={setOpenPoolInfo}
          showPoolInfo={isOpenPoolInfo}
        />
      }
    </>
  );
}
