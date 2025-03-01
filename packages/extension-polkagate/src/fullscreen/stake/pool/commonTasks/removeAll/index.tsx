// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { BN } from '@polkadot/util';
import type { MemberPoints, MyPoolInfo, TxInfo } from '../../../../../util/types';

import { faPersonCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { CheckCircleOutlineSharp as CheckCircleOutlineSharpIcon } from '@mui/icons-material';
import { Divider, Grid, Typography } from '@mui/material';
// @ts-ignore
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import { BN_ZERO } from '@polkadot/util';

import { AccountWithProxyInConfirmation, PButton } from '../../../../../components';
import { useFormatted, useTranslation } from '../../../../../hooks';
import { usePoolMembers } from '../../../../../hooks/usePoolMembers';
import { ModalTitle } from '../../../solo/commonTasks/configurePayee';
import Confirmation from '../../partials/Confirmation';
import { STEPS } from '../../stake';
import Review from './Review';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  pool: MyPoolInfo;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
}

interface SessionIfo {
  eraLength: number;
  eraProgress: number;
  currentEra: number;
}

interface RemainingTimeCounterProps {
  dayCounter: number;
  hourCounter: number;
  minCounter: number;
  secCounter: number;
}

const remainingTime = (seconds: number) => {
  const dayCounter = Math.floor(seconds / (3600 * 24));
  const hourCounter = Math.floor(seconds % (3600 * 24) / 3600);
  const minCounter = Math.floor(seconds % 3600 / 60);
  const secCounter = Math.floor(seconds % 60);

  return ({
    dayCounter,
    hourCounter,
    minCounter,
    secCounter
  });
};

export type Mode = 'UnbondAll' | 'RemoveAll';

