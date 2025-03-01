// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { StakingInputs } from '../../type';

import { faMinus } from '@fortawesome/free-solid-svg-icons';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import Asset from '@polkadot/extension-polkagate/src/partials/Asset';
import { MAX_AMOUNT_LENGTH } from '@polkadot/extension-polkagate/src/util/constants';
import { amountToHuman, amountToMachine } from '@polkadot/extension-polkagate/src/util/utils';
import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, TwoButtons, Warning } from '../../../../components';
import { useInfo, useStakingAccount, useStakingConsts, useTranslation } from '../../../../hooks';
import Confirmation from '../../partials/Confirmation';
import Review from '../../partials/Review';
import { STEPS } from '../../pool/stake';
import { ModalTitle } from '../commonTasks/configurePayee';
import { MODAL_IDS } from '..';

interface Props {
  address: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<number>>;
  show: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Unstake({ address, setRefresh, setShow, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, decimal, formatted, token } = useInfo(address);

  const stakingAccount = useStakingAccount(address);
  const stakingConsts = useStakingConsts(address as string);

  const [step, setStep] = useState(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<StakingInputs>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();
  const [isUnstakeAll, setIsUnstakeAll] = useState<boolean>(false);

  const staked = useMemo(() => stakingAccount && stakingAccount.stakingLedger.active as unknown as BN, [stakingAccount]);
  const unlockingLen = stakingAccount?.stakingLedger?.unlocking?.length;
  const maxUnlockingChunks = api && (api.consts['staking']['maxUnlockingChunks'] as any)?.toNumber();
  const amountAsBN = useMemo(() => amountToMachine(amount, decimal), [amount, decimal]);

  const unbonded = api && api.tx['staking']['unbond']; // signer: Controller
  const redeem = api && api.tx['staking']['withdrawUnbonded']; // signer: Controller
  const chilled = api && api.tx['staking']['chill']; // signer: Controller

  useEffect(() => {
    if (!amountAsBN) {
      return;
    }

    if (amountAsBN.gt(staked ?? BN_ZERO)) {
      return setAlert(t('It is more than already staked.'));
    }

    if (api && staked && stakingConsts && !staked.sub(amountAsBN).isZero() && !isUnstakeAll && staked.sub(amountAsBN).lt(stakingConsts.minNominatorBond)) {
      const remained = api.createType('Balance', staked.sub(amountAsBN)).toHuman();
      const min = api.createType('Balance', stakingConsts.minNominatorBond).toHuman();

      return setAlert(t('Remaining stake amount ({{remained}}) should not be less than {{min}}.', { replace: { min, remained } }));
    }

    setAlert(undefined);
  }, [amountAsBN, api, staked, stakingConsts, t, isUnstakeAll]);

  useEffect(() => {
    const handleInputs = async () => {
      if (amountAsBN && redeem && chilled && unbonded && maxUnlockingChunks !== undefined && unlockingLen !== undefined && formatted && staked) {
        const txs = [];

        if (unlockingLen >= maxUnlockingChunks) {
          const optSpans = await api.query['staking']['slashingSpans'](formatted) as any;
          const spanCount = optSpans.isNone ? 0 : optSpans.unwrap().prior.length + 1 as number;

          txs.push(redeem(spanCount));
        }

        const hasNominator = !!stakingAccount?.nominators?.length;

        if ((isUnstakeAll || amount === amountToHuman(staked, decimal)) && hasNominator) {
          txs.push(chilled());
        }

        txs.push(unbonded(amountAsBN));
        const call = txs.length > 1 ? api.tx['utility']['batchAll'] : unbonded;
        const params = txs.length > 1 ? [txs] : [amountAsBN];

        const totalStakeAfter = staked.sub(amountAsBN);

        const extraInfo = {
          action: 'Solo Staking',
          amount,
          subAction: 'Unstake',
          totalStakeAfter
        };

        setInputs({
          call,
          extraInfo,
          params
        });
      }
    };

    handleInputs().catch(console.error);
  }, [amount, amountAsBN, api, chilled, decimal, formatted, isUnstakeAll, maxUnlockingChunks, redeem, staked, stakingAccount?.nominators?.length, unbonded, unlockingLen]);

  const getFee = useCallback(async () => {
    if (api && !api?.call?.['transactionPaymentApi']) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE) as Balance);
    }

    if (address && inputs?.call && inputs?.params) {
      const partialFee = (await inputs.call(...inputs.params).paymentInfo(address))?.partialFee;

      setEstimatedFee(api?.createType('Balance', partialFee) as Balance);
    }
  }, [address, api, inputs]);

  useEffect(() => {
    if (amountAsBN && redeem && chilled && maxUnlockingChunks && unlockingLen !== undefined && unbonded && staked) {
      getFee().catch(console.error);
    }
  }, [amountAsBN, api, chilled, getFee, maxUnlockingChunks, redeem, staked, unbonded, unlockingLen]);

  const onChangeAmount = useCallback((value: string) => {
    setIsUnstakeAll(false);

    if (decimal && value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    const roundedAmount = value.slice(0, MAX_AMOUNT_LENGTH);

    setAmount(roundedAmount);
  }, [decimal]);

  const onAllAmount = useCallback(() => {
    if (!staked || !decimal) {
      return;
    }

    const allToShow = amountToHuman(staked.toString(), decimal);

    setIsUnstakeAll(true);
    setAmount(allToShow);
  }, [decimal, staked]);

  const onNext = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, []);

  const onCancel = useCallback(() => {
    setStep(STEPS.INDEX);
    setShow(MODAL_IDS.NONE);
  }, [setShow]);

  const Warn = ({ belowInput, iconDanger, isDanger, text }: { belowInput?: boolean, text: string, isDanger?: boolean, iconDanger?: boolean }) => (
    <Grid container sx={{ '> div': { mr: '0', mt: isDanger ? '15px' : 0, pl: '5px' }, justifyContent: isDanger ? 'center' : 'unset' }}>
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

  return (
    <DraggableModal minHeight={615} onClose={onCancel} open={show}>
      <Grid container>
        {step !== STEPS.WAIT_SCREEN &&
          <ModalTitle
            icon={faMinus}
            onCancel={onCancel}
            setStep={setStep}
            step={step}
            text={t('Unstaking')}
          />
        }
        {step === STEPS.INDEX &&
          <>
            <Grid container item>
              <Typography fontSize='16px' py='20px' textAlign='left' width='100%'>
                {t('Your unstaked amount will be redeemable after {{unbondingDuration}} days.', { replace: { unbondingDuration: stakingConsts?.unbondingDuration } })}
              </Typography>
              <Asset
                address={address}
                api={api}
                balance={staked}
                balanceLabel={t('Staked')}
                fee={estimatedFee}
                style={{ pt: '20px' }}
              />
              <AmountWithOptions
                label={t<string>('Amount ({{token}})', { replace: { token } })}
                onChangeAmount={onChangeAmount}
                onPrimary={onAllAmount}
                primaryBtnText={t<string>('All amount')}
                style={{ paddingTop: '30px' }}
                value={amount}
              />
              {alert &&
                <Warn belowInput iconDanger text={alert} />
              }
            </Grid>
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
        {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) &&
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
