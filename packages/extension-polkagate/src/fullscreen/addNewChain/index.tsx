// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { MetadataDef } from '@polkadot/extension-inject/types';
import type { UserAddedEndpoint } from '@polkadot/extension-polkagate/util/types';

import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Collapse, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';

import { endpointUrlPng } from '../../assets/img';
import { ActionContext, InputWithLabel, Progress, TwoButtons, VaadinIcon, Warning } from '../../components';
import FormatPrice from '../../components/FormatPrice';
import { updateStorage } from '../../components/Loading';
import { useCurrency, useFullscreen, useTranslation } from '../../hooks';
import { updateMetadata } from '../../messaging';
import { getPrices } from '../../util/api';
import allChains from '../../util/chains';
import { FULLSCREEN_WIDTH } from '../../util/constants';
import { isWss } from '../../util/utils';
import { metadataFromApi } from '../../util/workers/utils';
import FullScreenHeader from '../governance/FullScreenHeader';
import { convertToHyphenated } from '../governance/utils/util';
import Bread from '../partials/Bread';
import { Title } from '../sendFund/InputPage';
import ShowChainInfo from './ShowChainInfo';

function getRandomColor() {
  // Generate a random number between 0 and 16777215 (0xFFFFFF)
  const randomNumber = Math.floor(Math.random() * 16777215);
  // Convert the number to a hexadecimal string and pad with leading zeros if necessary
  const randomColor = `#${randomNumber.toString(16).padStart(6, '0')}`;

  return randomColor;
}

