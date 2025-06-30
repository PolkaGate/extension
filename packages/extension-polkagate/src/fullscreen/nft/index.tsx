// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { ItemInformation } from './utils/types';

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import NftManager from '../../class/nftManager';
import { Warning } from '../../components';
import { useApiWithChain2, useFullscreen, useTranslation } from '../../hooks';
import { getAssetHubByChainName } from '../../hooks/useReferendum';
import HomeLayout from '../components/layout';
import Filters from './components/Filters';
import NftList from './components/NftList';
import { SUPPORTED_NFT_CHAINS } from './utils/constants';
import { fetchItemMetadata } from './utils/util';

enum STEPS {
  CHECK_SCREEN,
  INDEX,
  UNSUPPORTED
}

function NFT (): React.ReactElement {
  useFullscreen();
  const nftManager = React.useMemo(() => new NftManager(), []);

  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();

  const [nfts, setNfts] = useState<ItemInformation[] | null | undefined>(undefined);
  const [step, setStep] = useState<STEPS>(STEPS.CHECK_SCREEN);
  const [itemsToShow, setItemsToShow] = useState<ItemInformation[] | null | undefined>(undefined);

  useEffect(() => {
    if (!address) {
      return;
    }

    const myNfts = nftManager.get(address);

    setNfts(myNfts);

    const handleNftUpdate = (updatedAddress: string, updatedNfts: ItemInformation[]) => {
      if (updatedAddress === address) {
        setNfts(updatedNfts);
      }
    };

    nftManager.subscribe(handleNftUpdate);

    // Cleanup
    return () => {
      nftManager.unsubscribe(handleNftUpdate);
    };
  }, [address, nftManager]);

  const chainNames = Object.keys(SUPPORTED_NFT_CHAINS);

  const apis = Object.fromEntries(
    chainNames.map((chainName) => [
      chainName,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useApiWithChain2(getAssetHubByChainName(chainName) as Chain)
    ])
  );

  const reset = useCallback(() => {
    setStep(STEPS.CHECK_SCREEN);
  }, []);

  useEffect(() => {
    reset();
  }, [address, reset]);

  useEffect(() => {
    if (nfts && address) {
      setStep(STEPS.INDEX);

      nfts.forEach((nft) => {
        (nft.data && ((nft.image === undefined && nft.animation_url === undefined) || !nft.collectionName)) &&
          fetchItemMetadata(address, nft).catch(console.error);
      });

      return;
    }

    setStep(STEPS.CHECK_SCREEN);
  }, [address, nfts]);

  return (
    <HomeLayout
      childrenStyle={{ paddingLeft: '25px', position: 'relative', zIndex: 1 }}
    >
      <Stack alignItems='center' columnGap='10px' direction='row' justifyContent='start' sx={{ width: '100%' }}>
        <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase' }} variant='H-2'>
          {t('NFT Album')}
        </Typography>
        {!!itemsToShow?.length &&
          <Typography color='warning.main' sx={{ bgcolor: '#FF4FB926', borderRadius: '12px', height: '25px', minWidth: '38px', textAlign: 'center' }} variant='B-3'>
            {itemsToShow?.length}
          </Typography>
        }
      </Stack>
      {step === STEPS.UNSUPPORTED &&
        <Grid alignItems='center' container direction='column' display='block' item>
          <Grid container item justifyContent='center' sx={{ '> div.belowInput': { m: 0 }, height: '30px', m: 'auto', pt: '50px', width: '70%' }}>
            <Warning
              fontSize='16px'
              fontWeight={500}
              isBelowInput
              theme={theme}
            >
              {t('The chosen blockchain does not support NFTs/Uniques.')}
            </Warning>
          </Grid>
        </Grid>
      }
      {[STEPS.INDEX, STEPS.CHECK_SCREEN].includes(step) &&
        <>
          <Typography color='text.secondary' variant='B-4' sx={{ mt: '7px' }}>
            {t('Here, you can view all your created or owned NFTs and unique items. Click on any to enlarge, access more details, and view in fullscreen mode.')}
          </Typography>
          <Filters
            items={nfts}
            setItemsToShow={setItemsToShow}
          />
          <NftList
            apis={apis}
            nfts={itemsToShow}
          />
        </>
      }
    </HomeLayout>
  );
}

export default React.memo(NFT);
