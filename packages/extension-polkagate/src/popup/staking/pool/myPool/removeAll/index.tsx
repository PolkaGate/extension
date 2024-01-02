// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { MemberPoints, MyPoolInfo } from '../../../../../util/types';

import CheckCircleOutlineSharpIcon from '@mui/icons-material/CheckCircleOutlineSharp';
import { Grid, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { PButton, Popup } from '../../../../../components';
import { useApi, useChain, useFormatted, useTranslation } from '../../../../../hooks';
import { usePoolMembers } from '../../../../../hooks/usePoolMembers';
import { HeaderBrand } from '../../../../../partials';
import Review from './Review';

interface Props {
  address: string;
  pool: MyPoolInfo;
  showRemoveAll?: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRemoveAll: React.Dispatch<React.SetStateAction<boolean>>;
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

export default function RemoveAll({ address, pool, setRefresh, setShowRemoveAll, showRemoveAll }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const chain = useChain(address);
  const formatted = useFormatted(address);

  const [step, setStep] = useState<number>(0);
  const [mode, setMode] = useState<'UnbondAll' | 'RemoveAll' | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [remainingEraToKick, setRemainingEraToKick] = useState<number | null>();
  const [remainingSecondsToKickAll, setRemainingSecondsToKickAll] = useState<number>();// in seconds
  const [remainingTimeCounter, setRemainingTimeCounter] = useState<RemainingTimeCounterProps>();

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

  const backToPool = useCallback(() => {
    setShowRemoveAll(false);
  }, [setShowRemoveAll]);

  const goUnstakeAll = useCallback(() => {
    setMode('UnbondAll');
    setShowReview(!showReview);
  }, [showReview]);

  const goRemoveAll = useCallback(() => {
    setMode('RemoveAll');
    setShowReview(!showReview);
  }, [showReview]);

  const RemoveAllBtnDisabled = needsUnboundAll || (!!sessionInfo && remainingEraToKick > 0);

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
      return setStep(1);
    }

    if (sessionInfo && remainingEraToKick > 0) {
      return setStep(2);
    }

    if (sessionInfo && (remainingEraToKick === 0 || remainingEraToKick === null)) {
      return setStep(3);
    }

    members?.length <= 1 && setStep(4);
  }, [remainingEraToKick, needsUnboundAll, members, sessionInfo, sessionInfo?.currentEra]);

  useEffect(() => {
    api && api.derive.session?.progress().then((sessionInfo) => {
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
      <Typography fontSize='16px' fontWeight={300}>{t<string>('Time left to be able to remove all')}</Typography>
      <Grid container justifyContent='center' sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', m: 'auto', py: '30px', width: '92%' }}>
        {remainingTimeCounter?.dayCounter > 0 &&
          <Typography fontSize='28px' fontWeight={400} textAlign='center'>
            {remainingTimeCounter?.dayCounter > 1
              ? t<string>('days and')
              : t<string>('day and')}
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

  return (
    <Popup show={showRemoveAll}>
      <HeaderBrand
        onBackClick={backToPool}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Remove All')}
        withSteps={step !== 4 ? { current: step === 0 ? 1 : step, total: 3 } : undefined}
      />
      <Grid container direction='column' m='20px auto' width='85%'>
        <Typography fontSize='14px' fontWeight={300}>
          {t<string>('To remove all members')}:
        </Typography>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px' pt='15px'>
          {step > 1
            ? <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />
            : <Typography fontSize='13px' sx={{ bgcolor: step === 1 ? 'success.main' : 'action.disabledBackground', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
              1
            </Typography>}
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t<string>('Unstake all members’ tokens')}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px'>
          {step <= 2
            ? <Typography fontSize='13px' sx={{ bgcolor: step === 2 ? 'success.main' : 'action.disabledBackground', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
              2
            </Typography>
            : <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />}
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t<string>('Wait for unstaking locking period')}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item lineHeight='28px' pl='5px'>
          {step <= 3
            ? <Typography fontSize='13px' sx={{ bgcolor: step === 3 ? 'success.main' : 'action.disabledBackground', border: '1px solid', borderColor: '#fff', borderRadius: '50%', height: '18px', lineHeight: 1.4, textAlign: 'center', width: '18px' }}>
              3
            </Typography>
            : <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', color: '#fff', fontSize: '20px', ml: '-1px' }} />}
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>
            {t<string>('Come back here, and remove all')}
          </Typography>
        </Grid>
      </Grid>
      {!poolMembers && step !== 2 &&
        <>
          <Grid alignItems='center' container justifyContent='center' mt='60px'>
            <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={75} />
          </Grid>
          <Typography fontSize='15px' fontWeight={300} m='20px auto 0' textAlign='center'>
            {t<string>('Loading pool members information...')}
          </Typography>
        </>
      }
      {step === 2 && remainingTimeCounter !== undefined &&
        <RemainingTime />
      }
      <Grid bottom='25px' container direction='column' position='absolute'>
        {(step === 1) &&
          <Grid container item position='relative'>
            <PButton
              _mt='0'
              _onClick={goUnstakeAll}
              disabled={!needsUnboundAll}
              text={t<string>('Unstake All ({{members}})', { replace: { members: (poolMembers && poolMembers.length - 1) ?? '...' } })}
            />
          </Grid>}
        {(step !== 4) &&
          <Grid container item position='relative'>
            <PButton _mt='20px' _onClick={goRemoveAll} disabled={!members || RemoveAllBtnDisabled} text={t<string>('Remove All')} />
          </Grid>}
      </Grid>
      {showReview && mode && members && api &&
        <Review
          address={address}
          api={api}
          chain={chain}
          formatted={formatted}
          mode={mode}
          pool={pool}
          poolMembers={members}
          setRefresh={setRefresh}
          setShow={setShowReview}
          setShowMyPool={setShowRemoveAll}
          show={showReview}
        />}
    </Popup>
  );
}
