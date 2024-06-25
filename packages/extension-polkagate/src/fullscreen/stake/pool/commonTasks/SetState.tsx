// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';

import { faLock, faLockOpen, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { Divider, Grid, Typography } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import type { Balance } from '@polkadot/types/interfaces';
import { BN_ONE } from '@polkadot/util';

import { ShortAddress } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { ThroughProxy } from '../../../../partials';
import type { MyPoolInfo, TxInfo } from '../../../../util/types';
import type { Inputs } from '../../Entry';
import Review from '../../partials/Review';
import { ModalTitle } from '../../solo/commonTasks/configurePayee';
import Confirmation from '../partials/Confirmation';
import { PoolState } from '../partials/PoolCommonTasks';
import { STEPS } from '../stake';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  formatted: string;
  pool: MyPoolInfo;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  state: PoolState;
  onClose: () => void;
}

export default function SetState({ address, api, formatted, onClose, pool, setRefresh, state }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [step, setStep] = useState<number>(STEPS.REVIEW);
  const [inputs, setInputs] = useState<Inputs>();
  const [estimatedFee, setEstimatedFee] = useState<Balance>();

  const helperText = useMemo(() =>
    state === 'Blocked'
      ? t('The pool state will be changed to Blocked, and no member will be able to join and only some admin roles can remove members.')
      : state === 'Open'
        ? t('The pool state will be changed to Open, and any member will be able to join the pool.')
        : t('No one can join and all members can be removed without permissions. Once in destroying state, it cannot be reverted to another state.')
    , [state, t]);

  const extraInfo = useMemo(() => ({
    action: 'Pool Staking',
    fee: String(estimatedFee || 0),
    helperText,
    pool,
    subAction: state === 'Destroying' ? 'Destroy Pool' : state === 'Open' ? 'Unblock Pool' : 'Block Pool'
  }), [estimatedFee, helperText, state, pool]);

  useEffect(() => {
    if (!api) {
      return;
    }

    const batchAll = api && api.tx['utility']['batchAll'];
    const chilled = api && api.tx['nominationPools']['chill'];
    const poolSetState = api && api.tx['nominationPools']['setState']; // (poolId, state)

    const poolId = pool.poolId.toString();

    const mayNeedChill =
      state === 'Destroying' &&
      pool.stashIdAccount?.nominators &&
      pool.stashIdAccount.nominators.length > 0 &&
      [String(pool.bondedPool?.roles.root), String(pool.bondedPool?.roles.nominator)].includes(String(formatted));

    const call = mayNeedChill ? batchAll : poolSetState;
    const params = mayNeedChill ? [[chilled(poolId), poolSetState(poolId, state)]] : [poolId, state];

    setInputs({
      call,
      extraInfo,
      params
    });
  }, [api, extraInfo, formatted, pool.bondedPool?.roles.nominator, pool.bondedPool?.roles.root, pool.poolId, pool.stashIdAccount?.nominators, state]);

  useEffect(() => {
    if (!api || !inputs?.call) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    // eslint-disable-next-line no-void
    void inputs?.call(...inputs.params).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee));
  }, [api, formatted, inputs]);

  // this page doesn't have an INDEX, When the ModalTitle close button is clicked, it will set the step to STEPS.INDEX, triggering the modal to close
  useEffect(() => {
    step === STEPS.INDEX && onClose();
  }, [onClose, step]);

  return (
    <DraggableModal minHeight={650} onClose={onClose} open>
      <>
        {step !== STEPS.WAIT_SCREEN &&
          <ModalTitle
            icon={state === 'Blocked' ? faLock : state === 'Open' ? faLockOpen : faTrashCan}
            onCancel={onClose}
            setStep={setStep}
            step={step}
            text={t('Change State to {{state}}', { replace: { state } })}
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
            popupHeight={650}
            txInfo={txInfo}
          >
            <>
              <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t('Account holder:')}
                </Typography>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                  {txInfo.from.name}
                </Typography>
                <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
                  <ShortAddress
                    address={txInfo.from.address}
                    inParentheses
                    style={{ fontSize: '16px' }}
                  />
                </Grid>
              </Grid>
              {txInfo.throughProxy &&
                <Grid container m='auto' maxWidth='92%'>
                  <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
                </Grid>
              }
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
              <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t('Pool:')}
                </Typography>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                  {pool.metadata}
                </Typography>
              </Grid>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
              <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t('New pool state:')}
                </Typography>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                  {state}
                </Typography>
              </Grid>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
            </>
          </Confirmation>)
        }
      </>
    </DraggableModal>
  );
}
