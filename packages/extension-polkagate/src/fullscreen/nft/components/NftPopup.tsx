// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Attribute, ItemInformation } from '../utils/types';

import { ChevronLeft } from '@mui/icons-material';
import { Box, Divider, Grid, IconButton, Link, Modal, Stack, Typography, useTheme } from '@mui/material';
import { Maximize4 } from 'iconsax-react';
import React, { type ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { modalEffect } from '@polkadot/extension-polkagate/src/assets/img/index';
import ActionButton from '@polkadot/extension-polkagate/src/components/ActionButton';
import GradientButton from '@polkadot/extension-polkagate/src/components/GradientButton';
import { CopyAddressButton, Identity, Logo } from '@polkadot/extension-polkagate/src/components/index';
import { useTranslation } from '@polkadot/extension-polkagate/src/components/translate';
import useIsDark from '@polkadot/extension-polkagate/src/hooks/useIsDark';
import NftPrice from '@polkadot/extension-polkagate/src/popup/nft/NftPrice';
import { GradientDivider } from '@polkadot/extension-polkagate/src/style/index';
import { KODADOT_URL } from '@polkadot/extension-polkagate/src/util/constants';
import { toTitleCase } from '@polkadot/extension-polkagate/src/util/string';

import { IPFS_GATEWAY } from '../utils/constants';
import { fetchWithRetry, getContentUrl } from '../utils/util';
import NftPreview from './NftPreview';

export interface Props {
  info: ItemInformation;
  onClose: () => void;
  setShowFullscreen: React.Dispatch<React.SetStateAction<{
    iFrame: boolean;
    source: string | null | undefined;
  } | undefined>>;
}

function AccountRow({ address, genesisHash, label }: { label: string, address: string, genesisHash: string }): React.ReactElement {
  const theme = useTheme();

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' lineHeight='35px'>
      <Stack alignItems='baseline' columnGap='3px' direction='row'>
        <Typography color={theme.palette.accent.text} textAlign='left' variant='B-1'>
          {label}
        </Typography>
        <CopyAddressButton address={address} padding={0} />
      </Stack>
      <Identity
        address={address}
        genesisHash={genesisHash}
        identiconSize={14}
        showShortAddress
        style={{ lineHeight: '35px', variant: 'B-1' }}
      />
    </Stack>
  );
}

function LeftCol({ gifSource, info, setShowFullscreen }: {
  gifSource: string | null | undefined, info: ItemInformation; setShowFullscreen: React.Dispatch<React.SetStateAction<{
    iFrame: boolean;
    source: string | null | undefined;
  } | undefined>>
}): React.ReactElement<{ info: ItemInformation; }> {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const { iFrame, source } = useMemo(() => {
    if (gifSource) {
      return { iFrame: false, source: gifSource };
    } else if (info.animation_url && info.animationContentType === 'text/html') {
      return { iFrame: true, source: info.animation_url };
    } else {
      return { iFrame: false, source: info.image };
    }
  }, [info.animationContentType, info.animation_url, gifSource, info.image]);

  const onFullscreen = useCallback(() => {
    if (!source) {
      return;
    }

    document.documentElement.requestFullscreen().catch(console.error);
    setShowFullscreen({ iFrame, source });
  }, [iFrame, setShowFullscreen, source]);

  return (
    <Stack
      direction='column'
      sx={{
        background: 'transparent',
        width: '212px'
      }}
    >
      <NftPreview
        gifSource={gifSource}
        info={info}
      />
      <Stack direction='column' sx={{ bgcolor: isDark ? '#05091C' : '#FFFFFF', border: isDark ? '2px solid #1B133C' : '1px solid #DDE3F4', borderRadius: '23px', boxShadow: isDark ? 'none' : '0 10px 22px rgba(133, 140, 176, 0.14)', my: '8px', padding: '23px 13px' }}>
        <Typography color={isDark ? 'text.secondary' : '#745D8B'} sx={{ textAlign: 'left' }} variant='B-1'>
          {t('Collection name')}
        </Typography>
        <Typography color={isDark ? '#EAEBF1' : '#2D1E4A'} sx={{ mt: '1px', textAlign: 'left' }} variant='B-1'>
          {info.collectionName || (info.isCollection && info.name) || info.collectionId || t('Not in a collection')}
        </Typography>
        <GradientDivider style={{ margin: '15px 0' }} />
        {info.isCollection
          ? <>
            <Typography color={isDark ? 'text.secondary' : '#745D8B'} sx={{ textAlign: 'left' }} variant='B-1'>
              {t('Items')}
            </Typography>
            <Typography color={isDark ? '#EAEBF1' : '#2D1E4A'} sx={{ mt: '1px', textAlign: 'left' }} variant='B-1'>
              {info.items}
            </Typography>
          </>
          : <>
            <Typography color={isDark ? 'text.secondary' : '#745D8B'} sx={{ textAlign: 'left' }} variant='B-1'>
              {t('Price')}
            </Typography>
            <NftPrice
              nft={info}
              style={{ justifyContent: 'start', mt: '1px' }}
            />
          </>
        }
      </Stack>
      <GradientButton
        StartIcon={Maximize4}
        contentPlacement='center'
        onClick={onFullscreen}
        startIconVariant='Linear'
        style={{
          columnGap: '5px',
          height: '44px'
        }}
        text={t('View in Full Screen')}
      />
    </Stack>
  );
}

