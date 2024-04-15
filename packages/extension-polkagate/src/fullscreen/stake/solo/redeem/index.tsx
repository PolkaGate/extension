// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { faCircleDown } from '@fortawesome/free-solid-svg-icons';
import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import { TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util/utils';

import { Progress } from '../../../../components';
import { useInfo, useTranslation } from '../../../../hooks';
import { Inputs } from '../../Entry';
import { ModalTitle } from '../configurePayee';
import Confirmation from '../configurePayee/Confirmation';
import Review from '../configurePayee/Review';

interface Props {
  address: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
  redeemable: Balance | undefined
}

export const STEPS = {
  INDEX: 1,
  REVIEW: 2,
  WAIT_SCREEN: 3,
  CONFIRM: 4,
  PROXY: 100
};

export default function Pending ({ address, redeemable, setRefresh, setShow, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api, decimal, formatted } = useInfo(address);

  const [step, setStep] = useState(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<Inputs>();

  const onNext = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, []);

  useEffect(() => {
    const handleInputs = async () => {
      if (api) {
        const call = api.tx.staking.withdrawUnbonded; // sign by controller

        const optSpans = await api.query.staking.slashingSpans(formatted);
        const spanCount = optSpans.isNone ? 0 : optSpans.unwrap().prior.length + 1;
        const params = [spanCount];

        const extraInfo = {
          action: 'Solo Staking',
          amount: amountToHuman(redeemable, decimal),
          subAction: 'Redeem'
        };

        setInputs({
          call,
          extraInfo,
          params
        });

        onNext();
      }
    };

    show && step === STEPS.INDEX && handleInputs().catch(console.error);
  }, [api, decimal, formatted, onNext, redeemable, show, step]);

  const onCancel = useCallback(() => {
    setShow(false);
    setInputs(undefined);
    setStep(STEPS.INDEX);
  }, [setShow]);

  useEffect(() => {
    !!inputs && step === STEPS.INDEX && onCancel();
  }, [inputs, onCancel, step]);

  return (
    <DraggableModal onClose={onCancel} open={show}>
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
        {step === STEPS.INDEX &&
            <Grid container item p='30px'>
              <Progress
                fontSize={16}
                pt={10}
                size={150}
                title={t('Loading information, please wait ...')}
              />
            </Grid>
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
