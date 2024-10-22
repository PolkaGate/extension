// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable camelcase */

import type { DetailItemProps, DetailProp, DetailsProp } from '../utils/types';

import { Close as CloseIcon, OpenInFull as OpenInFullIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Link, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { Identity, Progress, ShortAddress, ShowBalance, TwoButtons } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { useMetadata } from '../../../hooks';
import { KODADOT_URL } from '../../../util/constants';
import { amountToMachine } from '../../../util/utils';
import { DraggableModal } from '../../governance/components/DraggableModal';
import { IPFS_GATEWAY } from '../utils/constants';
import { fetchWithRetry, getContentUrl } from '../utils/util';
import AudioPlayer from './AudioPlayer';
import FullScreenNFT from './FullScreenNFT';
import ItemAvatar from './ItemAvatar';

export const InfoRow = React.memo(
  function InfoRow ({ accountId, api, chain, divider = true, inline = true, isThumbnail, link, linkName, price, text, title }: DetailProp) {
    const { t } = useTranslation();
    const decimal = api?.registry.chainDecimals[0];
    const token = api?.registry.chainTokens[0];

    const convertedAmount = useMemo(() => price && decimal ? (price.toNumber() / 10 ** decimal).toString() : null, [decimal, price]);
    const priceAsBN = useMemo(() => convertedAmount ? amountToMachine(convertedAmount, decimal) : null, [convertedAmount, decimal]);
    const notListed = price === null;
    const isDescription = !title;

    return (
      <Grid container item justifyContent='space-between'>
        {divider && !isThumbnail &&
          <Divider sx={{ bgcolor: 'divider', height: '1px', m: '8px auto', width: '100%' }} />
        }
        {title &&
          <Typography fontSize={isThumbnail ? '13px' : '14px'} fontWeight={400} sx={inline ? { pr: '10px', width: 'fit-content' } : {}}>
            {title}:
          </Typography>
        }
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
          <Typography fontSize='14px' fontWeight={400} textAlign='left'>
            {t('Not listed')}
          </Typography>
        }
        {text &&
          <Typography fontSize='14px' fontWeight={isDescription ? 400 : 500} sx={{ '> p': { m: 0 } }} textAlign='justify'>
            <ReactMarkdown
              linkTarget='_blank'
            >
              {String(text)}
            </ReactMarkdown>
          </Typography>
        }
        {accountId &&
          <>
            {api && chain
              ? <Identity api={api} chain={chain} formatted={accountId} identiconSize={15} showShortAddress style={{ fontSize: '14px', maxWidth: '200px' }} />
              : <ShortAddress address={accountId} charsCount={6} style={{ fontSize: '14px', width: 'fit-content' }} />
            }
          </>
        }
        {link &&
          <Link href={link} target='_blank' underline='hover'>
            {linkName}
          </Link>
        }
      </Grid>
    );
  });

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

const Item = ({ animation_url, animationContentType, image, imageContentType, setShowFullscreenDisabled }: DetailItemProps) => {
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
};

