// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation } from '@polkadot/extension-polkagate/fullscreen/nft/utils/types';

import { Avatar } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { IPFS_GATEWAY } from '@polkadot/extension-polkagate/fullscreen/nft/utils/constants';
import { fetchWithRetry, getContentUrl } from '@polkadot/extension-polkagate/fullscreen/nft/utils/util';

export default function IllustrateNft({ height = '144px', nft, width = '144px' }: { nft: ItemInformation | undefined, height?: string, width?: string }): React.ReactElement {
  const [gifSource, setGifSource] = useState<string | null | undefined>(undefined);

  const isHtmlContent = nft?.animation_url && nft?.animationContentType === 'text/html';

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

      setGifSource(gifURL);
    };

    getUniqueGif().catch(console.error);
  }, [nft]);

  return (
    <>
      {isHtmlContent && nft.animation_url
        ? <iframe
          src={nft.animation_url}
          style={{
            border: 'none',
            height,
            objectFit: 'contain',
            pointerEvents: 'none',
            width
          }}
          title='HTML Content'
        />
        : <Avatar
          draggable={false}
          src={gifSource || nft?.image || ''}
          sx={{
            borderRadius: '14px',
            display: 'initial',
            height,
            img: {
              objectFit: 'contain',
              objectPosition: 'center'
            },
            pointerEvents: 'none',
            width
          }}
          variant='square'
        />
      }
    </>
  );
}
