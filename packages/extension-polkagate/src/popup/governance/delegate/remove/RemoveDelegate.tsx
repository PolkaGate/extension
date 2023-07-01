// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import keyring from '@polkadot/ui-keyring';
import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { AccountContext, Identity, Motion, ShowValue, WrongPasswordAlert } from '../../../../components';
import { useAccountInfo, useAccountName, useApi, useChain, useDecimal, useToken, useTracks, useTranslation } from '../../../../hooks';
import { ThroughProxy } from '../../../../partials';
import { signAndSend } from '../../../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../../util/utils';
import PasswordWithTwoButtonsAndUseProxy from '../../components/PasswordWithTwoButtonsAndUseProxy';
import DisplayValue from '../../post/castVote/partial/DisplayValue';
import ReferendaTable from '../partial/ReferendaTable';
import TracksList from '../partial/tracksList';
import { AlreadyDelegateInformation, DelegateInformation, STEPS } from '..';
import { GOVERNANCE_PROXY } from '../../utils/consts';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  classicDelegateInformation: DelegateInformation | undefined;
  mixedDelegateInformation: AlreadyDelegateInformation | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  step: number;
  setSelectedTracksLength: React.Dispatch<React.SetStateAction<number | undefined>>;
  setModalHeight: React.Dispatch<React.SetStateAction<number | undefined>>;
  selectedProxy: Proxy | undefined;
  proxyItems: ProxyItem[] | undefined;
}

