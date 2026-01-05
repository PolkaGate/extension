// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDef } from '@polkadot/extension-inject/types';
import type { UserAddedEndpoint } from '@polkadot/extension-polkagate/src/util/types';
import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';

import { Box, Collapse, IconButton, Stack, Typography, useTheme } from '@mui/material';
import { CloseCircle, Hashtag, ProgrammingArrow, RefreshCircle, Tag2, TickCircle } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { endpointUrlPng } from '@polkadot/extension-polkagate/src/assets/img';
import { CurrencyContext, DecisionButtons, MySnackbar, MyTextField, MyTooltip } from '@polkadot/extension-polkagate/src/components/index';
import { updateMetadata } from '@polkadot/extension-polkagate/src/messaging';
import { convertToHyphenated, isWss, toShortAddress, updateStorage } from '@polkadot/extension-polkagate/src/util';
import { getPrices } from '@polkadot/extension-polkagate/src/util/api/index';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { metadataFromApi } from '@polkadot/extension-polkagate/src/util/workers/utils/index';

import { useTranslation } from '../../../hooks';
import allChains from '../../../util/chains';
import { DraggableModal } from '../../components/DraggableModal';

interface Props {
  closePopup: ExtensionPopupCloser;
}

function getRandomColor () {
  // Generate a random number between 0 and 16777215 (0xFFFFFF)
  const randomNumber = Math.floor(Math.random() * 16777215);
  // Convert the number to a hexadecimal string and pad with leading zeros if necessary
  const randomColor = `#${randomNumber.toString(16).padStart(6, '0')}`;

  return randomColor;
}

interface ShowChainInfoProps {
  currencySign: string | undefined;
  metadata?: MetadataDef;
  price: number | null | undefined
}

interface ChainItemProps {
  value: any;
  label: string
}

function ChainItem ({ label, value }: ChainItemProps): React.ReactElement {
  return (
    <Stack alignItems='start' direction='column' rowGap='4px'>
      <Typography color='text.primary' variant='B-1'>
        {value}
      </Typography>
      <Typography color='#674394' variant='S-2'>
        {label}
      </Typography>
    </Stack>

  );
}

function ShowChainInfo ({ currencySign, metadata, price }: ShowChainInfoProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Collapse in={true} orientation='vertical' sx={{ m: '20px 0 20px', width: '100%' }}>
      {metadata &&
        <Stack alignItems='start' direction='column' sx={{ bgcolor: 'background.paper', borderRadius: '14px', display: 'felx', width: '100%' }}>
          <Stack alignItems='start' direction='column' sx={{ display: 'felx', p: '20px 20px 10px', width: '100%' }}>
            <Typography color='#7956A5' fontSize='11px' fontWeight={400} sx={{ alignItems: 'center', display: 'flex', letterSpacing: 1, mb: '15px', textAlign: 'left', textTransform: 'uppercase', width: '100%' }} variant='S-1'>
              {t('Network information')}
            </Typography>
            <Stack alignItems='start' columnGap='20px' direction='row'>
              <Stack alignItems='start' direction='column'>
                <Stack alignItems='center' columnGap='4px' direction='row'>
                  <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase' }} variant='H-3'>
                    {metadata.chain}
                  </Typography>
                  <Typography color='primary.main' sx={{ bgcolor: '#C6AECC26', borderRadius: '6px', lineHeight: '19px', px: '3px', textAlign: 'center', textTransform: 'uppercase' }} variant='S-2'>
                    {metadata.tokenSymbol}
                  </Typography>
                </Stack>
                <Typography color='#7956A5' variant='S-2'>
                  {t('Network')}
                </Typography>
              </Stack>
              <Stack alignItems='start' direction='column'>
                <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase' }} variant='H-3'>
                  {currencySign ?? '$'}{price ?? '0.00'}
                </Typography>
                <Typography color='#7956A5' variant='S-2'>
                  {t('Token price')}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack alignItems='center' columnGap='10%' direction='row' sx={{ bgcolor: '#2D1E4A', borderRadius: '14px', height: '62px', mx: '5px', pl: '15px', width: '98%' }}>
            <ChainItem
              label={t('Decimal')}
              value={metadata.tokenDecimals}
            />
            <ChainItem
              label={t('Type')}
              value={metadata.chainType}
            />
            <ChainItem
              label={t('Spec version')}
              value={metadata.specVersion}
            />
            <ChainItem
              label={t('Ss58 format')}
              value={metadata.ss58Format}
            />
          </Stack>
          <Stack alignItems='start' columnGap='20px' direction='column' sx={{ my: '20px', pl: '20px', width: '100%' }}>
            <Typography color='text.primary' sx={{ alignItems: 'center', mb: '10px', textAlign: 'left', width: '100%' }} variant='B-1'>
              {t('Genesis Hash')}
            </Typography>
            <Stack alignItems='center' columnGap='10px' direction='row' sx={{ bgcolor: '#1B133CB2', border: '1px solid #BEAAD833', borderRadius: '12px', height: '44px', opacity: '50%', pl: '20px', width: '95%' }}>
              <Hashtag color={theme.palette.text.secondary} size='18px' variant='Bulk' />
              <Typography color='text.secondary' variant='B-1'>
                {toShortAddress(metadata.genesisHash, 15)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      }
    </Collapse>
  );
}

