// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity, Infotip, ShowBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import getPoolAccounts from '../../../util/getPoolAccounts';
import { MyPoolInfo, PoolInfo } from '../../../util/types';
import RewardsDetail from '../solo/rewards/RewardsDetail';
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
  const theme = useTheme();
  const [isOpenPoolInfo, setOpenPoolInfo] = useState<boolean>(false);
  const [showRewardsChart, setShowRewardsChart] = useState<boolean>(false);

  const rewardDestinationAddress = pool?.accounts?.rewardId || getPoolAccounts(api, pool.poolId).rewardId;
  const token = pool?.token || (api && api.registry.chainTokens[0]);
  const decimal = pool?.decimal || (api && api.registry.chainDecimals[0]);

  const openPoolInfo = useCallback(() => setOpenPoolInfo(!isOpenPoolInfo), [isOpenPoolInfo]);

  const poolStaked = pool?.stashIdAccount?.stakingLedger?.active || pool?.bondedPool?.points;
  const poolStatus = pool?.bondedPool?.state ? String(pool.bondedPool.state) : undefined;
  const chainName = chain?.name?.replace(' Relay Chain', '');

  const onRewardsChart = useCallback(() => {
    setShowRewardsChart(true);
  }, []);

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
                <Grid fontSize='16px' fontWeight={400} item justifyContent='center' overflow='hidden' textAlign='center' textOverflow='ellipsis' whiteSpace='nowrap' width={showInfo ? '92%' : '100%'}>
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
                <Typography fontSize='12px' lineHeight='30px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} textAlign='center' width='13%'>
                  {t<string>('Index')}
                </Typography>
                <Typography fontSize='12px' lineHeight='30px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} textAlign='center' width='30%'>
                  {t<string>('Staked')}
                </Typography>
                <Typography fontSize='12px' lineHeight='30px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} textAlign='center' width='18%'>
                  {t<string>('Members')}
                </Typography>
                <Typography fontSize='12px' lineHeight='30px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} textAlign='center' width='22%'>
                  {t<string>('Status')}
                </Typography>
                <Typography fontSize='12px' lineHeight='30px' textAlign='center' width='16%'>
                  {t<string>('Rewards')}
                </Typography>
              </Grid>
              <Grid container fontSize='14px' fontWeight={400} item lineHeight='37px' textAlign='center'>
                <Grid alignItems='center' item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='13%'>
                  {pool.poolId.toString()}
                </Grid>
                <Grid alignItems='center' container item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='30%'>
                  <ShowBalance
                    api={api}
                    balance={poolStaked}
                    decimal={pool?.decimal}
                    decimalPoint={2}
                    height={22}
                    token={pool?.token}
                  />
                </Grid>
                <Grid alignItems='center' item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='18%'>
                  {pool.bondedPool?.memberCounter?.toString()}
                </Grid>
                <Grid alignItems='center' container item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='22%'>
                  {mode === 'Default' ? poolStatus : mode}
                </Grid>
                <Grid alignItems='center' item justifyContent='center' onClick={onRewardsChart} width='16%' sx={{ cursor: 'pointer' }}>
                  <vaadin-icon icon='vaadin:bar-chart-h' style={{ height: '16px', width: '16px', color: `${mode === 'Creating' ? theme.palette.text.disabled : theme.palette.secondary.main}` }} />
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
          poolId={pool.poolId}
          setShowPoolInfo={setOpenPoolInfo}
          showPoolInfo={isOpenPoolInfo}
        />
      }
      {showRewardsChart && chain && rewardDestinationAddress && token && token && mode !== 'Creating' &&
        <RewardsDetail
          api={api}
          chain={chain}
          chainName={chainName}
          decimal={decimal}
          rewardDestinationAddress={rewardDestinationAddress}
          setShow={setShowRewardsChart}
          show={showRewardsChart}
          token={token}
        />
      }
    </>
  );
}
