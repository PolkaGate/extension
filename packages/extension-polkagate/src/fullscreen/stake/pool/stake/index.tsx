// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { StakingInputs } from '../../type';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import Asset from '@polkadot/extension-polkagate/src/partials/Asset';
import ShowPool from '@polkadot/extension-polkagate/src/popup/staking/partial/ShowPool';
import { MAX_AMOUNT_LENGTH } from '@polkadot/extension-polkagate/src/util/constants';
import { amountToHuman, amountToMachine } from '@polkadot/extension-polkagate/src/util/utils';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, TwoButtons, Warning } from '../../../../components';
import { useBalances, useInfo, usePool, useTranslation } from '../../../../hooks';
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
  PROGRESS: 5,
  PROXY: 100,
  SIGN_QR: 200
};

export default function StakeExtra({ address, setRefresh, setShow, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chain, decimal, formatted, token } = useInfo(address);
  const balances = useBalances(address);
  const pool = usePool(address);

  const [step, setStep] = useState(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<StakingInputs>();

  const freeBalance = balances?.freeBalance;
  const [amount, setAmount] = useState<string | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance | undefined>();

  const staked = useMemo(() => pool === undefined ? undefined : new BN(pool?.member?.points ?? 0), [pool]);
  const amountAsBN = useMemo(() => amountToMachine(amount, decimal), [amount, decimal]);
  const ED = api?.consts?.['balances']?.['existentialDeposit'] as unknown as BN | undefined;

  const max = useMemo(() => {
    if (!freeBalance || !ED || !estimatedMaxFee) {
      return;
    }

    return new BN(freeBalance).sub(ED.muln(2)).sub(new BN(estimatedMaxFee));
  }, [ED, freeBalance, estimatedMaxFee]);

  useEffect(() => {
    if (amount && api && staked && amountAsBN) {
      const call = api.tx['nominationPools']['bondExtra'];
      const params = [{ FreeBalance: amountAsBN.toString() }];

      const totalStakeAfter = staked.add(amountAsBN);

      const extraInfo = {
        action: 'Pool Staking',
        amount,
        subAction: 'stake extra',
        totalStakeAfter
      };

      setInputs({
        call,
        extraInfo,
        params
      });
    }
  }, [amount, amountAsBN, api, staked]);

  const onMaxAmount = useCallback(() => {
    if (!max) {
      return;
    }

    const maxToHuman = max.gt(BN_ZERO) ? amountToHuman(max.toString(), decimal) : 0;

    maxToHuman && setAmount(maxToHuman);
  }, [decimal, max]);

  const bondAmountChange = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  useEffect(() => {
    if (!api || !freeBalance || !formatted) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      return setEstimatedFee(api.createType('Balance', BN_ONE) as Balance);
    }

    amountAsBN && api.tx['nominationPools']['bondExtra']({ FreeBalance: amountAsBN.toString() }).paymentInfo(formatted).then((i) => {
      setEstimatedFee(api.createType('Balance', i?.partialFee) as Balance);
    }).catch(console.error);

    amountAsBN && api.tx['nominationPools']['bondExtra']({ FreeBalance: freeBalance.toString() }).paymentInfo(formatted).then((i) => {
      setEstimatedMaxFee(api.createType('Balance', i?.partialFee) as Balance);
    }).catch(console.error);
  }, [formatted, api, freeBalance, amount, decimal, amountAsBN]);

  const nextBtnDisabled = useMemo(() => {
    if (!amountAsBN || !max || !inputs) {
      return true;
    }

    const amountNotInRange = amountAsBN.gt(max);

    return amountAsBN.isZero() || amountNotInRange || !pool || pool?.bondedPool?.state as unknown as string !== 'Open';
  }, [amountAsBN, max, inputs, pool]);

  const Warn = ({ iconDanger, isDanger, text }: { text: string; isDanger?: boolean; iconDanger?: boolean; }) => (
    <Grid container sx={{ 'div.danger': { mr: '10px', mt: 0, pl: '10px' }, mt: '25px' }}>
      <Warning
        fontWeight={400}
        iconDanger={iconDanger}
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
            icon={faPlus}
            onCancel={onCancel}
            setStep={setStep}
            step={step}
            text={t('Stake extra')}
          />
        }
        {step === STEPS.INDEX &&
          <>
            {pool?.member?.points as unknown as string === '0' &&
              <Warn isDanger text={t('The account is fully unstaked, so can\'t stake until you withdraw entire unstaked/redeemable amount.')} />
            }
            <Asset
              address={address}
              api={api}
              balance={freeBalance}
              balanceLabel={t('Available balance')}
              fee={estimatedFee}
              style={{
                m: '20px auto',
                width: '92%'
              }}
            />
            <AmountWithOptions
              label={t('Amount ({{token}})', { replace: { token: token || '...' } })}
              onChangeAmount={bondAmountChange}
              onPrimary={onMaxAmount}
              primaryBtnText={t('Max amount')}
              value={amount}
            />
            {pool &&
              <ShowPool
                api={api}
                chain={chain as any}
                label={t('Pool')}
                mode='Default'
                pool={pool}
                showInfo
                style={{ m: '20px auto 0' }}
              />}
            <Typography fontSize='14px' fontWeight={400} m='20px 0 0' textAlign='center'>
              {t('Outstanding rewards automatically withdrawn after transaction')}
            </Typography>
            <TwoButtons
              disabled={nextBtnDisabled}
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
