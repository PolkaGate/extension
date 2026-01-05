// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation } from '@polkadot/extension-polkagate/fullscreen/nft/utils/types';

import { Avatar, Divider, Grid, Stack, type SxProps, Typography } from '@mui/material';
import React, { type ReactElement } from 'react';

import { ChainLogo } from '../../components';
import AudioPlayer from '../../fullscreen/nft/components/AudioPlayer';
import { useTranslation } from '../../hooks';
import { GlowBox } from '../../style';
import { toTitleCase } from '../../util';
import NftPrice from './NftPrice';

function ItemInfo ({ label, style = {}, value }: { label: string, value: string | ReactElement, style?: SxProps }): ReactElement {
  return (
    <Stack direction='column' sx={{ ...style }}>
      <Typography color='#AA83DC' textAlign='left' variant='B-4'>
        {label}
      </Typography>
      {React.isValidElement(value)
        ? value
        : <Typography color='#EAEBF1' textAlign='left' variant='B-1'>
          {value}
        </Typography>
      }
    </Stack>
  );
}

export default function Details ({ nft }: { nft: ItemInformation | undefined }): React.ReactElement {
  const { t } = useTranslation();

  const isAudioOnly = !nft?.image && nft?.animation_url && nft?.animationContentType?.startsWith('audio');
  const isImageWithAudio = nft?.image && nft?.imageContentType?.startsWith('image') && nft?.animation_url && nft?.animationContentType?.startsWith('audio');

  return (
    <GlowBox showTopBorder={false} style={{ mt: '10px', px: '5px' }}>
      {nft &&
        <Grid container item rowGap='10px' sx={{ p: '15px 5px' }}>
          <Typography color='#EAEBF1' sx={{ textAlign: 'left', width: '100%' }} variant='B-3'>
            {toTitleCase(nft.name)}
          </Typography>
          <Stack columnGap='10px' direction='row'>
            <Avatar
              draggable={false}
              src={nft.image || ''}
              sx={{
                borderRadius: '14px',
                display: 'initial',
                height: '144px',
                img: {
                  objectFit: 'contain',
                  objectPosition: 'center'
                },
                pointerEvents: 'none',
                width: '144px'
              }}
              variant='square'
            />
            <Stack direction='column' sx={{ mt: '5px' }}>
              <ItemInfo
                label={t('Collection name')}
                value={nft.collectionName ?? nft.collectionId ?? t('Not in a collection')}
              />
              <Divider
                orientation='horizontal' sx={{
                  background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', my: '15px', width: '182px', height: '1px'
                }}
              />
              <ItemInfo
                label={t('Price')}
                value={
                  <NftPrice
                    nft={nft}
                    style={{ justifyContent: 'left' }}
                  />
                }
              />
            </Stack>
          </Stack>
          {(isAudioOnly || isImageWithAudio) &&
            <AudioPlayer audioUrl={nft.animation_url} />
          }
          <Stack columnGap='15px' direction='row' sx={{ mt: '10px' }}>
            <ItemInfo
              label={t('Collection ID')}
              value={nft.collectionId || 'Unknown'}
            />
            <ItemInfo
              label={t('NFT ID')}
              value={nft.itemId || 'Unknown'}
            />
            <ItemInfo
              label={t('Network')}
              value={<Stack alignItems='center' columnGap='3px' direction='row'>
                <ChainLogo genesisHash={nft?.genesisHash} size={14} />
                <Typography color='#EAEBF1' variant='B-2'>
                  {nft?.chainName}
                </Typography>
              </Stack>
              }
            />
          </Stack>
        </Grid>
      }
    </GlowBox>
  );
}
