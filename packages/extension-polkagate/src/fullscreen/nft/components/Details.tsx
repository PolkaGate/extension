// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable camelcase */

import type { Chain } from '@polkadot/extension-chains/types';
import type { DetailItemProps, DetailProp, DetailsProp } from '../utils/types';

import { Close as CloseIcon, OpenInFull as OpenInFullIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Link, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router';

import { Identity, Progress, ShortAddress, ShowBalance } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { useApiWithChain2, useInfo, useMetadata } from '../../../hooks';
import { getAssetHubByChainName } from '../../../hooks/useReferendum';
import { KODADOT_URL } from '../../../util/constants';
import { amountToMachine } from '../../../util/utils';
import { DraggableModal } from '../../governance/components/DraggableModal';
import { IPFS_GATEWAY } from '../utils/constants';
import { fetchWithRetry, getContentUrl } from '../utils/util';
import AudioPlayer from './AudioPlayer';
import FullScreenNFT from './FullScreenNFT';
import ItemAvatar from './ItemAvatar';

export const Detail = React.memo(
  function Detail ({ accountId, api, chain, decimal, divider = true, inline = true, isThumbnail, link, linkName, price, text, title, token }: DetailProp) {
    const { t } = useTranslation();

    const convertedAmount = useMemo(() => price && decimal ? (price / 10 ** decimal).toString() : null, [decimal, price]);
    const priceAsBN = convertedAmount ? amountToMachine(convertedAmount, decimal) : null;
    const notListed = price !== undefined && price === null;
    const isDescription = !title;

    return (
      <Grid container item justifyContent='space-between'>
        {divider && !isThumbnail &&
        <Divider sx={{ bgcolor: 'divider', height: '1px', m: '8px auto', width: '100%' }} />
        }
        {title &&
        <Typography fontSize={ isThumbnail ? '13px' : '14px'} fontWeight={400} sx={inline ? { pr: '10px', width: 'fit-content' } : {}}>
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

const Item = ({ animation_url, animationContentType, image, imageContentType }: DetailItemProps) => {
  const [loaded, setLoaded] = useState<boolean>(false);

  const onLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  if (animation_url && animationContentType === 'text/html') {
    return (
      <>
        {!loaded &&
          <Grid container item sx={{ left: '23%', position: 'absolute', top: '42%', width: 'fit-content', zIndex: 100 }}>
            <Progress />
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
  } else if (!image && animation_url && animationContentType?.startsWith('audio')) {
    return (
      <AudioPlayer audioUrl={animation_url} />
    );
  } else if (image && imageContentType?.startsWith('image') && animation_url && animationContentType?.startsWith('audio')) {
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
    return <Progress />;
  }
};

export default function Details ({ details: { animation_url, animationContentType, description, image, imageContentType, mediaUri, metadataLink, name }, itemInformation: { chainName, collectionId, creator, isNft, itemId, owner, price }, setShowDetail, show }: DetailsProp): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { address } = useParams<{ address: string | undefined }>();
  const { decimal, token } = useInfo(address);
  const api = useApiWithChain2(getAssetHubByChainName(chainName) as Chain);

  const genesisHash = api?.genesisHash.toHex();
  const chain = useMetadata(genesisHash, true);

  const [showFullscreen, setShowFullscreen] = useState<boolean>(false);
  const [gifSource, setGifSource] = useState<string | null | undefined>(undefined);
  const [gifHash, setGifHash] = useState<string | undefined>(undefined);

  const closeDetail = useCallback(() => setShowDetail(false), [setShowDetail]);

  useEffect(() => {
    const getUniqueGif = async () => {
      if (isNft || !mediaUri) {
        setGifSource(null);

        return;
      }

      const { isIPFS, sanitizedUrl } = getContentUrl(mediaUri);

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
  }, [mediaUri, isNft]);

  const { iFrame, source } = useMemo(() => {
    if (gifSource) {
      return { iFrame: false, source: gifSource };
    } else if (animation_url && animationContentType === 'text/html') {
      return { iFrame: true, source: animation_url };
    } else {
      return { iFrame: false, source: image };
    }
  }, [animationContentType, animation_url, gifSource, image]);

  const openFullscreen = useCallback(() => {
    document.documentElement.requestFullscreen().catch(console.error);
    setShowFullscreen(true);
  }, []);

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
              {name ?? (isNft ? t('NFT Detail') : t('Unique Detail'))}
            </Typography>
            <Grid item>
              <IconButton onClick={openFullscreen} sx={{ mr: 1 }}>
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
                animationContentType={animationContentType}
                animation_url={animation_url}
                image={gifSource || image}
                imageContentType={imageContentType}
              />
            </Grid>
            <Grid alignContent='flex-start' container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', maxHeight: '460px', overflowY: 'scroll', p: '15px 20px', width: '390px' }}>
              {description &&
                <Grid item sx={{ pb: '15px' }}>
                  <Detail
                    divider={false}
                    inline={false}
                    text={description}
                  />
                </Grid>
              }
              <Detail
                divider={!!description}
                text={chainName}
                title={t('Network')}
              />
              {collectionId !== undefined &&
                <Detail
                  text={collectionId}
                  title={t('Collection ID')}
                />
              }
              {itemId !== undefined &&
                <Detail
                  divider={!!collectionId || !!description}
                  text={itemId}
                  title={isNft ? t('NFT ID') : t('Unique ID')}
                />
              }
              {metadataLink &&
                <Detail
                  divider={!!itemId}
                  text={`[application/json](${metadataLink})`}
                  title={t('Metadata')}
                />
              }
              {image &&
                <Detail
                  text={`[${imageContentType}](${image})`}
                  title={t('Image')}
                />
              }
              {animation_url &&
                <Detail
                  text={`[${animationContentType}](${animation_url})`}
                  title={animationContentType?.startsWith('text') ? t('Animation') : t('Audio')}
                />
              }
              {gifSource &&
                <Detail
                  text={`[image/gif](${IPFS_GATEWAY + gifHash})`}
                  title={t('Media')}
                />
              }
              <Detail
                decimal={decimal}
                price={price}
                title={t('Price')}
                token={token}
              />
              {creator &&
                <Detail
                  accountId={creator}
                  api={api}
                  chain={chain}
                  title={t('Creator')}
                />
              }
              {owner &&
                <Detail
                  accountId={owner}
                  api={api}
                  chain={chain}
                  title={t('Owner')}
                />
              }
              {owner &&
                <Detail
                  link={KODADOT_URL}
                  linkName='Kodadot'
                  title={t('Sell on')}
                />
              }
            </Grid>
          </Grid>
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