export default function Details ({ api, details, itemInformation: { chainName, collectionId, creator, isCollection, isNft, itemId, items, owner, price }, setShowDetail, show }: DetailsProp): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const genesisHash = api?.genesisHash.toHex();
  const chain = useMetadata(genesisHash, true);

  const [showFullscreen, setShowFullscreen] = useState<boolean>(false);
  const [gifSource, setGifSource] = useState<string | null | undefined>(undefined);
  const [gifHash, setGifHash] = useState<string | undefined>(undefined);
  const [showFullscreenDisabled, setShowFullscreenDisabled] = useState<boolean>(false);

  const chainNameSymbol = useCallback(() => {
    switch (chainName) {
      case 'Polkadot Asset Hub':
        return 'ahp';
      case 'Kusama Asset Hub':
        return 'ahk';
      default:
        return '';
    }
  }, [chainName]);

  const NFT_URL_ON_KODADOT = useMemo(() => {
    if (isCollection) {
      return `${KODADOT_URL}/${chainNameSymbol()}/collection/${collectionId}`;
    } else {
      return `${KODADOT_URL}/${chainNameSymbol()}/gallery/${collectionId}-${itemId}`;
    }
  }, [chainNameSymbol, collectionId, isCollection, itemId]);

  const closeDetail = useCallback(() => setShowDetail(false), [setShowDetail]);

  useEffect(() => {
    const getUniqueGif = async () => {
      if (isNft || !details?.mediaUri) {
        setGifSource(null);

        return;
      }

      const { isIPFS, sanitizedUrl } = getContentUrl(details.mediaUri);

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
  }, [details?.mediaUri, isNft]);

  const { iFrame, source } = useMemo(() => {
    if (gifSource) {
      return { iFrame: false, source: gifSource };
    } else if (details?.animation_url && details?.animationContentType === 'text/html') {
      return { iFrame: true, source: details?.animation_url };
    } else {
      return { iFrame: false, source: details?.image };
    }
  }, [details?.animationContentType, details?.animation_url, gifSource, details?.image]);

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
      <DraggableModal minHeight={540} onClose={closeDetail} open={show} width={800}>
        <Grid container item>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ borderBottom: '1px solid', borderBottomColor: 'divider', mb: '20px' }}>
            <Typography fontSize='20px' fontWeight={500} sx={{ maxWidth: '380px', overflow: 'hidden', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 'fit-content' }}>
              {details?.name ?? (isNft ? t('NFT Detail') : t('Unique Detail'))}
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
                animationContentType={details?.animationContentType}
                animation_url={details?.animation_url}
                image={gifSource || details?.image}
                imageContentType={details?.imageContentType}
                setShowFullscreenDisabled={setShowFullscreenDisabled}
              />
            </Grid>
            <Grid alignContent='flex-start' container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', maxHeight: '460px', overflowY: 'scroll', p: '15px 20px', width: '390px' }}>
              {details?.description &&
                <Grid item sx={{ pb: '15px' }}>
                  <InfoRow
                    divider={false}
                    inline={false}
                    text={details.description}
                  />
                </Grid>
              }
              <InfoRow
                divider={!!details?.description}
                text={chainName}
                title={t('Network')}
              />
              {collectionId !== undefined &&
                <InfoRow
                  text={collectionId}
                  title={t('Collection ID')}
                />
              }
              {items !== undefined &&
                <InfoRow
                  divider={!!collectionId}
                  text={items.toString()}
                  title={t('Items')}
                />
              }
              {itemId !== undefined &&
                <InfoRow
                  divider={!!collectionId || !!details?.description}
                  text={itemId}
                  title={isNft ? t('NFT ID') : t('Unique ID')}
                />
              }
              {details?.metadataLink &&
                <InfoRow
                  divider={!!itemId || items !== undefined}
                  text={`[application/json](${details.metadataLink})`}
                  title={t('Metadata')}
                />
              }
              {details?.image &&
                <InfoRow
                  text={`[${details?.imageContentType}](${details.image})`}
                  title={t('Image')}
                />
              }
              {details?.animation_url &&
                <InfoRow
                  text={`[${details?.animationContentType}](${details?.animation_url})`}
                  title={details?.animationContentType?.startsWith('text') ? t('Animation') : t('Audio')}
                />
              }
              {gifSource &&
                <InfoRow
                  text={`[image/gif](${IPFS_GATEWAY + gifHash})`}
                  title={t('Media')}
                />
              }
              {!isCollection &&
                <InfoRow
                  api={api}
                  price={price}
                  title={t('Price')}
                />
              }
              {creator &&
                <InfoRow
                  accountId={creator}
                  api={api}
                  chain={chain}
                  title={t('Creator')}
                />
              }
              {owner &&
                <InfoRow
                  accountId={owner}
                  api={api}
                  chain={chain}
                  title={t('Owner')}
                />
              }
              {owner &&
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