export default function AddNewChain(): React.ReactElement {
  useFullscreen();
  const theme = useTheme();
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const currency = useCurrency();

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

  const chainAlreadyExist = useMemo(() => !!allChains.find(({ genesisHash }) => genesisHash === metadata?.genesisHash), [metadata?.genesisHash]);

  const reset = useCallback(() => {
    setMetadata(undefined);
    setPrice(undefined);
    setPriceId(undefined);
    setVerifiedEndpoint(undefined);
    setLoading(false);
    setCheckingPriceId(false);
    setError(false);
  }, []);

  const onEndpointChange = useCallback((input: string) => {
    reset();
    const maybeDecodedInput = decodeURIComponent(input);

    setEndpoint(maybeDecodedInput);
  }, [reset]);

  const onPriceIdChange = useCallback((input: string) => {
    setPriceId(input);
  }, []);

  const getPrice = useCallback(async (priceId: string) => {
    if (priceId) {
      const maybePriceInfo = await getPrices([priceId], currency?.code?.toLowerCase());

      return maybePriceInfo.prices?.[priceId.toLowerCase()]?.value;
    }

    return null;
  }, [currency?.code]);

  const onCheckPriceIdClick = useCallback(() => {
    setCheckingPriceId(true);

    priceId && getPrice(priceId).then((maybePrice) => setPrice(maybePrice ?? null)).catch(console.error).finally(() => setCheckingPriceId(false));
  }, [priceId, getPrice]);

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
    await updateStorage('userAddedEndpoint', toSaveInfo).catch(console.error);
    await updateMetadata(metadata as unknown as MetadataDef).catch(console.error);
    onAction('/');
  }, [metadata, onAction]);

  const onAdd = useCallback(() => {
    if (!metadata || !endpoint) {
      return;
    }

    const key = metadata.genesisHash;

    const toSaveInfo = {
      [key]: {
        chain: metadata.chain,
        color: metadata.color,
        endpoint,
        priceId
      } as UserAddedEndpoint
    };

    handleSavings(toSaveInfo).catch(console.error);
  }, [endpoint, handleSavings, metadata, priceId]);

  const onHow = useCallback(() => {
    setShowHow(!showHow);
  }, [showHow]);

  const onCancel = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader noAccountDropDown noChainSwitch />
      <Grid container item sx={{ bgcolor: 'backgroundFL.secondary', display: 'block', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', position: 'relative', px: '3%' }}>
        <Bread />
        <Title
          height='100px'
          logo={<VaadinIcon icon='vaadin:globe-wire' style={{ color: `${theme.palette.text.primary}`, fontSize: '20px' }} />}
          text={t('Add New Chain')}
        />
        <Typography fontSize='14px' fontWeight={400} mb={2}>
          {t('If your chain is not listed in the PolkaGate chain list, you can provide an RPC endpoint, and we’ll automatically fetch the chain information to add it to the extension’s chain list.')}
        </Typography>
        <Grid container item justifyContent='flex-end' position='relative'>
          <Button onClick={onHow} sx={{ minWidth: 0, p: 0, position: 'absolute', textTransform: 'none', zIndex: 10 }} variant='text'>
            {t('How?')}
          </Button>
        </Grid>
        <InputWithLabel
          helperText={t('Find the chain endpoint in the Polkadot.js/org/apps. After selecting your chain and endpoint, copy the URL segment starting with wss and ending before the first #. For example: wss://rpc.dotters.network/polkadot')}
          isFocused
          label={t('RPC endpoint for your desired chain:')}
          labelFontSize='16px'
          onChange={onEndpointChange}
          // eslint-disable-next-line react/jsx-no-bind
          onEnter={() => onCheck()}
          placeholder='wss://'
          type='wss'
          value={endpoint}
        />
        {(isError || chainAlreadyExist) &&
          <Warning
            iconDanger
            isBelowInput
            marginTop={0}
            theme={theme}
          >
            {isError ? t('Invalid endpoint format!') : t('The chain already exists, no need to add it again!')}
          </Warning>
        }
        {!isLoading && !metadata &&
          <Collapse in={showHow} orientation='vertical' sx={{ width: '100%' }}>
            <Box
              alt='endpont in an URL'
              component='img'
              src={endpointUrlPng}
              sx={{
                borderRadius: '10px',
                height: 'auto',
                mt: '15px',
                width: '100%'
              }}
            />
          </Collapse>
        }
        {isLoading
          ? <Progress
            fontSize={16}
            pt={10}
            size={150}
            title={t('Loading chain information, please wait ...')}
            type='grid'
          />
          : metadata &&
          <>
            <ShowChainInfo
              metadata={metadata}
              price={price}
              style={{ my: '30px' }}
            />
            {!isPriceIdAsChainName && !chainAlreadyExist &&
              <>
                <Typography fontSize='14px' lineHeight='20px' py='15px'>
                  {t('We couldn’t find the token price ID on-chain. To view your balance in fiat, please get it from CoinGecko and enter it below. This step is optional if you only need the crypto balance.')}
                </Typography>
                <Grid alignItems='end' container item>
                  <Grid item xs={4}>
                    <InputWithLabel
                      helperText={t('Find your token on CoinGecko. The price ID is available at: https://www.coingecko.com/en/coins/[price-id]')}
                      isFocused
                      label={t('Chain token price Id')}
                      onChange={onPriceIdChange}
                      placeholder={metadata.chain}
                      value={priceId}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton
                      disabled={!priceId}
                      onClick={onCheckPriceIdClick}
                      sx={{ mx: '7px', p: 0 }}
                    >
                      <FontAwesomeIcon
                        color={priceId ? theme.palette.primary.main : theme.palette.text.disabled}
                        fontSize='25px'
                        icon={faRefresh}
                        spin={isCheckingPriceId}
                      />
                    </IconButton>
                  </Grid>
                  <Grid item xs={6}>
                    {priceId && price !== undefined &&
                      <Typography fontSize='16px' fontWeight={400}>
                        {price
                          ? <FormatPrice
                            decimalPoint={4}
                            fontSize='18px'
                            num={price}
                            width='80px'
                          />
                          : 'Check the price id, and try again!'
                        }
                      </Typography>}
                  </Grid>
                </Grid>

              </>
            }
          </>
        }
        <Grid container item justifyContent='flex-end' sx={{ borderColor: 'divider', borderTop: 0.5, bottom: '25px', height: '50px', left: 0, mx: '7%', position: 'absolute', width: '85%' }}>
          <Grid container item xs={7}>
            <TwoButtons
              disabled={!endpoint || chainAlreadyExist}
              isBusy={isLoading}
              mt='10px'
              onPrimaryClick={metadata ? onAdd : onCheck}
              onSecondaryClick={onCancel}
              primaryBtnText={metadata ? t('Add') : t('Check')}
              secondaryBtnText={t('Cancel')}
              width='100%'
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
