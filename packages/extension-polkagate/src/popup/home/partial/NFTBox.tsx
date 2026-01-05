// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation } from '../../../fullscreen/nft/utils/types';

import { Box, Container, Grid, Typography } from '@mui/material';
import { ArrowRight2 } from 'iconsax-react';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { windowOpen } from '@polkadot/extension-polkagate/src/messaging';
import { switchToOrOpenTab } from '@polkadot/extension-polkagate/src/util/switchToOrOpenTab';

import { logoBlackBirdTransparent } from '../../../assets/logos';
import NftManager from '../../../class/nftManager';
import { ActionButton } from '../../../components';
import { fetchItemMetadata } from '../../../fullscreen/nft/utils/util';
import { useIsDark, useIsExtensionPopup, useSelectedAccount, useTranslation } from '../../../hooks';
import { NFTItem } from './NFTItem';

const nftManager = new NftManager();

const NoNftAlert = () => {
  const { t } = useTranslation();

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'grid', justifyItems: 'center', py: '33px', width: '100%' }}>
      <Box
        component='img'
        src={logoBlackBirdTransparent as string}
        sx={{ opacity: 0.4, width: '129px' }}
      />
      <Typography pt='10px' variant='B-2'>
        {t("You don't have any NFTs yet")}
      </Typography>
    </Container>
  );
};

function NFTBox () {
  const { t } = useTranslation();
  const account = useSelectedAccount();
  const isDark = useIsDark();
  const isExtension = useIsExtensionPopup();

  const MAX_NFT_TO_SHOW = isExtension ? 2 : undefined;

  const [nfts, setNfts] = useState<ItemInformation[] | null | undefined>(undefined);

  useEffect(() => {
    if (!account) {
      return;
    }

    const myNfts = nftManager.get(account.address);

    setNfts(myNfts);

    const handleNftUpdate = (updatedAddress: string, updatedNfts: ItemInformation[]) => {
      if (updatedAddress === account.address) {
        setNfts(updatedNfts);
      }
    };

    nftManager.subscribe(handleNftUpdate);

    return () => {
      nftManager.unsubscribe(handleNftUpdate);
    };
  }, [account, account?.address]);

  const itemsToShow = useMemo(() => nfts?.filter(({ isCollection }) => !isCollection)?.slice(0, MAX_NFT_TO_SHOW), [MAX_NFT_TO_SHOW, nfts]);

  const fetchMetadata = useCallback(async () => {
    if (!itemsToShow || itemsToShow?.length === 0 || !account) {
      return;
    }

    try {
      await Promise.all(itemsToShow.map((item) => fetchItemMetadata(account.address, item)));
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
    }
  }, [account, itemsToShow]);

  useEffect(() => {
    if (!itemsToShow || itemsToShow?.length === 0) {
      return;
    }

    fetchMetadata().catch(console.error);
  }, [fetchMetadata, itemsToShow]);

  const openNft = useCallback(() => {
    const path = `/nft/${account?.address ?? ''}`;

    isExtension
    ? windowOpen(path).catch(console.error)
    : switchToOrOpenTab(path, true);
  }, [account?.address, isExtension]);

  return (
    <>
      {nfts
        ? <>
          <Container disableGutters sx={{ bgcolor: isDark ? '#05091C' : '#F5F4FF', borderRadius: '14px', columnGap: '5px', display: 'flex', height: '259px', justifyContent: 'space-evenly', px: isExtension ? 0 : '15px', py: '10px', width: '100%' }}>
            {itemsToShow?.map((item, index) => (
              <NFTItem
                index={index}
                info={item}
                key={index}
                onClick ={isExtension ? undefined : openNft}
              />
            ))}
          </Container>
          {isExtension
            ? <Grid alignItems='center' columnGap='5px' container item justifyContent='center' onClick={openNft} sx={{ cursor: 'pointer', p: '8px 0 4px' }}>
              <Typography color={isDark ? '#BEAAD8' : '#745D8B'} variant='B-2'>
                {t('See all')}
              </Typography>
              <ArrowRight2 color='#BEAAD880' size='14' />
            </Grid>
            : (
              <ActionButton
                contentPlacement='center'
                onClick={openNft}
                style={{ height: '44px', margin: '20px 5%', width: '90%' }}
                text={t('See all')}
              />)
          }
        </>
        : <NoNftAlert />
      }
    </>
  );
}

export default memo(NFTBox);
