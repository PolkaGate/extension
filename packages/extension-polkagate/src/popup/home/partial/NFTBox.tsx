// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation } from '../../../fullscreen/nft/utils/types';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { ArrowCircleRight, ArrowRight2 } from 'iconsax-react';
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { logoBlackBirdTransparent } from '../../../assets/logos';
import NftManager from '../../../class/nftManager';
import { ActionButton, ActionContext } from '../../../components';
import { fetchItemMetadata } from '../../../fullscreen/nft/utils/util';
import { useIsDark, useIsExtensionPopup, useSelectedAccount, useTranslation } from '../../../hooks';
import { windowOpen } from '../../../messaging';
import { toTitleCase } from '../../../util';
import NftPrice from '../../nft/NftPrice';

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

interface NftItemProps {
  item: ItemInformation;
  index: number;
}

function NFTItem ({ index, item }: NftItemProps) {
  const theme = useTheme();
  const isDark = useIsDark();
  const onAction = useContext(ActionContext);
  const account = useSelectedAccount();

  const [isHovered, setHovered] = useState(false);

  const bgcolor = isDark ? isHovered ? '#2D1E4A' : '#1B133C' : '#FFF';
  const bgcolor2 = isDark ? '#05091C' : '#EFEEF7';
  const itemIdColor = isDark ? '#EAEBF1' : '#291443';
  const itemNameColor = isDark ? '#BEAAD8' : '#745D8B';

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const onClick = useCallback(() => account?.address && onAction(`/nft-extension/${account.address}/${index}`), [account?.address, index, onAction]);

  return (
    <Grid container item onClick={onClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} sx={{ bgcolor, borderRadius: '18px', cursor: 'pointer', p: '4px', width: '152px' }}>
      <Grid container direction='column' item sx={{ bgcolor: bgcolor2, borderRadius: '14px' }}>
        <Grid
          container item sx={{
            borderRadius: '14px',
            height: isHovered ? '135px' : '144px',
            overflow: 'hidden',
            position: 'relative',
            transition: 'height 0.3s ease-in-out',
            width: '144px'
          }}
        >
          <Box
            sx={{
              '&:hover': {
                transform: 'translate(-50%, -50%) scale(1.1)'
              },
              backgroundImage: `url(${item.image ?? ''})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              borderRadius: '14px',
              height: '100%',
              left: '50%',
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              transition: 'transform 0.3s ease-in-out',
              width: '100%'
            }}
          />
          <ArrowCircleRight
            color='#FF4FB9'
            id='arrow'
            size='40'
            style={{
              left: '50%',
              opacity: isHovered ? 1 : 0,
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              transition: 'opacity 0.3s ease-in-out'
            }}
            variant='Bold'
          />
        </Grid>
        <Grid container direction='column' item sx={{ m: '6px 12px' }}>
          <Grid container item width='fit-content'>
            <span style={{ color: isDark ? '#BEAAD880' : '#745D8B', ...theme.typography['B-2'] }}>
              #
            </span>
            <span style={{ color: itemIdColor, ...theme.typography['B-2'] }}>
              {item.itemId}
            </span>
          </Grid>
          <Typography color={itemNameColor} sx={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant='B-2'>
            {toTitleCase(item.name)}
          </Typography>
        </Grid>
      </Grid>
      <NftPrice
        nft={item}
        style={{ justifyContent: 'center', p: '8px 0 4px' }}
      />
    </Grid>
  );
}

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
    windowOpen(`/nft/${account?.address ?? ''}`).catch(console.error);
  }, [account?.address]);

  return (
    <>
      {nfts
        ? <>
          <Container disableGutters sx={{ bgcolor: isDark ? '#05091C' : '#F5F4FF', borderRadius: '14px', columnGap: '5px', display: 'flex', height: '259px', justifyContent: 'space-evenly', overflowX: 'scroll', py: '10px', width: '100%', px: isExtension ? 0 : '15px'  }}>
            {itemsToShow?.map((item, index) => (
              <NFTItem
                index={index}
                item={item}
                key={index}
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
            : <ActionButton
              contentPlacement='center'
              onClick={openNft}
              style={{ height: '44px', margin: '20px 5%', width: '90%' }}
              text={t('See all')}
            />
          }
        </>
        : <NoNftAlert />
      }
    </>
  );
}

export default memo(NFTBox);
