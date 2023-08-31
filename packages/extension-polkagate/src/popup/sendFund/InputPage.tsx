// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { Balance } from '@polkadot/types/interfaces';
import { BN, BN_ONE, BN_ZERO, isFunction } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { AmountWithOptions, ChainLogo, FullscreenChain, InputAccount, PButton, ShowBalance } from '../../components';
import { useTranslation } from '../../components/translate';
import { useApi, useChain, useDecimal, useFormatted, useTeleport } from '../../hooks';
import { BalancesInfo, DropdownOption, TransferType } from '../../util/types';
import { amountToHuman, amountToMachine } from '../../util/utils';
import { toTitleCase } from '../governance/utils/util';
import { Inputs, STEPS } from '.';

interface Props {
  address: string
  balances: BalancesInfo | undefined;
  assetId: number | undefined;
  inputs: Inputs | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setInputs: React.Dispatch<React.SetStateAction<Inputs>>
}

const XCM_LOC = ['xcm', 'xcmPallet', 'polkadotXcm'];
const INVALID_PARA_ID = Number.MAX_SAFE_INTEGER;

function isNumber(variable: any) {
  return typeof variable === 'number';
}

export const Title = ({ padding = '30px 0px 20px', text }: { text: string, padding?: string }) => {
  const theme = useTheme();

  return (
    <Grid alignItems='baseline' container item spacing={1} p={padding}>
      <Grid item>
        <FontAwesomeIcon
          color={theme.palette.text.primary}
          icon={faPaperPlane}
          size='xl'
          style={{ paddingBottom: '5px' }}
        />
      </Grid>
      <Grid item>
        <Typography fontSize='30px' fontWeight={700} >
          {text}
        </Typography>
      </Grid>
    </Grid>
  )
};

