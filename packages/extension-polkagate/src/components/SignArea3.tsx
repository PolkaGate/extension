// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerOptions } from '@polkadot/api/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import type { ISubmittableResult, SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { Proxy, ProxyTypes, TxInfo, TxResult } from '../util/types';

import { Grid, useTheme } from '@mui/material';
import { Data, Lock, ScanBarcode } from 'iconsax-react';
import React, { memo, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { noop } from '@polkadot/util';

import { useAccount, useAccountDisplay, useAlerts, useChainInfo, useFormatted, useProxies, useTranslation } from '../hooks';
import { getSubstrateAddress } from '../util';
import { send } from '../util/api';
import { TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../util/constants';
import NoPrivateKeySigningButton from './NoPrivateKeySigningButton';
import SignUsingPassword, { type SignUsingPasswordProps } from './SignUsingPassword';
import { SignUsingQR, type SignUsingQRProps } from './SignUsingQR';
import SignWithLedger from './SignWithLedger';
import { SignUsingProxy } from '.';

interface AlertHandler {
  alertText: string;
  buttonText: string;
  isDisabled?: boolean;
  icon: ReactNode;
  onClick: () => void;
}

interface Props {
  address: string | undefined;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
  genesisHash: string | null | undefined;
  ledgerStyle?: React.CSSProperties;
  onClose: () => void
  proxyTypeFilter: ProxyTypes[] | undefined;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  setFlowStep: React.Dispatch<React.SetStateAction<TransactionFlowStep>>;
  selectedProxy: Proxy | undefined;
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  setShowProxySelection: React.Dispatch<React.SetStateAction<boolean>>;
  showProxySelection: boolean;
  signerOption?: Partial<SignerOptions>;
  extraProps?: Partial<SignUsingPasswordProps>;
  signUsingQRProps?: Partial<SignUsingQRProps>;
  style?: React.CSSProperties;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult> | undefined;
  withCancel?: boolean;
}

/**
 * @description
 * Final step of the transaction flow where the user signs and submits a prepared
 * Substrate transaction. This component is responsible for:
 *
 * - Building a correct `SignerPayload` (era, nonce, runtime version, extensions)
 * - Supporting multiple signing methods:
 *   - Password-based local accounts
 *   - Ledger hardware wallets
 *   - QR-based offline signing
 *   - Proxy-based signing
 * - Handling proxy wrapping of the original transaction
 * - Submitting the signed extrinsic and tracking the result
 *
*/
function SignArea3({ address, direction, disabled, extraProps, genesisHash, ledgerStyle, onClose, proxyTypeFilter, selectedProxy, setFlowStep, setSelectedProxy, setShowProxySelection, setTxInfo, showProxySelection, signUsingQRProps, signerOption, style = {}, transaction, withCancel }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(address);
  const { api, chain, token } = useChainInfo(genesisHash);
  const formatted = useFormatted(address, genesisHash);
  const { notify } = useAlerts();

  const senderName = useAccountDisplay(address, genesisHash);
  const proxies = useProxies(genesisHash, formatted);

  const [showQR, setShowQR] = useState<boolean>(false);
  const [signerPayload, setSignerPayload] = useState<SignerPayloadJSON>();

  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxy?.delegate), genesisHash);
  const from = selectedProxy?.delegate ?? formatted ?? address;

  const isLedger = useMemo(() => account?.isHardware, [account?.isHardware]);
  const showUseProxy = useMemo(() => !account?.isHardware && !account?.isQR && account?.isExternal && !selectedProxy, [account, selectedProxy]);
  const showQrSign = useMemo(() => account?.isQR, [account]);
  const noPrivateKeyAccount = useMemo(() => account?.isExternal || account?.isHardware || account?.isQR, [account]);

  const preparedTransaction = useMemo((): SubmittableExtrinsic<'promise', ISubmittableResult> | undefined => {
    if (!transaction || !api) {
      return;
    }

    return selectedProxy ? api.tx['proxy']['proxy'](formatted, selectedProxy.proxyType, transaction) : transaction;
  }, [api, formatted, selectedProxy, transaction]);

  useEffect(() => {
    if (!api || !from || !preparedTransaction || signerPayload) {
      return;
    }

    (async() => {
      const [{ hash, number }, nonce] = await Promise.all([
        api.rpc.chain.getHeader(),
        api.rpc.system.accountNextIndex(from)
      ]);
      const current = number.toNumber();

      const _payload = {
        address: from,
        assetId: signerOption?.assetId,
        blockHash: hash,
        blockNumber: api.registry.createType('BlockNumber', current),
        era: api.registry.createType('ExtrinsicEra', { current, period: 256 }),
        genesisHash: api.genesisHash,
        method: api.createType('Call', preparedTransaction),
        nonce,
        runtimeVersion: api.runtimeVersion,
        signedExtensions: api.registry.signedExtensions,
        tip: 0,
        version: preparedTransaction.version
      };

      const raw = api.registry.createType('SignerPayload', _payload, {
        version: _payload.version
      });

      setSignerPayload(raw.toPayload());
    })().catch((error) =>
      notify('Something went wrong when making payload:' + error, 'warning')
    );
  }, [api, preparedTransaction, from, signerOption?.assetId, signerPayload, notify]);

  const extrinsicPayload = useMemo(() => {
    if (!api || !signerPayload) {
      return;
    }

    return api.registry.createType('ExtrinsicPayload', signerPayload, { version: signerPayload.version });
  }, [api, signerPayload]);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const toggleSelectProxy = useCallback(() => setShowProxySelection((show) => !show), [setShowProxySelection]);
  const toggleQrScan = useCallback(() => setShowQR((show) => !show), []);

  const alertHandler = useMemo((): AlertHandler | undefined => {
    if (showQrSign) {
      return {
        alertText: t('This is a QR-attached account. To complete this transaction, you need to use your QR-signer.'),
        buttonText: t('Use QR-Signer'),
        icon: <ScanBarcode color={theme.palette.text.primary} size={18} variant='Bold' />,
        isDisabled: disabled,
        onClick: toggleQrScan
      };
    }

    if (showUseProxy) {
      if (proxies === undefined) {
        return {
          alertText: t('This is a watch-only account. Checking if this account has proxy accounts.'),
          buttonText: t('Loading ...'),
          icon: <Data color={theme.palette.text.primary} size={18} variant='Bold' />,
          isDisabled: true,
          onClick: noop
        };
      }

      if (proxies?.length) {
        return {
          alertText: t('This is a watch-only account. To complete this transaction, you must use a proxy.'),
          buttonText: t('Use Proxy'),
          icon: <Data color={theme.palette.text.primary} size={18} variant='Bold' />,
          isDisabled: false,
          onClick: toggleSelectProxy
        };
      }

      return {
        alertText: t('This is a watch-only account. No proxies are available in the extension to sign transactions.'),
        buttonText: t('Cannot sign'),
        icon: <Lock color={theme.palette.text.highlight} size={18} variant='Bold' />,
        isDisabled: true,
        onClick: noop
      };
    }

    return undefined;
  }, [disabled, proxies, showQrSign, showUseProxy, t, theme.palette.text.highlight, theme.palette.text.primary, toggleQrScan, toggleSelectProxy]);

  const handleTxResult = useCallback((txResult: TxResult) => {
    try {
      if (!txResult || !api || !chain) {
        return;
      }

      const _token = token || api.registry.chainTokens[0];
      const decimal = api.registry.chainDecimals[0];
      const { block = 0, failureText, success, txHash = '' } = txResult;

      const info = {
        block,
        chain,
        date: Date.now(),
        decimal, // in cross chain transfer this will be the sending chain decimal
        failureText,
        from: { address: String(formatted), name: senderName },
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        token: _token,
        txHash
      };

      setTxInfo({ ...info, api, chain } as TxInfo);
    } catch (e) {
      console.log('error:', e);
    }
  }, [api, chain, formatted, selectedProxyAddress, selectedProxyName, senderName, setTxInfo, token]);

  const onSignature = useCallback(async({ signature }: { signature: HexString }) => {
    if (!api || !extrinsicPayload || !signature || !preparedTransaction || !from) {
      return;
    }

    setFlowStep(TRANSACTION_FLOW_STEPS.WAIT_SCREEN);

    const txResult = await send(from, api, preparedTransaction, extrinsicPayload.toHex(), signature);

    setFlowStep(TRANSACTION_FLOW_STEPS.CONFIRMATION);

    handleTxResult(txResult);
  }, [api, from, handleTxResult, extrinsicPayload, preparedTransaction, setFlowStep]);

  return (
    <>
      <Grid container item sx={{ bottom: '13px', left: 0, position: 'absolute', px: '15px', right: 0, width: '100%', ...style }}>
        {!selectedProxy && noPrivateKeyAccount && !isLedger && alertHandler &&
          <NoPrivateKeySigningButton
            {...alertHandler}
            decisionButtonProps={extraProps?.decisionButtonProps}
            onDismiss={onClose}
            withCancel={withCancel}
          />
        }
        {isLedger &&
          <SignWithLedger
            address={address}
            api={api}
            disabled={disabled}
            from={from}
            handleTxResult={handleTxResult}
            onSecondaryClick={onClose}
            onSignature={onSignature}
            payload={extrinsicPayload}
            preparedTransaction={preparedTransaction}
            setFlowStep={setFlowStep}
            signerPayload={signerPayload}
            style={ledgerStyle}
          />
        }
        {(selectedProxy || !noPrivateKeyAccount) &&
          <SignUsingPassword
            {...extraProps}
            api={api}
            direction={direction}
            disabled={disabled || !signerPayload}
            onCancel={onClose}
            onSignature={onSignature}
            onUseProxy={selectedProxy ? undefined : toggleSelectProxy}
            proxies={proxies}
            signerPayload={signerPayload}
            withCancel={withCancel}
          />
        }
      </Grid>
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
        payload={extrinsicPayload}
        signerPayload={signerPayload}
        {...signUsingQRProps}
      />
    </>
  );
}

export default memo(SignArea3);
