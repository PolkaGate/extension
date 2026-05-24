// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemAvatarProp } from '../utils/types';

import { faGem } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Grid, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Progress } from '@polkadot/extension-polkagate/src/components/index';
import { useTranslation } from '@polkadot/extension-polkagate/src/components/translate';

import { PREVIEW_SIZE } from '../utils/constants';

const SIZE = {
  large: {
    height: '400px',
    width: '320px'
  },
  small: {
    height: PREVIEW_SIZE,
    width: PREVIEW_SIZE
  }
};

const WithLoading = ({ children, loaded }: { loaded: boolean, children: React.ReactElement }) => {
  const { t } = useTranslation();

  return (
    <>
      {!loaded &&
        <Progress
          title={t('Loading')}
          withEllipsis
        />
      }
      {children}
    </>
  );
};

export default function ItemAvatar({ image, size = 'small' }: ItemAvatarProp): React.ReactElement {
  const theme = useTheme();
  const [showLoading, setShowLoading] = useState<boolean>(true);

  const onLoad = useCallback(() => {
    setShowLoading(false);
  }, []);

  return (
    <Grid alignItems='center' container item justifyContent='center' sx={{ borderRadius: size === 'small' ? '10px 10px 5px 5px' : '10px', height: SIZE[size].height, overflow: 'hidden', width: SIZE[size].width }}>
      {image &&
        <WithLoading
          loaded={!showLoading}
        >
          <Avatar
            draggable={false}
            onLoad={onLoad}
            src={image}
            sx={{
              borderRadius: '22px',
              display: showLoading ? 'none' : 'initial',
              height: '200px',
              img: {
                objectFit: 'contain',
                objectPosition: 'center'
              },
              pointerEvents: 'none',
              width: '200px'
            }}
            variant='square'
          />
        </WithLoading>
      }
      {image === null &&
        <FontAwesomeIcon
          color={theme.palette.text.primary}
          fontSize='70px'
          icon={faGem}
        />
      }
    </Grid>
  );
}
