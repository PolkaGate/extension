// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation } from '../../../fullscreen/nft/utils/types';

import { Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import { ArrowCircleRight, Cards } from 'iconsax-react';
import React, { useCallback, useContext, useRef } from 'react';

import { ActionContext, MyTooltip } from '../../../components';
import { useIsDark, useIsHovered, useSelectedAccount, useTranslation } from '../../../hooks';
import { toTitleCase } from '../../../util';
import NftPrice from '../../nft/NftPrice';

interface NftItemProps {
  info: ItemInformation;
  index: number;
  onClick?: () => void;
}

export function NFTItem ({ index, info, onClick }: NftItemProps) {
  const theme = useTheme();
  const isDark = useIsDark();
  const { t } = useTranslation();

  const onAction = useContext(ActionContext);
  const account = useSelectedAccount();
  const containerRef = useRef(null);
  const isHovered = useIsHovered(containerRef);

  const bgcolor = isDark ? isHovered ? '#2D1E4A' : '#1B133C' : '#FFF';
  const bgcolor2 = isDark ? '#05091C' : '#EFEEF7';
  const itemIdColor = isDark ? '#EAEBF1' : '#291443';
  const itemNameColor = isDark ? '#BEAAD8' : '#745D8B';

  const _onClick = useCallback(() => {
    if (onClick) {
      return onClick();
    }

    if (!account?.address) {
      return;
    }

    onAction(`/nft-extension/${account.address}/${index}`);
  }, [account?.address, index, onAction, onClick]);

  return (
    <Grid container item onClick={_onClick} ref={containerRef} sx={{ bgcolor, borderRadius: '18px', cursor: 'pointer', maxHeight: '250px', p: '4px', width: '152px' }}>
      <Grid container direction='column' item sx={{ bgcolor: bgcolor2, borderRadius: '14px' }}>
        <Grid
          container item sx={{
            borderRadius: '14px',
            height: isHovered ? '135px' : '144px',
            overflow: 'hidden',
            position: 'relative',
            transition: 'height 0.3s ease-in-out',
            width: '144px'
          }}
        >
          <Box
            sx={{
              '&:hover': {
                transform: 'translate(-50%, -50%) scale(1.1)'
              },
              backgroundImage: `url(${info.image ?? ''})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'contain',
              borderRadius: '14px',
              height: '100%',
              left: '50%',
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              transition: 'transform 0.3s ease-in-out',
              width: '100%'
            }}
          />
          <ArrowCircleRight
            color='#FF4FB9'
            id='arrow'
            size='40'
            style={{
              left: '50%',
              opacity: isHovered ? 1 : 0,
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              transition: 'opacity 0.3s ease-in-out'
            }}
            variant='Bold'
          />
        </Grid>
        <Grid container direction='column' item sx={{ m: '6px 12px' }}>
          <Stack alignItems='center' direction='row'>
            {
              info.isCollection &&
              <MyTooltip content={t('This is a collection.')}>
                <Cards color='#AA83DC' size='13' style={{ marginRight: '3px' }} />
              </MyTooltip>
            }
            <Typography color={itemNameColor} sx={{ maxWidth: '110px', overflow: 'hidden', textAlign: 'left', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant='B-2'>
              {toTitleCase(info.name)}
            </Typography>
          </Stack>
          <Grid container item width='fit-content'>
            <span style={{ color: isDark ? '#BEAAD880' : '#745D8B', ...theme.typography['B-2'] }}>
              #
            </span>
            <span style={{ color: itemIdColor, ...theme.typography['B-2'] }}>
              {info.isCollection ? info.collectionId : `${info.collectionId}${info.collectionId ? '_' : ''}${info.itemId}`}
            </span>
          </Grid>
        </Grid>
      </Grid>
      {info.isCollection
        ? <Stack alignItems='center' columnGap= '3px' direction='row' justifyContent= 'center' sx={{ p: '8px 0 4px', width: '100%' }}>
          <Typography color='text.secondary' textAlign='left' variant='B-1'>
            {t('Items')}:
          </Typography>
          <Typography color='primary.main' textAlign='left' variant='B-1'>
            {info.items}
          </Typography>
        </Stack>
        : <NftPrice
          nft={info}
          style={{ justifyContent: 'center', p: '8px 0 4px' }}
        />}
    </Grid>
  );
}
