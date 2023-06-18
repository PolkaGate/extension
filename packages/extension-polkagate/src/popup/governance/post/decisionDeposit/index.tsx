// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { BN_ONE } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext, Identity, ShowBalance, Warning } from '../../../../components';
import { useAccountName, useApi, useBalances, useChain, useDecimal, useFormatted, useProxies, useToken, useTranslation } from '../../../../hooks';
import { Track } from '../../../../hooks/useTrack';
import { broadcast } from '../../../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import { DraggableModal } from '../../components/DraggableModal';
import PasswordWithTwoButtonsAndUseProxy from '../../components/PasswordWithTwoButtonsAndUseProxy';
import SelectProxyModal from '../../components/SelectProxyModal';
import WaitScreen from '../../partials/WaitScreen';
import DisplayValue from '../castVote/partial/DisplayValue';
import Confirmation from './Confirmation';

interface Props {
  address: string | undefined;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean | undefined>>
  refIndex: number | undefined;
  track: Track | undefined;

}

const STEPS = {
  REVIEW: 1,
  CONFIRM: 2,
  WAIT_SCREEN: 3,
  PROXY: 100
};

export default function DecisionDeposit({ address, open, refIndex, setOpen, track }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const theme = useTheme();
  const name = useAccountName(address);
  const balances = useBalances(address);
  const { accounts } = useContext(AccountContext);
  const proxies = useProxies(api, formatted);

  const proxyItems = useMemo(() =>
    proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[]
    , [proxies]);

  const [step, setStep] = useState<number>(STEPS.REVIEW);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [password, setPassword] = useState<string | undefined>();

  const tx = api && api.tx.referenda.placeDecisionDeposit;
  const amount = track?.[1]?.decisionDeposit;
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  useEffect(() => {
    if (!formatted || !tx) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    const feeDummyParams = [1];

    tx(...feeDummyParams).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, formatted, tx]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const handleClose = useCallback(() => {
    if (step === STEPS.PROXY) {
      setStep(STEPS.REVIEW);

      return;
    }

    setOpen(false);
  }, [setOpen, step]);

  const confirm = useCallback(async () => {
    try {
      if (!formatted || !tx || !api || !decimal || !refIndex) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setStep(STEPS.WAIT_SCREEN);

      const { block, failureText, fee, success, txHash } = await broadcast(api, tx, [refIndex], signer, formatted, selectedProxy);

      const info = {
        action: 'Governance',
        amount,
        block: block || 0,
        date: Date.now(),
        failureText,
        fee: fee || estimatedFee,
        from: { address: formatted, name },
        subAction: 'Pay Decision Deposit',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setStep(STEPS.CONFIRM);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [amount, api, chain, decimal, estimatedFee, formatted, name, password, refIndex, selectedProxy, selectedProxyAddress, selectedProxyName, tx]);

  const title = useMemo(() => {
    if (step === STEPS.REVIEW) {
      return 'Pay Decision Deposit';
    }

    if (step === STEPS.PROXY) {
      return 'Select Proxy';
    }

    if (step === STEPS.WAIT_SCREEN) {
      return 'Paying';
    }

    if (step === STEPS.CONFIRM) {
      return 'Paying Completed';
    }
  }, [step]);

  const HEIGHT = 550;

  const notEnoughBalance = useMemo(() => amount && estimatedFee && balances?.availableBalance?.lt(amount.add(estimatedFee)), [amount, balances, estimatedFee]);

  return (
    <DraggableModal onClose={handleClose} open={open} width={500}>
      <Grid container item justifyContent='center' sx={{ height: '625px' }} >
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={HEIGHT}>
              {title}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        {notEnoughBalance &&
          <Grid container height='15px' item justifyContent='center' my='20px'>
            <Warning
              fontWeight={400}
              isDanger
              theme={theme}
            >
              {t<string>('You don\'t have sufficient funds available to complete this transaction.')}
            </Warning>
          </Grid>
        }
        {step === STEPS.REVIEW &&
          <Grid container item sx={{ height: '550px' }}>
            <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '30px', width: '90%' }}>
              <DisplayValue title={t<string>('Referendum')} topDivider={false}>
                <Typography fontSize='28px' fontWeight={400}>
                  #{refIndex}
                </Typography>
              </DisplayValue>
              <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t<string>('Account')}
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
              <DisplayValue title={t<string>('Decision Deposit')}>
                <Grid alignItems='center' container height={42} item>
                  <ShowBalance balance={amount} decimal={decimal} skeletonWidth={130} token={token} />
                </Grid>
              </DisplayValue>
              <DisplayValue title={t<string>('Fee')}>
                <Grid alignItems='center' container height={42} item>
                  <ShowBalance balance={estimatedFee} decimal={decimal} skeletonWidth={130} token={token} />
                </Grid>
              </DisplayValue>
            </Grid>
            <Grid container item sx={{ pt: '40px' }}>
              <PasswordWithTwoButtonsAndUseProxy
                chain={chain}
                disabled={notEnoughBalance}
                isPasswordError={isPasswordError}
                label={`${t<string>('Password')} for ${selectedProxyName || name || ''}`}
                onChange={setPassword}
                onPrimaryClick={confirm}
                onSecondaryClick={() => setOpen(false)}
                primaryBtnText={t<string>('Confirm')}
                proxiedAddress={formatted}
                proxies={proxyItems}
                proxyTypeFilter={['Any']}
                secondaryBtnText={t<string>('Reject')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setStep={setStep}
                showBackButtonWithUseProxy={false}
              />
            </Grid>
          </Grid>
        }
        {step === STEPS.PROXY &&
          <SelectProxyModal
            address={address}
            height={HEIGHT}
            proxies={proxyItems}
            proxyTypeFilter={['Any', 'Governance', 'NonTransfer']}
            selectedProxy={selectedProxy}
            setSelectedProxy={setSelectedProxy}
            setStep={setStep}
          />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {step === STEPS.CONFIRM && txInfo && refIndex &&
          <Confirmation
            address={address}
            handleClose={handleClose}
            refIndex={refIndex}
            txInfo={txInfo}
          />
        }
      </Grid>
    </DraggableModal>
  );
}
