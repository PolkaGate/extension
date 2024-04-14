// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import { ISubmittableResult } from '@polkadot/types/types';
import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { Infotip, ShowValue, SignArea2, WrongPasswordAlert } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { MyPoolInfo, Proxy, TxInfo } from '../../../../util/types';
import ShowPoolRole from './ShowPoolRole';
import { ChangesProps, STEPS } from '.';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  changes?: ChangesProps;
  formatted: string;
  pool: MyPoolInfo;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  step: number;
  selectedProxy: Proxy | undefined;
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
}

export default function Review({ address, api, chain, changes, formatted, pool, selectedProxy, setRefresh, setSelectedProxy, setStep, setTxInfo, step }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [isPasswordError, setIsPasswordError] = useState(false);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [transaction, setTransaction] = useState<SubmittableExtrinsic<'promise', ISubmittableResult>>();

  const batchAll = api && api.tx.utility.batchAll;
  const setMetadata = api && api.tx.nominationPools.setMetadata;

  const maybeCurrentCommissionPayee = pool?.bondedPool?.commission?.current?.[1]?.toString() as string | undefined;

  useEffect(() => {
    if (!api || !setMetadata || !batchAll) {
      return;
    }

    const calls = [];

    const getRole = (role: string | undefined | null) => {
      if (role === undefined) {
        return 'Noop';
      } else if (role === null) {
        return 'Remove';
      } else {
        return { set: role };
      }
    };

    changes?.newPoolName !== undefined &&
      calls.push(setMetadata(pool.poolId, changes?.newPoolName));

    changes?.newRoles !== undefined && !Object.values(changes.newRoles).every((value) => value === undefined) &&
      calls.push(api.tx.nominationPools.updateRoles(pool.poolId, getRole(changes.newRoles.newRoot), getRole(changes.newRoles.newNominator), getRole(changes.newRoles.newBouncer)));

    changes?.commission !== undefined && (changes.commission.value !== undefined || changes.commission.payee) &&
      calls.push(api.tx.nominationPools.setCommission(pool.poolId, [(changes.commission.value || 0) * 10 ** 7, changes.commission.payee || maybeCurrentCommissionPayee]));

    const tx = calls.length > 1 ? batchAll(calls) : calls[0];

    setTransaction(tx);

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    calls.length && calls[0].paymentInfo(formatted).then((i) => {
      setEstimatedFee(api.createType('Balance', i?.partialFee));
    }).catch(console.error);

    calls.length > 1 && calls[1].paymentInfo(formatted).then((i) => {
      setEstimatedFee((prevEstimatedFee) => api.createType('Balance', (prevEstimatedFee ?? BN_ZERO).add(i?.partialFee)));
    }).catch(console.error);
  }, [api, batchAll, changes, formatted, maybeCurrentCommissionPayee, pool?.bondedPool?.commission, pool?.poolId, setMetadata]);

  const extraInfo = useMemo(() => ({
    action: 'Pool Staking',
    fee: String(estimatedFee || 0),
    subAction: 'Edit Pool'
  }), [estimatedFee]);

  const onBackClick = useCallback(() => {
    setSelectedProxy(undefined);
    setStep(STEPS.INDEX);
  }, [setStep, setSelectedProxy]);

  return (
    <Grid container direction='column' item pt='15px'>
      {isPasswordError &&
        <WrongPasswordAlert />
      }
      {changes?.newPoolName !== undefined &&
        <>
          <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: '8px', width: '90%' }}>
            <Infotip showQuestionMark text={changes?.newPoolName}>
              <Typography fontSize='16px' fontWeight={300} lineHeight='23px'>
                {t<string>('Pool name')}
              </Typography>
            </Infotip>
            <Typography fontSize='25px' fontWeight={400} lineHeight='42px' maxWidth='100%' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
              {changes?.newPoolName}
            </Typography>
          </Grid>
          {changes?.newRoles &&
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />
          }
        </>}
      {changes?.newRoles?.newRoot !== undefined &&
        <ShowPoolRole
          chain={chain}
          roleAddress={changes?.newRoles?.newRoot}
          roleTitle={t<string>('Root')}
          showDivider
        />
      }
      {changes?.newRoles?.newNominator !== undefined &&
        <ShowPoolRole
          chain={chain}
          roleAddress={changes?.newRoles?.newNominator}
          roleTitle={t<string>('Nominator')}
          showDivider
        />
      }
      {changes?.newRoles?.newBouncer !== undefined &&
        <ShowPoolRole
          chain={chain}
          roleAddress={changes?.newRoles?.newBouncer}
          roleTitle={t<string>('Bouncer')}
          showDivider
        />
      }
      {changes?.commission?.value !== undefined &&
        <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
          <Grid item>
            <Typography fontSize='16px' fontWeight={300} lineHeight='23px'>
              {t('Commission value')}
            </Typography>
          </Grid>
          <Grid fontSize='28px' fontWeight={400} item>
            {changes.commission.value}%
          </Grid>
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '240px' }} />
        </Grid>
      }
      {changes?.commission?.payee !== undefined &&
        <ShowPoolRole
          chain={chain}
          roleAddress={changes.commission.payee || maybeCurrentCommissionPayee}
          roleTitle={t<string>('Commission payee')}
          showDivider
        />
      }
      <Grid alignItems='center' container item justifyContent='center' lineHeight='20px'>
        <Grid item>
          {t('Fee')}:
        </Grid>
        <Grid item sx={{ pl: '5px' }}>
          <ShowValue height={16} value={estimatedFee?.toHuman()} />
        </Grid>
      </Grid>
      <Grid container item sx={{ bottom: '15px', height: '120px', position: 'absolute', width: '86%' }}>
        <SignArea2
          address={address}
          call={transaction}
          extraInfo={extraInfo}
          isPasswordError={isPasswordError}
          onSecondaryClick={onBackClick}
          primaryBtnText={t<string>('Confirm')}
          proxyTypeFilter={['Any', 'NonTransfer', 'NominationPools']}
          secondaryBtnText={t<string>('Back')}
          selectedProxy={selectedProxy}
          setIsPasswordError={setIsPasswordError}
          setRefresh={setRefresh}
          setSelectedProxy={setSelectedProxy}
          setStep={setStep}
          setTxInfo={setTxInfo}
          showBackButtonWithUseProxy
          step={step}
          steps={STEPS}
        />
      </Grid>
    </Grid>
  );
}
