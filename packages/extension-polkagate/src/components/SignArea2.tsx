// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Header } from '@polkadot/types/interfaces';
import type { AnyTuple } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Tooltip, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types/submittable';
import { AccountsStore } from '@polkadot/extension-base/stores';
import { ISubmittableResult } from '@polkadot/types/types';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { useAccount, useAccountDisplay, useApi, useChain, useFormatted, useProxies, useTranslation } from '../hooks';
import { DraggableModal } from '../popup/governance/components/DraggableModal';
import SelectProxyModal2 from '../popup/governance/components/SelectProxyModal2';
import LedgerSign from '../popup/signing/LedgerSign';
import { send, signAndSend } from '../util/api';
import { Proxy, ProxyItem, ProxyTypes, TxInfo, TxResult } from '../util/types';
import { getSubstrateAddress, saveAsHistory } from '../util/utils';
import { Identity, Password, PButton, TwoButtons, Warning } from '.';

interface Props {
  address: string;
  call: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined | SubmittableExtrinsic<'promise', ISubmittableResult>;
  disabled?: boolean;
  isPasswordError?: boolean;
  onSecondaryClick: () => void;
  params?: unknown[] | (() => unknown[]) | undefined;
  primaryBtn?: boolean;
  primaryBtnText?: string;
  proxyModalHeight?: number | undefined
  prevState?: Record<string, any>;
  proxyTypeFilter: ProxyTypes[] | string[];
  secondaryBtnText?: string;
  selectedProxy: Proxy | undefined;
  setSelectedProxy?: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  setIsPasswordError: React.Dispatch<React.SetStateAction<boolean>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  showBackButtonWithUseProxy?: boolean;
  to?: string;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  extraInfo: Record<string, unknown>;
  steps: Record<string, number>;
  setRefresh?: React.Dispatch<React.SetStateAction<boolean>>
}