function Line(): ReactElement {
  const theme = useTheme();

  return (
    <Divider
      orientation='horizontal' sx={{
        background: theme.palette.dividerGradientFade, height: '1px', width: '301px'
      }}
    />
  );
}

function ItemInfo({ label, link, markDown, showDivider = true, value }: { label: string, value?: string | ReactElement, showDivider?: boolean, link?: string, markDown?: string }): ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();

  return (
    <Stack direction='column' justifyItems='center'>
      <Grid container direction='row' item justifyContent='space-between' justifyItems='space-between' sx={{ lineHeight: '35px' }}>
        <Typography color={theme.palette.accent.text} textAlign='left' variant='B-1'>
          {label}
        </Typography>
        {React.isValidElement(value)
          ? value
          : <Typography color={isDark ? '#EAEBF1' : '#2D1E4A'} overflow='auto' textAlign='right' variant='B-1' width='50%'>
            {value}
          </Typography>
        }
        {markDown &&
          <Typography sx={{ '> p': { m: 0 } }} textAlign='right' variant='B-1'>
            <ReactMarkdown
              components={{
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                a: ({ node, ...props }) => <a style={{ color: isDark ? '#AA83DC' : '#674394' }} {...props} />
              }}
              linkTarget='_blank'
            >
              {markDown}
            </ReactMarkdown>
          </Typography>
        }
        {link &&
          <Typography color={isDark ? '#AA83DC' : '#674394'} variant='B-1'>
            <Link href={link} target='_blank' underline='hover'>
              Kodadot
            </Link>
          </Typography>
        }
      </Grid>
      {showDivider &&
        <Line />
      }
    </Stack>
  );
}

function NftDetails({ gifHash, gifSource, info }: { gifHash: string | undefined, gifSource: string | null | undefined, info: ItemInformation; }): React.ReactElement<{ info: ItemInformation; }> {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const chainNameSymbol = useMemo(() => {
    switch (info?.chainName) {
      case 'Polkadot Asset Hub':
        return 'ahp';
      case 'Kusama Asset Hub':
        return 'ahk';
      default:
        return '';
    }
  }, [info?.chainName]);

  const NFT_URL_ON_KODADOT = useMemo(() => {
    if (info?.isCollection) {
      return `${KODADOT_URL}/${chainNameSymbol}/collection/${info.collectionId}`;
    } else {
      return `${KODADOT_URL}/${chainNameSymbol}/gallery/${info?.collectionId}-${info?.itemId}`;
    }
  }, [chainNameSymbol, info]);

  return (
    <Grid container item sx={{ bgcolor: isDark ? '#05091C' : '#FFFFFF', border: isDark ? '4px solid #1B133C' : '1px solid #DDE3F4', borderRadius: '18px', boxShadow: isDark ? 'none' : '0 10px 22px rgba(133, 140, 176, 0.14)', m: '20px 10px 45px', maxHeight: '370px', overflowY: 'auto', p: '10px 15px', width: '94%' }}>
      {info &&
        <Stack direction='column' width='100%'>
          <ItemInfo
            label={t('Network')}
            value={<Stack alignItems='center' columnGap='3px' direction='row'>
              <Logo genesisHash={info?.genesisHash} size={14} />
              <Typography color={isDark ? '#EAEBF1' : '#2D1E4A'} variant='B-2'>
                {info?.chainName}
              </Typography>
            </Stack>
            }
          />
          <ItemInfo
            label={t('Collection ID')}
            value={info.collectionId || 'Unknown'}
          />
          {
            info.itemId !== undefined &&
            <ItemInfo
              label={t('NFT ID')}
              value={info.itemId || 'Unknown'}
            />
          }
          {
            info.creator && info.genesisHash &&
            <>
              <AccountRow
                address={info.creator}
                genesisHash={info.genesisHash}
                label={t('Creator')}
              />
              <Line />
            </>
          }
          {info.owner && info.genesisHash &&
            <>
              <AccountRow
                address={info.owner}
                genesisHash={info.genesisHash}
                label={t('Owner')}
              />
              <Line />
            </>
          }
          {
            info?.attributes?.map((attribute: Attribute) => {
              const [labelKey, valueKey] = Object.keys(attribute);
              const label = attribute[labelKey];
              const value = attribute[valueKey];

              /** Since already has shown in other tabs */
              const exceptionLabels = ['name', 'description'];

              if (value === '' || exceptionLabels.includes(label) || (typeof value === 'object' && value !== null)) {
                return <></>;
              }

              return (
                <ItemInfo
                  key={label}
                  label={toTitleCase(label) || 'Unknown'}
                  value={value}
                />
              );
            })}
          {info.metadataLink &&
            <ItemInfo
              label={t('Metadata')}
              markDown={`[application/json](${info.metadataLink})`}
            />
          }
          {info.image &&
            <ItemInfo
              label={t('Image')}
              markDown={`[${info.imageContentType}](${info.image})`}
            />
          }
          {info.animation_url &&
            <ItemInfo
              label={info.animationContentType?.startsWith('text') ? t('Animation') : t('Audio')}
              markDown={`[${info.animationContentType}](${info.animation_url})`}
            />
          }
          {gifSource &&
            <ItemInfo
              label={t('Media')}
              markDown={`[image/gif](${IPFS_GATEWAY + gifHash})`}
            />
          }
          {info.owner &&
            <ItemInfo
              label={t('View on')}
              link={NFT_URL_ON_KODADOT}
              showDivider={false}
            />
          }
        </Stack>
      }
    </Grid>
  );
}

