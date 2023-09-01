// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PalletIdentityIdentityInfo } from '@polkadot/types/lookup';

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import keyring from '@polkadot/ui-keyring';

import { ChainLogo, Identity, Motion, ShowBalance, WrongPasswordAlert } from '../../components';
import { useAccountDisplay, useApi, useChain, useFormatted, useProxies } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { ThroughProxy } from '../../partials';
import { signAndSend } from '../../util/api';
import { BalancesInfo, Proxy, ProxyItem, TxInfo } from '../../util/types';
import { amountToMachine, getSubstrateAddress, saveAsHistory } from '../../util/utils';
import { DraggableModal } from '../governance/components/DraggableModal';
import PasswordWithTwoButtonsAndUseProxy from '../governance/components/PasswordWithTwoButtonsAndUseProxy';
import SelectProxyModal from '../governance/components/SelectProxyModal';
import WaitScreen from '../governance/partials/WaitScreen';
import DisplayValue from '../governance/post/castVote/partial/DisplayValue';
import Confirmation from './Confirmation';
import { Title } from './InputPage';
import { Inputs, STEPS } from './';

interface Props {
  address: string;
  balances: BalancesInfo | undefined;
  inputs: Inputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Review({ address, balances, inputs, setRefresh, setStep, step }: Props): React.ReactElement {
  const { t } = useTranslation();
  const senderName = useAccountDisplay(address);
  const formatted = useFormatted(address);
  const api = useApi(address);
  const chain = useChain(address);
  const proxies = useProxies(api, formatted);
  const theme = useTheme();
  const recipientName = useAccountDisplay(inputs?.recipientAddress);

  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [password, setPassword] = useState<string>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxyAddress));

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const onConfirm = useCallback(async (): Promise<void> => {
    try {
      if (!formatted || !inputs?.call || !api || !inputs?.params) {
        return;
      }

      const from = selectedProxy?.delegate ?? formatted;
      const signer = keyring.getPair(from);

      signer.unlock(password);
      setStep(STEPS.WAIT_SCREEN);

      const tx = inputs.call(...inputs.params);
      const ptx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, tx) : tx;

      const { block, failureText, fee, success, txHash } = await signAndSend(api, ptx, signer, formatted);

      const info = {
        action: 'Transfer',
        amount: inputs.amount,
        block: block || 0,
        chain,
        date: Date.now(),
        decimal: balances?.decimal,
        failureText,
        fee: fee || String(inputs?.totalFee || 0),
        from: { address: String(formatted), name: senderName },
        recipientChainName: inputs?.recipientChainName,
        subAction: 'send',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        to: { address: String(inputs.recipientAddress), name: recipientName },
        token: balances?.token,
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(String(from), info);
      setStep(STEPS.CONFIRM);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [formatted, inputs, api, selectedProxy, password, setStep, chain, balances, senderName, recipientName, selectedProxyAddress, selectedProxyName]);

  const handleClose = useCallback(() => {
    setStep(STEPS.INDEX);
  }, [setStep]);

  const closeSelectProxy = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, [setStep]);

  const closeConfirmation = useCallback(() => {
    setRefresh(true);
    setStep(STEPS.INDEX);
  }, [setRefresh, setStep]);

  return (
    <Motion style={{ height: '100%', paddingInline: '10%', width: '100%' }}>
      <>
        <Grid container>
          {(step === STEPS.REVIEW || step === STEPS.PROXY) && (
            <Title padding='30px 0 0' text={t<string>('Review')} />
          )}
          {step === STEPS.WAIT_SCREEN && (
            <Title text={t<string>('Sending Fund')} />
          )}
          {step === STEPS.CONFIRM && (
            <Title text={t<string>(txInfo?.success ? t('Fund Sent') : t('Fund Send Failed'))} />

          )}
        </Grid>
        {(step === STEPS.REVIEW || step === STEPS.PROXY) &&
          <>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', mb: '20px', p: '1% 3%' }}>
              <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t<string>('From')}
                </Typography>
                <Identity
                  address={address}
                  api={api}
                  chain={chain}
                  direction='row'
                  identiconSize={31}
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
              <DisplayValue dividerHeight='1px' title={t<string>('Amount')}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <ShowBalance
                    balance={inputs?.amount && balances?.decimal && amountToMachine(inputs.amount, balances?.decimal)}
                    decimal={balances?.decimal}
                    decimalPoint={4}
                    token={balances?.token}
                  />
                </Grid>
              </DisplayValue>
              <DisplayValue dividerHeight='1px' title={t<string>('Chain')}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <ChainLogo chainName={chain?.name} size={31} />
                  <Typography fontSize='26px' pl='10px'>
                    {chain?.name}
                  </Typography>
                </Grid>
              </DisplayValue>
              <Divider sx={{ bgcolor: 'secondary.main', height: '3px', mx: 'auto', my: '5px', width: '170px' }} />
              <DisplayValue title={t<string>('To')} topDivider={false}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <Identity
                    address={inputs?.recipientAddress}
                    api={api}
                    chain={chain}
                    direction='row'
                    identiconSize={31}
                    showSocial={false}
                    style={{ maxWidth: '100%', width: 'fit-content' }}
                    withShortAddress
                  />
                </Grid>
              </DisplayValue>
              <DisplayValue dividerHeight='1px' title={t<string>('Chain')}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <ChainLogo chainName={inputs?.recipientChainName} size={31} />
                  <Typography fontSize='26px' pl='10px'>
                    {inputs?.recipientChainName}
                  </Typography>
                </Grid>
              </DisplayValue>
              <DisplayValue dividerHeight='3px' title={t<string>('Total transaction fee')}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <ShowBalance
                    api={api}
                    balance={inputs?.totalFee}
                    decimalPoint={4}
                  />
                </Grid>
              </DisplayValue>
            </Grid>
            <Grid container item sx={{ '> div #TwoButtons': { '> div': { justifyContent: 'space-between', width: '450px' }, justifyContent: 'flex-end' }, pb: '20px' }}>
              <PasswordWithTwoButtonsAndUseProxy
                chain={chain}
                isPasswordError={isPasswordError}
                label={`${t<string>('Password')} for ${selectedProxyName || senderName || ''}`}
                onChange={setPassword}
                onPrimaryClick={onConfirm}
                onSecondaryClick={handleClose}
                primaryBtnText={t<string>('Confirm')}
                proxiedAddress={formatted}
                proxies={proxyItems}
                proxyTypeFilter={['Any', 'NonTransfer']}
                secondaryBtnText={t<string>('Cancel')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setStep={setStep}
              />
            </Grid>
          </>
        }
        {step === STEPS.PROXY &&
          <DraggableModal onClose={closeSelectProxy} open={step === STEPS.PROXY}>
            <Grid container item>
              <Grid alignItems='center' container item justifyContent='space-between'>
                <Typography fontSize='22px' fontWeight={700}>
                  {t<string>('Select Proxy')}
                </Typography>
                <Grid item>
                  <CloseIcon onClick={closeSelectProxy} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
                </Grid>
              </Grid>
              <SelectProxyModal
                address={address}
                height={500}
                nextStep={STEPS.REVIEW}
                proxies={proxyItems}
                proxyTypeFilter={['Any']}
                selectedProxy={selectedProxy}
                setSelectedProxy={setSelectedProxy}
                setStep={setStep}
              />
            </Grid>
          </DraggableModal>
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {txInfo && step === STEPS.CONFIRM &&
          <Confirmation
            handleClose={closeConfirmation}
            txInfo={txInfo}
          />
        }
      </>
    </Motion>
  );
}
