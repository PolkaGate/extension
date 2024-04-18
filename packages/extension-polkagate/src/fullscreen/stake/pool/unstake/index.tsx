// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { faMinus, faPersonCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AutoDelete as AutoDeleteIcon } from '@mui/icons-material';
import { Button, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import Asset from '@polkadot/extension-polkagate/src/partials/Asset';
import ShowPool from '@polkadot/extension-polkagate/src/popup/staking/partial/ShowPool';
import { CONDITION_MAP } from '@polkadot/extension-polkagate/src/popup/staking/pool/unstake';
import { DATE_OPTIONS, MAX_AMOUNT_LENGTH } from '@polkadot/extension-polkagate/src/util/constants';
import { TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import { amountToHuman, amountToMachine } from '@polkadot/extension-polkagate/src/util/utils';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, TwoButtons, Warning } from '../../../../components';
import { useInfo, usePool, usePoolConsts, useStakingConsts, useTranslation } from '../../../../hooks';
import { Inputs } from '../../Entry';
import Confirmation from '../../partials/Confirmation';
import Review from '../../partials/Review';
import { ModalTitle } from '../../solo/commonTasks/configurePayee';
import { MODAL_IDS } from '..';

interface Props {
  address: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<number>>;
  show: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export const STEPS = {
  INDEX: 1,
  REVIEW: 2,
  WAIT_SCREEN: 3,
  CONFIRM: 4,
  PROXY: 100
};

export default function Unstake({ address, setRefresh, setShow, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chain, decimal, formatted, token } = useInfo(address);

  const [step, setStep] = useState(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<Inputs>();

  const myPool = usePool(address, undefined);
  const poolConsts = usePoolConsts(address);
  const stakingConsts = useStakingConsts(address);
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();
  const [helperText, setHelperText] = useState<string | undefined>();
  const [unstakeAllAmount, setUnstakeAllAmount] = useState<boolean>(false);
  const [helperButton, setShowHelperButton] = useState<number>();
  const [goChange, setGoChange] = useState<boolean>(false);

  const staked = useMemo(() => {
    if (myPool && myPool.member?.points && myPool.stashIdAccount && myPool.bondedPool) {
      const myPoints = new BN(myPool.member.points);
      const poolActive = new BN(String(myPool.stashIdAccount.stakingLedger.active));
      const poolPoints = new BN(myPool.bondedPool.points);

      return myPoints.isZero() || poolPoints.isZero()
        ? BN_ZERO
        : myPoints.mul(poolActive).div(poolPoints);
    } else {
      return BN_ZERO;
    }
  }, [myPool]);

  const totalStakeAfter = useMemo(() => {
    if (unstakeAllAmount) {
      return BN_ZERO;
    }

    if (staked && !unstakeAllAmount) {
      return staked.sub(amountToMachine(amount, decimal));
    }

    return undefined;
  }, [amount, decimal, staked, unstakeAllAmount]);

  const unlockingLen = myPool?.stashIdAccount?.stakingLedger?.unlocking?.length;
  const maxUnlockingChunks = api && api.consts.staking.maxUnlockingChunks?.toNumber() as unknown as number;
  const isPoolRoot = useMemo(() => String(formatted) === String(myPool?.bondedPool?.roles?.root), [formatted, myPool?.bondedPool?.roles?.root]);
  const isPoolDepositor = useMemo(() => String(formatted) === String(myPool?.bondedPool?.roles?.depositor), [formatted, myPool?.bondedPool?.roles?.depositor]);
  const poolState = useMemo(() => String(myPool?.bondedPool?.state), [myPool?.bondedPool?.state]);
  const poolMemberCounter = useMemo(() => Number(myPool?.bondedPool?.memberCounter), [myPool?.bondedPool?.memberCounter]);
  const destroyHelperText = t<string>('No one can join and all members can be removed without permissions. Once in destroying state, it cannot be reverted to another state.');

  const unbonded = api && api.tx.nominationPools.unbond;
  const poolWithdrawUnbonded = api && api.tx.nominationPools.poolWithdrawUnbonded;
  const redeemDate = useMemo(() => {
    if (stakingConsts) {
      const date = Date.now() + stakingConsts.unbondingDuration * 24 * 60 * 60 * 1000;

      return new Date(date).toLocaleDateString(undefined, DATE_OPTIONS);
    }

    return undefined;
  }, [stakingConsts]);

  useEffect(() => {
    if (!amount) {
      return;
    }

    const amountAsBN = amountToMachine(amount, decimal);

    if (amountAsBN.gt(staked ?? BN_ZERO)) {
      return setAlert(t('It is more than already staked.'));
    }

    if (isPoolDepositor && (poolMemberCounter > 1 || poolState !== 'Destroying') && poolConsts && staked.sub(amountAsBN).lt(poolConsts.minCreateBond)) {
      return setAlert(t('Remaining stake amount should not be less than {{min}} {{token}}', { replace: { min: amountToHuman(poolConsts.minCreateBond, decimal), token } }));
    }

    if (api && staked && poolConsts && !staked.sub(amountAsBN).isZero() && !unstakeAllAmount && staked.sub(amountAsBN).lt(poolConsts.minJoinBond)) {
      const remained = api.createType('Balance', staked.sub(amountAsBN)).toHuman();
      const min = api.createType('Balance', poolConsts.minJoinBond).toHuman();

      return setAlert(t('Remaining stake amount ({{remained}}) should not be less than {{min}}.', { replace: { min, remained } }));
    }

    setAlert(undefined);
  }, [amount, api, poolConsts, decimal, staked, t, unstakeAllAmount, isPoolDepositor, poolMemberCounter, poolState, token]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const params = [formatted, amountToMachine(amount, decimal)];

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    // eslint-disable-next-line no-void
    poolWithdrawUnbonded && maxUnlockingChunks && unlockingLen !== undefined && unbonded && formatted && void unbonded(...params).paymentInfo(formatted).then((i) => {
      const fee = i?.partialFee;

      if (unlockingLen < maxUnlockingChunks) {
        setEstimatedFee(fee);
      } else {
        const dummyParams = [1, 1];

        // eslint-disable-next-line no-void
        void poolWithdrawUnbonded(...dummyParams).paymentInfo(formatted).then((j) => setEstimatedFee(api.createType('Balance', fee.add(j?.partialFee))));
      }
    }).catch(console.error);
  }, [amount, api, decimal, formatted, maxUnlockingChunks, poolWithdrawUnbonded, unbonded, unlockingLen]);

  useEffect(() => {
    if (!myPool || !formatted || !poolConsts || !staked) {
      return;
    }

    const partial = staked.sub(poolConsts.minCreateBond);

    if (isPoolDepositor && isPoolRoot && poolState !== 'Destroying' && partial.isZero()) {
      setHelperText(t<string>('You need to change the pool state to Destroying first to be able to unstake.'));
      setShowHelperButton(CONDITION_MAP.DESTROY);

      return;
    }

    if (isPoolDepositor && isPoolRoot && poolState === 'Destroying' && poolMemberCounter !== 1 && partial.isZero()) {
      setHelperText(t<string>('You need to remove all members first to be able to unstake.'));
      setShowHelperButton(CONDITION_MAP.REMOVE_ALL);

      return;
    }

    setShowHelperButton(undefined);
    setHelperText(undefined);
  }, [formatted, isPoolDepositor, isPoolRoot, myPool, poolConsts, poolMemberCounter, poolState, staked, t]);

  const onChangeAmount = useCallback((value: string) => {
    setUnstakeAllAmount(false);

    if (decimal && value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onAllAmount = useCallback(() => {
    if (!myPool || !formatted || !poolConsts || !staked || staked.isZero()) {
      return;
    }

    if ((isPoolRoot || isPoolDepositor) && poolState === 'Destroying' && poolMemberCounter === 1) {
      setUnstakeAllAmount(true);
      setAmount(amountToHuman(staked.toString(), decimal));

      return;
    }

    if (isPoolDepositor && (poolState !== 'Destroying' || poolMemberCounter !== 1)) {
      const partial = staked.sub(poolConsts.minCreateBond);

      setUnstakeAllAmount(false);
      !partial.isZero() && setAmount(amountToHuman(partial, decimal));

      return;
    }

    if (!isPoolDepositor && !isPoolRoot) { // TODO: do we really need this condition @Amir
      setUnstakeAllAmount(true);
      setAmount(amountToHuman(staked.toString(), decimal));
    }
  }, [decimal, formatted, isPoolDepositor, isPoolRoot, myPool, poolConsts, poolMemberCounter, poolState, staked]);

  const goToDestroying = useCallback(() => {
    helperButton === 1 && setGoChange(!goChange);
  }, [goChange, helperButton]);

  const goToRemoveAll = useCallback(() => {
    helperButton === 2 && setGoChange(!goChange);
  }, [goChange, helperButton]);

  useEffect(() => {
    const handleInput = async () => {
      if (amount && api && maxUnlockingChunks && unlockingLen !== undefined && myPool?.poolId && unbonded && poolWithdrawUnbonded) {
        const amountAsBN = amountToMachine(amount, decimal);

        const batch = api.tx.utility.batchAll;

        const unbondedParams = [formatted, amountAsBN];

        const optSpans = await api.query.staking.slashingSpans(formatted);
        const spanCount = optSpans.isNone ? 0 : optSpans.unwrap().prior.length + 1 as number;
        const poolId = myPool.poolId;

        const poolWithdrawUnbondedParams = [poolId, spanCount];

        const call = unlockingLen > maxUnlockingChunks ? batch : unbonded;
        const params = unlockingLen > maxUnlockingChunks
          ? [unbonded(...unbondedParams), poolWithdrawUnbonded(...poolWithdrawUnbondedParams)]
          : unbondedParams;

        const extraInfo = {
          action: 'Pool Staking',
          amount,
          subAction: 'unstake',
          totalStakeAfter
        };

        setInputs({
          call,
          extraInfo,
          params
        });
      }
    };

    handleInput().catch(console.error);
  }, [amount, api, decimal, formatted, maxUnlockingChunks, myPool?.poolId, poolWithdrawUnbonded, totalStakeAfter, unbonded, unlockingLen]);

  const Warn = ({ belowInput, iconDanger, isDanger, text }: { belowInput?: boolean, text: string; isDanger?: boolean; iconDanger?: boolean; }) => (
    <Grid container sx={{ '> div': { mr: '0', mt: '5px', pl: '5px' }, mt: isDanger ? '15px' : 0 }}>
      <Warning
        fontWeight={400}
        iconDanger={iconDanger}
        isBelowInput={belowInput}
        isDanger={isDanger}
        theme={theme}
      >
        {text}
      </Warning>
    </Grid>
  );

  const onCancel = useCallback(() => {
    setStep(STEPS.INDEX);
    setShow(MODAL_IDS.NONE);
  }, [setShow]);

  const onNext = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, []);

  return (
    <DraggableModal minHeight={615} onClose={onCancel} open={show}>
      <Grid container>
        {step !== STEPS.WAIT_SCREEN &&
          <ModalTitle
            icon={faMinus}
            onCancel={onCancel}
            setStep={setStep}
            step={step}
            text={t('Unstake')}
          />
        }
        {step === STEPS.INDEX &&
          <>
            {helperText &&
              <Grid container height='78px' justifyContent='center' m='auto' width='92%'>
                <Warn isDanger text={helperText} />
                {helperButton &&
                  <Button
                    onClick={helperButton === 1 ? goToDestroying : goToRemoveAll}
                    startIcon={
                      helperButton === 1
                        ? (
                          <AutoDeleteIcon
                            sx={{ color: 'text.primary', fontSize: '21px' }}
                          />)
                        : (
                          <FontAwesomeIcon
                            color={theme.palette.text.primary}
                            fontSize='18px'
                            icon={faPersonCircleXmark}
                          />)
                    }
                    sx={{ color: 'text.primary', fontSize: '14px', fontWeight: 400, mt: '10px', textDecorationLine: 'underline', textTransform: 'capitalize' }}
                    variant='text'
                  >
                    {helperButton === 1 ? t<string>('Destroying') : t<string>('RemoveAll')}
                  </Button>}
              </Grid>
            }
            <Grid item sx={{ mx: '15px' }} xs={12}>
              <Asset
                address={address}
                api={api}
                balance={staked}
                balanceLabel={t('Staked')}
                fee={estimatedFee}
                style={{
                  m: '20px auto'
                }}
              />
              <AmountWithOptions
                disabled={!!helperButton}
                label={t<string>('Amount ({{token}})', { replace: { token } })}
                onChangeAmount={onChangeAmount}
                onPrimary={onAllAmount}
                primaryBtnText={t<string>('All amount')}
                value={amount}
              />
              {alert &&
                <Warn belowInput iconDanger text={alert} />
              }
            </Grid>
            {myPool &&
              <ShowPool
                api={api}
                chain={chain}
                label={t<string>('Pool')}
                mode='Default'
                pool={myPool}
                showInfo
                style={{
                  m: '15px auto 0',
                  width: '92%'
                }}
              />
            }
            {!helperButton &&
              <Typography fontSize='14px' m='20px auto' textAlign='center'>
                {t<string>('Outstanding rewards automatically withdrawn after transaction')}
              </Typography>
            }
            <TwoButtons
              disabled={!inputs}
              ml='0'
              onPrimaryClick={onNext}
              onSecondaryClick={onCancel}
              primaryBtnText={t('Next')}
              secondaryBtnText={t('Cancel')}
              width='87%'
            />
          </>
        }
        {[STEPS.REVIEW, STEPS.PROXY].includes(step) &&
          <Review
            address={address}
            inputs={inputs}
            setRefresh={setRefresh}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
          />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {step === STEPS.CONFIRM && txInfo &&
          <Confirmation
            handleDone={onCancel}
            txInfo={txInfo}
          />
        }
      </Grid>
    </DraggableModal>
  );
}