function PolkadotJsUrlPicture ({ show }: { show: boolean | undefined }): React.ReactElement {
  return (
    <Collapse in={show} orientation='vertical' sx={{ mb: '60px', width: '100%' }}>
      <Box
        alt='endpoint in an URL'
        component='img'
        src={endpointUrlPng as string}
        sx={{
          borderRadius: '10px',
          height: 'auto',
          mt: '15px',
          width: '100%'
        }}
      />
    </Collapse>
  );
}

function GetPriceId ({ chainName, isCheckingPriceId, price, setCheckingPriceId, setPrice }:
  {
    chainName: string | undefined;
    isCheckingPriceId: boolean | undefined;
    price: number | null | undefined;
    setCheckingPriceId: React.Dispatch<React.SetStateAction<boolean | undefined>>;
    setPrice: React.Dispatch<React.SetStateAction<number | null | undefined>>;
  }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currency } = useContext(CurrencyContext);

  const [priceId, setPriceId] = useState<string>();

  const onPriceIdChange = useCallback((input: string) => {
    setPriceId(input);
    setPrice(undefined);
  }, [setPrice]);

  const getPrice = useCallback(async (priceId: string) => {
    if (priceId) {
      const maybePriceInfo = await getPrices([priceId], currency?.code?.toLowerCase());

      return maybePriceInfo.prices?.[priceId.toLowerCase()]?.value;
    }

    return null;
  }, [currency?.code]);

  const onCheckPriceIdClick = useCallback(() => {
    if (!priceId) {
      return;
    }

    setCheckingPriceId(true);

    getPrice(priceId)
      .then((p) => setPrice(p ?? null))
      .catch((error) => {
        console.error(error);
        setPrice(null);
      })
      .finally(() => setCheckingPriceId(false));
  }, [setCheckingPriceId, priceId, getPrice, setPrice]);

  const [Icon, color, bgcolor] = useMemo(() => {
    return isCheckingPriceId
      ? [RefreshCircle, theme.palette.primary.main, '#2D1E4A']
      : price === undefined && !priceId
        ? [Tag2, theme.palette.primary.main, '#2D1E4A']
        : price === undefined && priceId
          ? [Tag2, theme.palette.primary.main, '#2D1E4A']
          : price === null
            ? [CloseCircle, '#FF165C', '#B319554D']
            : [TickCircle, theme.palette.success.main, '#68A87A4D'];
  }, [isCheckingPriceId, price, priceId, theme.palette.primary.main, theme.palette.success.main]);

  return (
    <Stack alignItems='center' columnGap='10px' direction='row' sx={{ width: '100%' }}>
      <MyTextField
        inputValue={priceId}
        onEnterPress={onCheckPriceIdClick}
        onTextChange={onPriceIdChange}
        placeholder={chainName}
        style={{ marginBottom: '66px', width: '100%' }}
        title={t('Network token price id')}
        tooltip={t('Find your token on CoinGecko. The price ID is available at: https://www.coingecko.com/en/coins/[price-id]')}
      />
      <MyTooltip content={t('Check price ID')}>
        <IconButton onClick={onCheckPriceIdClick} sx={{ bgcolor, borderRadius: '8px', mb: '41px', padding: '3px', position: 'absolute', right: '24px' }}>
          <Box sx={{
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' }
            },
            animation: isCheckingPriceId ? 'spin 1.5s linear infinite' : undefined,
            display: 'inline-block',
            transformOrigin: '50% 50%',
            verticalAlign: 'middle',
            // to keep the icon stable in layout
            height: '30px',
            width: '30px'
          }}
          >
            <Icon color={color} size='30' variant='Bulk' />
          </Box>
        </IconButton>
      </MyTooltip>
    </Stack>
  );
}

