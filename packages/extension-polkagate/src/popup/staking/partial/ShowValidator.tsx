// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { DirectionsRun as DirectionsRunIcon, WarningRounded as WarningRoundedIcon } from '@mui/icons-material/';
import { Divider, Grid, useTheme } from '@mui/material';
import React from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';

import { Checkbox2, Identity, Infotip, ShowBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import { StakingConsts, ValidatorInfo } from '../../../util/types';

interface Props {
  api?: ApiPromise;
  accountInfo: DeriveAccountInfo | undefined;
  check: boolean;
  isActive: ValidatorInfo | undefined;
  isOversubscribed: {
    notSafe: boolean;
    safe: boolean;
  } | undefined;
  v: ValidatorInfo;
  handleCheck: (checked: boolean, validator: ValidatorInfo) => void;
  chain?: Chain;
  decimal?: number;
  stakingConsts: StakingConsts | null | undefined;
  showCheckbox?: boolean;
  token?: string;
}

function ShowValidator({ accountInfo, api, chain, check, decimal, handleCheck, isActive, isOversubscribed, showCheckbox, stakingConsts, token, v }: Props): React.ReactElement {
  const { t } = useTranslation();
  
  const overSubscriptionAlert1 = t('This validator is oversubscribed but you are within the top {{max}}.', { replace: { max: stakingConsts?.maxNominatorRewardedPerValidator } });
  const overSubscriptionAlert2 = t('This validator is oversubscribed and you are not within the top {{max}} and won\'t get rewards.', { replace: { max: stakingConsts?.maxNominatorRewardedPerValidator } });

  const Div = () => (
    <Grid alignItems='center' item justifyContent='center'>
      <Divider orientation='vertical' sx={{ bgcolor: 'secondary.light', height: '15px', m: '3px 5px', width: '1px' }} />
    </Grid>
  );

  return (
    <Grid container direction='column' item p='3px 5px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='94%'>
      <Grid alignItems='center' container item>
        {showCheckbox &&
          <Grid item width='10%'>
            <Checkbox2
              checked={check}
              onChange={(e) => handleCheck(e, v)}
            />
          </Grid>
        }
        <Grid container fontSize='12px' item overflow='hidden' textAlign='left' textOverflow='ellipsis' whiteSpace='nowrap' width={showCheckbox ? '90%' : '100%'} >
          <Identity
            accountInfo={accountInfo}
            api={api}
            chain={chain}
            formatted={String(v.accountId)}
            identiconSize={24}
            showShortAddress
            style={{ fontSize: '12px' }}
          />
        </Grid>
      </Grid>
      <Grid alignItems='center' container item>
        <Grid alignItems='center' container item maxWidth='50%' sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '23px' }} width='fit-content'>
          {t<string>('Staked:')}
          <Grid fontSize='12px' fontWeight={400} item pl='3px'>
            {v.exposure.total
              ? <ShowBalance
                api={api}
                balance={v.exposure.total}
                decimal={decimal}
                decimalPoint={1}
                height={15}
                skeletonWidth={50}
                token={token}
              />
              : t('waiting')
            }
          </Grid>
        </Grid>
        <Div />
        <Grid alignItems='center' container item sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '23px' }} width='fit-content'>
          {t<string>('Com.')}
          <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='3px'>
            {Number(v.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(v.validatorPrefs.commission) / (10 ** 7)}%
          </Grid>
        </Grid>
        <Div />
        <Grid alignItems='end' container item sx={{ fontSize: '12px', fontWeight: 300, lineHeight: '23px' }} width='fit-content'>
          {t<string>('Nominators:')}
          <Grid fontSize='12px' fontWeight={400} item lineHeight='22px' pl='3px'>
            {v.exposure.others.length || t('N/A')}
          </Grid>
        </Grid>
        <Grid alignItems='center' container item justifyContent='flex-end' sx={{ lineHeight: '23px', pl: '4px' }} width='fit-content'>
          {isActive &&
            <Infotip text={t('Active')}>
              <DirectionsRunIcon sx={{ color: '#1F7720', fontSize: '15px' }} />
            </Infotip>
          }
          {(isOversubscribed?.safe || isOversubscribed?.notSafe) &&
            <Infotip text={isOversubscribed?.safe ? overSubscriptionAlert1 : overSubscriptionAlert2}>
              <WarningRoundedIcon sx={{ color: isOversubscribed?.safe ? '#FFB800' : '#FF002B', fontSize: '15px' }} />
            </Infotip>
          }
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(ShowValidator);
