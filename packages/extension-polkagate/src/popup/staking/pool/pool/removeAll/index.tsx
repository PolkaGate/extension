// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
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
import { useChain, useFormatted, useTranslation } from '../../../../../hooks';
import { usePoolMembers } from '../../../../../hooks/usePoolMembers';
import { HeaderBrand } from '../../../../../partials';
import Review from './Review';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  pool: MyPoolInfo;
  showRemoveAll?: boolean;
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

export default function RemoveAll({ address, api, pool, setShowRemoveAll, showRemoveAll }: Props): React.ReactElement {
  const { t } = useTranslation();

  const chain = useChain(address);
  const formatted = useFormatted(address);

  const [step, setStep] = useState<number>(1);
  const [mode, setMode] = useState<'UnbondAll' | 'RemoveAll' | undefined>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [sessionInfo, setSessionInfo] = useState<SessionIfo>();
  const [remainingEraToKick, setRemainingEraToKick] = useState<number>();
  const [remainingSecondsToKickAll, setRemainingSecondsToKickAll] = useState<number>();// in seconds
  const [remainingTimeCounter, setRemainingTimeCounter] = useState<RemainingTimeCounterProps>();

  const poolMembers = usePoolMembers(api, pool.poolId.toString());

  const members = useMemo(() => {
    if (!poolMembers) {
      return;
    }

    return poolMembers.map((m) => ({ accountId: m.accountId, points: m.member.points }) as MemberPoints);
  }, [poolMembers]);

  const needsUnboundAll = useMemo(() => {
    if (!members) {
      return false;
    }

    const allMembersPoints = members.reduce((sum: BN, { points }) => sum.add(points), BN_ZERO);
    const myPoint = members.find((m) => m.accountId === formatted)?.points ?? BN_ZERO;

    return !allMembersPoints.sub(myPoint).isZero();
  }, [members, formatted]);

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

    const unlocking = pool.stashIdAccount.unlocking;
    const remainingEras = unlocking?.length ? unlocking[unlocking.length - 1].remainingEras : null;

    setRemainingEraToKick(remainingEras ? Number(remainingEras) : null);
  }, [api, members, formatted, pool]);

  useEffect(() => {
    if (needsUnboundAll) {
      return setStep(1);
    }

    if (sessionInfo && remainingEraToKick > 0) {
      return setStep(2);
    }

    if (sessionInfo && remainingEraToKick === 0) {
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
      return setRemainingSecondsToKickAll(0);
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
        <Typography fontSize='28px' fontWeight={400} textAlign='center' px='2px'>{remainingTimeCounter?.hourCounter.toLocaleString('en-US', { minimumIntegerDigits: 2 })}</Typography>
        <Typography fontSize='28px' fontWeight={400} textAlign='center' px='2px'>:</Typography>
        <Typography fontSize='28px' fontWeight={400} textAlign='center' px='2px'>{remainingTimeCounter?.minCounter.toLocaleString('en-US', { minimumIntegerDigits: 2 })}</Typography>
        <Typography fontSize='28px' fontWeight={400} textAlign='center' px='2px'>:</Typography>
        <Typography fontSize='28px' fontWeight={400} textAlign='center' px='2px'>{remainingTimeCounter?.secCounter.toLocaleString('en-US', { minimumIntegerDigits: 2 })}</Typography>
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
        withSteps={step !== 4 ? { current: step, total: 3 } : undefined}
      />
      <Grid container direction='column' m='20px auto' width='85%'>
        <Typography fontSize='14px' fontWeight={300}>
          {t<string>('To remove all members')}:
        </Typography>
        <Grid alignItems='center' container item lineHeight='25px' pl='5px' pt='15px'>
          {step > 1 ? <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', fontSize: '15px' }} /> : '1.'}
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>{t<string>('Unstake all members’ tokens')}</Typography>
        </Grid>
        <Grid alignItems='center' container item lineHeight='25px' pl='5px'>
          {step <= 2 ? '2.' : <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', fontSize: '15px' }} />}
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>{t<string>('Wait for unstaking locking period')}</Typography>
        </Grid>
        <Grid alignItems='center' container item lineHeight='25px' pl='5px'>
          {step <= 3 ? '3.' : <CheckCircleOutlineSharpIcon sx={{ bgcolor: 'success.main', borderRadius: '50%', fontSize: '15px' }} />}
          <Typography fontSize='14px' fontWeight={300} lineHeight='inherit' pl='5px'>{t<string>('Come back here, and remove all')}</Typography>
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
            <PButton _mt='0' _onClick={goUnstakeAll} disabled={!needsUnboundAll} text={t<string>(`Unstake All (${(poolMembers && poolMembers.length - 1) ?? '...'})`)} />
          </Grid>}
        {(step !== 4) &&
          <Grid container item position='relative'>
            <PButton _mt='20px' _onClick={goRemoveAll} disabled={!members || RemoveAllBtnDisabled} text={t<string>('Remove All')} />
          </Grid>}
      </Grid>
      {showReview && mode && members &&
        <Review
          address={address}
          api={api}
          chain={chain}
          formatted={formatted}
          mode={mode}
          pool={pool}
          poolMembers={members}
          setShow={setShowReview}
          setShowMyPool={setShowRemoveAll}
          show={showReview}
        />}
    </Popup>
  );
}