export default function RemoveDelegate({ address, classicDelegateInformation, formatted, mixedDelegateInformation, proxyItems, selectedProxy, setModalHeight, setSelectedTracksLength, setStep, setTxInfo, step }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const decimal = useDecimal(address);
  const token = useToken(address);
  const name = useAccountName(address);
  const { accounts } = useContext(AccountContext);
  const api = useApi(address);
  const chain = useChain(address);
  const { tracks } = useTracks(address);
  const delegateeAddress = classicDelegateInformation
    ? classicDelegateInformation.delegateeAddress
    : mixedDelegateInformation
      ? mixedDelegateInformation.delegatee
      : undefined;
  const delegateeName = useAccountInfo(api, delegateeAddress)?.identity.display;
  const ref = useRef(null);

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const undelegate = api && api.tx.convictionVoting.undelegate;
  const batch = api && api.tx.utility.batchAll;

  const delegatedTracks = useMemo(() => {
    if (classicDelegateInformation) {
      return classicDelegateInformation.delegatedTracks;
    }

    if (mixedDelegateInformation) {
      return mixedDelegateInformation.info.map((value) => value.track);
    }

    return undefined;
  }, [classicDelegateInformation, mixedDelegateInformation]);

  const params = useMemo(() => {
    if (!delegatedTracks || delegatedTracks.length === 0) {
      return undefined;
    }

    return delegatedTracks;
  }, [delegatedTracks]);

  useEffect(() => {
    if (ref) {
      setModalHeight(ref.current?.offsetHeight as number);
    }
  }, [setModalHeight]);

  useEffect(() => {
    if (!formatted || !undelegate || !params || !batch) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    params.length === 1
      ? undelegate(BN_ZERO).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error)
      : batch(params.map((param) => undelegate(param))).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, batch, formatted, params, undelegate]);

  const removeDelegate = useCallback(async () => {
    try {
      if (!formatted || !undelegate || !api || !decimal || !params || !batch) {
        return;
      }

      const from = selectedProxyAddress ?? formatted;

      const signer = keyring.getPair(from);

      signer.unlock(password);

      const txList = params.map((param) => undelegate(param));

      setStep(STEPS.WAIT_SCREEN);
      setSelectedTracksLength(params.length);

      const calls = txList.length > 1 ? batch(txList) : txList[0];
      const mayBeProxiedTx = selectedProxy ? api.tx.proxy.proxy(formatted, selectedProxy.proxyType, calls) : calls;
      const { block, failureText, fee, success, txHash } = await signAndSend(api, mayBeProxiedTx, signer, formatted);

      const info = {
        action: 'Governance',
        amount: 'delegateInformation.delegateAmount',
        block: block || 0,
        date: Date.now(),
        failureText,
        fee: estimatedFee || fee,
        from: { address: formatted, name },
        subAction: 'RemoveDelegate',
        success,
        throughProxy: selectedProxyAddress ? { address: selectedProxyAddress, name: selectedProxyName } : undefined,
        to: { address: delegateeAddress, name: delegateeName },
        txHash: txHash || ''
      };

      setTxInfo({ ...info, api, chain });
      saveAsHistory(from, info);

      setStep(STEPS.CONFIRM);
    } catch (e) {
      console.log('error:', e);
      setIsPasswordError(true);
    }
  }, [api, batch, chain, decimal, delegateeAddress, delegateeName, estimatedFee, formatted, name, params, password, selectedProxy, selectedProxyAddress, selectedProxyName, setSelectedTracksLength, setStep, setTxInfo, undelegate]);

  const backToPreview = useCallback(() => setStep(STEPS.PREVIEW), [setStep]);

  return (
    <Motion>
      {step === STEPS.REMOVE &&
        <Grid container ref={ref}>
          {isPasswordError &&
            <WrongPasswordAlert />
          }
          <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: isPasswordError ? 0 : '10px', width: '90%' }}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {t<string>('Account Holder')}
            </Typography>
            <Identity
              address={address}
              api={api}
              chain={chain}
              direction='row'
              identiconSize={31}
              showShortAddress
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
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
          <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {t<string>('Delegatee')}
            </Typography>
            <Identity
              api={api}
              chain={chain}
              direction='row'
              formatted={delegateeAddress}
              identiconSize={31}
              showShortAddress
              showSocial={false}
              style={{ maxWidth: '100%', width: 'fit-content' }}
              withShortAddress
            />
          </Grid>
          {classicDelegateInformation &&
            <>
              <DisplayValue title={t<string>('Delegated Value ({{token}})', { replace: { token } })}>
                <Typography fontSize='28px' fontWeight={400}>
                  {classicDelegateInformation.delegateAmount}
                </Typography>
              </DisplayValue>
              <DisplayValue title={t<string>('Vote Multiplier')}>
                <Typography fontSize='28px' fontWeight={400}>
                  {`${classicDelegateInformation.delegateConviction}x`}
                </Typography>
              </DisplayValue>
              <DisplayValue title={t<string>('Number of Referenda Categories')}>
                <Grid container direction='row'>
                  <Typography fontSize='28px' fontWeight={400} width='fit-content'>
                    {`${classicDelegateInformation.delegatedTracks.length} of ${tracks?.length ?? 15}`}
                  </Typography>
                  <TracksList selectedTracks={classicDelegateInformation.delegatedTracks} tracks={tracks} />
                </Grid>
              </DisplayValue>
            </>
          }
          {mixedDelegateInformation &&
            <>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
              <ReferendaTable
                decimal={decimal}
                delegatedInfo={mixedDelegateInformation.info}
                maxTableHeight={180}
                token={token}
                tracks={tracks}
              />
            </>
          }
          <DisplayValue title={t<string>('Fee')}>
            <ShowValue height={20} value={estimatedFee?.toHuman()} />
          </DisplayValue>
          <Grid container item pt='10px'>
            <PasswordWithTwoButtonsAndUseProxy
              chain={chain}
              disabled={!delegatedTracks || delegatedTracks.length === 0}
              isPasswordError={isPasswordError}
              label={`${t<string>('Password')} for ${selectedProxyName || name}`}
              onChange={setPassword}
              onPrimaryClick={removeDelegate}
              onSecondaryClick={backToPreview}
              primaryBtnText={t<string>('Confirm')}
              proxiedAddress={formatted}
              proxies={proxyItems}
              proxyTypeFilter={GOVERNANCE_PROXY}
              selectedProxy={selectedProxy}
              setIsPasswordError={setIsPasswordError}
              setStep={setStep}
            />
          </Grid>
        </Grid>
      }
    </Motion>
  );
}
