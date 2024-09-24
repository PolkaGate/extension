// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { NFTMetadata } from './NftItem';
import { OpenInFull as OpenInFullIcon } from '@mui/icons-material';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { useTranslation } from '../../components/translate';
import { DraggableModal } from '../governance/components/DraggableModal';
import NftAvatar from './NftAvatar';
import type { NFTInformation } from '.';
import FullscreenNftModal from './NftFullScreenModal';

interface NftDetailsProp {
  details: NFTMetadata;
  nftInformation: NFTInformation;
  show: boolean;
  setShowDetail: React.Dispatch<React.SetStateAction<boolean>>;
}

interface DetailProp {
  title: string;
  text: string;
  inline?: boolean;
}

export const Detail = ({ inline = true, text, title }: DetailProp) => (
  <Grid container item>
    <Typography fontSize='16px' fontWeight={500} sx={inline ? { pr: '10px', width: 'fit-content' } : {}}>
      {title}:
    </Typography>
    <Typography fontSize='16px' fontWeight={400} textAlign='left'>
      {text}
    </Typography>
  </Grid>
);

export default function NftDetails({ details: { attributes, description, image, name, tags }, nftInformation: { collectionId, nftId }, setShowDetail, show }: NftDetailsProp): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [showFullscreen, setShowFullscreen] = useState<boolean>(false);

  const closeDetail = useCallback(() => setShowDetail(false), [setShowDetail]);
  const openFullscreen = useCallback(() => setShowFullscreen(true), []);
  const closeFullscreen = useCallback(() => setShowFullscreen(false), []);

  return (
    <>
      <DraggableModal onClose={closeDetail} open={show}>
        <Grid container item justifyContent='center'>
          <Grid alignItems='center' container item justifyContent='space-between' mb='20px'>
            <Typography fontSize='22px' fontWeight={700}>
              {t('NFT Detail')}
            </Typography>
            <Grid item>
              <IconButton onClick={openFullscreen} sx={{ mr: 1 }}>
                <OpenInFullIcon />
              </IconButton>
              <IconButton onClick={closeDetail}>
                <CloseIcon onClick={closeDetail} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
              </IconButton>
            </Grid>
          </Grid>
          <NftAvatar
            height='400px'
            image={image}
            width='320px'
          />
          <Grid container item sx={{ p: '20px', rowGap: '10px' }}>
            {name &&
              <Typography fontSize='14px' fontWeight={400} sx={{ maxWidth: '100%', textAlign: 'center', textOverflow: 'ellipsis', width: '100%' }}>
                {name}
              </Typography>
            }
            {description &&
              <Detail
                inline={false}
                text={description}
                title={t('Description')}
              />
            }
            {collectionId !== undefined &&
              <Detail
                text={collectionId}
                title={t('Collection ID')}
              />
            }
            {nftId !== undefined &&
              <Detail
                text={nftId}
                title={t('NFT ID')}
              />
            }
          </Grid>
        </Grid>
      </DraggableModal>
      <FullscreenNftModal
        image={image}
        onClose={closeFullscreen}
        open={showFullscreen}
      />
    </>
  );
}
