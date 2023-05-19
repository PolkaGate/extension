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

import { AccountContext, Motion, ShortAddress, ShowValue, WrongPasswordAlert } from '../../../../../components';
import { useAccountName, useApi, useChain, useDecimal, useProxies, useToken, useTranslation } from '../../../../../hooks';
import { ThroughProxy } from '../../../../../partials';
import broadcast from '../../../../../util/api/broadcast';
import { Proxy, ProxyItem, TxInfo } from '../../../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../../../util/utils';
import PasswordWithTwoButtonsAndUseProxy from '../../../components/PasswordWithTwoButtonsAndUseProxy';
import SelectProxyModal from '../../../components/SelectProxyModal';
import WaitScreen from '../../../partials/WaitScreen';
import { STATUS_COLOR } from '../../../utils/consts';
import { STEPS, VoteInformation } from '..';
import Confirmation from './Confirmation';
import DisplayValue from './DisplayValue';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  voteInformation: VoteInformation;
  handleClose: () => void;
  estimatedFee: Balance | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
}

export default function Review({ address, estimatedFee, formatted, handleClose, setStep, step, voteInformation }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const decimal = useDecimal(address);
  const token = useToken(address);
  const name = useAccountName(address);
  const { accounts } = useContext(AccountContext);
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);
  const proxies = useProxies(api, formatted);
  const ref = useRef(null);

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [modalHeight, setModalHeight] = useState<number | undefined>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const vote = api && api.tx.convictionVoting.vote;

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

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const params = useMemo(() => {
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
  }, [voteInformation]);

  useEffect(() => {
    if (ref) {
      setModalHeight(ref.current?.offsetHeight as number);
      console.log('ref.current?.offsetHeight:', ref.current?.offsetHeight)
    }
  }, []);

  const confirmVote = useCallback(async () => {
    try {
      if (!formatted || !vote || !api || !decimal || !params) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;

      const signer = keyring.getPair(from);

      signer.unlock(password);

      setStep(2);

      const { block, failureText, fee, success, txHash } = await broadcast(api, vote, params, signer, formatted, selectedProxy);

      const info = {
        action: 'Governance',
        amount: voteInformation.voteBalance,
        block: block || 0,
        date: Date.now(),
        failureText,
        fee: estimatedFee || fee,
        from: { address: formatted, name },
        subAction: 'Vote',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        // to: voteInformation.,
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setStep(3);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [name, api, chain, decimal, estimatedFee, formatted, params, password, selectedProxy, selectedProxyAddress, selectedProxyName, setStep, vote, voteInformation.voteBalance]);

  const backToCastVote = useCallback(() => setStep(0), [setStep]);

  return (
    <Motion style={{ height: '100%' }}>
      {step === STEPS.REVIEW &&
        <Grid container ref={ref}>
          {isPasswordError &&
            <WrongPasswordAlert />
          }
          {/* <AccountHolderWithProxy
            address={address}
            chain={chain}
            selectedProxyAddress={selectedProxyAddress}
            title={t('Account')}
          /> */}
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
          <DisplayValue title={t<string>('Lock up Period')}>
            <Typography fontSize='28px' fontWeight={400}>
              {voteInformation.voteLockUpUpPeriod}
            </Typography>
          </DisplayValue>
          <DisplayValue title={t<string>('Final vote power')}>
            <Typography fontSize='28px' fontWeight={400}>
              {voteInformation.votePower}
            </Typography>
          </DisplayValue>
          <DisplayValue title={t<string>('Fee')}>
            <ShowValue height={20} value={estimatedFee?.toHuman()} />
          </DisplayValue>
          <PasswordWithTwoButtonsAndUseProxy
            chain={chain}
            isPasswordError={isPasswordError}
            label={`${t<string>('Password')} for ${selectedProxyName || name}`}
            onChange={setPassword}
            onPrimaryClick={confirmVote}
            onSecondaryClick={backToCastVote}
            primaryBtnText={t<string>('Confirm')}
            proxiedAddress={formatted}
            proxies={proxyItems}
            proxyTypeFilter={['Any']}
            selectedProxy={selectedProxy}
            setIsPasswordError={setIsPasswordError}
            setStep={setStep}
          />
        </Grid>
      }
      {step === STEPS.WAIT_SCREEN &&
        <WaitScreen />
      }
      {step === STEPS.CONFIRM &&
        <Confirmation
          address={address}
          handleClose={handleClose}
          txInfo={txInfo}
          voteInformation={voteInformation}
        />
      }
      {step === STEPS.PROXY &&
        <SelectProxyModal
          address={address}
          height={modalHeight}
          proxies={proxyItems}
          proxyTypeFilter={['Any', 'Governance', 'NonTransfer']}
          selectedProxy={selectedProxy}
          setSelectedProxy={setSelectedProxy}
          setStep={setStep}
        />
      }
    </Motion>
  );
}
