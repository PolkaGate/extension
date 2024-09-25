// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DetailProp, DetailsProp } from '../utils/types';

import { Close as CloseIcon, OpenInFull as OpenInFullIcon } from '@mui/icons-material';
import { Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { useTranslation } from '../../../components/translate';
import { DraggableModal } from '../../governance/components/DraggableModal';
import NftAvatar from './ItemAvatar';
import ItemFullscreenModal from './ItemFullScreenModal';

export const Detail = ({ inline = true, text, title }: DetailProp) => (
  <Grid container item>
    <Typography fontSize='16px' fontWeight={500} sx={inline ? { pr: '10px', width: 'fit-content' } : {}}>
      {title}:
    </Typography>
    <Typography fontSize='16px' fontWeight={400} sx={{ '> p': { m: 0 } }} textAlign='left'>
      <ReactMarkdown
        linkTarget='_blank'
      >{text}</ReactMarkdown>
    </Typography>
  </Grid>
);

export default function Details ({ details: { description, image, name }, itemInformation: { collectionId, isNft, itemId }, setShowDetail, show }: DetailsProp): React.ReactElement {
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
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ borderBottom: '1px solid', borderBottomColor: 'divider', mb: '20px' }}>
            <Typography fontSize='22px' fontWeight={700}>
              {isNft ? t('NFT Detail') : t('Unique Detail')}
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
          <Grid container item sx={{ m: '20px', maxHeight: '230px', overflowY: 'scroll', rowGap: '10px' }}>
            {name &&
              <Typography fontSize='14px' fontWeight={400} sx={{ maxWidth: '380px', overflow: 'hidden', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
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
            {itemId !== undefined &&
              <Detail
                text={itemId}
                title={isNft ? t('NFT ID') : t('Unique ID')}
              />
            }
          </Grid>
        </Grid>
      </DraggableModal>
      <ItemFullscreenModal
        image={image}
        onClose={closeFullscreen}
        open={showFullscreen}
      />
    </>
  );
}