export default function InputPage({ address, assetId, balances, inputs, setInputs, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const decimal = useDecimal(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const teleportState = useTeleport(address);

  const [amount, setAmount] = useState<string>(inputs?.amount || '0');
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [estimatedCrossChainFee, setEstimatedCrossChainFee] = useState<Balance>();
  const [recipientAddress, setRecipientAddress] = useState<string>(inputs?.recipientAddress);
  const [recipientChainGenesisHash, setRecipientChainGenesisHash] = useState<string | undefined>(inputs?.recipientGenesisHashOrParaId);
  const [recipientParaId, setParaId] = useState(INVALID_PARA_ID);
  const [recipientChainName, setRecipientChainName] = useState<string>();
  const [transferType, setTransferType] = useState<TransferType>('Normal');
  const [maxFee, setMaxFee] = useState<Balance>();

  const destinationGenesisHashes = useMemo((): DropdownOption[] => {
    const currentChainOption = chain ? [{ text: chain.name, value: chain.genesisHash }] : [];
    const mayBeTeleportDestinations = assetId === undefined
      ? teleportState?.destinations?.map(({ genesisHash, info, paraId }) => ({ text: toTitleCase(info), value: genesisHash || paraId }))
      : [];

    return currentChainOption.concat(mayBeTeleportDestinations);
  }, [assetId, chain, teleportState?.destinations]);

  const isCrossChain = useMemo(() => recipientChainGenesisHash !== chain?.genesisHash, [chain?.genesisHash, recipientChainGenesisHash]);

  const amountAsBN = useMemo(() => {
    if (!isCrossChain && assetId !== undefined) {
      return balances?.decimal && amountToMachine(amount, balances.decimal);
    }

    return amountToMachine(amount, decimal);
  }, [amount, assetId, balances, decimal, isCrossChain]);

  const onChainCall = useMemo(() => {
    const module = assetId !== undefined ? 'assets' : 'balances';

    return api && api.tx?.[module] && (['Normal', 'Max'].includes(transferType) ? api.tx[module].transferKeepAlive : api.tx[module].transferAll);
  }, [api, assetId, transferType]);

  const call = useMemo((): SubmittableExtrinsicFunction<'promise'> | undefined => {
    if (!api) {
      return;
    }

    if (isCrossChain) {
      const m = XCM_LOC.filter((x) => api.tx[x] && isFunction(api.tx[x].limitedTeleportAssets))[0];

      return api.tx[m].limitedTeleportAssets;
    }

    return onChainCall;
  }, [api, isCrossChain, onChainCall]);

  const calculateFee = useCallback((amount: Balance | BN, setFeeCall: (value: React.SetStateAction<Balance | undefined>) => void) => {
    /** to set Maximum fee which will be used to estimate and show max transferable amount */
    if (!api || !balances || !formatted || !onChainCall) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      const dummyAmount = api?.createType('Balance', BN_ONE);

      return setFeeCall(dummyAmount);
    }

    const _params = assetId !== undefined ? [assetId, formatted, amount] : [formatted, amount];

    onChainCall(..._params).paymentInfo(formatted).then((i) => setFeeCall(i?.partialFee)).catch(console.error);
  }, [api, formatted, balances, onChainCall, assetId]);

  const crossChainParams = useMemo(() => {
    if (!api || !teleportState || isCrossChain === false || (recipientParaId === INVALID_PARA_ID && !teleportState?.isParaTeleport) || Number(amount) === 0) {
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
          fun: { Fungible: amountToMachine(amount, decimal) },
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
  }, [api, teleportState, isCrossChain, recipientParaId, recipientAddress, amount, decimal]);

  useEffect(() => {
    if (isNumber(recipientChainGenesisHash) && isCrossChain) {
      setParaId(parseInt(recipientChainGenesisHash));
    }

    setRecipientChainName(destinationGenesisHashes?.find(({ value }) => value === recipientChainGenesisHash)?.text);
  }, [destinationGenesisHashes, isCrossChain, recipientChainGenesisHash]);

  useEffect(() => {
    if (!recipientChainGenesisHash || recipientAddress === undefined || !recipientChainName) {
      return;
    }

    setInputs({
      amount,
      call,
      params: isCrossChain
        ? crossChainParams
        : assetId !== undefined
          ? [assetId, recipientAddress, amountAsBN]
          : [formatted, amountAsBN],
      recipientAddress,
      recipientChainName,
      recipientGenesisHashOrParaId: recipientChainGenesisHash,
      totalFee: (estimatedFee || BN_ZERO).add(estimatedCrossChainFee || BN_ZERO)
    });
  }, [amountAsBN, estimatedFee, estimatedCrossChainFee, setInputs, call, recipientAddress, isCrossChain, crossChainParams, assetId, formatted, amount, decimal, recipientChainName, recipientChainGenesisHash]);

  useEffect(() => {
    if (!api || !balances) {
      return;
    }

    calculateFee(balances?.availableBalance, setMaxFee);
  }, [api, balances, calculateFee]);

  useEffect(() => {
    if (!api || amount === undefined) {
      return;
    }

    const value = amount ? amountToMachine(amount, decimal) : BN_ZERO;

    calculateFee(value, setEstimatedFee);
  }, [amount, api, calculateFee, decimal]);

  const reformatRecipientAddress = useCallback(() => {
    if (!recipientAddress || chain?.ss58Format === undefined) {
      return;
    }

    const publicKey = decodeAddress(recipientAddress);
    const newFormattedAddress = encodeAddress(publicKey, chain.ss58Format)

    setRecipientAddress(newFormattedAddress);
  }, [chain?.ss58Format, recipientAddress]);

  useEffect(() => {
    chain && reformatRecipientAddress();
  }, [chain, reformatRecipientAddress]);

  useEffect(() => {
    if (!call || !crossChainParams || !formatted) {
      return;
    }

    isCrossChain && call(...crossChainParams).paymentInfo(formatted).then((i) => setEstimatedCrossChainFee(i?.partialFee)).catch(console.error);
  }, [call, formatted, isCrossChain, crossChainParams]);

  const setWholeAmount = useCallback((type: TransferType) => {
    if (!api || !balances?.availableBalance || !maxFee || !decimal) {
      return;
    }

    setTransferType(type);
    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const allAmount = balances.availableBalance.isZero() ? '0' : amountToHuman(balances.availableBalance.sub(maxFee).toString(), decimal);
    const maxAmount = balances.availableBalance.isZero() ? '0' : amountToHuman(balances.availableBalance.sub(maxFee).sub(ED).toString(), decimal);

    setAmount(type === 'All' ? allAmount : maxAmount);
  }, [api, balances?.availableBalance, decimal, maxFee]);

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      <Title text={t<string>('Send Fund')} />
      <Typography fontSize='14px' fontWeight={400}>
        {t<string>('Input transfer amount and destination account. For cross-chain transfers, adjust recipient chain and consider associated fees.')}
      </Typography>
      <Grid alignItems='center' borderBottom='1px rgba(99, 54, 77, 0.2) solid' container item justifyContent='space-between' m='auto' pb='15px' pt='25px'>
        <Grid container item justifyContent='space-between'>
          <Grid item md={6.9} xs={12}>
            <Typography fontSize='16px'>
              {t<string>('Transferable amount')}
            </Typography>
            <Grid alignItems='center' container item sx={{ border: 1, height: '48px', p: '0 5px', fontSize: '18px', borderColor: 'rgba(75, 75, 75, 0.3)' }}>
              <ShowBalance balance={balances?.availableBalance} decimal={balances?.decimal} token={balances?.token} />
            </Grid>
          </Grid>
          <Grid item md={4.8} xs={12}>
            <Typography fontSize='16px'>
              {t<string>('Chain')}
            </Typography>
            <Grid alignItems='center' container item sx={{ border: 1, height: '48px', p: '0 15px', fontSize: '18px', borderColor: 'rgba(75, 75, 75, 0.3)' }}>
              <ChainLogo genesisHash={chain?.genesisHash} size={29} />
              <Typography fontSize='14px' pl='10px'>
                {chain?.name}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <AmountWithOptions
          inputWidth={8.4}
          label={t<string>('Amount')}
          labelFontSize='16px'
          onChangeAmount={setAmount}
          // eslint-disable-next-line react/jsx-no-bind
          onPrimary={() => setWholeAmount('All')}
          // eslint-disable-next-line react/jsx-no-bind
          onSecondary={() => setWholeAmount('Max')}
          primaryBtnText={t<string>('All amount')}
          secondaryBtnText={t<string>('Max amount')}
          style={{
            fontSize: '16px',
            mt: '25px',
            width: '82%'
          }}
          textSpace='15px'
          value={amount || inputs?.amount}
        />
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ width: '57.5%', height: '38px' }}>
          <Typography fontSize='16px' fontWeight={400}>
            {t<string>('Network fee')}
          </Typography>
          <ShowBalance api={api} balance={estimatedFee} />
        </Grid>
      </Grid>
      <Typography fontSize='20px' fontWeight={500} pt='15px'>
        {t<string>('To')}
      </Typography>
      <Grid container item justifyContent='space-between' >
        <Grid item md={6.9} xs={12} sx={{ pt: '10px' }} >
          <InputAccount
            address={recipientAddress || inputs?.recipientAddress}
            chain={chain}
            label={t('Account')}
            labelFontSize='16px'
            setAddress={setRecipientAddress}
            style={{ display: 'contents' }}
          />
        </Grid>
        <Grid item md={4.8} xs={12}>
          <FullscreenChain
            address={address}
            defaultValue={chain?.genesisHash || inputs?.recipientGenesisHashOrParaId}
            label={t<string>('Chain')}
            labelFontSize='16px'
            onChange={setRecipientChainGenesisHash}
            options={destinationGenesisHashes}
            style={{ pt: '10px', width: '100%' }}
          />
          {isCrossChain && Number(amount) !== 0 &&
            <Grid alignItems='center' container item justifyContent='space-between' sx={{ height: '38px', width: '100%' }}>
              <Typography fontSize='16px' fontWeight={400}>
                {t<string>('Cross-chain fee')}
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
              mt: '38px',
              width: '100%'
            }}
          />
        </Grid>
        <Grid container justifyContent='flex-end'>
          <PButton
            _mt='15px'
            // eslint-disable-next-line react/jsx-no-bind
            _onClick={() => setStep(STEPS.REVIEW)}
            _width={32}
            disabled={!address || !recipientChainGenesisHash || !(recipientAddress && inputs?.recipientAddress) || Number(amount) <= 0 || amountAsBN.gt(new BN(balances?.availableBalance || BN_ZERO))}
            text={t<string>('Next')}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
