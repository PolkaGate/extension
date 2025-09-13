// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SignerOptions } from '@polkadot/api/types';
import type { SubmittableExtrinsic } from '@polkadot/api/types/submittable';
import type { Header } from '@polkadot/types/interfaces';
// @ts-ignore
import type { FrameSystemAccountInfo } from '@polkadot/types/lookup';
import type { ISubmittableResult, SignerPayloadJSON } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
import type { Proxy, ProxyTypes, TxInfo, TxResult } from '../util/types';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Data, Lock, ScanBarcode, Warning2 } from 'iconsax-react';
import React, { memo, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { noop } from '@polkadot/util';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useAccount, useAccountDisplay, useChainInfo, useFormatted, useIsBlueish, useIsExtensionPopup, useProxies, useTranslation } from '../hooks';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { send } from '../util/api';
import { TRANSACTION_FLOW_STEPS, type TransactionFlowStep } from '../util/constants';
import { getSubstrateAddress } from '../util/utils';
import SignUsingPassword, { type SignUsingPasswordProps } from './SignUsingPassword';
import { SignUsingQR, type SignUsingQRProps } from './SignUsingQR';
import SignWithLedger from './SignWithLedger';
import { GradientButton, SignUsingProxy } from '.';

interface AlertHandler {
  alertText: string;
  buttonText: string;
  isDisabled?: boolean;
  icon: ReactNode;
  onClick: () => void;
}

interface ChooseSigningButtonProps {
  alertHandler: AlertHandler | undefined;
}

const NoPrivateKeySigningButton = ({ alertHandler }: ChooseSigningButtonProps) => {
  const isBlueish = useIsBlueish();
  const isExtension = useIsExtensionPopup();

  if (!alertHandler) {
    return null;
  }

  return (
    <Stack direction='column' sx={{ width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'center', columnGap: '8px', display: 'flex' }}>
        <Warning2 color={isBlueish ? '#596AFF' : '#FFCE4F'} size={isExtension ? 35 : 24} style={{ height: 'fit-content' }} variant='Bold' />
        <Typography color={isBlueish ? 'text.highlight' : 'primary.main'} textAlign='left' variant='B-4'>
          {alertHandler.alertText}
        </Typography>
      </Container>
      {
        isBlueish
          ? (
            <StakingActionButton
              disabled={alertHandler.isDisabled}
              onClick={alertHandler.onClick}
              startIcon={alertHandler.icon}
              style={{ marginTop: '18px' }}
              text={alertHandler.buttonText}

            />)
          : (
            <GradientButton
              contentPlacement='center'
              disabled={alertHandler.isDisabled}
              onClick={alertHandler.onClick}
              style={{
                height: '44px',
                marginTop: '18px'
              }}
              text={alertHandler.buttonText}
            />)
      }
    </Stack>
  );
};

interface Props {
  address: string | undefined;
  direction?: 'horizontal' | 'vertical';
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
  signUsingPasswordProps?: Partial<SignUsingPasswordProps>;
  signUsingQRProps?: Partial<SignUsingQRProps>;
  style?: React.CSSProperties;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
  withCancel?: boolean;
}

/**
 *  @description
 * This puts usually at the end of review page where user can do enter password,
 * choose proxy or use other alternatives like signing using ledger
 *
*/
function SignArea3 ({ address, direction, genesisHash, ledgerStyle, onClose, proxyTypeFilter, selectedProxy, setFlowStep, setSelectedProxy, setShowProxySelection, setTxInfo, showProxySelection, signUsingPasswordProps, signUsingQRProps, signerOption, style = {}, transaction, withCancel }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(address);
  const { api, chain, token } = useChainInfo(genesisHash);
  const formatted = useFormatted(address, genesisHash);

  const senderName = useAccountDisplay(address, genesisHash);
  const proxies = useProxies(api, formatted);

  const [showQR, setShowQR] = useState<boolean>(false);
  const [lastHeader, setLastHeader] = useState<Header>();
  const [rawNonce, setRawNonce] = useState<number>();

  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxy?.delegate), genesisHash);
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
    if (!api || !preparedTransaction || !lastHeader || rawNonce === undefined) {
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

  const alertHandler = useMemo((): AlertHandler | undefined => {
    if (showQrSign) {
      return {
        alertText: t('This is a QR-attached account. To complete this transaction, you need to use your QR-signer.'),
        buttonText: t('Use QR-Signer'),
        icon: <ScanBarcode color={theme.palette.text.primary} size={18} variant='Bold' />,
        onClick: toggleQrScan
      };
    }

    if (showUseProxy) {
      if (proxies?.length) {
        return {
          alertText: t('This is a watch-only account. To complete this transaction, you must use a proxy.'),
          buttonText: t('Use Proxy'),
          icon: <Data color={theme.palette.text.primary} size={18} variant='Bold' />,
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
  }, [proxies?.length, showQrSign, showUseProxy, t, theme.palette.text.highlight, theme.palette.text.primary, toggleQrScan, toggleSelectProxy]);

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
        decimal, // in cross chain transfer this will be the sending chain decimal
        failureText: txResult?.failureText,
        from: { address: String(formatted), name: senderName },
        success: txResult?.success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        token: _token,
        txHash: txResult?.txHash || ''
      };

      setTxInfo({ ...info, api, chain } as TxInfo);
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
      <Grid container item sx={{ bottom: '13px', left: 0, position: 'absolute', px: '15px', right: 0, width: '100%', ...style }}>
        {!selectedProxy && noPrivateKeyAccount && !isLedger &&
          <NoPrivateKeySigningButton
            alertHandler={alertHandler}
          />
        }
        {isLedger &&
          <SignWithLedger
            address={address}
            api={api}
            from={from}
            handleTxResult={handleTxResult}
            onSecondaryClick={onClose}
            onSignature={onSignature}
            payload={payload}
            preparedTransaction={preparedTransaction}
            setFlowStep={setFlowStep}
            signerPayload={signerPayload}
            style={ledgerStyle}
          />
        }
        {(selectedProxy || !noPrivateKeyAccount) &&
          <SignUsingPassword
            api={api}
            direction={direction}
            from={from}
            handleTxResult={handleTxResult}
            onCancel={onClose}
            onUseProxy={selectedProxy ? undefined : toggleSelectProxy}
            preparedTransaction={preparedTransaction}
            proxies={proxies}
            setFlowStep={setFlowStep}
            signerOption={signerOption}
            withCancel={withCancel}
            {...signUsingPasswordProps}
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
        payload={payload}
        signerPayload={signerPayload}
        {...signUsingQRProps}
      />
    </>
  );
}

export default memo(SignArea3);
