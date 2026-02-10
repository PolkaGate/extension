// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDef } from '@polkadot/extension-inject/types';
import type { UserAddedEndpoint } from '@polkadot/extension-polkagate/src/util/types';
import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';

import { Stack, Typography, useTheme } from '@mui/material';
import { Hashtag, ProgrammingArrow } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise, WsProvider } from '@polkadot/api';
import { CurrencyContext, DecisionButtons, MySnackbar, MyTextField } from '@polkadot/extension-polkagate/src/components/index';
import { updateMetadata } from '@polkadot/extension-polkagate/src/messaging';
import { convertToHyphenated, isWss, sanitizeChainName, updateStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { metadataFromApi } from '@polkadot/extension-polkagate/src/util/workers/utils/index';

import { useTranslation } from '../../../hooks';
import allChains from '../../../util/chains';
import { DraggableModal } from '../../components/DraggableModal';
import GetPriceId from './GetPriceId';
import PolkadotJsUrlPicture from './PolkadotJsUrlPicture';
import ShowChainInfo from './ShowChainInfo';
import { getPrice, getRandomColor } from './utils';

interface Props {
  closePopup: ExtensionPopupCloser;
}

function AddNewNetwork({ closePopup }: Props): React.ReactElement {
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

  useEffect(() => {
    let api: ApiPromise | null = null;

    const getInfo = async() => {
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
        const _chainName = sanitizeChainName(chainName) || '';

        const res = await getPrice([hyphenatedChainName, _chainName], currency?.code);

        if (res) {
          setPrice(res.price);
          setPriceIdAsChainName(true);
          setPriceId(res.priceId);
        }
      }

      setLoading(false);
    };

    getInfo().catch((error) => {
      console.error(error);
      setLoading(false);
      setError(true);
    });

    return () => {
      if (api) {
        api.disconnect().catch(console.error);
      }
    };
  }, [currency?.code, verifiedEndpoint]);

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
    metadata && await updateStorage(STORAGE_KEY.SELECTED_CHAINS, [metadata.genesisHash], true).catch(console.error);
    setShowSnackbar(true);
  }, [metadata]);

  const onAdd = useCallback(() => {
    if (!metadata || !endpoint || chainAlreadyExist) {
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
  }, [chainAlreadyExist, endpoint, handleSavings, metadata, priceId]);

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
              priceId={priceId}
              setCheckingPriceId={setCheckingPriceId}
              setPrice={setPrice}
              setPriceId={setPriceId}
            />
          }
          <DecisionButtons
            cancelButton
            direction='horizontal'
            disabled={!endpoint || chainAlreadyExist}
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
