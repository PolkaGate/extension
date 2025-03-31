// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BalancesInfo, MyPoolInfo, TxInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { StakingInputs } from '../../../type';

import { faArrowCircleDown } from '@fortawesome/free-solid-svg-icons';
import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Progress } from '@polkadot/extension-polkagate/src/components';
import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util/utils';
import { BN } from '@polkadot/util';

import { useInfo, useTranslation } from '../../../../../hooks';
import Confirmation from '../../../partials/Confirmation';
import Review from '../../../partials/Review';
import { ModalTitle } from '../../../solo/commonTasks/configurePayee';
import { MODAL_IDS } from '../..';
import { STEPS } from '../../stake';

interface Props {
  address: string | undefined;
  balances: BalancesInfo | undefined;
  setShow: React.Dispatch<React.SetStateAction<number>>;
  show: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  pool: MyPoolInfo | null | undefined;
}

export default function WithdrawRewards ({ address, balances, pool, setRefresh, setShow, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api, decimal, formatted } = useInfo(address);

  const claimable = useMemo(() => pool === undefined ? undefined : new BN(pool?.myClaimable ?? 0), [pool]);
  const transferable = useMemo(() => getValue('transferable', balances), [balances]);

  const [step, setStep] = useState(STEPS.PROGRESS);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<StakingInputs>();

  useEffect(() => {
    if (claimable && api && transferable) {
      const call = api.tx['nominationPools']['claimPayout'];
      const params = [] as unknown[];

      const extraInfo = {
        action: 'Pool Staking',
        amount: amountToHuman(claimable, decimal),
        availableBalanceAfter: transferable.add(claimable),
        subAction: 'Withdraw Rewards'
      };

      setInputs({
        call,
        extraInfo,
        params
      });
    }
  }, [api, transferable, claimable, decimal, formatted]);

  const onCancel = useCallback(() => {
    setShow(MODAL_IDS.NONE);
  }, [setShow]);

  useEffect(() => {
    /** this ia a little bit tricky, if close window returns to index page, since here there is no index page hence close modal */
    step === STEPS.INDEX && onCancel();

    /** if inputs is ready, and the step is progress, then go to review page */
    step === STEPS.PROGRESS && inputs && setStep(STEPS.REVIEW);
  }, [inputs, onCancel, step]);

  return (
    <DraggableModal minHeight={615} onClose={onCancel} open={show}>
      <Grid container>
        {step !== STEPS.WAIT_SCREEN &&
          <ModalTitle
            icon={faArrowCircleDown}
            onCancel={onCancel}
            setStep={setStep}
            step={step}
            text={t('Withdraw Rewards')}
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
