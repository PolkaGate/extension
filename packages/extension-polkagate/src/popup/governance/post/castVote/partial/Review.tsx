// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Check as CheckIcon, Close as CloseIcon, RemoveCircle as AbstainIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import keyring from '@polkadot/ui-keyring';
import { BN_ZERO } from '@polkadot/util';

import { AccountContext, AccountHolderWithProxy, Motion, PasswordUseProxyConfirm, ShowValue, WrongPasswordAlert } from '../../../../../components';
import { useAccountName, useApi, useChain, useDecimal, useProxies, useToken, useTranslation } from '../../../../../hooks';
import broadcast from '../../../../../util/api/broadcast';
import { Proxy, ProxyItem, TxInfo } from '../../../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../../../util/utils';
import { STATUS_COLOR } from '../../../utils/consts';
import { VoteInformation } from '../CastVote';
import Confirmation from './Confirmation';
import WaitScreen from './WaitScreen';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  voteInformation: VoteInformation;
  handleClose: () => void;
  estimatedFee: Balance | undefined;
}

export default function Review({ address, estimatedFee, formatted, voteInformation, handleClose }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const decimal = useDecimal(address);
  const token = useToken(address);
  const accountName = useAccountName(address)
  const { accounts } = useContext(AccountContext);
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);
  const proxies = useProxies(api, formatted);

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [showWaitScreen, setShowWaitScreen] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [params, setParams] = useState<unknown[] | undefined>();

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

  const DisplayValue = ({ children, title, topDivider = true }: { children: React.ReactNode, topDivider?: boolean, title: string }) => {
    return (
      <Grid alignItems='center' container direction='column' justifyContent='center'>
        <Grid item>
          {topDivider && <Divider sx={{ bgcolor: 'secondary.main', height: '2px', my: '5px', width: '170px' }} />}
        </Grid>
        <Grid item>
          <Typography>
            {title}
          </Typography>
        </Grid>
        <Grid item fontSize='28px' fontWeight={500}>
          {children}
        </Grid>
      </Grid>
    );
  };

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  useEffect((): void => {
    if (['Aye', 'Nay'].includes(voteInformation.voteType)) {
      setParams([voteInformation.refIndex, {
        Standard: {
          balance: voteInformation.voteAmountBN,
          vote: {
            aye: voteInformation.voteType === 'Aye',
            conviction: voteInformation.voteConvictionValue
          }
        }
      }]);
    } else if (voteInformation.voteType === 'Abstain') {
      setParams([voteInformation.refIndex, {
        SplitAbstain: {
          abstain: voteInformation.voteAmountBN,
          aye: BN_ZERO,
          nay: BN_ZERO
        }
      }]);
    }
  }, [voteInformation.refIndex, voteInformation.trackId, voteInformation.voteAmountBN, voteInformation.voteConvictionValue, voteInformation.voteType]);

  const confirmVote = useCallback(async () => {
    try {
      if (!formatted || !vote || !api || !decimal || !params) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);

      setShowWaitScreen(true);

      const { block, failureText, fee, success, txHash } = await broadcast(api, vote, params, signer, formatted, selectedProxy);

      const info = {
        action: 'Governance',
        amount: voteInformation.voteBalance,
        block: block || 0,
        date: Date.now(),
        failureText,
        fee: estimatedFee || fee,
        from: { address: from, name: selectedProxyName || accountName },
        subAction: 'Vote',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        // to: voteInformation.,
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setShowWaitScreen(false);
      setShowConfirmation(true);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [accountName, api, chain, decimal, estimatedFee, formatted, params, password, selectedProxy, selectedProxyAddress, selectedProxyName, vote, voteInformation.voteBalance]);

  return (
    <Motion style={{ height: '100%' }}>
      {!showWaitScreen && !showConfirmation
        ? <>
          {isPasswordError &&
            <WrongPasswordAlert />
          }
          <AccountHolderWithProxy
            address={address}
            chain={chain}
            selectedProxyAddress={selectedProxyAddress}
            title={t('Account')}
          />
          <DisplayValue title={t<string>('Vote')}>
            <VoteStatus vote={voteInformation.voteType} />
          </DisplayValue>
          <DisplayValue title={t<string>('Vote Value({{token}})', { replace: { token } })}>
            <Typography fontSize='28px' fontWeight={500}>
              {voteInformation.voteBalance}
            </Typography>
          </DisplayValue>
          <DisplayValue title={t<string>('Lock up Period')}>
            <Typography fontSize='28px' fontWeight={500}>
              {voteInformation.voteLockUpUpPeriod}
            </Typography>
          </DisplayValue>
          <DisplayValue title={t<string>('Final vote power')}>
            <Typography fontSize='28px' fontWeight={500}>
              {voteInformation.votePower}
            </Typography>
          </DisplayValue>
          <DisplayValue title={t<string>('Fee')}>
            <ShowValue height={20} value={estimatedFee?.toHuman()} />
          </DisplayValue>
          <Grid container item sx={{ height: '130px', position: 'relative', pt: '10px' }}>
            <PasswordUseProxyConfirm
              api={api}
              confirmText={t<string>('Confirm')}
              genesisHash={chain?.genesisHash}
              isPasswordError={isPasswordError}
              label={`${t<string>('Password')} for ${selectedProxyName || accountName}`}
              onChange={setPassword}
              onConfirmClick={confirmVote}
              proxiedAddress={formatted}
              proxies={proxyItems}
              proxyTypeFilter={['Any']}
              selectedProxy={selectedProxy}
              setIsPasswordError={setIsPasswordError}
              setSelectedProxy={setSelectedProxy}
              style={{
                bottom: '80px',
                left: '6%',
                position: 'absolute',
                width: '88%'
              }}
            />
          </Grid>
        </>
        : showWaitScreen
          ? <WaitScreen />
          : <Confirmation
            address={address}
            handleClose={handleClose}
            txInfo={txInfo}
            voteInformation={voteInformation}
          />}
    </Motion>
  );
}
