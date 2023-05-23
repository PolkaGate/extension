// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import keyring from '@polkadot/ui-keyring';
import { BN_ZERO } from '@polkadot/util';

import { AccountContext, Motion, ShortAddress, ShowBalance, ShowValue, Warning, WrongPasswordAlert } from '../../../../components';
import { useAccountName, useApi, useChain, useDecimal, useToken, useTranslation } from '../../../../hooks';
import { ThroughProxy } from '../../../../partials';
import broadcast from '../../../../util/api/broadcast';
import { Proxy, ProxyItem, TxInfo } from '../../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import PasswordWithTwoButtonsAndUseProxy from '../../components/PasswordWithTwoButtonsAndUseProxy';
import { ENDED_STATUSES, STATUS_COLOR } from '../../utils/consts';
import { STEPS, VoteInformation } from '.';
import DisplayValue from './partial/DisplayValue';
import { SubmittableExtrinsicFunction } from '@polkadot/api/types';

interface Props {
  address: string | undefined;
  estimatedFee: Balance | undefined;
  formatted: string | undefined;
  proxyItems: ProxyItem[] | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  selectedProxy: Proxy | undefined;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  voteInformation: VoteInformation;
  tx: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined;
  status: string | undefined;
}

export default function Review({ address, estimatedFee, formatted, proxyItems, selectedProxy, setStep, setTxInfo, status, step, tx, voteInformation }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const decimal = useDecimal(address);
  const token = useToken(address);
  const name = useAccountName(address);
  const { accounts } = useContext(AccountContext);
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);
  const ref = useRef(null);

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [modalHeight, setModalHeight] = useState<number | undefined>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);
  const isOngoing = !ENDED_STATUSES.includes(status);

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
      console.log('ref.current?.offsetHeight:', ref.current?.offsetHeight)
    }
  }, []);

  const confirmVote = useCallback(async () => {
    try {
      if (!formatted || !tx || !api || !decimal || !params) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;

      const signer = keyring.getPair(from);

      signer.unlock(password);

      setStep(STEPS.WAIT_SCREEN);

      const { block, failureText, fee, success, txHash } = await broadcast(api, tx, params, signer, formatted, selectedProxy);

      const info = {
        action: 'Governance',
        amount: voteInformation.voteBalance,
        block: block || 0,
        date: Date.now(),
        failureText,
        fee: estimatedFee || fee,
        from: { address: formatted, name },
        subAction: step === STEPS.REMOVE ? 'Remove vote' : 'Vote',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        // to: voteInformation.,
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setStep(STEPS.CONFIRM);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [formatted, tx, api, decimal, params, selectedProxyAddress, password, setStep, selectedProxy, voteInformation, estimatedFee, name, step, selectedProxyName, setTxInfo, chain]);

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
        <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '30px', width: '90%' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t<string>('Account holder')}:
          </Typography>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
            {name}
          </Typography>
          <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
            <ShortAddress address={formatted ?? address} inParentheses style={{ fontSize: '16px' }} />
          </Grid>
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
          <PasswordWithTwoButtonsAndUseProxy
            chain={chain}
            isPasswordError={isPasswordError}
            label={`${t<string>('Password')} for ${selectedProxyName || name || '...'}`}
            onChange={setPassword}
            onPrimaryClick={confirmVote}
            onSecondaryClick={onBackClick}
            primaryBtnText={t<string>('Confirm')}
            proxiedAddress={formatted}
            proxies={proxyItems}
            proxyTypeFilter={['Any']}
            selectedProxy={selectedProxy}
            setIsPasswordError={setIsPasswordError}
            setStep={setStep}
          />
        </Grid>
      </Grid>
    </Motion>
  );
}
