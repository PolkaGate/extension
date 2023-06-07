// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens send review page
 * */

import type { Balance } from '@polkadot/types/interfaces';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import keyring from '@polkadot/ui-keyring';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AccountContext, From, Identity, Motion, PButton, ShowValue, TwoButtons, Warning, WrongPasswordAlert } from '../../../components';
import { useAccountInfo, useAccountName, useApi, useChain, useDecimal, useProxies, useToken, useTracks, useTranslation } from '../../../hooks';
import { ThroughProxy } from '../../../partials';
import { signAndSend } from '../../../util/api';
import { Proxy, ProxyItem, TxInfo } from '../../../util/types';
import { getSubstrateAddress, saveAsHistory } from '../../../util/utils';
import PasswordWithTwoButtonsAndUseProxy from '../components/PasswordWithTwoButtonsAndUseProxy';
import SelectProxyModal from '../components/SelectProxyModal';
import DisplayValue from '../post/castVote/partial/DisplayValue';
import { Track } from '../utils/types';
import { toTitleCase } from '../utils/util';
import ReferendaTracks from './partial/ReferendaTracks';
import { DiffDelegation, STEPS } from '.';

interface Props {
  address: string | undefined;
  formatted: string | undefined;
  delegateInformation: DiffDelegation | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  step: number;
  modalHeight: number;
}

const MODES = {
  SELECT_TRACKS: 1,
  REMOVE_TRACKS: 2
};

