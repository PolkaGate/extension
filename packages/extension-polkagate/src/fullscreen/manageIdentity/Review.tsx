// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';
import type { PalletIdentityIdentityInfo } from '@polkadot/types/lookup';
import type { AnyTuple } from '@polkadot/types/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { SubmittableExtrinsicFunction } from '@polkadot/api/types/submittable';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_ONE, isFunction } from '@polkadot/util';

import { CanPayErrorAlert, Identity, Motion, ShowBalance, SignArea2, Warning, WrongPasswordAlert } from '../../components';
import { useCanPayFeeAndDeposit, useFormatted, useProxies } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { ThroughProxy } from '../../partials';
import { BalancesInfo, Proxy, ProxyItem, TxInfo } from '../../util/types';
import { pgBoxShadow } from '../../util/utils';
import { DraggableModal } from '../governance/components/DraggableModal';
import SelectProxyModal2 from '../governance/components/SelectProxyModal2';
import WaitScreen from '../governance/partials/WaitScreen';
import DisplayValue from '../governance/post/castVote/partial/DisplayValue';
import { toTitleCase } from '../governance/utils/util';
import Confirmation from './partial/Confirmation';
import DisplaySubId from './partial/DisplaySubId';
import IdentityTable from './partial/IdentityTable';
import { Mode, STEPS, SubIdAccountsToSubmit, SubIdsParams } from '.';
import type { ParaId } from '@polkadot/types/interfaces';

interface Props {
  secondaryApi: ApiPromise | null | undefined;
  address: string;
  api: ApiPromise | undefined;
  chain: Chain;
  depositToPay: BN | undefined;
  depositValue: BN;
  identityToSet: DeriveAccountRegistration | null | undefined;
  infoParams: PalletIdentityIdentityInfo | null | undefined;
  subIdsParams: SubIdsParams | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  step: number;
  mode: Mode;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  parentDisplay: string | undefined;
  selectedRegistrar: string | number | undefined;
  maxFeeAmount: BN | undefined;
  selectedRegistrarName: string | undefined;
  isOnPeopleChain: boolean;
  needSecondaryApi: boolean;
}

const XCM_LOC = ['xcm', 'xcmPallet', 'polkadotXcm'];