function RightCol({ gifHash, gifSource, info, onClose }: { gifSource: string | null | undefined, gifHash: string | undefined, info: ItemInformation; onClose: () => void; }): React.ReactElement<Props> {
  const theme = useTheme();
  const isDark = useIsDark();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        backgroundImage: isDark ? `url(${modalEffect})` : 'linear-gradient(180deg, #F1E4FF 0%, #F8FAFF 48%, #FFFFFF 100%)',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        bgcolor: isDark ? '#1B133C' : '#F8FAFF',
        border: isDark ? '0.5px solid' : 'none',
        borderColor: '#FFFFFF0D',
        borderRadius: '32px',
        cursor: 'default',
        padding: '20px 0 20px',
        position: 'relative',
        width: '415px'
      }}
    >
      <Grid alignItems='center' container item>
        <Stack direction='row' sx={{ width: '100%' }}>
          <IconButton
            onClick={onClose}
            sx={{
              background: isDark ? '#BFA1FF26' : '#FFFFFF',
              border: isDark ? 'none' : '1px solid #DDE3F4',
              borderRadius: '10px',
              boxShadow: isDark ? 'none' : '0 8px 18px rgba(133, 140, 176, 0.12)',
              height: '36px',
              left: '20px',
              position: 'absolute',
              width: '36px',
              zIndex: 1
            }}
          >
            <ChevronLeft sx={{ color: theme.palette.accent.icon, fontSize: 20, stroke: theme.palette.accent.icon }} />
          </IconButton>
          <Typography color={isDark ? '#EAEBF1' : '#2D1E4A'} sx={{ ml: '53px', textAlign: 'center', textTransform: 'uppercase', width: '80%' }} variant='H-2'>
            {info.name ?? t('unknown')}
          </Typography>
        </Stack>
        <Typography color={isDark ? '#EAEBF1' : '#745D8B'} sx={{ '> p': { m: 0 }, maxHeight: '120px', mt: '30px', overflow: 'auto', px: '20px', width: '100%' }} textAlign='justify' variant='B-5'>
          <ReactMarkdown
            components={{
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              a: ({ node, ...props }) => <a style={{ color: isDark ? '#AA83DC' : '#674394' }} {...props} />
            }}
            linkTarget='_blank'
          >
            {String(info.description ?? t('No description!'))}
          </ReactMarkdown>
        </Typography>
      </Grid>
      <NftDetails
        gifHash={gifHash}
        gifSource={gifSource}
        info={info}
      />
      <ActionButton
        contentPlacement='center'
        onClick={onClose}
        style={{
          bottom: '15px',
          height: '44px',
          left: '15px',
          position: 'absolute',
          width: '92%'
        }}
        text={t('Close')}
        variant='text'
      />
    </Box>
  );
}

export function NftPopup({ info, onClose, setShowFullscreen }: Props): React.ReactElement<Props> {
  const width = 615;
  const maxHeight = 740;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - maxHeight) / 2;

  const [gifSource, setGifSource] = useState<string | null | undefined>(undefined);
  const [gifHash, setGifHash] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getUniqueGif = async() => {
      if (info.isNft || !info.mediaUri) {
        setGifSource(null);

        return;
      }

      const { isIPFS, sanitizedUrl } = getContentUrl(info.mediaUri);

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
  }, [info.isNft, info.mediaUri]);

  return (
    <Modal
      onClose={onClose}
      open={true}
      slotProps={{
        backdrop: {
          style: {
            backdropFilter: 'blur(5px)',
            backgroundColor: 'rgba(0, 0, 0, 0.73)'
          }
        }
      }}
    >
      <Stack
        columnGap='8px'
        direction='row'
        sx={{
          '&:focus': {
            outline: 'none' // Remove outline when Box is focused
          },
          left,
          maxHeight,
          minHeight: '300px',
          padding: '20px 0 20px',
          position: 'absolute',
          top,
          width
        }}
      >
        <LeftCol
          gifSource={gifSource}
          info={info}
          setShowFullscreen={setShowFullscreen}
        />
        <RightCol
          gifHash={gifHash}
          gifSource={gifSource}
          info={info}
          onClose={onClose}
        />
      </Stack>
    </Modal>
  );
}
