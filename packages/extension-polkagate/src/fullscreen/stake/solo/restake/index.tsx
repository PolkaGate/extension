// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { StakingInputs } from '../../type';

import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import Asset from '@polkadot/extension-polkagate/src/partials/Asset';
import { MAX_AMOUNT_LENGTH } from '@polkadot/extension-polkagate/src/util/constants';
import { amountToHuman, amountToMachine } from '@polkadot/extension-polkagate/src/util/utils';
import { BN, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, TwoButtons, Warning } from '../../../../components';
import { useEstimatedFee, useInfo, useStakingAccount, useTranslation } from '../../../../hooks';
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
  const { api, decimal, token } = useInfo(address);

  const stakingAccount = useStakingAccount(address);

  const [step, setStep] = useState(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<StakingInputs>();
  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();
  const [restakeAllAmount, setRestakeAllAmount] = useState<boolean>(false);
  const [unlockingAmount, setUnlockingAmount] = useState<BN | undefined>();

  const staked = useMemo(() => stakingAccount?.stakingLedger?.active as BN | undefined, [stakingAccount?.stakingLedger?.active]);
  const amountAsBN = useMemo(() => restakeAllAmount ? unlockingAmount : amountToMachine(amount, decimal), [amount, decimal, restakeAllAmount, unlockingAmount]);
  const totalStakeAfter = useMemo(() => staked && unlockingAmount && amountAsBN && staked.add(amountAsBN), [amountAsBN, staked, unlockingAmount]);

  const rebonded = api?.tx['staking']['rebond']; // signer: Controller
  const estimatedFee = useEstimatedFee(address, rebonded, [amountAsBN]);

  useEffect(() => {
    if (!stakingAccount) {
      return;
    }

    let unlockingValue = BN_ZERO;

    if (stakingAccount?.unlocking) {
      for (const [_, { remainingEras, value }] of Object.entries(stakingAccount.unlocking)) {
        if (remainingEras.gtn(0)) {
          const amount = new BN(value as unknown as string);

          unlockingValue = unlockingValue.add(amount);
        }
      }
    }

    setUnlockingAmount(unlockingValue);
  }, [stakingAccount]);

  useEffect(() => {
    if (amountAsBN?.gt(unlockingAmount || BN_ZERO)) {
      return setAlert(t('It is more than total unlocking amount.'));
    }

    setAlert(undefined);
  }, [unlockingAmount, t, amountAsBN]);

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
      const call = api.tx['staking']['rebond'];
      const params = [amountAsBN];

      const extraInfo = {
        action: 'Solo Staking',
        amount,
        subAction: 'Re-stake',
        totalStakeAfter
      };

      setInputs({
        call,
        extraInfo,
        params
      });
    }
  }, [amount, amountAsBN, api, totalStakeAfter]);

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
