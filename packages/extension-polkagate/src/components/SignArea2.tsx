// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types/submittable';
import type { Header } from '@polkadot/types/interfaces';
import type { AnyTuple, ISubmittableResult, SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { Proxy, ProxyItem, ProxyTypes, TxInfo, TxResult } from '../util/types';

import { faSignature } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { DraggableModal } from '../fullscreen/governance/components/DraggableModal';
import SelectProxyModal2 from '../fullscreen/governance/components/SelectProxyModal2';
import { useAccountDisplay, useInfo, useProxies, useTranslation } from '../hooks';
import Qr from '../popup/signing/Qr';
import { CMD_MORTAL } from '../popup/signing/Request';
import { send } from '../util/api';
import { getSubstrateAddress, saveAsHistory } from '../util/utils';
import SignWithLedger from './SignWithLedger';
import SignWithPassword from './SignWithPassword';
import { PButton, Progress, TwoButtons, Warning } from '.';

interface Props {
  address: string;
  maybeApi?: ApiPromise;
  call: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined | SubmittableExtrinsic<'promise', ISubmittableResult>;
  disabled?: boolean;
  isPasswordError?: boolean;
  onSecondaryClick: () => void;
  params?: unknown[] | (() => unknown[]) | undefined;
  primaryBtn?: boolean;
  primaryBtnText?: string;
  proxyModalHeight?: number | undefined
  prevState?: Record<string, unknown>;
  proxyTypeFilter: ProxyTypes[] | string[];
  secondaryBtnText?: string;
  selectedProxy: Proxy | undefined;
  setSelectedProxy?: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  setIsPasswordError: React.Dispatch<React.SetStateAction<boolean>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  showBackButtonWithUseProxy?: boolean;
  token?: string | undefined
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  extraInfo: Record<string, unknown> | undefined;
  steps: Record<string, number>;
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>>;
  previousStep?: number;
}

/**
 *  @description
 * This puts usually at the end of review page where user can do enter password,
 * choose proxy or use other alternatives like signing using ledger
 *
*/
export default function SignArea({ address, call, disabled, extraInfo, isPasswordError, maybeApi, onSecondaryClick, params, prevState, previousStep, primaryBtn, primaryBtnText, proxyModalHeight, proxyTypeFilter, secondaryBtnText, selectedProxy, setIsPasswordError, setRefresh, setSelectedProxy, setStep, setTxInfo, showBackButtonWithUseProxy = true, steps, token }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const { account, api: apiFromAddress, chain, formatted } = useInfo(address);

  // To handle system chain apis like people chain
  const api = maybeApi || apiFromAddress;

  const senderName = useAccountDisplay(address);
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxy?.delegate));
  const proxies = useProxies(api, formatted);

  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [showProxy, setShowProxy] = useState<boolean>();
  const [showQR, setShowQR] = useState<boolean>();
  const [lastHeader, setLastHeader] = useState<Header>();
  const [rawNonce, setRawNonce] = useState<number>();

  const from = selectedProxy?.delegate ?? formatted;

  const isLedger = useMemo(() => account?.isHardware, [account?.isHardware]);
  const showUseProxy = useMemo(() => !account?.isHardware && !account?.isQR && account?.isExternal && !selectedProxy, [account, selectedProxy]);
  const showQrSign = useMemo(() => account?.isQR, [account]);

  const alertText = useMemo(() => {
    if (isLedger) {
      return t('This is a ledger account. To complete this transaction, use your ledger.');
    }

    if (showQrSign) {
      return t('This is a QR-attached account. To complete this transaction, you need to use your QR-signer.');
    }

    if (showUseProxy) {
      return t('This is a watch-only account. To complete this transaction, you must use a proxy.');
    }

    return undefined;
  }, [isLedger, showQrSign, showUseProxy, t]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const ptx = useMemo((): SubmittableExtrinsic<'promise', ISubmittableResult> | undefined => {
    if (!call || !api) {
      return;
    }

    // @ts-ignore
    const tx = (params ? call(...params) : call) as SubmittableExtrinsic<'promise', ISubmittableResult>;

    return selectedProxy ? api.tx['proxy']['proxy'](formatted, selectedProxy.proxyType, tx) : tx;
  }, [api, call, formatted, params, selectedProxy]);

  const signerPayload = useMemo(() => {
    if (!api || !ptx || !lastHeader || !rawNonce) {
      return;
    }

    try {
      const _payload = {
        address: from,
        blockHash: lastHeader.hash.toHex(),
        blockNumber: api.registry.createType('BlockNumber', lastHeader.number.toNumber()).toHex(),
        era: api.registry.createType('ExtrinsicEra', { current: lastHeader.number.toNumber(), period: 64 }).toHex(),
        genesisHash: api.genesisHash.toHex(),
        method: api.createType('Call', ptx).toHex(), // TODO: DOES SUPPORT nested calls, batches , ...
        nonce: api.registry.createType('Compact<Index>', rawNonce).toHex(),
        signedExtensions: [
          'CheckNonZeroSender',
          'CheckSpecVersion',
          'CheckTxVersion',
          'CheckGenesis',
          'CheckMortality',
          'CheckNonce',
          'CheckWeight',
          'ChargeTransactionPayment'
        ],
        specVersion: api.runtimeVersion.specVersion.toHex(),
        tip: api.registry.createType('Compact<Balance>', 0).toHex(),
        transactionVersion: api.runtimeVersion.transactionVersion.toHex(),
        version: ptx.version
      };

      return _payload as SignerPayloadJSON;
    } catch (error) {
      console.error('Something went wrong when making payload:', error);

      return undefined;
    }
  }, [api, from, lastHeader, rawNonce, ptx]);

  const payload = useMemo(() => {
    if (!api || !signerPayload) {
      return;
    }

    return api.registry.createType('ExtrinsicPayload', signerPayload, { version: signerPayload.version });
  }, [api, signerPayload]);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  useEffect((): void => {
    if (api && from) {
      api.rpc.chain.getHeader().then(setLastHeader).catch(console.error);
      api.query['system']['account'](from).then((res: any) => setRawNonce(res?.nonce || 0)).catch(console.error);
    }
  }, [api, formatted, from, selectedProxy]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const goToSelectProxy = useCallback(() => {
    setShowProxy(true);

    setStep(steps['PROXY']);
  }, [setStep, steps]);

  const closeSelectProxy = useCallback(() => {
    setShowProxy(false);
  }, []);

  const goToQrScan = useCallback(() => {
    setShowQR(true);

    setStep(steps['SIGN_QR'] || 200);
  }, [setStep, steps]);

  const closeQrModal = useCallback(() => {
    setShowQR(false);
    previousStep !== undefined && setStep(previousStep);
  }, [previousStep, setStep]);

  const handleTxResult = useCallback((txResult: TxResult) => {
    try {
      if (!txResult || !api || !chain) {
        return;
      }

      setRefresh && setRefresh(true);

      const _token = token || api.registry.chainTokens[0];
      const decimal = api.registry.chainDecimals[0];

      const info = {
        block: txResult?.block || 0,
        chain,
        date: Date.now(),
        decimal,
        failureText: txResult?.failureText,
        from: { address: String(formatted), name: senderName },
        success: txResult?.success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        token: _token,
        txHash: txResult?.txHash || '',
        ...extraInfo
      };

      setTxInfo({ ...info as any, api, chain: chain as any });

      saveAsHistory(String(from), info as any);
      setStep(steps['CONFIRM']);
    } catch (e) {
      console.log('error:', e);
    }
  }, [api, chain, extraInfo, formatted, from, selectedProxyAddress, selectedProxyName, senderName, setRefresh, setStep, setTxInfo, steps, token]);

  const onSignature = useCallback(async ({ signature }: { signature: HexString }) => {
    if (!api || !payload || !signature || !ptx || !from) {
      return;
    }

    setStep(steps['WAIT_SCREEN']);

    const txResult = await send(from, api, ptx, payload.toHex(), signature);

    handleTxResult(txResult);
  }, [api, from, handleTxResult, payload, ptx, setStep, steps]);

  const SignUsingProxy = () => (
    <>
      <Grid alignItems='center' container height='50px' item sx={{ '> div': { m: 0, p: 0 }, pt: '5px' }}>
        <Warning
          theme={theme}
        >
          {alertText}
        </Warning>
      </Grid>
      {showBackButtonWithUseProxy
        ? <TwoButtons
          ml='0'
          mt='5px'
          onPrimaryClick={goToSelectProxy}
          onSecondaryClick={onSecondaryClick}
          primaryBtnText={t('Use Proxy')}
          secondaryBtnText={t('Back')}
          width='100%'
        />
        : <PButton
          _ml={0}
          _mt='5px'
          _onClick={goToSelectProxy}
          _width={100}
          text={t('Use Proxy')}
        />
      }
    </>
  );

  const SignWithQR = () => (
    <>
      <Grid alignItems='center' container height='50px' item sx={{ '> div': { m: 0, p: 0 }, pt: '5px' }}>
        <Warning
          theme={theme}
        >
          {alertText}
        </Warning>
      </Grid>
      <TwoButtons
        ml='0'
        mt='5px'
        onPrimaryClick={goToQrScan}
        onSecondaryClick={onSecondaryClick}
        primaryBtnText={t('Use QR-Signer')}
        secondaryBtnText={t('Back')}
        width='100%'
      />
    </>
  );

  return (
    <Grid container>
      {isLedger
        ? <SignWithLedger
          address={address}
          alertText={alertText}
          api={api}
          from={from}
          handleTxResult={handleTxResult}
          onSecondaryClick={onSecondaryClick}
          onSignature={onSignature}
          payload={payload}
          ptx={ptx}
          setStep={setStep}
          signerPayload={signerPayload}
          steps={steps}
        />
        : showQrSign
          ? <SignWithQR />
          : showUseProxy
            ? <SignUsingProxy />
            : <SignWithPassword
              address={address}
              api={api}
              disabled={disabled}
              from={from}
              goToSelectProxy={goToSelectProxy}
              handleTxResult={handleTxResult}
              isPasswordError={isPasswordError}
              onSecondaryClick={onSecondaryClick}
              prevState={prevState}
              primaryBtn={primaryBtn}
              primaryBtnText={primaryBtnText}
              proxies={proxies}
              ptx={ptx}
              secondaryBtnText={secondaryBtnText}
              selectedProxy={selectedProxy}
              selectedProxyName={selectedProxyName}
              senderName={senderName}
              setIsPasswordError={setIsPasswordError}
              setStep={setStep}
              steps={steps}
            />
      }
      {showProxy && setSelectedProxy &&
        <DraggableModal onClose={closeSelectProxy} open={showProxy}>
          <Grid container item>
            <Grid alignItems='center' container item justifyContent='space-between'>
              <Typography fontSize='22px' fontWeight={700}>
                {t('Select Proxy')}
              </Typography>
              <Grid item>
                <CloseIcon onClick={closeSelectProxy} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
              </Grid>
            </Grid>
            <SelectProxyModal2
              address={address}
              closeSelectProxy={closeSelectProxy}
              height={proxyModalHeight || 500}
              proxies={proxyItems}
              proxyTypeFilter={proxyTypeFilter || ['Any']}
              selectedProxy={selectedProxy}
              setSelectedProxy={setSelectedProxy}
            />
          </Grid>
        </DraggableModal>
      }
      {showQR &&
        <DraggableModal onClose={closeQrModal} open={showQR}>
          <Grid container item>
            <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
              <Grid alignItems='center' container justifyContent='flex-start' sx={{ width: 'fit-content' }}>
                <Grid item>
                  <FontAwesomeIcon
                    color={`${theme.palette.text.primary}`}
                    fontSize='25px'
                    icon={faSignature}
                  />
                </Grid>
                <Grid item sx={{ pl: '10px' }}>
                  <Typography fontSize='18px' fontWeight={700}>
                    {t('Sign with QR code')}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item>
                <CloseIcon
                  onClick={closeQrModal}
                  sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }}
                />
              </Grid>
            </Grid>
            <Grid alignItems='center' container item justifyContent='center' sx={{ '> div': { width: 'inherit' }, pt: '30px' }}>
              {formatted && (account?.genesisHash || api?.genesisHash?.toHex()) && payload
                ? <Qr
                  address={formatted}
                  buttonLeft='0px'
                  cmd={CMD_MORTAL}
                  genesisHash={account?.genesisHash || api?.genesisHash?.toHex() as string}
                  onSignature={onSignature}
                  payload={payload}
                />
                : <Progress pt='20px' title={t('API is not connected yet ...')} type='grid' />
              }
            </Grid>
          </Grid>
        </DraggableModal>
      }
    </Grid>
  );
}
