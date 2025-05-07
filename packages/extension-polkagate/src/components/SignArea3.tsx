// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import type { GenericExtrinsicPayload } from '@polkadot/types/extrinsic';
import type { ExtrinsicPayload, Header } from '@polkadot/types/interfaces';
import type { FrameSystemAccountInfo } from '@polkadot/types/lookup';
import type { ISubmittableResult, SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { Proxy, ProxyTypes, TxInfo, TxResult } from '../util/types';

import { Container, Stack, Typography, useTheme } from '@mui/material';
import { ColorSwatch, Data, ScanBarcode, Warning2 } from 'iconsax-react';
import React, { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useAccount, useAccountDisplay2, useChainInfo, useFormatted3, useProxies, useTranslation } from '../hooks';
import { TRANSACTION_FLOW_STEPS } from '../partials/TransactionFlow';
import Qr from '../popup/signing/Request/Qr';
import { CMD_MORTAL } from '../popup/signing/types';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { send } from '../util/api';
import { getSubstrateAddress, noop } from '../util/utils';
import SignUsingPassword from './SignUsingPassword';
import { ExtensionPopup, SignUsingProxy } from '.';

type AlertHandler = {
  alertText: string;
  buttonText: string;
  icon: ReactNode;
  onClick: () => void;
} | undefined;

interface SignUsingQRProps {
  handleClose: () => void;
  openMenu: boolean;
  onSignature: ({ signature }: { signature: HexString; }) => void;
  payload: GenericExtrinsicPayload | undefined;
  signerPayload: SignerPayloadJSON | undefined;
}

const SignUsingQR = ({ handleClose, onSignature, openMenu, payload, signerPayload }: SignUsingQRProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <ExtensionPopup
      TitleIcon={ScanBarcode}
      handleClose={handleClose}
      iconColor={theme.palette.text.highlight}
      iconSize={25}
      openMenu={openMenu}
      title={t('Select Proxy')}
    >
      <Qr
        address={signerPayload?.address ?? ''}
        cmd={CMD_MORTAL}
        genesisHash={signerPayload?.genesisHash ?? ''}
        onSignature={onSignature}
        payload={payload as ExtrinsicPayload}
      />
    </ExtensionPopup>
  );
};

interface SignUsingPasswordProps {
  alertHandler: AlertHandler;
}

const ChooseSigningButton = ({ alertHandler }: SignUsingPasswordProps) => {
  if (!alertHandler) {
    return null;
  }

  return (
    <Stack direction='column' sx={{ bottom: '15px', left: 0, position: 'absolute', px: '15px', right: 0, width: '100%' }}>
      <Container disableGutters sx={{ columnGap: '8px', display: 'flex' }}>
        <Warning2 color='#596AFF' size='35' style={{ height: 'fit-content' }} variant='Bold' />
        <Typography color='text.highlight' textAlign='left' variant='B-4'>
          {alertHandler.alertText}
        </Typography>
      </Container>
      <StakingActionButton
        onClick={alertHandler.onClick}
        startIcon={alertHandler.icon}
        style={{ mt: '18px' }}
        text={alertHandler.buttonText}
      />
    </Stack>
  );
};

interface Props {
  address: string | undefined;
  maybeApi?: ApiPromise;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
  proxyTypeFilter: ProxyTypes[] | undefined;
  genesisHash: string | null | undefined;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  setFlowStep: React.Dispatch<React.SetStateAction<TRANSACTION_FLOW_STEPS>>;
  selectedProxy: Proxy | undefined;
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  setShowProxySelection: React.Dispatch<React.SetStateAction<boolean>>;
  showProxySelection: boolean;
}

