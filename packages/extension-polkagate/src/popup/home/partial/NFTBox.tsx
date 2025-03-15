// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { ItemInformation } from '../../../fullscreen/nft/utils/types';

import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { ArrowCircleRight, ArrowRight2 } from 'iconsax-react';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';

import { logoBlackBirdTransparent } from '../../../assets/logos';
import NftManager from '../../../class/nftManager';
import { ShowBalance } from '../../../components';
import { SUPPORTED_NFT_CHAINS } from '../../../fullscreen/nft/utils/constants';
import { fetchItemMetadata } from '../../../fullscreen/nft/utils/util';
import { useApiWithChain2, useIsDark, useSelectedAccount, useTranslation } from '../../../hooks';
import { getAssetHubByChainName } from '../../../hooks/useReferendum';
import { windowOpen } from '../../../messaging';
import { toTitleCase } from '../../../util';
import { amountToMachine } from '../../../util/utils';

const MAX_NFT_TO_SHOW = 2; // we're gonna display up to 2 nfts if they were available!
const nftManager = new NftManager();

const NftNull = () => {
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

function ItemPrice ({ api, price }: { api: ApiPromise | undefined, price: number | null | undefined }) {
  const { t } = useTranslation();
  const decimal = api?.registry.chainDecimals[0];
  const token = api?.registry.chainTokens[0];

  const convertedAmount = useMemo(() => price && decimal ? price / (10 ** decimal) : null, [decimal, price]);

  const priceAsBN = useMemo(() => convertedAmount ? amountToMachine(String(convertedAmount), decimal) : null, [convertedAmount, decimal]);
  const notListed = price === null;

  return (
    <Grid alignItems='center' container item justifyContent='center' p='8px 0 4px'>
      {price &&
        <ShowBalance
          balance={priceAsBN}
          decimal={decimal}
          decimalPoint={3}
          token={token}
          withCurrency
        />
      }
      {notListed &&
        <Typography fontSize='14px' fontWeight={500} textAlign='left'>
          {t('Not listed')}
        </Typography>
      }
    </Grid>
  );
}

interface NftItemProps {
  item: ItemInformation;
  apis: Record<string, ApiPromise | undefined>;
}

function NFTItem ({ apis, item }: NftItemProps) {
  const theme = useTheme();
  const isDark = useIsDark();
  const api = apis[item.chainName];
  const [isHovered, setHovered] = useState(false);

  const bgcolor = isDark ? isHovered ? '#2D1E4A' : '#1B133C' : '#FFF';
  const bgcolor2 = isDark ? '#05091C' : '#EFEEF7';
  const itemIdColor = isDark ? '#EAEBF1' : '#291443';
  const itemNameColor = isDark ? '#BEAAD8' : '#745D8B';

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  return (
    <Grid container item onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} sx={{ bgcolor, borderRadius: '18px', p: '4px', width: '152px' }}>
      <Grid container direction='column' item sx={{ bgcolor: bgcolor2, borderRadius: '14px' }}>
        <Grid container item sx={{
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
              opacity: isHovered ? 1 : 0, // Control visibility based on state
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
      <ItemPrice
        api={api}
        price={item.price}
      />
    </Grid>
  );
}

function NFTBox () {
  const { t } = useTranslation();
  const account = useSelectedAccount();
  const isDark = useIsDark();

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

    // Cleanup
    return () => {
      nftManager.unsubscribe(handleNftUpdate);
    };
  }, [account, account?.address]);

  const chainNames = Object.keys(SUPPORTED_NFT_CHAINS);

  const apis = Object.fromEntries(
    chainNames.map((chainName) => [
      chainName,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useApiWithChain2(getAssetHubByChainName(chainName) as Chain)
    ])
  );

  const itemsToShow = useMemo(() => nfts?.slice(0, MAX_NFT_TO_SHOW), [nfts]);

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
          <Container disableGutters sx={{ bgcolor: isDark ? '#05091C' : '#F5F4FF', borderRadius: '14px', display: 'flex', height: '259px', justifyContent: 'space-evenly', py: '10px', width: '100%' }}>
            {itemsToShow?.map((item, index) => (
              <NFTItem
                apis={apis}
                item={item}
                key={index}
              />
            ))}
          </Container>
          <Grid alignItems='center' columnGap='5px' container item justifyContent='center' onClick={openNft} sx={{ cursor: 'pointer', p: '8px 0 4px' }}>
            <Typography color={isDark ? '#BEAAD8' : '#745D8B'} variant='B-2'>
              {t('See all')}
            </Typography>
            <ArrowRight2 color='#BEAAD880' size='14' />
          </Grid>
        </>
        : <NftNull />
      }
    </>
  );
}

export default memo(NFTBox);
