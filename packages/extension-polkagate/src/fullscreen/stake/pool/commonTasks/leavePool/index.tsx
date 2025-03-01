// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { SubmittableExtrinsicFunction } from '@polkadot/api/types/submittable';
import type { AnyTuple } from '@polkadot/types/types';
import type { MyPoolInfo, TxInfo } from '../../../../../util/types';
import type { StakingInputs } from '../../../type';

import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import React, { useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import { useEstimatedFee, useInfo, useStakingConsts, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { DATE_OPTIONS } from '@polkadot/extension-polkagate/src/util/constants';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util/utils';
import { BN } from '@polkadot/util';

import Review from '../../../partials/Review';
import { ModalTitle } from '../../../solo/commonTasks/configurePayee';
import Confirmation from '../../partials/Confirmation';
import { STEPS } from '../../stake';
import TxDetail from './TxDetail';

interface Props {
  address: string;
  pool: MyPoolInfo;
  onClose: () => void;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LeavePool({ address, onClose, pool, setRefresh }: Props): React.ReactElement {
  const { t } = useTranslation();
  const stakingConsts = useStakingConsts(address);
  const { api, decimal, formatted, token } = useInfo(address);

  const [step, setStep] = useState<number>(STEPS.REVIEW);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<StakingInputs>();
  const [spanCount, setSpanCount] = useState<number>();

  const estimatedFee = useEstimatedFee(address, inputs?.call, inputs?.params);

  const unlockingLen = pool?.stashIdAccount?.stakingLedger?.unlocking?.length;
  const maxUnlockingChunks = api && (api.consts['staking']['maxUnlockingChunks'] as any)?.toNumber();

  const staked = useMemo(() => pool.member?.points && new BN(pool.member.points), [pool.member?.points]);

  const redeemDate = useMemo(() => {
    if (stakingConsts) {
      const date = Date.now() + stakingConsts.unbondingDuration * 24 * 60 * 60 * 1000;

      return new Date(date).toLocaleDateString(undefined, DATE_OPTIONS);
    }

    return undefined;
  }, [stakingConsts]);

  const extraInfo = useMemo(() => ({
    action: 'Pool Staking',
    amount: amountToHuman(staked?.toString(), decimal),
    estimatedFee,
    helperText: t('You are unstaking all your {{token}}s from this pool!', { replace: { token } }),
    redeemText: t('This amount will be redeemable on {{redeemDate}}, and your rewards will be automatically claimed.', { replace: { redeemDate } }),
    subAction: 'Unstake'
  }), [decimal, estimatedFee, redeemDate, staked, t, token]);

  useEffect(() => {
    api?.query['staking']['slashingSpans'](formatted).then((optSpans: any) => {
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

    if (unlockingLen < maxUnlockingChunks) {
      call = api.tx['nominationPools']['unbond'];
      params = [formatted, staked];
    } else {
      const unbonded = api.tx['nominationPools']['unbond'];
      const poolWithdrawUnbonded = api.tx['nominationPools']['poolWithdrawUnbonded'];

      call = api.tx['utility']['batchAll'];
      params = [[poolWithdrawUnbonded(pool.poolId, spanCount), unbonded(formatted, staked)]];
    }

    setInputs({
      call,
      extraInfo,
      params
    });
  }, [address, api, extraInfo, formatted, maxUnlockingChunks, pool.poolId, spanCount, staked, unlockingLen]);

  // this page doesn't have an INDEX, When the ModalTitle close button is clicked, it will set the step to STEPS.INDEX, triggering the modal to close
  useEffect(() => {
    step === STEPS.INDEX && onClose();
  }, [onClose, step]);

  return (
    <DraggableModal minHeight={600} onClose={onClose} open>
      <>
        {step !== STEPS.WAIT_SCREEN &&
          <ModalTitle
            icon={faRightFromBracket}
            onCancel={onClose}
            setStep={setStep}
            step={step}
            text={t('Leave Pool')}
          />
        }
        {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) &&
          <Review
            address={address}
            inputs={inputs}
            onClose={onClose}
            setRefresh={setRefresh}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
          />
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
