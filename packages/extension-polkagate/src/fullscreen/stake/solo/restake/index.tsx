// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import Asset from '@polkadot/extension-polkagate/src/partials/Asset';
import { MAX_AMOUNT_LENGTH } from '@polkadot/extension-polkagate/src/util/constants';
import { TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import { amountToHuman, amountToMachine } from '@polkadot/extension-polkagate/src/util/utils';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, TwoButtons, Warning } from '../../../../components';
import { useInfo, useStakingAccount, useStakingConsts, useTranslation } from '../../../../hooks';
import { Inputs } from '../../Entry';
import { ModalTitle } from '../configurePayee';
import Confirmation from '../configurePayee/Confirmation';
import Review from '../configurePayee/Review';

interface Props {
  address: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
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

export default function Unstake ({ address, setRefresh, setShow, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, decimal, formatted, token } = useInfo(address);

  const stakingAccount = useStakingAccount(address);

  const [step, setStep] = useState(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<Inputs>();
  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();
  const [restakeAllAmount, setRestakeAllAmount] = useState<boolean>(false);
  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();

  const staked = useMemo(() => stakingAccount?.stakingLedger?.active as BN | undefined, [stakingAccount?.stakingLedger?.active]);
  const amountAsBN = useMemo(() => amountToMachine(amount, decimal), [amount, decimal]);
  const totalStakeAfter = useMemo(() => staked && unlockingAmount && staked.add(amountAsBN), [amountAsBN, staked, unlockingAmount]);

  const rebonded = api && api.tx.staking.rebond; // signer: Controller

  useEffect(() => {
    if (!stakingAccount) {
      return;
    }

    let unlockingValue = BN_ZERO;

    if (stakingAccount?.unlocking) {
      for (const [_, { remainingEras, value }] of Object.entries(stakingAccount.unlocking)) {
        if (remainingEras.gtn(0)) {
          const amount = new BN(value as string);

          unlockingValue = unlockingValue.add(amount);
        }
      }
    }

    setUnlockingAmount(unlockingValue);
  }, [stakingAccount]);

  useEffect(() => {
    if (amountAsBN.gt(unlockingAmount || BN_ZERO)) {
      return setAlert(t('It is more than total unlocking amount.'));
    }

    setAlert(undefined);
  }, [unlockingAmount, t, amountAsBN]);

  useEffect(() => {
    if (!rebonded || !formatted) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    rebonded(amountAsBN).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [amountAsBN, api, formatted, rebonded]);

  const onChangeAmount = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    setRestakeAllAmount(false);

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onAllAmount = useCallback(() => {
    if (!unlockingAmount) {
      return;
    }

    const allToShow = amountToHuman(unlockingAmount.toString(), decimal);

    setRestakeAllAmount(true);
    setAmount(allToShow);
  }, [decimal, unlockingAmount]);

  useEffect(() => {
    if (amount && api) {
      const call = api.tx.staking.rebond;
      const params = [amountAsBN];

      const extraInfo = {
        action: 'Solo Staking',
        amount,
        subAction: 'Re-stake'
      };

      setInputs({
        call,
        extraInfo,
        params
      });
    }
  }, [amount, amountAsBN, api]);

  const onNext = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, []);

  const onCancel = useCallback(() => {
    setStep(STEPS.INDEX);
    setShow(false);
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
            icon={faArrowRotateLeft}
            onCancel={onCancel}
            setStep={setStep}
            step={step}
            text={t('Restaking')}
          />
        }
        {step === STEPS.INDEX &&
          <>
            <Grid container item mt='2%'>
              <Asset
                address={address}
                api={api}
                balance={unlockingAmount}
                balanceLabel={t('Unstaking')}
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
