// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import { Balance } from '@polkadot/types/interfaces';
import { BN, BN_ONE, BN_ZERO, isFunction } from '@polkadot/util';

import { AmountWithOptions, FullscreenChain, InputAccount, PButton, ShowBalance } from '../../components';
import { useTranslation } from '../../components/translate';
import { useApi, useChain, useDecimal, useFormatted, useTeleport } from '../../hooks';
import { CHAINS_WITH_BLACK_LOGO } from '../../util/constants';
import getLogo from '../../util/getLogo';
import { BalancesInfo, DropdownOption, TransferType } from '../../util/types';
import { amountToHuman, amountToMachine } from '../../util/utils';
import { toTitleCase } from '../governance/utils/util';

interface Props {
  address: string
  balances: BalancesInfo | undefined;
  assetId: number | undefined
}

const XCM_LOC = ['xcm', 'xcmPallet', 'polkadotXcm'];
const INVALID_PARA_ID = Number.MAX_SAFE_INTEGER;

export default function SetValues({ address, assetId, balances }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const decimal = useDecimal(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const teleportState = useTeleport(address);

  const destinationGenesisHashes = useMemo((): DropdownOption[] => {
    const currentChainOption = chain ? [{ text: chain.name, value: chain.genesisHash }] : [];
    const mayBeTeleportDestinations = teleportState?.destinations?.map(({ paraId, info }) => {
      return { text: toTitleCase(info), value: paraId };
    });

    return currentChainOption.concat(mayBeTeleportDestinations || []);
  }, [chain, teleportState?.destinations]);

  const [display, setDisplay] = useState<string | undefined>();
  const [amount, setAmount] = useState<string>('0');
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [estimatedCrossChainFee, setEstimatedCrossChainFee] = useState<Balance>();
  const [recipientAddress, setRecipientAddress] = useState<string>();
  const [recipientChainGenesisHash, setRecipientChainGenesisHash] = useState<string>();
  const [recipientParaId, setParaId] = useState(INVALID_PARA_ID);

  const [transferType, setTransferType] = useState<TransferType>('Normal');
  const [maxFee, setMaxFee] = useState<Balance>();

  const isCrossChain = useMemo(() => recipientChainGenesisHash !== chain?.genesisHash, [chain?.genesisHash, recipientChainGenesisHash]);

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

  const params = useMemo(() => {
    if (!api || !teleportState || isCrossChain === false || recipientParaId === INVALID_PARA_ID || Number(amount) === 0) {
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

  console.log('recipientParaId:', recipientParaId);
  console.log('paramsparams:', params);
  console.log('recipientChainGenesisHash:', recipientChainGenesisHash);

  useEffect(() => {
    if (recipientChainGenesisHash && isCrossChain) {
      setParaId(parseInt(recipientChainGenesisHash));
    }
  }, [isCrossChain, recipientChainGenesisHash]);

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

  useEffect(() => {
    if (!call || !params || !formatted) {
      return;
    }

    isCrossChain && call(...params).paymentInfo(formatted).then((i) => setEstimatedCrossChainFee(i?.partialFee)).catch(console.error);
  }, [call, formatted, isCrossChain, params]);

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
      <Grid alignItems='baseline' container item spacing={1}>
        <Grid item>
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            icon={faPaperPlane}
            size='xl'
            style={{ paddingBottom: '5px' }}
          />
        </Grid>
        <Grid item>
          <Typography fontSize='30px' fontWeight={700} pb='20px' pt='30px'>
            {t<string>('Send Fund')}
          </Typography>
        </Grid>
      </Grid>
      <Typography fontSize='14px' fontWeight={400}>
        {t<string>('Please enter the amount you wish to transfer. For cross-chain transfers, if available, adjust the recipient chain and take into account the applicable cross-chain fee.')}
      </Typography>
      <Grid alignItems='center' borderBottom='1px rgba(99, 54, 77, 0.2) solid' container item justifyContent='space-between' m='auto' pb='15px' pt='18px'>
        <Grid container item justifyContent='space-between'>
          <Grid item md={6.9} xs={12}>
            <Typography fontSize='16px'>
              {t<string>('Transferable amount')}
            </Typography>
            <Grid alignItems='center' container item sx={{ border: 1, height: '48px', p: '0 5px', fontSize: '18px', borderColor: 'rgba(75, 75, 75, 0.3)' }}>
              <ShowBalance balance={balances?.availableBalance} decimal={balances?.decimal} token={balances?.token} />
            </Grid>
          </Grid>
          <Grid item md={4.7} xs={12}>
            <Typography fontSize='16px'>
              {t<string>('Chain')}
            </Typography>
            <Grid alignItems='center' container item sx={{ border: 1, height: '48px', p: '0 5px', fontSize: '18px', borderColor: 'rgba(75, 75, 75, 0.3)' }}>
              <Avatar src={getLogo(chain)} sx={{ filter: (CHAINS_WITH_BLACK_LOGO.includes(chain?.name) && theme.palette.mode === 'dark') ? 'invert(1)' : '', borderRadius: '50%', height: 29, width: 29 }} variant='square' />
              <Typography fontSize='14px' pl='5px'>
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
          value={amount}
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
            address={recipientAddress}
            chain={chain}
            label={t('Account')}
            labelFontSize='16px'
            setAddress={setRecipientAddress}
            style={{ display: 'contents' }}
          />
        </Grid>
        <Grid item md={4.7} xs={12}>
          <FullscreenChain
            address={address}
            defaultValue={chain?.genesisHash}
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
            _width={30}
            disabled={!address || !recipientChainGenesisHash || !recipientAddress || Number(amount) <= 0}
            text={t<string>('Next')}
          // _onClick={goReview}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
