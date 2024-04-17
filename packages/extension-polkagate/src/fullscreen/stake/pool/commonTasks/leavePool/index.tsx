// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AnyTuple } from '@polkadot/types/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { SubmittableExtrinsicFunction } from '@polkadot/api/types/submittable';
import { AmountFee, SignArea2, WrongPasswordAlert } from '@polkadot/extension-polkagate/src/components';
import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import { useEstimatedFee, useInfo, useStakingConsts, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { DATE_OPTIONS } from '@polkadot/extension-polkagate/src/util/constants';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util/utils';
import { BN } from '@polkadot/util';

import { MyPoolInfo, Proxy, TxInfo } from '../../../../../util/types';
import { Inputs } from '../../../Entry';
import Confirmation from '../../partials/Confirmation';
import TxDetail from './TxDetail';

interface Props {
  address: string;
  pool: MyPoolInfo;
  onClose: () => void;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

const STEPS = {
  REVIEW: 1,
  WAIT_SCREEN: 2,
  CONFIRM: 3,
  PROXY: 100
};

export default function LeavePool({ address, onClose, pool, setRefresh }: Props): React.ReactElement {
  const { t } = useTranslation();
  const stakingConsts = useStakingConsts(address);
  const theme = useTheme();
  const { api, decimal, formatted, token } = useInfo(address);

  const [step, setStep] = useState<number>(STEPS.REVIEW);
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<Inputs>();
  const [spanCount, setSpanCount] = useState<number>();

  const estimatedFee = useEstimatedFee(address, inputs?.call, inputs?.params);

  const unlockingLen = pool?.stashIdAccount?.stakingLedger?.unlocking?.length;
  const maxUnlockingChunks = api && api.consts.staking.maxUnlockingChunks?.toNumber() as unknown as number;

  const staked = useMemo(() => pool.member?.points && new BN(pool.member.points), [pool.member?.points]);

  const redeemDate = useMemo(() => {
    if (stakingConsts) {
      const date = Date.now() + stakingConsts.unbondingDuration * 24 * 60 * 60 * 1000;

      return new Date(date).toLocaleDateString(undefined, DATE_OPTIONS);
    }

    return undefined;
  }, [stakingConsts]);

  const extraInfo = {
    action: 'Pool Staking',
    amount: staked,
    subAction: 'Unstake'
  };

  useEffect(() => {
    api && api.query.staking.slashingSpans(formatted).then((optSpans) => {
      const _spanCount = optSpans.isNone ? 0 : optSpans.unwrap().prior.length + 1;

      setSpanCount(_spanCount as number);
    }).catch(console.error);
  }, [api, formatted]);

  useEffect(() => {
    if (!address || !api || !staked || unlockingLen === undefined || !maxUnlockingChunks) {
      return;
    }

    let call: SubmittableExtrinsicFunction<'promise', AnyTuple>;
    let params: unknown[];
    const amount = amountToHuman(staked.toString(), decimal);

    if (unlockingLen < maxUnlockingChunks) {
      call = api.tx.nominationPools.unbond;
      params = [formatted, staked];
    } else {
      const unbonded = api.tx.nominationPools.unbond;
      const poolWithdrawUnbonded = api.tx.nominationPools.poolWithdrawUnbonded;

      call = api.tx.utility.batchAll;
      params = [[poolWithdrawUnbonded(pool.poolId, spanCount), unbonded(formatted, staked)]];
    }

    const extraInfo = {
      action: 'Pool Staking',
      amount,
      subAction: 'Unstake'
    };

    setInputs({
      call,
      extraInfo,
      params
    });
  }, [address, api, decimal, formatted, maxUnlockingChunks, pool.poolId, spanCount, staked, unlockingLen]);

  return (
    <DraggableModal minHeight={550} onClose={onClose} open>
      <>
        <Grid alignItems='center' container justifyContent='space-between' py='15px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t('Leave Pool')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={onClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        {[STEPS.REVIEW, STEPS.PROXY].includes(step) &&
          <>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            <Grid container item justifyContent='center' sx={{ fontSize: '14px', fontWeight: 400, pt: '10px', textAlign: 'center' }}>
              {t('You are unstaking all your {{token}}s from this pool!', { replace: { token } })}
            </Grid>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '10px auto', width: '240px' }} />
            <AmountFee
              address={address}
              amount={amountToHuman(staked?.toString(), decimal)}
              // amount={staked?.toString()}
              fee={estimatedFee}
              label={t('Amount')}
              style={{ pt: '5px' }}
              token={token}
              withFee
            >
              <Grid container item justifyContent='center' sx={{ fontSize: '12px', pt: '10px', textAlign: 'center' }}>
                {t('This amount will be redeemable on {{redeemDate}}, and your rewards will be automatically claimed.', { replace: { redeemDate } })}
              </Grid>
            </AmountFee>
            <Grid container item sx={{ bottom: '15px', height: '120px', position: 'absolute', width: '86%' }}>
              <SignArea2
                address={address}
                call={inputs?.call}
                extraInfo={extraInfo}
                isPasswordError={isPasswordError}
                onSecondaryClick={onClose}
                params={inputs?.params}
                primaryBtnText={t('Confirm')}
                proxyTypeFilter={['Any', 'NonTransfer', 'NominationPools']}
                secondaryBtnText={t('Cancel')}
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
          </>
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {txInfo && step === STEPS.CONFIRM && (
          <Confirmation
            handleClose={onClose}
            popupHeight={550}
            txInfo={txInfo}
          >
            <TxDetail
              decimal={decimal}
              pool={pool}
              token={token}
              txInfo={txInfo}
            />
          </Confirmation>)
        }
      </>
    </DraggableModal>
  );
}