export default function Review({ address, api, chain, depositToPay, depositValue, identityToSet, infoParams, isOnPeopleChain, maxFeeAmount, mode, needSecondaryApi, parentDisplay, secondaryApi, selectedRegistrar, selectedRegistrarName, setRefresh, setStep, step, subIdsParams }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);
  const theme = useTheme();

  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false);
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();
  const [proxyItems, setProxyItems] = useState<ProxyItem[]>();
  const [balances, setBalances] = useState<BalancesInfo>();
  const [secondaryBalances, setSecondaryBalances] = useState<BalancesInfo>();
  const [paraId, setParaId] = useState<ParaId>();

  const selectedProxyAddress = selectedProxy?.delegate as unknown as string;

  const feeAndDeposit = useCanPayFeeAndDeposit(formatted?.toString(), selectedProxyAddress, estimatedFee, depositToPay, balances);

  const setIdentity = api && api.tx.identity.setIdentity;
  const clearIdentity = api && api.tx.identity.clearIdentity;
  const setSubs = api && api.tx.identity.setSubs;
  const requestJudgement = api && api.tx.identity.requestJudgement;
  const cancelRequest = api && api.tx.identity.cancelRequest;
  // const transfer = api && api.tx.balances.transfer;

  useEffect(() => {
    formatted && api && api.derive.balances?.all(formatted).then((b) => {
      setBalances(b);
    });

    needSecondaryApi && secondaryApi && formatted && secondaryApi.derive.balances?.all(formatted).then((b) => {
      setSecondaryBalances(b);
    });
  }, [api, formatted, needSecondaryApi, secondaryApi]);

  useEffect((): void => {
    needSecondaryApi && api && api.query.parachainInfo && api.query.parachainInfo.parachainId()
      .then(setParaId)
      .catch((error) => {
        console.error('Failed to fetch parachain ID:', error);
      });
  }, [api]);

  const subIdsToShow: SubIdAccountsToSubmit | undefined = useMemo(() => {
    if (mode !== 'ManageSubId' || !subIdsParams) {
      return undefined;
    }

    return subIdsParams.map((subs) => ({
      address: subs[0],
      name: subs[1]?.raw as string
    })) as SubIdAccountsToSubmit;
  }, [mode, subIdsParams]);

  const { call, params } = useMemo((): { call: SubmittableExtrinsicFunction<'promise', AnyTuple> | undefined, params: unknown[] | undefined } => {
    if (!setIdentity || !clearIdentity || !setSubs || !requestJudgement || !cancelRequest) {
      return { call: undefined, params: undefined };
    }

    if (mode === 'Set' || mode === 'Modify') {
      return { call: setIdentity, params: [infoParams] };
      // return setIdentity(infoParams);
    }

    if (mode === 'Clear') {
      return { call: clearIdentity, params: [] };
      // return clearIdentity();
    }

    if (mode === 'ManageSubId' && subIdsParams) {
      return { call: setSubs, params: [subIdsParams] };
      // return setSubs(subIdsParams);
    }

    if (mode === 'RequestJudgement' && selectedRegistrar !== undefined) {
      return { call: requestJudgement, params: [selectedRegistrar, maxFeeAmount] };
      // return requestJudgement(selectedRegistrar, maxFeeAmount);
    }

    if (mode === 'CancelJudgement' && selectedRegistrar !== undefined) {
      return { call: cancelRequest, params: [selectedRegistrar] };
      // return cancelRequest(selectedRegistrar);
    }

    return { call: undefined, params: undefined };
    // return undefined;
  }, [cancelRequest, clearIdentity, infoParams, maxFeeAmount, mode, requestJudgement, selectedRegistrar, setIdentity, setSubs, subIdsParams]);

  const preparedTxForPeopleChain = useMemo(() => {
    if (!needSecondaryApi) {
      return null;
    }

    if (!balances || !secondaryBalances || !estimatedFee || !call || params === undefined || !secondaryApi || paraId === undefined) {
      return undefined;
    }

    const availableBalanceOnPeopleChain = balances.availableBalance;
    const availableBalanceOnRelay = secondaryBalances.availableBalance;
    const estimatedFeeInNumber = estimatedFee.toNumber();

    console.log('estimatedFeeInNumber:', estimatedFeeInNumber);
    const haveEnoughAssetOnPeopleChain = availableBalanceOnPeopleChain.gt(estimatedFee);

    console.log('haveEnoughAssetOnPeopleChain:', haveEnoughAssetOnPeopleChain);

    if (haveEnoughAssetOnPeopleChain) {
      return [];
    } else {
      const haveEnoughBalanceOnRelay = availableBalanceOnRelay.gt(estimatedFee.muln(3)); // 1 fee for setting ID, 1 fee for transferring asset, TODO: we should check reap condition on relay chain.

      if (haveEnoughBalanceOnRelay) {
        const m = XCM_LOC.filter((x) => secondaryApi.tx[x] && isFunction(secondaryApi.tx[x].limitedTeleportAssets))?.[0];
        const txCall = secondaryApi.tx[m].limitedTeleportAssets;
        const crossChainParams = [
          {
            V3: { interior: { X1: { ParaChain: paraId } }, parents: 0 }
          },
          {
            V3: {
              interior: {
                X1: {
                  AccountId32: {
                    id: secondaryApi.createType('AccountId32', formatted).toHex(),
                    network: null
                  }
                }
              },
              parents: 0
            }
          },
          {
            V3: [{
              fun: { Fungible: BN_ONE }, // amount to transfer
              // fun: { Fungible: amountToMachine(amount, balances.decimal) },
              id: {
                Concrete: {
                  interior: 'Here',
                  parents: 0
                }
              }
            }]
          },
          0,
          { Unlimited: null }
        ];
        const batchCall = secondaryApi.tx.utility.batchAll;
        const batchCallParams = [[txCall(...crossChainParams), call(...params)]];

        return {
          call: batchCall,
          params: batchCallParams
        };
      }
    }
  }, [balances, call, estimatedFee, formatted, needSecondaryApi, paraId, params, secondaryApi, secondaryBalances]);

  useEffect((): void => {
    const fetchedProxyItems = proxies?.map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];

    setProxyItems(fetchedProxyItems);
  }, [proxies]);

  useEffect(() => {
    if (!formatted || !call || !params) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    call(...params).paymentInfo(formatted)
      .then((i) => setEstimatedFee(i?.partialFee))
      .catch((error) => {
        console.error(' error while fetching fee:', error);
        setEstimatedFee(api?.createType('Balance', BN_ONE));
      });
  }, [api, formatted, call, params]);

  const extraInfo = useMemo(() => ({
    action: 'Manage Identity',
    fee: String(estimatedFee || 0),
    subAction: toTitleCase(mode)
  }), [estimatedFee, mode]);

  const handleClose = useCallback(() => {
    setStep(mode === 'Set' || mode === 'Modify'
      ? STEPS.INDEX
      : mode === 'ManageSubId'
        ? STEPS.MANAGE_SUBID
        : mode === 'RequestJudgement' || mode === 'CancelJudgement'
          ? STEPS.JUDGEMENT
          : STEPS.PREVIEW);
  }, [mode, setStep]);

  const closeSelectProxy = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, [setStep]);

  const closeConfirmation = useCallback(() => {
    setRefresh(true);
    setStep(STEPS.CHECK_SCREEN);
  }, [setRefresh, setStep]);

  return (
    <Motion style={{ height: '100%', width: '100%' }}>
      <>
        <Grid container py='25px'>
          <Typography fontSize='30px' fontWeight={700}>
            {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) && (
              <>
                {mode === 'Set' && t('Review On-chain Identity')}
                {mode === 'Clear' && t('Clear On-chain Identity')}
                {mode === 'Modify' && t('Modify On-chain Identity')}
                {mode === 'ManageSubId' && t('Review Sub-identity(ies)')}
                {mode === 'RequestJudgement' && t('Review Judgment Request')}
                {mode === 'CancelJudgement' && t('Review Judgment Cancellation')}
              </>
            )}
            {step === STEPS.WAIT_SCREEN && (
              <>
                {mode === 'Set' && t('Setting On-chain Identity')}
                {mode === 'Clear' && t('Clearing On-chain Identity')}
                {mode === 'Modify' && t('Modifying On-chain Identity')}
                {mode === 'ManageSubId' && t('Setting Sub-identity(ies)')}
                {mode === 'RequestJudgement' && t('Requesting Judgement')}
                {mode === 'CancelJudgement' && t('Canceling Judgement')}
              </>
            )}
            {step === STEPS.CONFIRM && mode === 'Set' && (
              txInfo?.success ? t('On-chain Identity Set') : t('On-chain Identity Setup Failed')
            )}
            {step === STEPS.CONFIRM && mode === 'Modify' && (
              txInfo?.success ? t('On-chain Identity Modified') : t('On-chain Identity Modification Failed')
            )}
            {step === STEPS.CONFIRM && mode === 'Clear' && (
              txInfo?.success ? t('On-chain Identity Cleared') : t('On-Chain Identity Clearing Failed')
            )}
            {step === STEPS.CONFIRM && mode === 'ManageSubId' && (
              txInfo?.success
                ? subIdsToShow?.length === 0
                  ? t('Sub-identity(ies) cleared')
                  : t('Sub-identity(ies) created')
                : t('Sub-identity(ies) creation failed')
            )}
            {step === STEPS.CONFIRM && mode === 'RequestJudgement' && (
              txInfo?.success ? t('Request Judgment Sent') : t('Request Judgment failed')
            )}
            {step === STEPS.CONFIRM && mode === 'CancelJudgement' && (
              txInfo?.success ? t('Judgement Canceled') : t('Canceling Judgement failed')
            )}
          </Typography>
        </Grid>
        {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) &&
          <>
            {isPasswordError &&
              <WrongPasswordAlert />
            }
            {feeAndDeposit.isAbleToPay === false &&
              <CanPayErrorAlert canPayStatements={feeAndDeposit.statement} />
            }
            <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: pgBoxShadow(theme), mb: '20px', p: '1% 3%' }}>
              <Grid alignItems='center' container direction='column' justifyContent='center' sx={{ m: 'auto', width: '90%' }}>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
                  {mode === 'ManageSubId'
                    ? t('Parent account')
                    : t('Account holder')}
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
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: 'auto', my: '5px', width: '170px' }} />
              {identityToSet && (mode === 'Set' || mode === 'Modify') &&
                <>
                  <Typography sx={{ m: '6px auto', textAlign: 'center', width: '100%' }}>
                    {t('Identity')}
                  </Typography>
                  <IdentityTable
                    identity={identityToSet}
                    style={{ width: '75%' }}
                  />
                </>
              }
              {(mode === 'Clear' || (subIdsToShow && subIdsToShow.length === 0)) &&
                <Grid container item justifyContent='center' sx={{ '> div.belowInput': { m: 0 }, height: '70px', py: '20px' }}>
                  <Warning
                    fontWeight={400}
                    iconDanger
                    isBelowInput
                    theme={theme}
                  >
                    {mode === 'Clear'
                      ? t('You are about to clear the on-chain identity for this account.')
                      : t('You are about to clear the on-chain sub-identity(ies) for this account.')
                    }
                  </Warning>
                </Grid>
              }
              {mode === 'ManageSubId' && subIdsToShow && subIdsToShow.length > 0 && parentDisplay &&
                <Grid container item>
                  <Typography fontSize='14px' fontWeight={400} textAlign='center' width='100%'>
                    {t('Sub-identity(ies)')}
                  </Typography>
                  <Grid container gap='10px' item sx={{ height: 'fit-content', maxHeight: '250px', overflow: 'hidden', overflowY: 'scroll' }}>
                    {subIdsToShow.map((subs, index) => (
                      <DisplaySubId
                        key={index}
                        noButtons
                        parentName={parentDisplay}
                        subIdInfo={subs}
                      />))}
                  </Grid>
                </Grid>
              }
              {mode === 'RequestJudgement' &&
                <Grid container direction='column' item>
                  <Typography fontSize='16px' fontWeight={400} textAlign='center' width='100%'>
                    {t('Registrar')}
                  </Typography>
                  <Typography fontSize='28px' fontWeight={400} textAlign='center' width='100%'>
                    {selectedRegistrarName}
                  </Typography>
                </Grid>
              }
              {mode === 'CancelJudgement' &&
                <Grid container item justifyContent='center' sx={{ '> div.belowInput': { m: 0 }, height: '70px', py: '20px' }}>
                  <Warning
                    fontWeight={400}
                    iconDanger
                    isBelowInput
                    theme={theme}
                  >
                    {t('You are about to cancel your judgement request for this account.')}
                  </Warning>
                </Grid>
              }
              {mode !== 'CancelJudgement' &&
                <DisplayValue title={mode === 'Clear'
                  ? t('Deposit that will be released')
                  : mode === 'RequestJudgement'
                    ? t('Registration fee')
                    : t('Total Deposit')}
                >
                  <ShowBalance
                    api={api}
                    balance={mode === 'RequestJudgement'
                      ? maxFeeAmount
                      : depositValue}
                    decimalPoint={4}
                    height={22}
                  />
                </DisplayValue>}
              <DisplayValue title={t('Fee')}>
                <Grid alignItems='center' container item sx={{ height: '42px' }}>
                  <ShowBalance
                    api={api}
                    balance={estimatedFee}
                    decimalPoint={4}
                  />
                </Grid>
              </DisplayValue>
            </Grid>
            <Grid container item sx={{ '> div #TwoButtons': { '> div': { justifyContent: 'space-between', width: '450px' }, justifyContent: 'flex-end' }, pb: '20px' }}>
              <SignArea2
                address={address}
                call={preparedTxForPeopleChain !== null
                  ? preparedTxForPeopleChain?.call
                  : call}
                disabled={feeAndDeposit.isAbleToPay !== true}
                extraInfo={extraInfo}
                isPasswordError={isPasswordError}
                mayBeApi={needSecondaryApi ? secondaryApi : api}
                onSecondaryClick={handleClose}
                params={preparedTxForPeopleChain !== null
                  ? preparedTxForPeopleChain?.params
                  : params}
                primaryBtnText={t('Confirm')}
                proxyTypeFilter={['Any', 'NonTransfer']}
                secondaryBtnText={t('Cancel')}
                selectedProxy={selectedProxy}
                setIsPasswordError={setIsPasswordError}
                setStep={setStep}
                setTxInfo={setTxInfo}
                step={step}
                steps={STEPS}
              />
            </Grid>
          </>
        }
        {step === STEPS.PROXY &&
          <DraggableModal onClose={closeSelectProxy} open={step === STEPS.PROXY}>
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
                // eslint-disable-next-line react/jsx-no-bind
                closeSelectProxy={() => setStep(STEPS.REVIEW)}
                height={500}
                proxies={proxyItems}
                proxyTypeFilter={['Any', 'NonTransfer']}
                selectedProxy={selectedProxy}
                setSelectedProxy={setSelectedProxy}
              />
            </Grid>
          </DraggableModal>
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {txInfo && step === STEPS.CONFIRM &&
          <Confirmation
            SubIdentityAccounts={subIdsToShow}
            handleClose={closeConfirmation}
            identity={identityToSet}
            maxFeeAmount={maxFeeAmount}
            selectedRegistrarName={selectedRegistrarName}
            status={mode}
            txInfo={txInfo}
          />
        }
      </>
    </Motion>
  );
}
