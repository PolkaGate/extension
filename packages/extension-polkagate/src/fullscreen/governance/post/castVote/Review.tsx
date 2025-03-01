// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { AnyTuple } from '@polkadot/types/types';
import type { Proxy, TxInfo } from '../../../../util/types';
import type { VoteInformation } from '.';

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { BN_ZERO } from '@polkadot/util';

import { AccountHolderWithProxy, Motion, ShowBalance, ShowValue, SignArea2, Warning, WrongPasswordAlert } from '../../../../components';
import { useInfo, useTranslation } from '../../../../hooks';
import { PROXY_TYPE } from '../../../../util/constants';
import { ENDED_STATUSES, STATUS_COLOR } from '../../utils/consts';
import DisplayValue from './partial/DisplayValue';
import { STEPS } from '.';

interface Props {
  address: string | undefined;
  estimatedFee: Balance | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  selectedProxy: Proxy | undefined;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  voteInformation: VoteInformation;
  tx: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  status: string | undefined;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setModalHeight: React.Dispatch<React.SetStateAction<number | undefined>>;
  txType: 'Remove' | 'Vote';
}

export default function Review({ address, estimatedFee, selectedProxy, setModalHeight, setRefresh, setStep, setTxInfo, status, step, tx, txType, voteInformation }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { chain, decimal, token } = useInfo(address);
  const ref = useRef(null);

  const [isPasswordError, setIsPasswordError] = useState(false);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const isOngoing = !ENDED_STATUSES.includes(status || '');
  const extraInfo = useMemo(() => ({
    action: 'Governance',
    amount: voteInformation.voteBalance,
    fee: String(estimatedFee || 0),
    subAction: step === STEPS.REMOVE ? 'Remove vote' : 'Vote'
  }), [estimatedFee, step, voteInformation.voteBalance]);

  const VoteStatus = ({ vote }: { vote: 'Aye' | 'Nay' | 'Abstain' }) => {
    return (
      <Grid alignItems='center' container>
        <Grid item>
          <Typography fontSize='28px' fontWeight={500}>
            {t(vote)}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item width='fit-content'>
          {vote === 'Aye'
            ? <CheckIcon sx={{ color: STATUS_COLOR['Confirmed'], fontSize: '28px', stroke: STATUS_COLOR['Confirmed'], strokeWidth: 1.8 }} />
            : vote === 'Nay'
              ? <CloseIcon sx={{ color: 'warning.main', fontSize: '28px', stroke: theme.palette.warning.main, strokeWidth: 1.5 }} />
              : <AbstainIcon sx={{ color: 'primary.light', fontSize: '28px' }} />
          }
        </Grid>
      </Grid>
    );
  };

  const params = useMemo(() => {
    if (txType === 'Vote') {
      if (['Aye', 'Nay'].includes(voteInformation.voteType)) {
        return ([voteInformation.refIndex, {
          Standard: {
            balance: voteInformation.voteAmountBN,
            vote: {
              aye: voteInformation.voteType === 'Aye',
              conviction: voteInformation.voteConvictionValue
            }
          }
        }]);
      } else if (voteInformation.voteType === 'Abstain') {
        return ([voteInformation.refIndex, {
          SplitAbstain: {
            abstain: voteInformation.voteAmountBN,
            aye: BN_ZERO,
            nay: BN_ZERO
          }
        }]);
      }
    } else if (txType === 'Remove') {
      return [voteInformation.trackId, voteInformation.refIndex];
    }

    return undefined;
  }, [txType, voteInformation.refIndex, voteInformation.trackId, voteInformation.voteAmountBN, voteInformation.voteConvictionValue, voteInformation.voteType]);

  useEffect(() => {
    if (ref) {
      //@ts-ignore
      setModalHeight(ref.current?.offsetHeight as number);
    }
  }, [setModalHeight]);

  const onBackClick = useCallback(() => setStep(txType === 'Vote' ? STEPS.INDEX : STEPS.PREVIEW), [setStep, txType]);

  return (
    <Motion style={{ height: '100%' }}>
      <Grid container ref={ref}>
        {isPasswordError &&
          <WrongPasswordAlert />
        }
        {step === STEPS.REMOVE && isOngoing &&
          <Warning
            fontWeight={400}
            isBelowInput
            marginRight={40}
            theme={theme}
          >
            {t('Think twice before removing your vote. It may affect the outcome.')}
          </Warning>
        }
        <AccountHolderWithProxy
          address={address}
          chain={chain}
          direction='row'
          selectedProxyAddress={selectedProxyAddress}
          style={{ m: 'auto', pt: isPasswordError ? 0 : '10px' }}
        />
        <DisplayValue title={t('Vote')}>
          <VoteStatus vote={voteInformation.voteType} />
        </DisplayValue>
        <DisplayValue title={t('Vote Value ({{token}})', { replace: { token } })}>
          <Typography fontSize='28px' fontWeight={400}>
            {voteInformation.voteBalance}
          </Typography>
        </DisplayValue>
        {voteInformation.voteLockUpUpPeriod &&
          <DisplayValue title={t('Lock up Period')}>
            <Typography fontSize='28px' fontWeight={400}>
              {voteInformation.voteLockUpUpPeriod}
            </Typography>
          </DisplayValue>
        }
        <DisplayValue title={t('Final vote power')}>
          <Typography fontSize='28px' fontWeight={400}>
            <ShowBalance balance={voteInformation.votePower} decimal={decimal} decimalPoint={2} token={token} />
          </Typography>
        </DisplayValue>
        <DisplayValue title={t('Fee')}>
          <ShowValue height={20} value={estimatedFee?.toHuman()} />
        </DisplayValue>
        <Grid container item mt='15px'>
          {address &&
            <SignArea2
              address={address}
              call={tx}
              extraInfo={extraInfo}
              isPasswordError={isPasswordError}
              onSecondaryClick={onBackClick}
              params={params}
              previousStep={txType === 'Vote' ? STEPS.REVIEW : STEPS.REMOVE}
              primaryBtnText={t('Confirm')}
              proxyTypeFilter={PROXY_TYPE.GOVERNANCE}
              secondaryBtnText={t('Back')}
              selectedProxy={selectedProxy}
              setIsPasswordError={setIsPasswordError}
              setRefresh={setRefresh}
              setStep={setStep}
              setTxInfo={setTxInfo}
              step={step}
              steps={STEPS}
            />}
        </Grid>
      </Grid>
    </Motion>
  );
}
