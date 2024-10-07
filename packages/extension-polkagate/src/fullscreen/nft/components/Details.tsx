// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
/* eslint-disable camelcase */

import type { DetailItemProps, DetailProp, DetailsProp } from '../utils/types';

import { Close as CloseIcon, OpenInFull as OpenInFullIcon } from '@mui/icons-material';
import { Grid, IconButton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'react-router';

import { Identity, Progress, ShowBalance } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { useInfo } from '../../../hooks';
import { amountToMachine } from '../../../util/utils';
import { DraggableModal } from '../../governance/components/DraggableModal';
import AudioPlayer from './AudioPlayer';
import ItemAvatar from './ItemAvatar';
import ItemFullscreenModal from './ItemFullScreenModal';

export const Detail = React.memo(function Detail ({ accountId, api, chain, decimal, inline = true, price, text, title, token }: DetailProp) {
  const { t } = useTranslation();
  const convertedAmount = useMemo(() => price && decimal ? (price / 10 ** decimal).toString() : null, [decimal, price]);
  const priceAsBN = convertedAmount ? amountToMachine(convertedAmount, decimal) : null;
  const notListed = price !== undefined && price === null;

  return (
    <Grid container item py='5px'>
      <Typography fontSize='16px' fontWeight={500} sx={inline ? { pr: '10px', width: 'fit-content' } : {}}>
        {title}:
      </Typography>
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
        <Typography fontSize='16px' fontWeight={400} textAlign='left'>
          {t('Not listed')}
        </Typography>
      }
      {text &&
        <Typography fontSize='16px' fontWeight={400} sx={{ '> p': { m: 0 } }} textAlign='left'>
          <ReactMarkdown
            linkTarget='_blank'
          >
            {text}
          </ReactMarkdown>
        </Typography>
      }
      {accountId && api && chain &&
        <Identity api={api} chain={chain} formatted={accountId} identiconSize={30} showShortAddress style={{ fontSize: '18px', maxWidth: '350px', width: '350px' }} />
      }
    </Grid>
  );
});

export const WithLoading = ({ children, loaded }: { loaded: boolean, children: React.ReactElement }) => (
  <>
    {!loaded && <Progress pt={0} />}
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
        {!loaded && <Progress />}
        <iframe
          onLoad={onLoaded}
          src={animation_url}
          style={{
            border: 'none',
            height: '100%',
            pointerEvents: 'none',
            width: '100%'
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
          height='400px'
          image={image}
          width='320px'
        />
        <AudioPlayer audioUrl={animation_url} />
      </Grid>
    );
  } else if (image && imageContentType?.startsWith('image')) {
    return (
      <ItemAvatar
        height='400px'
        image={image}
        width='320px'
      />
    );
  } else {
    return <Progress />;
  }
};

export default function Details ({ details: { animation_url, animationContentType, description, image, imageContentType, metadataLink, name }, itemInformation: { collectionId, creator, isNft, itemId, owner, price }, setShowDetail, show }: DetailsProp): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string | undefined }>();
  const { api, chain, decimal, token } = useInfo(address);

  const [showFullscreen, setShowFullscreen] = useState<boolean>(false);

  const closeDetail = useCallback(() => setShowDetail(false), [setShowDetail]);

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
                image={image}
                imageContentType={imageContentType}
              />
            </Grid>
            <Grid alignContent='flex-start' container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', maxHeight: '460px', overflowY: 'scroll', p: '10px', rowGap: '10px', width: '390px' }}>
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
              {metadataLink &&
                <Detail
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
            </Grid>
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
