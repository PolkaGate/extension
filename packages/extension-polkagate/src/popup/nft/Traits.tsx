// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Attribute, ItemInformation } from '@polkadot/extension-polkagate/fullscreen/nft/utils/types';

import { Divider, Grid, Link, Stack, Typography } from '@mui/material';
import React, { type ReactElement, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { IPFS_GATEWAY } from '../../fullscreen/nft/utils/constants';
import { fetchWithRetry, getContentUrl } from '../../fullscreen/nft/utils/util';
import { useTranslation } from '../../hooks';
import { toTitleCase } from '../../util';
import { KODADOT_URL } from '../../util/constants';

function Line(): ReactElement {
  return (
    <Divider
      orientation='horizontal' sx={{
        background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', width: '301px'
      }}
    />
  );
}

function ItemInfo({ label, link, markDown, showDivider = true, value }: { label: string, value?: string | ReactElement, showDivider?: boolean, link?: string, markDown?: string }): ReactElement {
  return (
    <Stack direction='column' justifyItems='center'>
      <Grid container direction='row' item justifyContent='space-between' justifyItems='space-between' sx={{ lineHeight: '35px' }}>
        <Typography color='#BEAAD8' textAlign='left' variant='B-1'>
          {label}
        </Typography>
        {React.isValidElement(value)
          ? value
          : <Typography color='#EAEBF1' overflow='auto' textAlign='right' variant='B-1' width='50%'>
            {value}
          </Typography>
        }
        {markDown &&
          <Typography sx={{ '> p': { m: 0 } }} textAlign='right' variant='B-1'>
            <ReactMarkdown
              components={{
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                a: ({ node, ...props }) => <a style={{ color: '#AA83DC' }} {...props} />
              }}
              linkTarget='_blank'
            >
              {markDown}
            </ReactMarkdown>
          </Typography>
        }
        {link &&
          <Typography color='#AA83DC' variant='B-1'>
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

export default function Traits({ nft }: { nft: ItemInformation | undefined }): React.ReactElement {
  const { t } = useTranslation();

  const [gifSource, setGifSource] = useState<string | null | undefined>(undefined);
  const [gifHash, setGifHash] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getUniqueGif = async () => {
      if (nft?.isNft || !nft?.mediaUri) {
        setGifSource(null);

        return;
      }

      const { isIPFS, sanitizedUrl } = getContentUrl(nft.mediaUri);

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
  }, [nft?.isNft, nft?.mediaUri]);

  const chainNameSymbol = useMemo(() => {
    switch (nft?.chainName) {
      case 'Polkadot Asset Hub':
        return 'ahp';
      case 'Kusama Asset Hub':
        return 'ahk';
      default:
        return '';
    }
  }, [nft?.chainName]);

  const NFT_URL_ON_KODADOT = useMemo(() => {
    if (nft?.isCollection) {
      return `${KODADOT_URL}/${chainNameSymbol}/collection/${nft.collectionId}`;
    } else {
      return `${KODADOT_URL}/${chainNameSymbol}/gallery/${nft?.collectionId}-${nft?.itemId}`;
    }
  }, [chainNameSymbol, nft]);

  return (
    <Grid container item sx={{ bgcolor: '#05091C', border: '4px solid #1B133C', borderRadius: '18px', m: '10px', maxHeight: '370px', overflowY: 'auto', p: '10px 15px' }}>
      {nft &&
        <Stack direction='column' width='100%'>
          {nft?.attributes?.map((attribute: Attribute) => {
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
          {nft.metadataLink &&
            <ItemInfo
              label={t('Metadata')}
              markDown={`[application/json](${nft.metadataLink})`}
            />
          }
          {nft.image &&
            <ItemInfo
              label={t('Image')}
              markDown={`[${nft.imageContentType}](${nft.image})`}
            />
          }
          {nft.animation_url &&
            <ItemInfo
              label={nft.animationContentType?.startsWith('text') ? t('Animation') : t('Audio')}
              markDown={`[${nft.animationContentType}](${nft.animation_url})`}
            />
          }
          {gifSource &&
            <ItemInfo
              label={t('Media')}
              markDown={`[image/gif](${IPFS_GATEWAY + gifHash})`}
            />
          }
          {nft.owner &&
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
