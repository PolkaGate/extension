// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable camelcase */

import type { ItemInformation } from '../utils/types';

import { Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';

import { Progress } from '../../../components';
import { PREVIEW_SIZE } from '../utils/constants';
import AudioPlayer from './AudioPlayer';
import ItemAvatar from './ItemAvatar';

function NftPreview ({ gifSource, info }: { gifSource: string | null | undefined; info: ItemInformation }) {
    const { t } = useTranslation();

  const [loaded, setLoaded] = useState<boolean>(false);

  const { animation_url, animationContentType, image, imageContentType } = info;
  const _image = gifSource || image;
  const isHtmlContent = animation_url && animationContentType === 'text/html';
  const isAudioOnly = !_image && animation_url && animationContentType?.startsWith('audio');
  const isImageWithAudio = _image && imageContentType?.startsWith('image') && animation_url && animationContentType?.startsWith('audio');

  const onLoaded = useCallback(() => {
    setLoaded(true);
  }, []);

  if (isHtmlContent) {
    return (
      <>
        {!loaded &&
          <Grid container item sx={{ left: '15%', position: 'absolute', top: '25%', width: 'fit-content', zIndex: 100 }}>
            <Progress
              title={t('Loading')}
              withEllipsis
            />
          </Grid>
        }
        <iframe
          onLoad={onLoaded}
          src={animation_url}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '22px',
            height: PREVIEW_SIZE,
            objectFit: 'contain',
            pointerEvents: 'none',
            width: PREVIEW_SIZE
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
      <Grid container direction='column' item rowGap='8px' width={PREVIEW_SIZE}>
        <ItemAvatar
          image={_image}
        />
        <AudioPlayer audioUrl={animation_url} />
      </Grid>
    );
  } else if (_image && imageContentType?.startsWith('image')) {
    return (
      <ItemAvatar
        image={_image}
      />
    );
  } else {
    return (
      <ItemAvatar
        image={null}
      />
    );
  }
}

export default React.memo(NftPreview);