/** This puts usually at the end of review page where user can do enter password, choose proxy or use other alternatives like signing using ledger */
export default function SignArea({ address, call, disabled, extraInfo, isPasswordError, onSecondaryClick, params, prevState, primaryBtn, primaryBtnText, proxyModalHeight, proxyTypeFilter, secondaryBtnText, selectedProxy, setIsPasswordError, setRefresh, setSelectedProxy, setStep, setTxInfo, showBackButtonWithUseProxy = true, steps, to }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const senderName = useAccountDisplay(address);
  const selectedProxyName = useAccountDisplay(getSubstrateAddress(selectedProxy?.delegate));

  const account = useAccount(address);
  const formatted = useFormatted(address);
  const api = useApi(address);
  const proxies = useProxies(api, formatted);

  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [password, setPassword] = useState<string>();
  const mustSelectProxy = useMemo(() => !account?.isHardware && account?.isExternal && !selectedProxy, [account, selectedProxy]);
  const [error, setError] = useState<string | null>();
  const [showProxy, setShowProxy] = useState<boolean>();
  const [lastHeader, setLastHeader] = useState<Header>();
  const [rawNonce, setRawNonce] = useState<number>();

  const from = selectedProxy?.delegate ?? formatted;

  useEffect(() => {
    cryptoWaitReady().then(() => keyring.loadAll({ store: new AccountsStore() })).catch(() => null);
  }, []);

  const ptx = useMemo((): SubmittableExtrinsic<'promise', ISubmittableResult> | undefined => {
    if (!call || !api) {
      return;
    }

    const tx = params ? call(...params) : call;

    return selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, tx) : tx;
  }, [api, call, formatted, params, selectedProxy]);

  const payload = useMemo(() => {
    if (!api || !ptx || !lastHeader || !rawNonce) {
      return;
    }

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

    return api.registry.createType('ExtrinsicPayload', _payload, { version: _payload.version });
  }, [api, from, lastHeader, rawNonce, ptx]);

  const isLedger = useMemo(() => account?.isHardware, [account?.isHardware]);
  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  useEffect((): void => {
    if (api && from) {
      api.rpc.chain.getHeader().then(setLastHeader).catch(console.error);
      api.query.system.account(from).then((res) => setRawNonce(res?.nonce || 0)).catch(console.error);
    }
  }, [api, formatted, from, selectedProxy]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const _onChange = useCallback(
    (pass: string): void => {
      pass.length > 3 && pass && setPassword(pass);
      pass.length > 3 && pass && setIsPasswordError && setIsPasswordError(false);
    }, [setIsPasswordError]
  );

  const goToSelectProxy = useCallback(() => {
    setShowProxy(true);

    setStep(steps.PROXY);
  }, [setStep, steps]);

  const closeSelectProxy = useCallback(() => {
    setShowProxy(false);
  }, []);

  const handleTxResult = useCallback((txResult: TxResult) => {
    try {
      if (!txResult || !api || !chain) {
        return;
      }

      setRefresh && setRefresh(true);

      const token = api.registry.chainTokens[0];
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
        token,
        txHash: txResult?.txHash || '',
        ...extraInfo
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(String(from), info);
      setStep(steps.CONFIRM);
    } catch (e) {
      console.log('error:', e);
    }
  }, [api, chain, extraInfo, formatted, from, selectedProxyAddress, selectedProxyName, senderName, setRefresh, setStep, setTxInfo, steps]);

  const onConfirm = useCallback(async () => {
    try {
      if (!formatted || !api || !ptx || !from) {
        return;
      }

      const signer = keyring.getPair(from);

      signer.unlock(password);
      setStep(steps.WAIT_SCREEN);

      const txResult = await signAndSend(api, ptx, signer, formatted);

      handleTxResult(txResult);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, formatted, from, handleTxResult, password, ptx, setIsPasswordError, setStep, steps]);

  const onSignature = useCallback(async ({ signature }: { signature: HexString }) => {
    if (!api || !payload || !signature || !ptx || !from) {
      return;
    }

    setStep(steps.WAIT_SCREEN);

    const txResult = await send(from, api, ptx, payload, signature);

    handleTxResult(txResult);
  }, [api, from, handleTxResult, payload, ptx, setStep, steps.WAIT_SCREEN]);

  return (
    <Grid container>
      {isLedger
        ? <>
          <Grid alignItems='center' container height='50px' item justifyContent='center' sx={{ '> div': { m: 0, p: 0 }, pt: '5px' }}>
            <Warning
              fontWeight={300}
              isDanger={!!error}
              theme={theme}
            >
              {error || t('This is a ledger account. To complete this transaction, use your ledger.')}
            </Warning>
          </Grid>
          <Grid container item justifyContent='space-between'>
            <Grid item sx={{ mt: '18px' }} xs={3}>
              <PButton
                _mt='1px'
                _onClick={onSecondaryClick}
                _variant='outlined'
                text={t('Cancel')}
              />
            </Grid>
            <Grid item xs={8} sx={{ ' button': { m: 0, width: '100%' }, mt: '80px', position: 'relative', width: '70%' }}>
              <LedgerSign
                accountIndex={account?.accountIndex as number || 0}
                addressOffset={account?.addressOffset as number || 0}
                error={error}
                genesisHash={account?.genesisHash || api?.genesisHash?.toHex()}
                onSignature={onSignature}
                payload={payload}
                setError={setError}
                showError={false}
              />
            </Grid>
          </Grid>
        </>
        : <>
          {mustSelectProxy
            ? <>
              <Grid container alignItems='center' height='50px' item sx={{ '> div': { m: 0, p: 0 }, pt: '5px' }}>
                <Warning
                  fontWeight={300}
                  theme={theme}
                >
                  {t('This is a watch-only account. To complete this transaction, you must use a proxy.')}
                </Warning>
              </Grid>
              {showBackButtonWithUseProxy
                ? <TwoButtons
                  mt='5px'
                  onPrimaryClick={goToSelectProxy}
                  onSecondaryClick={onSecondaryClick}
                  primaryBtnText={t<string>('Use Proxy')}
                  secondaryBtnText={t<string>('Back')}
                />
                : <PButton
                  _ml={0}
                  _mt='5px'
                  _onClick={goToSelectProxy}
                  _width={100}
                  text={t<string>('Use Proxy')}
                />
              }
            </>
            : <>
              <Grid alignItems='center' container item>
                <Grid item xs>
                  <Password
                    disabled={disabled}
                    isError={isPasswordError}
                    isFocused={true}
                    label={t<string>('Password for {{name}}', { replace: { name: selectedProxyName || senderName || '' } })}
                    onChange={_onChange}
                    onEnter={onConfirm}
                  />
                </Grid>
                {(!!proxies?.length || prevState?.selectedProxyAddress) &&
                  <Tooltip
                    arrow
                    componentsProps={{
                      popper: {
                        sx: {
                          '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-18kejt8': {
                            mb: '3px',
                            p: '3px 15px'
                          },
                          '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-1yuxi3g': {
                            mb: '3px',
                            p: '3px 15px'
                          },
                          visibility: selectedProxy ? 'visible' : 'hidden'
                        }
                      },
                      tooltip: {
                        sx: {
                          '& .MuiTooltip-arrow': {
                            color: '#fff',
                            height: '10px'
                          },
                          backgroundColor: '#fff',
                          color: '#000',
                          fontWeight: 400
                        }
                      }
                    }}
                    leaveDelay={300}
                    placement='top-start'
                    sx={{ width: 'fit-content' }}
                    title={
                      <>
                        {selectedProxy &&
                          <Identity
                            chain={chain}
                            formatted={selectedProxy?.delegate}
                            identiconSize={30}
                            style={{ fontSize: '14px' }}
                          />
                        }
                      </>
                    }
                  >
                    <Grid aria-label='useProxy' item onClick={goToSelectProxy} pl='10px' pt='10px' role='button' sx={{ cursor: 'pointer', fontWeight: 400, textDecorationLine: 'underline' }}              >
                      {selectedProxy ? t('Update proxy') : t('Use proxy')}
                    </Grid>
                  </Tooltip>
                }
              </Grid>
              <Grid alignItems='center' container id='TwoButtons' item sx={{ '> div': { m: 0, width: '100%' }, pt: '15px' }}>
                <TwoButtons
                  disabled={!password || isPasswordError || primaryBtn || disabled}
                  mt='8px'
                  onPrimaryClick={onConfirm}
                  onSecondaryClick={onSecondaryClick}
                  primaryBtnText={primaryBtnText ?? t<string>('Confirm')}
                  secondaryBtnText={secondaryBtnText ?? t<string>('Back')}
                />
              </Grid>
            </>
          }
        </>
      }
      {showProxy && setSelectedProxy &&
        <DraggableModal onClose={closeSelectProxy} open={showProxy}>
          <Grid container item>
            <Grid alignItems='center' container item justifyContent='space-between'>
              <Typography fontSize='22px' fontWeight={700}>
                {t<string>('Select Proxy')}
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
    </Grid>
  );
}