export default function RemoveDelegate ({ address, delegateInformation, formatted, modalHeight, setStep, setTxInfo, step }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const decimal = useDecimal(address);
  const name = useAccountName(address);
  const { accounts } = useContext(AccountContext);
  const api = useApi(address);
  const chain = useChain(address);
  const proxies = useProxies(api, formatted);
  const { tracks } = useTracks(address);
  const delegateeName = useAccountInfo(api, delegateInformation?.delegatee)?.identity.display;
  const delegateeAddress = delegateInformation?.delegatee;

  const [password, setPassword] = useState<string | undefined>();
  const [isPasswordError, setIsPasswordError] = useState(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [tracksToRemove, setSelectedTracks] = useState<BN[]>([]);
  const [mode, setMode] = useState<number>(1);

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;
  const selectedProxyName = useMemo(() => accounts?.find((a) => a.address === getSubstrateAddress(selectedProxyAddress))?.name, [accounts, selectedProxyAddress]);

  const undelegate = api && api.tx.convictionVoting.undelegate;
  const batch = api && api.tx.utility.batchAll;

  useEffect(() => {
    if (!formatted || !undelegate) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    undelegate(BN_ZERO).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, formatted, undelegate]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  const delegatedTracks = useMemo(() => (
    delegateInformation
      ? delegateInformation.info.map((delegateInfo) => delegateInfo.track)
      : undefined
  ), [delegateInformation]);

  const params = useMemo(() => {
    if (!tracksToRemove || tracksToRemove.length === 0) {
      return undefined;
    }

    return tracksToRemove;
  }, [tracksToRemove]);

  const possibleTracksForUnDelegate = useMemo(() => {
    if (!tracks || delegatedTracks === undefined) {
      return undefined;
    }

    setSelectedTracks(delegatedTracks);

    return tracks.filter((value) => delegatedTracks.find((track) => track.eq(value[0])));
  }, [delegatedTracks, tracks]);

  const selectedTracksToRemove = useMemo(() => {
    if (!possibleTracksForUnDelegate || tracksToRemove.length === 0) {
      return undefined;
    }

    return possibleTracksForUnDelegate.filter((value) => tracksToRemove.find((track) => track.eq(value[0])));
  }, [possibleTracksForUnDelegate, tracksToRemove]);

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
  }, [api, batch, chain, decimal, delegateeAddress, delegateeName, estimatedFee, formatted, name, params, password, selectedProxy, selectedProxyAddress, selectedProxyName, setStep, setTxInfo, undelegate]);

  const backToPreview = useCallback(() => setStep(STEPS.PREVIEW), [setStep]);
  const backToRemove = useCallback(() => setMode(MODES.SELECT_TRACKS), []);
  const goToReview = useCallback(() => setMode(MODES.REMOVE_TRACKS), []);

  const DisplaySelectedTracksToRemove = ({ removedTracks }: { removedTracks: Track[] }) => {
    return (
      <Grid container item minHeight='181px' p='15px'>
        <Typography fontSize='16px' fontWeight={400} pb='10px' textAlign='center' width='100%'>
          {t<string>('Referenda Categories')}
        </Typography>
        <Grid container item justifyContent={removedTracks.length === 1 ? 'center' : 'flex-start'}>
          {removedTracks.map((track, index) =>
            <Grid container item justifyContent={removedTracks.length === 1 ? 'center' : 'flex-start'} key={index} xs={6}>
              <Typography fontSize='20px' fontWeight={400} pl='5%'>
                {toTitleCase(track[1].name as unknown as string) as string}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Grid>
    );
  };

  return (
    <Motion style={{ height: modalHeight }}>
      {step === STEPS.REMOVE &&
        <Grid container>
          {isPasswordError &&
            <WrongPasswordAlert />
          }
          {mode === MODES.SELECT_TRACKS
            ? <>
              <Grid container item pt='15px'>
                <From
                  _chain={chain}
                  api={api}
                  formatted={delegateeAddress}
                  style={{ '> div': { px: '10px' }, '> p': { fontWeight: 400 } }}
                  title={t<string>('Remove delegate from')}
                />
              </Grid>
              <Grid container display='block' height='380px' item>
                <ReferendaTracks
                  maximumHeight='300px'
                  selectedTracks={tracksToRemove}
                  setSelectedTracks={setSelectedTracks}
                  unvotedTracks={possibleTracksForUnDelegate}
                />
              </Grid>
              <Grid alignItems='center' container item sx={{ '> div': { m: 0, width: '87%' }, pt: '36px' }}>
                <TwoButtons
                  disabled={tracksToRemove.length === 0}
                  onPrimaryClick={goToReview}
                  onSecondaryClick={backToPreview}
                  primaryBtnText={t<string>('Next')}
                  secondaryBtnText={t<string>('Back')}
                />
              </Grid>
            </>
            : <>
              <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', pt: '30px', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {t<string>('Delegate from')}:
                </Typography>
                <Identity
                  api={api}
                  chain={chain}
                  formatted={delegateeAddress}
                  identiconSize={31}
                  showShortAddress
                  showSocial={false}
                  style={{ maxWidth: '100%', width: 'fit-content' }}
                />
              </Grid>
              {selectedProxyAddress &&
                <Grid container m='auto' maxWidth='92%'>
                  <ThroughProxy address={selectedProxyAddress} chain={chain} />
                </Grid>
              }
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
              <DisplaySelectedTracksToRemove removedTracks={selectedTracksToRemove} />
              <DisplayValue title={t<string>('Fee')}>
                <ShowValue height={20} value={estimatedFee?.toHuman()} />
              </DisplayValue>
              <Grid container item pt='20px'>
                <PasswordWithTwoButtonsAndUseProxy
                  chain={chain}
                  disabled={tracksToRemove.length === 0}
                  isPasswordError={isPasswordError}
                  label={`${t<string>('Password')} for ${selectedProxyName || name}`}
                  onChange={setPassword}
                  onPrimaryClick={removeDelegate}
                  onSecondaryClick={backToRemove}
                  primaryBtnText={t<string>('Confirm')}
                  proxiedAddress={formatted}
                  proxies={proxyItems}
                  proxyTypeFilter={['Any']}
                  selectedProxy={selectedProxy}
                  setIsPasswordError={setIsPasswordError}
                  setStep={setStep}
                />
              </Grid>
            </>
          }
        </Grid>
      }
      {step === STEPS.PROXY &&
        <SelectProxyModal
          address={address}
          height={modalHeight}
          nextStep={STEPS.REMOVE}
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