function AddNewNetwork ({ closePopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currency } = useContext(CurrencyContext);

  const [endpoint, setEndpoint] = useState<string>();
  const [isError, setError] = useState<boolean>(false);
  const [showHow, setShowHow] = useState<boolean>();
  const [isPriceIdAsChainName, setPriceIdAsChainName] = useState<boolean>();
  const [priceId, setPriceId] = useState<string>();
  const [price, setPrice] = useState<number | null>();
  const [verifiedEndpoint, setVerifiedEndpoint] = useState<string>();
  const [isLoading, setLoading] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<MetadataDef | null>();
  const [isCheckingPriceId, setCheckingPriceId] = useState<boolean>();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const chainAlreadyExist = useMemo(() => !!allChains.find(({ genesisHash }) => genesisHash === metadata?.genesisHash), [metadata?.genesisHash]);

  const reset = useCallback(() => {
    setMetadata(undefined);
    setPrice(undefined);
    setPriceId(undefined);
    setVerifiedEndpoint(undefined);
    setLoading(false);
    setCheckingPriceId(false);
    setError(false);
    setShowSnackbar(false);
  }, []);

  const onEndpointChange = useCallback((input: string) => {
    reset();
    const maybeDecodedInput = decodeURIComponent(input);

    setEndpoint(maybeDecodedInput);
  }, [reset]);

  const getPrice = useCallback(async (priceId: string) => {
    if (priceId) {
      const maybePriceInfo = await getPrices([priceId], currency?.code?.toLowerCase());

      return maybePriceInfo.prices?.[priceId.toLowerCase()]?.value;
    }

    return null;
  }, [currency?.code]);

  useEffect(() => {
    let api: ApiPromise | null = null;

    const getInfo = async () => {
      if (!verifiedEndpoint) {
        return;
      }

      const wsProvider = new WsProvider(verifiedEndpoint);

      api = await ApiPromise.create({ provider: wsProvider });

      const { metadata } = metadataFromApi(api);

      if (!metadata.color) {
        metadata.color = getRandomColor();
      }

      setMetadata(metadata);

      const chainName = metadata?.chain;

      if (chainName) {
        const hyphenatedChainName = convertToHyphenated(chainName);

        const price = await getPrice(hyphenatedChainName);

        if (price) {
          setPrice(price);
          setPriceIdAsChainName(true);
          setPriceId(hyphenatedChainName);
        }
      }

      setLoading(false);
    };

    getInfo().catch(console.error);

    return () => {
      if (api) {
        api.disconnect().catch(console.error);
      }
    };
  }, [currency?.code, getPrice, verifiedEndpoint]);

  const onCheck = useCallback(() => {
    if (endpoint && isWss(endpoint)) {
      setLoading(true);
      // setVerifiedEndpoint((prev) => ([...prev, endpoint]));
      setVerifiedEndpoint(endpoint);
      setError(false);
    } else {
      setError(true);
    }
  }, [endpoint]);

  const handleSavings = useCallback(async (toSaveInfo: Record<string, UserAddedEndpoint>) => {
    await updateStorage(STORAGE_KEY.USER_ADDED_ENDPOINT, toSaveInfo).catch(console.error);
    await updateMetadata(metadata as unknown as MetadataDef).catch(console.error);
    setShowSnackbar(true);
  }, [metadata]);

  const onAdd = useCallback(() => {
    if (!metadata || !endpoint) {
      return;
    }

    const key = metadata.genesisHash;
    const { chain, color, icon, ss58Format, tokenDecimals, tokenSymbol } = metadata;
    const toSaveInfo = {
      [key]: {
        chain,
        color,
        endpoint,
        icon,
        name: chain,
        priceId,
        ss58Format,
        tokenDecimal: tokenDecimals,
        tokenSymbol
      } as UserAddedEndpoint
    };

    handleSavings(toSaveInfo).catch(console.error);
  }, [endpoint, handleSavings, metadata, priceId]);

  const onClose = useCallback(() => {
    if (showSnackbar) { // is used to detect if a chain has been added
      return window.location.reload();
    }

    reset();
    closePopup();
  }, [reset, closePopup, showSnackbar]);

  const onHow = useCallback(() => setShowHow(!showHow), [showHow]);

  return (
    <DraggableModal
      onClose={onClose}
      open
      showBackIconAsClose
      style={{ minHeight: '400px', padding: '20px 20px 50px' }}
      title={t('Add New Network')}
      width={492}
    >
      <>
        <Stack alignItems='start' direction='column' sx={{ display: 'flex', width: '100%' }}>
          <Typography color='text.secondary' sx={{ m: '10px 5px 10px', textAlign: 'left' }} variant='B-4'>
            {t('If your network not listed in the PolkaGate network list, you can provide an RPC endpoint, and we’ll automatically fetch the network information to add it to the extension’s network list')}
          </Typography>
          <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'space-between', mt: '20px', position: 'relative', width: '100%' }}>
            <Stack columnGap='2px' direction='row' onClick={onHow} sx={{ alignItems: 'center', cursor: 'pointer', justifyContent: 'end', position: 'absolute', right: 0, top: 0 }}>
              <ProgrammingArrow color={showHow ? theme.palette.warning.main : '#AA83DC'} size='14' variant='Bulk' />
              <Typography color={showHow ? 'warning.main' : '#AA83DC'} variant='B-1'>
                {t('How')}
              </Typography>
            </Stack>
            <MyTextField
              Icon={Hashtag}
              errorMessage={isError ? t('Invalid endpoint format.') : chainAlreadyExist ? t('This network is already available — no need to add it again.') : ''}
              focused
              iconSize={18}
              inputValue={endpoint}
              onEnterPress={onCheck}
              onTextChange={onEndpointChange}
              placeholder={'wss://'}
              title={t('RPC endpoint for your desired network')}
              tooltip={t('Find the chain endpoint in the Polkadot.js/org/apps. After selecting your chain and endpoint, copy the URL segment starting with wss and ending before the first #. For example: wss://rpc.dotters.network/polkadot')}
            />
          </Stack>
          {!isLoading && !metadata &&
            <PolkadotJsUrlPicture show={showHow} />
          }
          {metadata &&
            <ShowChainInfo
              currencySign={currency?.sign}
              metadata={metadata}
              price={price}
            />
          }
          {metadata && !isPriceIdAsChainName && !chainAlreadyExist &&
            <GetPriceId
              chainName={metadata?.chain}
              isCheckingPriceId={isCheckingPriceId}
              price={price}
              setCheckingPriceId={setCheckingPriceId}
              setPrice={setPrice}
            />
          }
          <DecisionButtons
            cancelButton
            direction='horizontal'
            disabled={!endpoint}
            isBusy={isLoading}
            onPrimaryClick={metadata ? onAdd : onCheck}
            onSecondaryClick={onClose}
            primaryBtnText={metadata ? t('Add') : t('Check')}
            secondaryBtnText={t('Cancel')}
            style={{ bottom: '12px', flexDirection: 'row-reverse', position: 'absolute', width: '90%' }}
          />
        </Stack>
        <MySnackbar
          onClose={onClose}
          open={showSnackbar}
          text={t('New network added successfully.')}
        />
      </>
    </DraggableModal>
  );
}

export default AddNewNetwork;
// wss%3A%2F%2Fpolkadot.dotters.network
// wss%3A%2F%2Fmainnet-archive.chainflip.io
