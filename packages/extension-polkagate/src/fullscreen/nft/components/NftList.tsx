// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation, ItemsListProps } from '../utils/types';

import { Box, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { NoNFT } from '@polkadot/extension-polkagate/src/assets/img/index';
import { NFTItem } from '@polkadot/extension-polkagate/src/popup/home/partial/NFTItem';

import Progress from '../../../components/Progress';
import useTranslation from '../../../hooks/useTranslation';
import PaginationRow from '../../history/PaginationRow';
import FullScreenNFT from './FullScreenNFT';
import { NftPopup } from './NftPopup';

const DEFAULT_ITEMS_PER_PAGE = 12;

function NftList({ nfts }: ItemsListProps): React.ReactElement {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPagePage] = useState<string | number>(DEFAULT_ITEMS_PER_PAGE);
  const [popupToShow, setShowPopup] = useState<ItemInformation>();
  const [showFullscreen, setShowFullscreen] = useState<{ iFrame: boolean, source: string | null | undefined } | undefined>();

  const nftItemsToShow = useMemo(() => {
    if (!nfts || nfts?.length === 0) {
      return null;
    }

    const start = (page - 1) * Number(itemsPerPage);
    const end = start + Number(itemsPerPage);

    return nfts.slice(start, end);
  }, [itemsPerPage, nfts, page]);

  const options = [
    { text: '1', value: 1 },
    { text: '3', value: 3 },
    { text: '6', value: 6 },
    { text: '12', value: 12 }
  ];

  const onClick = useCallback((nftInfo: ItemInformation) => () => setShowPopup(nftInfo), []);
  const onClose = useCallback(() => setShowPopup(undefined), []);

  const closeFullscreen = useCallback(() => {
    setShowFullscreen(undefined);
    document.fullscreenEnabled && document.exitFullscreen().catch(console.error);
  }, []);

  return (
    <Stack direction='column' sx={{ width: '952px' }}>
      <Grid container item justifyContent='start' sx={{ gap: '8px', height: '492px', mt: '30px', overflowY: 'auto' }}>
        {(!nfts || nfts.length === 0) &&
          <Grid alignItems='center' container item justifyContent='center'>
            {nfts === undefined
              ? <Progress
                title={t('Looking for NFTs/Uniques!')}
              />
              : <Stack alignItems='center' direction='column' justifyContent='start' sx={{ height: '100%', mt: '10%', width: '100%' }}>
                <Box component='img' src={NoNFT as string} sx={{ width: '200px' }} />
                <Typography color='text.secondary' variant='B-2'>
                  {t('You do not own any NFTs/Uniques')}!
                </Typography>
              </Stack>
            }
          </Grid>
        }
        {nftItemsToShow?.map((nftInfo, index) => (
          <NFTItem
            index={index}
            info={nftInfo}
            key={index}
            onClick={onClick(nftInfo)}
          />
        ))
        }
      </Grid>
      <PaginationRow
        itemsPerPage={itemsPerPage}
        options={options}
        page={page}
        setItemsPerPagePage={setItemsPerPagePage}
        setPage={setPage}
        totalItems={nfts?.length ?? 0}
      />
      {
        popupToShow &&
        <NftPopup
          info={popupToShow}
          onClose={onClose}
          setShowFullscreen={setShowFullscreen}
        />
      }
      {
        showFullscreen &&
        <FullScreenNFT
          iFrame={showFullscreen.iFrame}
          onClose={closeFullscreen}
          open={!!showFullscreen}
          source={showFullscreen.source}
        />
      }
    </Stack>
  );
}

export default React.memo(NftList);
