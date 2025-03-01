// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { StakingInputs } from '../../type';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import Asset from '@polkadot/extension-polkagate/src/partials/Asset';
import { MAX_AMOUNT_LENGTH } from '@polkadot/extension-polkagate/src/util/constants';
import { amountToHuman, amountToMachine } from '@polkadot/extension-polkagate/src/util/utils';
import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, TwoButtons, Warning } from '../../../../components';
import { useAvailableToSoloStake, useInfo, useStakingAccount, useStakingConsts, useTranslation } from '../../../../hooks';
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

export default function StakeExtra({ address, setRefresh, setShow, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, decimal, token } = useInfo(address);

  const stakingAccount = useStakingAccount(address);
  const stakingConsts = useStakingConsts(address as string);
  const availableToSoloStake = useAvailableToSoloStake(address);

  const [alert, setAlert] = useState<string | undefined>();
  const [step, setStep] = useState(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<StakingInputs>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [amount, setAmount] = useState<string>();

  const staked = useMemo(() => stakingAccount && stakingAccount.stakingLedger.active as unknown as BN, [stakingAccount]);
  const amountAsBN = useMemo(() => amountToMachine(amount, decimal), [amount, decimal]);

  const call = api && api.tx['staking']['bondExtra'];

  useEffect(() => {
    if (!amountAsBN) {
      return;
    }

    if (amountAsBN.gt(availableToSoloStake ?? BN_ZERO)) {
      return setAlert(t('It is more than available balance.'));
    }

    setAlert(undefined);
  }, [amountAsBN, t, availableToSoloStake]);

  useEffect(() => {
    if (api && amountAsBN && call && staked) {
      const params = [amountAsBN];

      const totalStakeAfter = staked.add(amountAsBN);

      const extraInfo = {
        action: 'Solo Staking',
        amount,
        subAction: 'Stake Extra',
        totalStakeAfter
      };

      setInputs({
        call,
        extraInfo,
        params
      });
    }
  }, [amount, amountAsBN, api, call, staked]);

  useEffect(() => {
    if (api && !api?.call?.['transactionPaymentApi']) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE) as Balance);
    }

    if (address && call) {
      call(...(inputs?.params || [BN_ONE])).paymentInfo(address).then((i) => {
        setEstimatedFee(api?.createType('Balance', i?.partialFee || BN_ONE) as Balance);
      }).catch(console.error);
    }
  }, [address, api, call, inputs]);

  const onChangeAmount = useCallback((value: string) => {
    if (decimal && value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    const roundedAmount = value.slice(0, MAX_AMOUNT_LENGTH);

    setAmount(roundedAmount);
  }, [decimal]);

  const onMaxAmount = useCallback(() => {
    if (!decimal || !availableToSoloStake || !stakingConsts) {
      return;
    }

    const ED = stakingConsts.existentialDeposit;

    const max = availableToSoloStake.sub(ED.muln(2));
    const maxToShow = amountToHuman(max.toString(), decimal);

    setAmount(maxToShow);
  }, [availableToSoloStake, decimal, stakingConsts]);

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
            icon={faPlus}
            onCancel={onCancel}
            setStep={setStep}
            step={step}
            text={t('Stake Extra')}
          />
        }
        {step === STEPS.INDEX &&
          <>
            <Grid container item>
              <Typography fontSize='16px' py='20px' textAlign='left' width='100%'>
                {t('Increase your staking amount to earn more rewards. Don’t forget to keep some tokens in your account to cover fees.')}
              </Typography>
              <Asset
                address={address}
                api={api}
                balance={availableToSoloStake}
                balanceLabel={t('Available to stake')}
                fee={estimatedFee}
                style={{ pt: '20px' }}
              />
              <AmountWithOptions
                label={t<string>('Amount ({{token}})', { replace: { token } })}
                onChangeAmount={onChangeAmount}
                onPrimary={onMaxAmount}
                primaryBtnText={t<string>('Max amount')}
                style={{ paddingTop: '30px' }}
                value={amount}
              />
              {alert &&
                <Warn belowInput iconDanger text={alert} />
              }
            </Grid>
            <TwoButtons
              disabled={!inputs || !!(amount && parseFloat(amount) === 0)}
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
