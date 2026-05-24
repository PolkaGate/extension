// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation } from './utils/types';

import { Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import NftManager from '../../class/nftManager';
import { useTranslation } from '../../hooks';
import HomeLayout from '../components/layout';
import Filters from './components/Filters';
import NftList from './components/NftList';
import { fetchItemMetadata } from './utils/util';

enum STEPS {
  CHECK_SCREEN,
  INDEX
}

function NFT(): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();

  const nftManager = React.useMemo(() => new NftManager(), []);

  const [nfts, setNfts] = useState<ItemInformation[] | null | undefined>(undefined);
  const [step, setStep] = useState<STEPS>(STEPS.CHECK_SCREEN);
  const [itemsToShow, setItemsToShow] = useState<ItemInformation[] | null | undefined>(undefined);

  useEffect(() => {
    if (!address) {
      return;
    }

    const myNfts = nftManager.get(address);

    setNfts(myNfts);

    if (!myNfts || myNfts?.length === 0) {
      setItemsToShow(null);
    }

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
      {[STEPS.INDEX, STEPS.CHECK_SCREEN].includes(step) &&
        <>
          <Typography color='text.secondary' sx={{ mt: '7px' }} variant='B-4'>
            {t('Here, you can view all your created or owned NFTs and unique items. Click on any to enlarge, access more details, and view in fullscreen mode.')}
          </Typography>
          {
            nfts && !!nfts.length &&
            <Filters
              items={nfts}
              setItemsToShow={setItemsToShow}
            />
          }
          <NftList
            nfts={itemsToShow}
          />
        </>
      }
    </HomeLayout>
  );
}

export default React.memo(NFT);
