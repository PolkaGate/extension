// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable camelcase */

import type { DetailItemProps, DetailsProp } from '../utils/types';

import { Close as CloseIcon, OpenInFull as OpenInFullIcon } from '@mui/icons-material';
import { Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Progress, TwoButtons } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { useMetadata } from '../../../hooks';
import { KODADOT_URL } from '../../../util/constants';
import { DraggableModal } from '../../governance/components/DraggableModal';
import { IPFS_GATEWAY } from '../utils/constants';
import { fetchWithRetry, getContentUrl } from '../utils/util';
import AudioPlayer from './AudioPlayer';
import FullScreenNFT from './FullScreenNFT';
import InfoRow from './InfoRow';
import ItemAvatar from './ItemAvatar';

export const WithLoading = ({ children, loaded }: { loaded: boolean, children: React.ReactElement }) => (
  <>
    {!loaded &&
      <Progress
        gridSize={50}
        pt={0}
        type='grid'
      />
    }
    {children}
  </>
);

const Item = React.memo(
  function Item({ animation_url, animationContentType, image, imageContentType, setShowFullscreenDisabled }: DetailItemProps) {
    const [loaded, setLoaded] = useState<boolean>(false);

    const isHtmlContent = animation_url && animationContentType === 'text/html';
    const isAudioOnly = !image && animation_url && animationContentType?.startsWith('audio');
    const isImageWithAudio = image && imageContentType?.startsWith('image') && animation_url && animationContentType?.startsWith('audio');

    const onLoaded = useCallback(() => {
      setLoaded(true);
    }, []);

    if (isHtmlContent) {
      return (
        <>
          {!loaded &&
            <Grid container item sx={{ left: '15%', position: 'absolute', top: '25%', width: 'fit-content', zIndex: 100 }}>
              <Progress type='grid' />
            </Grid>
          }
          <iframe
            onLoad={onLoaded}
            src={animation_url}
            style={{
              border: 'none',
              height: '460px',
              objectFit: 'contain',
              pointerEvents: 'none',
              width: '300px'
            }}
            title='HTML Content'
          />
        </>
      );
    } else if (isAudioOnly) {
      return (
        <AudioPlayer audioUrl={animation_url} />
      );
    } else if (isImageWithAudio) {
      return (
        <Grid container direction='column' item rowGap='20px' width='320px'>
          <ItemAvatar
            image={image}
            size='large'
          />
          <AudioPlayer audioUrl={animation_url} />
        </Grid>
      );
    } else if (image && imageContentType?.startsWith('image')) {
      return (
        <ItemAvatar
          image={image}
          size='large'
        />
      );
    } else {
      setShowFullscreenDisabled(true);

      return (
        <ItemAvatar
          image={null}
          size='large'
        />
      );
    }
  }
);

