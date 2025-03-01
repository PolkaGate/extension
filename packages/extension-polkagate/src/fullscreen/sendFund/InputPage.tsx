// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';
import type { BalancesInfo, DropdownOption, TransferType } from '../../util/types';
import type { Inputs } from '.';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowBackIos as ArrowBackIosIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_ONE, BN_ZERO, isFunction, isNumber } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { AmountWithOptions, FullscreenChainNames, Infotip2, InputAccount, ShowBalance, TwoButtons, Warning } from '../../components';
import { useTranslation } from '../../components/translate';
import { useInfo, useTeleport } from '../../hooks';
import { getValue } from '../../popup/account/util';
import { ASSET_HUBS, NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '../../util/constants';
import { amountToHuman, amountToMachine, decodeMultiLocation } from '../../util/utils';
import { openOrFocusTab } from '../accountDetails/components/CommonTasks';
import { toTitleCase } from '../governance/utils/util';
import { STEPS } from '../stake/pool/stake';

interface Props {
  address: string;
  balances: BalancesInfo | undefined;
  assetId: string | undefined;
  inputs: Inputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<Inputs | undefined>>;
}

const XCM_LOC = ['xcm', 'xcmPallet', 'polkadotXcm'];
const INVALID_PARA_ID = Number.MAX_SAFE_INTEGER;

interface TitleProps {
  height?: string;
  text: string;
  icon?: IconProp;
  logo?: unknown;
  ml?: string;
  padding?: string;
  onBackClick?: () => void;
  spacing?: number;
}

export const Title = ({ height, icon, logo, ml, onBackClick, padding = '30px 0px 30px', spacing = 1, text }: TitleProps): React.ReactElement => {
  const theme = useTheme();

  return (
    <Grid alignItems={'center'} container height={height || '113px'} item ml={ml} p={padding} spacing={spacing}>
      {!!onBackClick &&
        <Grid item width='fit-content'>
          <ArrowBackIosIcon
            onClick={onBackClick}
            sx={{
              ':hover': { opacity: 1 },
              color: 'secondary.light',
              cursor: 'pointer',
              fontSize: 36,
              opacity: 0.5,
              stroke: theme.palette.secondary.light,
              strokeWidth: 1
            }}
          />
        </Grid>
      }
      <Grid item>
        {icon &&
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            icon={icon}
            size='xl'
            style={{ paddingBottom: '5px' }}
          />
        }
        {logo as any}
      </Grid>
      <Grid item>
        <Typography fontSize='24px' fontWeight={700}>
          {text}
        </Typography>
      </Grid>
    </Grid>
  );
};

const isAssethub = (genesisHash?: string) => ASSET_HUBS.includes(genesisHash || '');

export default function InputPage({ address, assetId, balances, inputs, setInputs, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, chain, formatted } = useInfo(address);
  const teleportState = useTeleport(address);

  const isForeignAsset = assetId ? assetId.startsWith('0x') : undefined;

  const noAssetId = assetId === undefined || assetId === 'undefined';
  const isNativeToken = String(assetId) === String(NATIVE_TOKEN_ASSET_ID) || String(assetId) === String(NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB);
  const isNonNativeToken = !noAssetId && !isNativeToken;

  const parsedAssetId = useMemo(() => noAssetId || isNativeToken
    ? undefined
    : isForeignAsset
      ? decodeMultiLocation(assetId as HexString)
      : parseInt(assetId)
    , [assetId, isForeignAsset, isNativeToken, noAssetId]);

  const [amount, setAmount] = useState<string>(inputs?.amount || '0');
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [estimatedCrossChainFee, setEstimatedCrossChainFee] = useState<Balance>();
  const [recipientAddress, setRecipientAddress] = useState<string | undefined>(inputs?.recipientAddress);
  const [recipientChainGenesisHash, setRecipientChainGenesisHash] = useState<string | undefined>(inputs?.recipientGenesisHashOrParaId);
  const [recipientParaId, setParaId] = useState(INVALID_PARA_ID);
  const [recipientChainName, setRecipientChainName] = useState<string>();
  const [transferType, setTransferType] = useState<TransferType>('Normal');
  const [maxFee, setMaxFee] = useState<Balance>();

  const transferableBalance = useMemo(() => getValue('transferable', balances), [balances]);

  const amountAsBN = useMemo(
    () =>
      balances?.decimal ? amountToMachine(amount, balances.decimal) : undefined
    ,
    [amount, balances]);

  const warningMessage = useMemo(() => {
    if (transferType !== 'All' && amountAsBN && balances?.decimal && balances?.ED && transferableBalance) {
      const totalBalance = balances.freeBalance.add(balances.reservedBalance);
      const toTransferBalance = isNonNativeToken
        ? amountAsBN
        : amountAsBN.add(estimatedFee || BN_ZERO).add(estimatedCrossChainFee || BN_ZERO);

      const remainingBalanceAfterTransfer = totalBalance.sub(toTransferBalance);

      if (transferableBalance.isZero() || transferableBalance.lt(toTransferBalance)) {
        return t('There is no sufficient transferable balance!');
      }

      if (remainingBalanceAfterTransfer.lt(balances.ED) && remainingBalanceAfterTransfer.gt(BN_ZERO)) {
        return t('This transaction will drop your balance below the Existential Deposit threshold, risking account reaping.');
      }
    }

    return undefined;
  }, [amountAsBN, isNonNativeToken, balances, transferableBalance, estimatedCrossChainFee, estimatedFee, t, transferType]);

  const destinationGenesisHashes = useMemo((): DropdownOption[] => {
    const currentChainOption = chain ? [{ text: chain.name, value: chain.genesisHash as string }] : [];
    const maybeTeleportDestinations =
      isNativeToken
        ? teleportState?.destinations?.map(({ genesisHash, info, paraId }) => ({ text: toTitleCase(info) as string, value: (paraId || String(genesisHash)) as string }))
        : [];

    return currentChainOption.concat(maybeTeleportDestinations);
  }, [isNativeToken, chain, teleportState?.destinations]);

  const isCrossChain = useMemo(() => recipientChainGenesisHash !== chain?.genesisHash, [chain?.genesisHash, recipientChainGenesisHash]);

  const onChainCall = useMemo(() => {
    if (!api || !chain) {
      return undefined;
    }

    try {
      const module = isNonNativeToken
        ? isAssethub(chain.genesisHash)
          ? isForeignAsset
            ? 'foreignAssets'
            : 'assets'
          : api.tx?.['currencies']
            ? 'currencies'
            : 'tokens'
        : 'balances';

      if (['currencies', 'tokens'].includes(module)) {
        return api.tx[module]['transfer'];
      }

      return api.tx?.[module] && (
        transferType === 'Normal'
          ? api.tx[module]['transferKeepAlive']
          : isNonNativeToken
            ? api.tx[module]['transfer']
            : api.tx[module]['transferAll']
      );
    } catch (e) {
      console.log('Something wrong while making on chain call!', e);

      return undefined;
    }
  }, [api, isNonNativeToken, chain, isForeignAsset, transferType]);

  const call = useMemo((): SubmittableExtrinsicFunction<'promise'> | undefined => {
    if (!api) {
      return;
    }

    if (isCrossChain) {
      const m = XCM_LOC.filter((x) => api.tx[x] && isFunction(api.tx[x]['limitedTeleportAssets']))?.[0];

      return m ? api.tx[m]['limitedTeleportAssets'] : undefined;
    }

    return onChainCall;
  }, [api, isCrossChain, onChainCall]);

  const buttonDisable = useMemo(
    () =>
      !address ||
      !recipientChainGenesisHash ||
      !(recipientAddress && inputs?.recipientAddress) ||
      Number(amount) <= 0 ||
      amountAsBN?.gt(new BN(transferableBalance || BN_ZERO)) ||
      !inputs?.totalFee ||
      !!warningMessage
    ,
    [address, amount, amountAsBN, inputs?.recipientAddress, inputs?.totalFee, recipientAddress, recipientChainGenesisHash, transferableBalance, warningMessage]);

  const calculateFee = useCallback((amount: Balance | BN, setFeeCall: React.Dispatch<React.SetStateAction<Balance | undefined>>) => {
    /** to set Maximum fee which will be used to estimate and show max transferable amount */
    if (!api || !balances || !formatted || !onChainCall) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      const dummyAmount = api.createType('Balance', BN_ONE) as Balance;

      return setFeeCall(dummyAmount);
    }

    const _params = isNonNativeToken
      ? ['currencies', 'tokens'].includes(onChainCall.section)
        ? [formatted, balances.currencyId, amount]
        : [parsedAssetId, formatted, amount]
      : [formatted, amount];

    onChainCall(..._params).paymentInfo(formatted).then((i) => setFeeCall(i?.partialFee)).catch(console.error);
  }, [api, formatted, balances, onChainCall, isNonNativeToken, parsedAssetId]);

  const crossChainParams = useMemo(() => {
    if (!api || !balances || !teleportState || isCrossChain === false || (recipientParaId === INVALID_PARA_ID && !teleportState?.isParaTeleport) || Number(amount) === 0) {
      return;
    }

    return [
      {
        V3: teleportState.isParaTeleport
          ? { interior: 'Here', parents: 1 }
          : { interior: { X1: { ParaChain: recipientParaId } }, parents: 0 }
      },
      {
        V3: {
          interior: {
            X1: {
              AccountId32: {
                id: api.createType('AccountId32', recipientAddress).toHex(),
                network: null
              }
            }
          },
          parents: 0
        }
      },
      {
        V3: [{
          fun: { Fungible: amountToMachine(amount, balances.decimal) },
          id: {
            Concrete: {
              interior: 'Here',
              parents: teleportState.isParaTeleport ? 1 : 0
            }
          }
        }]
      },
      0,
      { Unlimited: null }
    ];
  }, [api, teleportState, isCrossChain, recipientParaId, recipientAddress, amount, balances]);

  useEffect(() => {
    if (isNumber(recipientChainGenesisHash) && isCrossChain) {
      setParaId(parseInt(recipientChainGenesisHash));
    }

    setRecipientChainName(destinationGenesisHashes?.find(({ value }) => value === recipientChainGenesisHash)?.text);
  }, [destinationGenesisHashes, isCrossChain, recipientChainGenesisHash]);

  useEffect(() => {
    if (!recipientChainGenesisHash || !balances || recipientAddress === undefined || !recipientChainName || !amountAsBN) {
      return;
    }

    setInputs({
      amount,
      call,
      params: (isCrossChain
        ? crossChainParams
        : isNonNativeToken
          ? ['currencies', 'tokens'].includes(onChainCall?.section || '')
            ? [recipientAddress, balances.currencyId, amountAsBN] // this is for transferring on mutliasset chains
            : [parsedAssetId, recipientAddress, amountAsBN] // this is for transferring on asset hubs
          : transferType === 'All'
            ? [recipientAddress, false] // transferAll with keepalive = false
            : [recipientAddress, amountAsBN]) as unknown[],
      recipientAddress,
      recipientChainName,
      recipientGenesisHashOrParaId: recipientChainGenesisHash,
      totalFee: estimatedFee ? estimatedFee.add(estimatedCrossChainFee || BN_ZERO) : undefined
    });
  }, [amountAsBN, estimatedFee, estimatedCrossChainFee, setInputs, call, parsedAssetId, recipientAddress, isCrossChain, crossChainParams, isNonNativeToken, formatted, amount, recipientChainName, recipientChainGenesisHash, transferType, onChainCall?.section, balances]);

  useEffect(() => {
    if (!api || !transferableBalance) {
      return;
    }

    calculateFee(transferableBalance, setMaxFee);
  }, [api, calculateFee, transferableBalance]);

  useEffect(() => {
    if (!api || amountAsBN === undefined || !balances) {
      return;
    }

    calculateFee(amountAsBN || BN_ZERO, setEstimatedFee);
  }, [amountAsBN, api, balances, calculateFee]);

  const reformatRecipientAddress = useCallback(() => {
    if (!recipientAddress || chain?.ss58Format === undefined) {
      return;
    }

    const publicKey = decodeAddress(recipientAddress);
    const newFormattedAddress = encodeAddress(publicKey, chain.ss58Format);

    setRecipientAddress(newFormattedAddress);
  }, [chain?.ss58Format, recipientAddress]);

  useEffect(() => {
    chain && reformatRecipientAddress();
  }, [chain, reformatRecipientAddress]);

  useEffect(() => {
    if (!call || !crossChainParams || !formatted) {
      return setEstimatedCrossChainFee(undefined);
    }

    isCrossChain && call(...crossChainParams).paymentInfo(formatted).then((i) => setEstimatedCrossChainFee(i?.partialFee)).catch(console.error);
  }, [call, formatted, isCrossChain, crossChainParams]);

  const setWholeAmount = useCallback(() => {
    if (!transferableBalance || !maxFee || !balances) {
      return;
    }

    setTransferType('All');

    const isAvailableZero = transferableBalance.isZero();

    const _maxFee = isNativeToken ? maxFee : BN_ZERO;

    const canNotTransfer = isAvailableZero || _maxFee.gte(transferableBalance);
    const allAmount = canNotTransfer ? '0' : amountToHuman(transferableBalance.sub(_maxFee).toString(), balances.decimal);

    setAmount(allAmount);
  }, [balances, isNativeToken, maxFee, transferableBalance]);

  const _onChangeAmount = useCallback((value: string) => {
    if (!balances) {
      return;
    }

    if (value.length > balances.decimal - 1) {
      console.log(`The amount digits is more than decimal:${balances.decimal}`);

      return;
    }

    setTransferType('Normal');

    setAmount(value);
  }, [balances]);

  const onBack = useCallback(
    () => openOrFocusTab(`/accountfs/${address}/${assetId || '0'}`, true)
    , [address, assetId]);

  return (
    <Grid container item>
      <Typography fontSize='14px' fontWeight={400}>
        {t('Input transfer amount and destination account. For cross-chain transfers, adjust recipient chain and consider associated fees.')}
      </Typography>
      <Grid alignItems='center' borderBottom='1px rgba(99, 54, 77, 0.2) solid' container item justifyContent='space-between' m='auto' pb='30px' pt='15px'>
        <AmountWithOptions
          inputWidth={8.4}
          label={t('How much would you like to send?')}
          labelFontSize='16px'
          onChangeAmount={_onChangeAmount}
          onPrimary={setWholeAmount}
          primaryBtnText={t('Max amount')}
          style={{
            fontSize: '16px',
            mt: '25px',
            width: '82%'
          }}
          textSpace='15px'
          value={amount || inputs?.amount}
        />
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ height: '30px', width: '57.5%' }}>
          <Typography fontSize='14px' fontWeight={400}>
            {t('Network fee')}
          </Typography>
          <ShowBalance api={api} balance={estimatedFee} />
        </Grid>
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ height: '25px', width: '57.5%' }}>
          <Infotip2 showInfoMark text={t('Existential Deposit: {{ED}}', { replace: { ED: `${amountToHuman(balances?.ED, balances?.decimal)} ${balances?.token}` } })}>
            <Typography fontSize='14px' fontWeight={400}>
              {t('Transferable amount')}
            </Typography>
          </Infotip2>
          <ShowBalance
            balance={transferableBalance}
            decimal={balances?.decimal}
            decimalPoint={4}
            token={balances?.token}
          />
        </Grid>
      </Grid>
      <Typography fontSize='20px' fontWeight={500} pt='30px'>
        {t('To')}
      </Typography>
      <Grid container item justifyContent='space-between'>
        <Grid item md={6.9} sx={{ pt: '10px' }} xs={12}>
          <InputAccount
            address={recipientAddress || inputs?.recipientAddress}
            chain={chain as any}
            label={t('Account')}
            labelFontSize='16px'
            setAddress={setRecipientAddress}
            style={{ display: 'contents' }}
          />
        </Grid>
        <Grid item md={4.8} xs={12}>
          <FullscreenChainNames
            address={address}
            defaultValue={chain?.genesisHash || inputs?.recipientGenesisHashOrParaId}
            label={t('Chain')}
            labelFontSize='16px'
            onChange={setRecipientChainGenesisHash}
            options={destinationGenesisHashes}
            style={{ pt: '10px', width: '100%' }}
          />
          {isCrossChain && Number(amount) !== 0 &&
            <Grid alignItems='center' container item justifyContent='space-between' sx={{ height: '38px', width: '100%' }}>
              <Typography fontSize='14px' fontWeight={400}>
                {t('Cross-chain fee')}
              </Typography>
              <ShowBalance api={api} balance={estimatedCrossChainFee} />
            </Grid>
          }
        </Grid>
        <Grid item xs={12}>
          <Divider
            sx={{
              bgcolor: 'transparent',
              border: '0.5px solid rgba(99, 54, 77, 0.2) ',
              mt: '40px',
              width: '100%'
            }}
          />
        </Grid>
        <Grid alignItems='end' container justifyContent={warningMessage ? 'space-between' : 'flex-end'} mt='10px'>
          {warningMessage &&
            <Warning
              fontWeight={400}
              isDanger
              marginTop={0}
              theme={theme}
            >
              {warningMessage}
            </Warning>
          }
          <Grid container item sx={{ '> div': { m: 0, width: '64%' }, justifyContent: 'flex-end', mt: '5px' }}>
            <TwoButtons
              disabled={buttonDisable}
              mt='1px'
              // eslint-disable-next-line react/jsx-no-bind
              onPrimaryClick={() => setStep(STEPS.REVIEW)}
              onSecondaryClick={onBack}
              primaryBtnText={t('Next')}
              secondaryBtnText={t('Back')}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
