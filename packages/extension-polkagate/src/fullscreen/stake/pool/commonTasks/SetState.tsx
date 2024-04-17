// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import ShowPool from '@polkadot/extension-polkagate/src/popup/staking/partial/ShowPool';
import { Balance } from '@polkadot/types/interfaces';
import { BN_ONE } from '@polkadot/util';

import { ShortAddress, ShowBalance, SignArea2, WrongPasswordAlert } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { ThroughProxy } from '../../../../partials';
import { MyPoolInfo, Proxy, TxInfo } from '../../../../util/types';
import Confirmation from '../partials/Confirmation';
import { PoolState } from '../partials/PoolCommonTasks';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  chain: Chain;
  formatted: string;
  pool: MyPoolInfo;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  state: PoolState;
  onClose: () => void;
}

const STEPS = {
  CONFIRM: 3,
  INDEX: 1,
  PROXY: 100,
  REVIEW: 1,
  WAIT_SCREEN: 2
};

export default function SetState ({ address, api, chain, formatted, onClose, pool, setRefresh, state }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [step, setStep] = useState<number>(STEPS.INDEX);

  const [estimatedFee, setEstimatedFee] = useState<Balance>();

  const batchAll = api && api.tx.utility.batchAll;
  const chilled = api && api.tx.nominationPools.chill;
  const poolSetState = api && api.tx.nominationPools.setState(pool.poolId.toString(), state); // (poolId, state)

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
    subAction: state === 'Destroying' ? 'Destroy Pool' : state === 'Open' ? 'Unblock Pool' : 'Block Pool'
  }), [estimatedFee, state]);

  const transaction = useMemo(() => {
    if (!chilled || !batchAll) {
      return;
    }

    const mayNeedChill = state === 'Destroying' && pool.stashIdAccount?.nominators?.length && (String(pool.bondedPool?.roles.root) === String(formatted) || String(pool.bondedPool?.roles.nominator) === String(formatted)) ? chilled(pool.poolId) : undefined;
    const calls = mayNeedChill ? batchAll([mayNeedChill, poolSetState]) : poolSetState;

    return calls;
  }, [batchAll, chilled, formatted, pool.bondedPool?.roles.nominator, pool.bondedPool?.roles.root, pool.poolId, pool.stashIdAccount?.nominators?.length, poolSetState, state]);

  useEffect(() => {
    if (!api) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    // eslint-disable-next-line no-void
    void poolSetState?.paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee));
  }, [api, formatted, poolSetState]);

  return (
    <DraggableModal minHeight={550} onClose={onClose} open>
      <>
        <Grid alignItems='center' container justifyContent='space-between' pt='15px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t<string>('Change State')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={onClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        {[STEPS.INDEX, STEPS.REVIEW, STEPS.PROXY].includes(step) &&
          <>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            <Typography fontSize='14px' fontWeight={400} m='20px auto' textAlign='left' width='100%'>
              {helperText}
            </Typography>
            <ShowPool
              api={api}
              chain={chain}
              mode='Default'
              pool={pool}
              showInfo
              style={{ m: '20px auto' }}
            />
            <Grid container item>
              <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
                {t('Fee:')}
              </Typography>
              <Grid item lineHeight='22px' pl='5px'>
                <ShowBalance
                  api={api}
                  balance={estimatedFee}
                  decimalPoint={4}
                  height={22}
                />
              </Grid>
            </Grid>
            <Grid container item sx={{ bottom: '15px', height: '120px', position: 'absolute', width: '86%' }}>
              <SignArea2
                address={address}
                call={transaction}
                extraInfo={extraInfo}
                isPasswordError={isPasswordError}
                onSecondaryClick={onClose}
                primaryBtnText={t('Confirm')}
                proxyTypeFilter={['Any', 'NonTransfer', 'NominationPools']}
                secondaryBtnText={t('Cancel')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setRefresh={setRefresh}
                setSelectedProxy={setSelectedProxy}
                setStep={setStep}
                setTxInfo={setTxInfo}
                showBackButtonWithUseProxy
                step={step}
                steps={STEPS}
              />
            </Grid>
          </>}
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {txInfo && step === STEPS.CONFIRM && (
          <Confirmation
            handleClose={onClose}
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