export default function Details({ api, itemInformation, setShowDetail, show }: DetailsProp): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const genesisHash = api?.genesisHash.toHex();
  const chain = useMetadata(genesisHash, true);

  const [showFullscreen, setShowFullscreen] = useState<boolean>(false);
  const [gifSource, setGifSource] = useState<string | null | undefined>(undefined);
  const [gifHash, setGifHash] = useState<string | undefined>(undefined);
  const [showFullscreenDisabled, setShowFullscreenDisabled] = useState<boolean>(false);

  const chainNameSymbol = useCallback(() => {
    switch (itemInformation.chainName) {
      case 'Polkadot Asset Hub':
        return 'ahp';
      case 'Kusama Asset Hub':
        return 'ahk';
      default:
        return '';
    }
  }, [itemInformation.chainName]);

  const NFT_URL_ON_KODADOT = useMemo(() => {
    if (itemInformation.isCollection) {
      return `${KODADOT_URL}/${chainNameSymbol()}/collection/${itemInformation.collectionId}`;
    } else {
      return `${KODADOT_URL}/${chainNameSymbol()}/gallery/${itemInformation.collectionId}-${itemInformation.itemId}`;
    }
  }, [chainNameSymbol, itemInformation.collectionId, itemInformation.isCollection, itemInformation.itemId]);

  const closeDetail = useCallback(() => setShowDetail(false), [setShowDetail]);

  useEffect(() => {
    const getUniqueGif = async () => {
      if (itemInformation.isNft || !itemInformation.mediaUri) {
        setGifSource(null);

        return;
      }

      const { isIPFS, sanitizedUrl } = getContentUrl(itemInformation.mediaUri);

      if (!isIPFS) {
        setGifSource(null);

        return;
      }

      const ipfsURL = IPFS_GATEWAY + sanitizedUrl;

      const content = await fetchWithRetry(ipfsURL, 1);
      const contentType = content.headers.get('content-type');

      if (!contentType?.includes('gif')) {
        setGifSource(null);

        return;
      }

      const blob = await content.blob();
      const gifURL = URL.createObjectURL(blob);

      setGifHash(sanitizedUrl);
      setGifSource(gifURL);
    };

    getUniqueGif().catch(console.error);
  }, [itemInformation.isNft, itemInformation.mediaUri]);

  const { iFrame, source } = useMemo(() => {
    if (gifSource) {
      return { iFrame: false, source: gifSource };
    } else if (itemInformation.animation_url && itemInformation.animationContentType === 'text/html') {
      return { iFrame: true, source: itemInformation.animation_url };
    } else {
      return { iFrame: false, source: itemInformation.image };
    }
  }, [itemInformation.animationContentType, itemInformation.animation_url, gifSource, itemInformation.image]);

  const openFullscreen = useCallback(() => {
    if (showFullscreenDisabled) {
      return;
    }

    document.documentElement.requestFullscreen().catch(console.error);
    setShowFullscreen(true);
  }, [showFullscreenDisabled]);

  const closeFullscreen = useCallback(() => {
    setShowFullscreen(false);
    document.fullscreenEnabled &&
      document.exitFullscreen().catch(console.error);
  }, []);

  return (
    <>
      <DraggableModal blurBackdrop minHeight={540} onClose={closeDetail} open={show} width={800}>
        <Grid container item>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ borderBottom: '1px solid', borderBottomColor: 'divider', mb: '20px' }}>
            <Typography fontSize='20px' fontWeight={500} sx={{ maxWidth: '380px', overflow: 'hidden', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 'fit-content' }}>
              {itemInformation.name ?? (itemInformation.isNft ? t('NFT Detail') : t('Unique Detail'))}
            </Typography>
            <Grid item>
              <IconButton disabled={showFullscreenDisabled} onClick={openFullscreen} sx={{ mr: 1 }}>
                <OpenInFullIcon sx={{ color: 'primary.main' }} />
              </IconButton>
              <IconButton onClick={closeDetail}>
                <CloseIcon onClick={closeDetail} sx={{ color: 'primary.main', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
              </IconButton>
            </Grid>
          </Grid>
          <Grid container item justifyContent='space-between' width='740px'>
            <Grid alignItems='center' container item width='fit-content'>
              <Item
                animationContentType={itemInformation.animationContentType}
                animation_url={itemInformation.animation_url}
                image={gifSource || itemInformation.image}
                imageContentType={itemInformation.imageContentType}
                setShowFullscreenDisabled={setShowFullscreenDisabled}
              />
            </Grid>
            <Grid alignContent='flex-start' container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', maxHeight: '460px', overflowY: 'scroll', p: '15px 20px', width: '390px' }}>
              {itemInformation.description &&
                <Grid item sx={{ pb: '15px' }}>
                  <InfoRow
                    divider={false}
                    inline={false}
                    text={itemInformation.description}
                  />
                </Grid>
              }
              {!itemInformation.isCollection && itemInformation.collectionName &&
                <InfoRow
                  divider={!!itemInformation.description}
                  text={itemInformation.collectionName}
                  title={t('Collection name')}
                />
              }
              {itemInformation.collectionId !== undefined &&
                <InfoRow
                  text={itemInformation.collectionId}
                  title={t('Collection ID')}
                />
              }
              {itemInformation.items !== undefined &&
                <InfoRow
                  divider={!!itemInformation.collectionId}
                  text={itemInformation.items.toString()}
                  title={t('Items')}
                />
              }
              {itemInformation.itemId !== undefined &&
                <InfoRow
                  divider={!!itemInformation.collectionId || !!itemInformation.description}
                  text={itemInformation.itemId}
                  title={itemInformation.isNft ? t('NFT ID') : t('Unique ID')}
                />
              }
              {!itemInformation.isCollection &&
                <InfoRow
                  api={api}
                  price={itemInformation.price}
                  title={t('Price')}
                />
              }
              {itemInformation.creator &&
                <InfoRow
                  accountId={itemInformation.creator}
                  api={api}
                  chain={chain}
                  title={t('Creator')}
                />
              }
              {itemInformation.owner &&
                <InfoRow
                  accountId={itemInformation.owner}
                  api={api}
                  chain={chain}
                  title={t('Owner')}
                />
              }
              <InfoRow
                divider={!!itemInformation.description || (!itemInformation.isCollection && !!itemInformation.collectionName)}
                text={itemInformation.chainName}
                title={t('Network')}
              />
              {itemInformation.metadataLink &&
                <InfoRow
                  divider={!!itemInformation.itemId || itemInformation.items !== undefined}
                  text={`[application/json](${itemInformation.metadataLink})`}
                  title={t('Metadata')}
                />
              }
              {itemInformation.image &&
                <InfoRow
                  text={`[${itemInformation.imageContentType}](${itemInformation.image})`}
                  title={t('Image')}
                />
              }
              {itemInformation.animation_url &&
                <InfoRow
                  text={`[${itemInformation.animationContentType}](${itemInformation.animation_url})`}
                  title={itemInformation.animationContentType?.startsWith('text') ? t('Animation') : t('Audio')}
                />
              }
              {gifSource &&
                <InfoRow
                  text={`[image/gif](${IPFS_GATEWAY + gifHash})`}
                  title={t('Media')}
                />
              }
              {itemInformation.owner &&
                <InfoRow
                  link={NFT_URL_ON_KODADOT}
                  linkName='Kodadot'
                  title={t('View on')}
                />
              }
            </Grid>
          </Grid>
          <TwoButtons
            disabled={showFullscreenDisabled}
            ml='0'
            mt='40px'
            onPrimaryClick={openFullscreen}
            onSecondaryClick={closeDetail}
            primaryBtnText={t('View in Full Screen')}
            secondaryBtnText={t('Close')}
            width='100%'
          />
        </Grid>
      </DraggableModal>
      {showFullscreen &&
        <FullScreenNFT
          iFrame={iFrame}
          onClose={closeFullscreen}
          open={showFullscreen}
          source={source}
        />
      }
    </>
  );
}
