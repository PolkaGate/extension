// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { BN } from '@polkadot/util';
import type { StakingInputs } from '../../type';

import { faCircleDown } from '@fortawesome/free-solid-svg-icons';
import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util/utils';

import { Progress } from '../../../../components';
import { useInfo, useTranslation } from '../../../../hooks';
import Confirmation from '../../partials/Confirmation';
import Review from '../../partials/Review';
import { ModalTitle } from '../../solo/commonTasks/configurePayee';
import { STEPS } from '../stake';
import { MODAL_IDS } from '..';

interface Props {
  address: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<number>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
  redeemable: BN | undefined;
  availableBalance: BN | undefined;
}

export default function WithdrawRedeem ({ address, availableBalance, redeemable, setRefresh, setShow }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api, decimal, formatted } = useInfo(address);

  const [step, setStep] = useState(STEPS.PROGRESS);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<StakingInputs>();

  const availableBalanceAfter = useMemo(() => {
    if (!redeemable || !availableBalance) {
      return undefined;
    }

    return redeemable.add(availableBalance);
  }, [availableBalance, redeemable]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const handleInputs = async () => {
      const call = api.tx['nominationPools']['withdrawUnbonded'];

      const optSpans = await api.query['staking']['slashingSpans'](formatted) as any;
      const spanCount = optSpans.isNone ? 0 : optSpans.unwrap().prior.length + 1;
      const params = [formatted, spanCount];

      const extraInfo = {
        action: 'Pool Staking',
        amount: amountToHuman(redeemable, decimal),
        availableBalanceAfter,
        subAction: 'Redeem'
      };

      setInputs({
        call,
        extraInfo,
        params
      });
    };

    step === STEPS.PROGRESS &&
      handleInputs()
        .catch(console.error);
  }, [api, availableBalanceAfter, decimal, formatted, redeemable, step]);

  const onCancel = useCallback(() => {
    setShow(MODAL_IDS.NONE);
  }, [setShow]);

  useEffect(() => {
    step === STEPS.INDEX && onCancel();

    step === STEPS.PROGRESS && inputs && setStep(STEPS.REVIEW);
  }, [inputs, onCancel, step]);

  return (
    <DraggableModal minHeight={600} onClose={onCancel} open>
      <Grid container>
        {step !== STEPS.WAIT_SCREEN &&
          <ModalTitle
            icon={faCircleDown}
            onCancel={onCancel}
            setStep={setStep}
            step={step}
            text={t('Withdraw Redeemable')}
          />
        }
        {step === STEPS.PROGRESS &&
          <Progress
            fontSize={16}
            pt={20}
            size={150}
            title={t('Loading information, please wait ...')}
            type='grid'
          />
        }
        {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) &&
          <Review
            address={address}
            inputs={inputs}
            onClose={onCancel}
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
