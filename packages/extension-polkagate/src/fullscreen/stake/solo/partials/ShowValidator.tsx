// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { StakingConsts, ValidatorInfo } from '../../../../util/types';

import { DirectionsRun as DirectionsRunIcon, WarningRounded as WarningRoundedIcon } from '@mui/icons-material/';
import { Divider, Grid } from '@mui/material';
import React from 'react';

import { BN_ZERO } from '@polkadot/util';

import { Checkbox2, Identity, Infotip, ShowBalance, ShowValue } from '../../../../components';
import { useTranslation, useValidatorApy } from '../../../../hooks';
import { isHexToBn } from '../../../../util/utils';

interface Props {
  api?: ApiPromise;
  accountInfo: DeriveAccountInfo | undefined;
  check?: boolean;
  isActive: boolean | undefined;
  isOversubscribed: {
    notSafe: boolean;
    safe: boolean;
  } | undefined;
  v: ValidatorInfo;
  handleCheck?: (checked: React.ChangeEvent<HTMLInputElement>, validator: ValidatorInfo) => void;
  chain?: Chain | null;
  decimal?: number;
  stakingConsts: StakingConsts | null | undefined;
  showCheckbox?: boolean;
  token?: string;
  allInOneRow?: boolean
}

const Div = () => (
  <Grid alignItems='center' item justifyContent='center'>
    <Divider orientation='vertical' sx={{ bgcolor: 'divider', height: '15px', m: '3px 10px', width: '1px' }} />
  </Grid>
);

function ShowValidator({ accountInfo, allInOneRow = true, api, chain, check, decimal, handleCheck, isActive, isOversubscribed, showCheckbox, stakingConsts, token, v }: Props): React.ReactElement {
  const { t } = useTranslation();

  const isElected = isHexToBn(v.exposure.total.toString()).gt(BN_ZERO);
  const apy = useValidatorApy(api, String(v.accountId), isElected);

  const overSubscriptionAlert1 = t('This validator is oversubscribed but you are within the top {{max}}.', { replace: { max: stakingConsts?.maxNominatorRewardedPerValidator } });
  const overSubscriptionAlert2 = t('This validator is oversubscribed and you are not within the top {{max}} and won\'t get rewards.', { replace: { max: stakingConsts?.maxNominatorRewardedPerValidator } });

  const ifOverSubscribed = isOversubscribed?.safe || isOversubscribed?.notSafe;

  return (
    <Grid alignItems='center' container item p='3px 5px' rowGap={!allInOneRow ? '5px' : undefined} sx={{ borderRight: allInOneRow ? '1px solid' : undefined, borderRightColor: allInOneRow ? 'secondary.light' : undefined }} width={allInOneRow ? '94%' : '100%'}>
      {showCheckbox &&
        <Grid item width='5%'>
          <Checkbox2
            checked={check}
            // eslint-disable-next-line react/jsx-no-bind
            onChange={(e) => handleCheck && handleCheck(e, v)}
          />
        </Grid>
      }
      <Grid container fontSize='14px' item maxWidth={showCheckbox ? '29%' : allInOneRow ? '50%' : '100%'} textAlign='left' width={allInOneRow ? 'fit-content' : '100%'}>
        <Identity
          accountInfo={accountInfo}
          api={api}
          chain={chain}
          formatted={String(v.accountId)}
          identiconSize={20}
          showShortAddress
          style={{ fontSize: '14px' }}
        />
      </Grid>
      {allInOneRow && <Div />}
      <Grid alignItems='center' container item justifyContent={allInOneRow ? 'center' : 'space-between'} maxWidth={allInOneRow ? '50%' : '100%'} sx={{ fontSize: '14px', fontWeight: 300, lineHeight: '23px' }} width={allInOneRow ? 'fit-content' : '100%'}>
        <Grid item>
          {t('Staked')}:
        </Grid>
        <Grid fontSize='14px' fontWeight={400} item pl='3px'>
          {isElected
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
      {allInOneRow && <Div />}
      <Grid alignItems='center' container item justifyContent={allInOneRow ? 'center' : 'space-between'} sx={{ fontSize: '14px', fontWeight: 300, lineHeight: '23px' }} width={allInOneRow ? 'fit-content' : '100%'}>
        <Grid item>
          {t('Comm')}:
        </Grid>
        <Grid fontSize='14px' fontWeight={400} item lineHeight='22px' pl='3px'>
          {Number(v.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(v.validatorPrefs.commission) / (10 ** 7)}%
        </Grid>
      </Grid>
      {allInOneRow && <Div />}
      <Grid alignItems='end' container item justifyContent={allInOneRow ? 'center' : 'space-between'} sx={{ fontSize: '14px', fontWeight: 300, lineHeight: '23px' }} width={allInOneRow ? 'fit-content' : ifOverSubscribed ? '93%' : '100%'}>
        <Grid item>
          {t('Nominators')}:
        </Grid>
        <Grid fontSize='14px' fontWeight={400} item lineHeight='22px' pl='3px'>
          {v.exposure.others?.length || t('N/A')}
        </Grid>
      </Grid>
      {allInOneRow && <Div />}
      <Grid alignItems='end' container item justifyContent={allInOneRow ? 'center' : 'space-between'} sx={{ fontSize: '14px', fontWeight: 300, lineHeight: '23px' }} width={allInOneRow ? 'fit-content' : ifOverSubscribed ? '93%' : '100%'}>
        <Grid item>
          {t('APY')}:
        </Grid>
        <Grid fontSize='14px' fontWeight={400} item lineHeight='22px' pl='3px'>
          {isElected
            ? <ShowValue height={14} value={apy ? `${apy}%` : undefined} width='40px' />
            : 'N/A'}
        </Grid>
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-end' sx={{ lineHeight: '23px', pl: '2px' }} width='fit-content'>
        {isActive && allInOneRow &&
          <Infotip text={t('Active')}>
            <DirectionsRunIcon sx={{ color: '#1F7720', fontSize: '18px' }} />
          </Infotip>
        }
        {ifOverSubscribed &&
          <Infotip text={isOversubscribed?.safe ? overSubscriptionAlert1 : overSubscriptionAlert2}>
            <WarningRoundedIcon sx={{ color: isOversubscribed?.safe ? '#FFB800' : '#FF002B', fontSize: '18px' }} />
          </Infotip>
        }
      </Grid>
    </Grid>
  );
}

export default React.memo(ShowValidator);