export default function RemoveAll({ address, api, chain, onClose, pool, setRefresh }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(address);

  const [status, setStatus] = useState<number>(0);
  const [step, setStep] = useState<number>(STEPS.INDEX);
  const [mode, setMode] = useState<Mode | undefined>();
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [remainingEraToKick, setRemainingEraToKick] = useState<number | null>();
  const [remainingSecondsToKickAll, setRemainingSecondsToKickAll] = useState<number>(); // in seconds
  const [remainingTimeCounter, setRemainingTimeCounter] = useState<RemainingTimeCounterProps>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();

  const poolMembers = usePoolMembers(api, pool.poolId.toString());
  const poolDepositorAddr = String(pool.bondedPool?.roles.depositor);

  const members = useMemo(() => {
    if (!poolMembers) {
      return;
    }

    return poolMembers.map((m) => ({ accountId: m.accountId, points: m.member.points }) as MemberPoints);
  }, [poolMembers]);

  const needsUnboundAll = useMemo(() => {
    if (!members) {
      return undefined;
    }

    const allMembersPoints = members.reduce((sum: BN, { points }) => sum.add(points), BN_ZERO);
    const myPoint = members.find((m) => m.accountId === poolDepositorAddr)?.points ?? BN_ZERO;

    return !allMembersPoints.sub(myPoint).isZero();
  }, [members, poolDepositorAddr]);

  const RemoveAllBtnDisabled = needsUnboundAll || (!!sessionInfo && remainingEraToKick && remainingEraToKick > 0);

  useEffect(() => {
    if (!pool) {
      return;
    }

    const unlocking = pool?.stashIdAccount?.unlocking;
    const remainingEras = unlocking?.length ? unlocking[unlocking.length - 1].remainingEras : null;

    setRemainingEraToKick(remainingEras ? Number(remainingEras) : null);
  }, [api, members, formatted, pool]);

  useEffect(() => {
    if (needsUnboundAll || needsUnboundAll === undefined) {
      return setStatus(1);
    }

    if (sessionInfo && remainingEraToKick && remainingEraToKick > 0) {
      return setStatus(2);
    }

    if (sessionInfo && (remainingEraToKick === 0 || remainingEraToKick === null)) {
      return setStatus(3);
    }

    members && members.length <= 1 && setStatus(4);
  }, [remainingEraToKick, needsUnboundAll, members, sessionInfo, sessionInfo?.currentEra]);

  useEffect(() => {
    api?.derive.session?.progress().then((sessionInfo) => {
      setSessionInfo({
        currentEra: Number(sessionInfo.currentEra),
        eraLength: Number(sessionInfo.eraLength),
        eraProgress: Number(sessionInfo.eraProgress)
      });
    }).catch(console.error);
  }, [api]);

  useEffect(() => {
    if (!sessionInfo || remainingEraToKick === undefined) {
      return;
    }

    if (remainingEraToKick === null) {
      setRemainingSecondsToKickAll(0);

      return;
    }

    setRemainingSecondsToKickAll(((remainingEraToKick - 1) * sessionInfo.eraLength + (sessionInfo.eraLength - sessionInfo.eraProgress)) * 6);
  }, [remainingEraToKick, sessionInfo]);

  useEffect(() => {
    if (!remainingSecondsToKickAll) {
      return;
    }

    setTimeout(() => setRemainingSecondsToKickAll(remainingSecondsToKickAll - 1), 1000);
    setRemainingTimeCounter(remainingTime(remainingSecondsToKickAll));
  }, [remainingSecondsToKickAll]);

  const RemainingTime = () => (
    <Grid container justifyContent='center'>
      <Typography fontSize='16px' fontWeight={300}>{t('Time left to be able to remove all')}</Typography>
      <Grid container justifyContent='center' sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', m: 'auto', py: '30px', width: '92%' }}>
        {remainingTimeCounter?.dayCounter && remainingTimeCounter.dayCounter > 0 &&
          <Typography fontSize='28px' fontWeight={400} textAlign='center'>
            {remainingTimeCounter.dayCounter > 1
              ? t('days and')
              : t('day and')}
          </Typography>
        }
        <Typography fontSize='28px' fontWeight={400} px='2px' textAlign='center'>
          {remainingTimeCounter?.hourCounter.toLocaleString('en-US', { minimumIntegerDigits: 2 })}
        </Typography>
        <Typography fontSize='28px' fontWeight={400} px='2px' textAlign='center'>
          :
        </Typography>
        <Typography fontSize='28px' fontWeight={400} px='2px' textAlign='center'>
          {remainingTimeCounter?.minCounter.toLocaleString('en-US', { minimumIntegerDigits: 2 })}
        </Typography>
        <Typography fontSize='28px' fontWeight={400} px='2px' textAlign='center'>
          :
        </Typography>
        <Typography fontSize='28px' fontWeight={400} px='2px' textAlign='center'>
          {remainingTimeCounter?.secCounter.toLocaleString('en-US', { minimumIntegerDigits: 2 })}
        </Typography>
      </Grid>
    </Grid>
  );

  const goUnstakeAll = useCallback(() => {
    setMode('UnbondAll');
    setStep(STEPS.REVIEW);
  }, []);

  const goRemoveAll = useCallback(() => {
    setMode('RemoveAll');
    setStep(STEPS.REVIEW);
  }, []);

  return (
    <DraggableModal minHeight={670} onClose={onClose} open>
      <>
        {step !== STEPS.WAIT_SCREEN &&
          <ModalTitle
            icon={faPersonCircleXmark}
            onCancel={onClose}
            setStep={setStep}
            step={step}
            text={mode === 'UnbondAll' ? t('Unstake All') : t('Remove All')}
          />
        }
        {step === STEPS.INDEX &&
          <>
            <Grid container direction='column' m='20px auto'>
              <Typography fontSize='14px' fontWeight={300} textAlign='left'>
                {t('To remove all members')}:
              </Typography>
              <Grid alignItems='center' container item lineHeight='28px' pl='5px' pt='15px'>
                {status > 1
                  ? <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />
                  : <Typography fontSize='13px' sx={{ bgcolor: status === 1 ? 'success.main' : 'action.disabledBackground', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
                    1
                  </Typography>}
                <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
                  {t('Unstake all members’ tokens')}
                </Typography>
              </Grid>
              <Grid alignItems='center' container item lineHeight='28px' pl='5px'>
                {status <= 2
                  ? <Typography fontSize='13px' sx={{ bgcolor: status === 2 ? 'success.main' : 'action.disabledBackground', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
                    2
                  </Typography>
                  : <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />}
                <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
                  {t('Wait for unstaking locking period')}
                </Typography>
              </Grid>
              <Grid alignItems='center' container item lineHeight='28px' pl='5px'>
                {status <= 3
                  ? <Typography fontSize='13px' sx={{ bgcolor: status === 3 ? 'success.main' : 'action.disabledBackground', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
                    3
                  </Typography>
                  : <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />}
                <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
                  {t('Come back here, and remove all')}
                </Typography>
              </Grid>
            </Grid>
            {!poolMembers && status !== 2 &&
              <>
                <Grid alignItems='center' container justifyContent='center' mt='60px'>
                  <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={75} />
                </Grid>
                <Typography fontSize='15px' fontWeight={300} m='20px auto 0' textAlign='center'>
                  {t('Loading pool members information...')}
                </Typography>
              </>
            }
            {status === 2 && remainingTimeCounter !== undefined &&
              <RemainingTime />
            }
            <Grid bottom='25px' container direction='column' position='absolute'>
              {(status === 1) &&
                <Grid container item position='relative'>
                  <PButton
                    _ml={0}
                    _mt='0'
                    _onClick={goUnstakeAll}
                    disabled={!needsUnboundAll}
                    text={t('Unstake All ({{members}})', { replace: { members: (poolMembers && poolMembers.length - 1) ?? '...' } })}
                  />
                </Grid>}
              {(status !== 4) &&
                <Grid container item position='relative'>
                  <PButton
                    _ml={0}
                    _mt='20px'
                    _onClick={goRemoveAll}
                    disabled={!members || !!RemoveAllBtnDisabled}
                    text={t('Remove All')}
                  />
                </Grid>}
            </Grid>
          </>}
        {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) && mode && members && api && chain &&
          <Review
            address={address}
            api={api}
            chain={chain}
            mode={mode}
            pool={pool}
            poolMembers={members}
            setMode={setMode}
            setRefresh={setRefresh}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
          />}
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {txInfo && step === STEPS.CONFIRM &&
          <Confirmation
            handleClose={onClose}
            popupHeight={670}
            txInfo={txInfo}
          >
            <>
              <AccountWithProxyInConfirmation
                txInfo={txInfo}
              />
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
              <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t('Pool')}:
                </Typography>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                  {pool.metadata}
                </Typography>
              </Grid>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '75%' }} />
            </>
          </Confirmation>
        }
      </>
    </DraggableModal>
  );
}