/**
 *  @description
 * This puts usually at the end of review page where user can do enter password,
 * choose proxy or use other alternatives like signing using ledger
 *
*/
export default function SignArea3 ({ address, genesisHash, maybeApi, proxyTypeFilter, selectedProxy, setFlowStep, setSelectedProxy, setShowProxySelection, setTxInfo, showProxySelection, transaction }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(address);
  const { api: apiFromGenesisHash, chain, token } = useChainInfo(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  // To handle system chain apis like people chain
  const api = maybeApi || apiFromGenesisHash;

  const senderName = useAccountDisplay2(address, genesisHash);
  const proxies = useProxies(api, formatted);

  const [showQR, setShowQR] = useState<boolean>(false);
  const [lastHeader, setLastHeader] = useState<Header>();
  const [rawNonce, setRawNonce] = useState<number>();

  const selectedProxyName = useAccountDisplay2(getSubstrateAddress(selectedProxy?.delegate), genesisHash);
  const from = selectedProxy?.delegate ?? formatted ?? address;

  const isLedger = useMemo(() => account?.isHardware, [account?.isHardware]);
  const showUseProxy = useMemo(() => !account?.isHardware && !account?.isQR && account?.isExternal && !selectedProxy, [account, selectedProxy]);
  const showQrSign = useMemo(() => account?.isQR, [account]);
  const noPrivateKeyAccount = useMemo(() => account?.isExternal || account?.isHardware || account?.isQR, [account]);

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const preparedTransaction = useMemo((): SubmittableExtrinsic<'promise', ISubmittableResult> | undefined => {
    if (!transaction || !api) {
      return;
    }

    return selectedProxy ? api.tx['proxy']['proxy'](formatted, selectedProxy.proxyType, transaction) : transaction;
  }, [api, formatted, selectedProxy, transaction]);

  const signerPayload = useMemo(() => {
    if (!api || !preparedTransaction || !lastHeader || !rawNonce) {
      return;
    }

    try {
      const _payload = {
        address: from,
        blockHash: lastHeader.hash.toHex(),
        blockNumber: api.registry.createType('BlockNumber', lastHeader.number.toNumber()).toHex(),
        era: api.registry.createType('ExtrinsicEra', { current: lastHeader.number.toNumber(), period: 64 }).toHex(),
        genesisHash: api.genesisHash.toHex(),
        method: api.createType('Call', preparedTransaction).toHex(), // TODO: DOES SUPPORT nested calls, batches , ...
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
        version: preparedTransaction.version
      };

      return _payload as SignerPayloadJSON;
    } catch (error) {
      console.error('Something went wrong when making payload:', error);

      return undefined;
    }
  }, [api, from, lastHeader, rawNonce, preparedTransaction]);

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
      api.query['system']['account'](from).then((res) => setRawNonce((res as FrameSystemAccountInfo)?.nonce.toNumber() || 0)).catch(console.error);
    }
  }, [api, formatted, from, selectedProxy]);

  const toggleSelectProxy = useCallback(() => setShowProxySelection((show) => !show), [setShowProxySelection]);
  const toggleQrScan = useCallback(() => setShowQR((show) => !show), []);

  const alertHandler = useMemo((): AlertHandler => {
    if (isLedger) {
      return {
        alertText: t('This is a ledger account. To complete this transaction, use your ledger.'),
        buttonText: t('Use Ledger'),
        icon: <ColorSwatch color={theme.palette.text.primary} size={18} variant='Bold' />,
        onClick: noop
      };
    }

    if (showQrSign) {
      return {
        alertText: t('This is a QR-attached account. To complete this transaction, you need to use your QR-signer.'),
        buttonText: t('Use QR-Signer'),
        icon: <ScanBarcode color={theme.palette.text.primary} size={18} variant='Bold' />,
        onClick: toggleQrScan
      };
    }

    if (showUseProxy) {
      return {
        alertText: t('This is a watch-only account. To complete this transaction, you must use a proxy.'),
        buttonText: t('Use Proxy'),
        icon: <Data color={theme.palette.text.primary} size={18} variant='Bold' />,
        onClick: toggleSelectProxy
      };
    }

    return undefined;
  }, [isLedger, showQrSign, showUseProxy, t, theme.palette.text.primary, toggleQrScan, toggleSelectProxy]);

  const handleTxResult = useCallback((txResult: TxResult) => {
    try {
      if (!txResult || !api || !chain) {
        return;
      }

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
        txHash: txResult?.txHash || ''
      };

      setTxInfo({ ...info, api, chain } as TxInfo);

      // saveAsHistory(String(from), info as any);
    } catch (e) {
      console.log('error:', e);
    }
  }, [api, chain, formatted, selectedProxyAddress, selectedProxyName, senderName, setTxInfo, token]);

  const onSignature = useCallback(async ({ signature }: { signature: HexString }) => {
    if (!api || !payload || !signature || !preparedTransaction || !from) {
      return;
    }

    setFlowStep(TRANSACTION_FLOW_STEPS.WAIT_SCREEN);

    const txResult = await send(from, api, preparedTransaction, payload.toHex(), signature);

    setFlowStep(TRANSACTION_FLOW_STEPS.CONFIRMATION);

    handleTxResult(txResult);
  }, [api, from, handleTxResult, payload, preparedTransaction, setFlowStep]);

  return (
    <>
      {noPrivateKeyAccount &&
        <ChooseSigningButton
          alertHandler={alertHandler}
        />}
      {(selectedProxy || !noPrivateKeyAccount) &&
        <SignUsingPassword
          api={api}
          from={from}
          handleTxResult={handleTxResult}
          onUseProxy={selectedProxy ? undefined : toggleSelectProxy}
          preparedTransaction={preparedTransaction}
          proxies={proxies}
          setFlowStep={setFlowStep}
        />}
      <SignUsingProxy
        genesisHash={genesisHash}
        handleClose={toggleSelectProxy}
        openMenu={showProxySelection}
        proxies={proxies}
        proxyTypeFilter={proxyTypeFilter}
        selectedProxy={selectedProxy}
        setSelectedProxy={setSelectedProxy}
      />
      <SignUsingQR
        handleClose={toggleQrScan}
        onSignature={onSignature as ({ signature }: { signature: `0x${string}`; }) => void}
        openMenu={showQR}
        payload={payload}
        signerPayload={signerPayload}
      />
    </>
  );
}
