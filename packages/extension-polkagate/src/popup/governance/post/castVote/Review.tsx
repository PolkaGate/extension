// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import type { Balance } from '@polkadot/types/interfaces';
import type { AnyTuple } from '@polkadot/types/types';

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { BN_ZERO } from '@polkadot/util';

import { Identity, Motion, ShowBalance, ShowValue, SignArea2, Warning, WrongPasswordAlert } from '../../../../components';
import { useApi, useChain, useDecimal, useToken, useTranslation } from '../../../../hooks';
import { ThroughProxy } from '../../../../partials';
import { Proxy, TxInfo } from '../../../../util/types';
import { ENDED_STATUSES, GOVERNANCE_PROXY, STATUS_COLOR } from '../../utils/consts';
import DisplayValue from './partial/DisplayValue';
import { STEPS, VoteInformation } from '.';

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
}

export default function Review({ address, estimatedFee, selectedProxy, setRefresh, setStep, setTxInfo, status, step, tx, voteInformation }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const decimal = useDecimal(address);
  const token = useToken(address);
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);
  const ref = useRef(null);

  const [isPasswordError, setIsPasswordError] = useState(false);
  const [modalHeight, setModalHeight] = useState<number | undefined>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const isOngoing = !ENDED_STATUSES.includes(status);
  const extraInfo = useMemo(() => ({
    action: 'Governance',
    amount: voteInformation.voteBalance,
    fee: String(estimatedFee || 0),
    subAction: step === STEPS.REMOVE ? 'Remove vote' : 'Vote',
  }), [estimatedFee, step, voteInformation.voteBalance]);

  const VoteStatus = ({ vote }: { vote: 'Aye' | 'Nay' | 'Abstain' }) => {
    return (
      <Grid alignItems='center' container>
        <Grid item>
          <Typography fontSize='28px' fontWeight={500}>
            {t<string>(vote)}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item width='fit-content'>
          {vote === 'Aye'
            ? <CheckIcon sx={{ color: STATUS_COLOR.Confirmed, fontSize: '28px', stroke: STATUS_COLOR.Confirmed, strokeWidth: 1.8 }} />
            : vote === 'Nay'
              ? <CloseIcon sx={{ color: 'warning.main', fontSize: '28px', stroke: theme.palette.warning.main, strokeWidth: 1.5 }} />
              : <AbstainIcon sx={{ color: 'primary.light', fontSize: '28px' }} />
          }
        </Grid>
      </Grid>
    );
  };

  const params = useMemo(() => {
    if (step === STEPS.REVIEW) {
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
    } else if (step === STEPS.REMOVE) {
      return [voteInformation.trackId, voteInformation.refIndex];
    }
  }, [step, voteInformation]);

  useEffect(() => {
    if (ref) {
      setModalHeight(ref.current?.offsetHeight as number);
    }
  }, []);

  const onBackClick = useCallback(() =>
    setStep(step === STEPS.REVIEW ? STEPS.INDEX : STEPS.PREVIEW)
  , [setStep, step]);

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
            theme={theme}
          >
            {t<string>('Think twice before removing your vote. It may affect the outcome.')}
          </Warning>
        }
        <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: isPasswordError ? 0 : '10px', width: '90%' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t<string>('Account holder')}
          </Typography>
          <Identity
            address={address}
            api={api}
            chain={chain}
            direction='row'
            identiconSize={35}
            showSocial={false}
            style={{ maxWidth: '100%', width: 'fit-content' }}
            withShortAddress
          />
        </Grid>
        {selectedProxyAddress &&
          <Grid container m='auto' maxWidth='92%'>
            <ThroughProxy address={selectedProxyAddress} chain={chain} />
          </Grid>
        }
        <DisplayValue title={t<string>('Vote')}>
          <VoteStatus vote={voteInformation.voteType} />
        </DisplayValue>
        <DisplayValue title={t<string>('Vote Value ({{token}})', { replace: { token } })}>
          <Typography fontSize='28px' fontWeight={400}>
            {voteInformation.voteBalance}
          </Typography>
        </DisplayValue>
        {voteInformation.voteLockUpUpPeriod &&
          <DisplayValue title={t<string>('Lock up Period')}>
            <Typography fontSize='28px' fontWeight={400}>
              {voteInformation.voteLockUpUpPeriod}
            </Typography>
          </DisplayValue>
        }
        <DisplayValue title={t<string>('Final vote power')}>
          <Typography fontSize='28px' fontWeight={400}>
            <ShowBalance balance={voteInformation.votePower} decimal={decimal} decimalPoint={2} token={token} />
          </Typography>
        </DisplayValue>
        <DisplayValue title={t<string>('Fee')}>
          <ShowValue height={20} value={estimatedFee?.toHuman()} />
        </DisplayValue>
        <Grid container item mt='15px'>
          <SignArea2
            address={address}
            call={tx}
            extraInfo={extraInfo}
            isPasswordError={isPasswordError}
            onSecondaryClick={onBackClick}
            params={params}
            primaryBtnText={t<string>('Confirm')}
            proxyTypeFilter={GOVERNANCE_PROXY}
            secondaryBtnText={t<string>('Back')}
            selectedProxy={selectedProxy}
            setIsPasswordError={setIsPasswordError}
            setRefresh={setRefresh}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
            steps={STEPS}
          />
        </Grid>
      </Grid>
    </Motion>
  );
}
