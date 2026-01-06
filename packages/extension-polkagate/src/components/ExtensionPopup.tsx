// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';
import type { OverridableStringUnion } from '@mui/types';

import { Box, Container, Dialog, Grid, type SxProps, type Theme, Typography, type TypographyPropsVariantOverrides } from '@mui/material';
import { ArrowCircleLeft, ArrowCircleRight, type Icon } from 'iconsax-react';
import React from 'react';

import { useIsBlueish, useTranslation } from '../hooks';
import { GradientBorder, GradientDivider, RedGradient } from '../style';
import BlueGradient from '../style/BlueGradient';
import CustomCloseSquare from './SVG/CustomCloseSquare';
import { Transition } from '.';

export interface ExtensionPopupProps {
  TitleIcon?: Icon;
  children: React.ReactNode;
  handleClose?: () => void;
  iconSize?: number;
  iconColor?: string;
  iconVariant?: 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'Bulk' | 'TwoTone' | undefined;
  maxHeight?: string;
  onBack?: () => void;
  onNext?: () => void;
  openMenu: boolean;
  pt?: number;
  px?: number;
  style?: SxProps<Theme>;
  title?: string;
  titleAlignment?: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  titleVariant?: OverridableStringUnion<Variant, TypographyPropsVariantOverrides> | undefined;
  titleDirection?: 'row' | 'column';
  titleStyle?: SxProps;
  withoutTopBorder?: boolean;
  withGradientBorder?: boolean;
  withoutBackground?: boolean;
  RightItem?: React.ReactNode;
  darkBackground?: boolean;
}

const Gradient = React.memo(function MemoGradient({ pt, withoutBackground }: { pt?: number, withoutBackground?: boolean }) {
  const isBlueish = useIsBlueish();

  if (withoutBackground) {
    return null;
  }

  return (
    <>
      {
        isBlueish
          ? <BlueGradient style={{ top: `${-120 + (pt ?? 0)}px` }} />
          : <RedGradient style={{ top: `${-140 + (pt ?? 0)}px` }} />
      }
    </>
  );
});

function ExtensionPopup({ RightItem, TitleIcon, children, darkBackground = false, handleClose, iconColor = '#AA83DC', iconSize = 18, iconVariant, maxHeight = '440px', onBack, onNext, openMenu, pt, px, style, title, titleAlignment, titleDirection = 'row', titleStyle = {}, titleVariant = 'H-3', withGradientBorder = false, withoutBackground, withoutTopBorder = false }: ExtensionPopupProps): React.ReactElement<ExtensionPopupProps> {
  const { t } = useTranslation();
  const isBlueish = useIsBlueish();

  return (
    <Dialog
      PaperProps={{
        sx: {
          backgroundImage: 'unset',
          bgcolor: 'transparent',
          boxShadow: 'unset',
          overflow: 'hidden'
        }
      }}
      TransitionComponent={Transition}
      componentsProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(5px)',
            background: 'radial-gradient(50% 44.61% at 50% 50%, rgba(12, 3, 28, 0) 0%, rgba(12, 3, 28, 0.7) 100%)',
            bgcolor: 'transparent'
          }
        }
      }}
      fullScreen
      open={openMenu}
    >
      <Container disableGutters sx={{ height: '100%', width: '100%', ...style }}>
        <Grid alignItems='center' container item justifyContent='center' sx={{ pb: '12px', pt: `${pt ?? 18}px` }}>
          <CustomCloseSquare color={isBlueish ? '#809ACB' : '#AA83DC'} onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
        </Grid>
        <Grid alignItems='center' container id='container' item justifyContent='center' sx={{ bgcolor: darkBackground ? '#110F2A' : '#1B133C', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: `calc(100% - ${60 + (pt ?? 18)}px)`, overflow: 'hidden', overflowY: 'auto', position: 'relative', px: `${px ?? 10}px`, width: '100%' }}>
          {withGradientBorder && <GradientBorder />}
          {!!onBack &&
            <Grid alignItems='center' container item onClick={onBack} sx={{ cursor: 'pointer', left: '15px', position: 'absolute', pt: '15px', width: 'fit-content', zIndex: 2 }}>
              <ArrowCircleLeft
                color='#FF4FB9'
                size='24'
                variant='Bulk'
              />
              <Typography color='#EAEBF1' ml='4px' variant='B-1'>
                {t('Back')}
              </Typography>
            </Grid>
          }
          {onNext &&
            <Grid alignItems='center' container item onClick={onNext} sx={{ cursor: 'pointer', position: 'absolute', right: '15px', pt: '15px', width: 'fit-content', zIndex: 2 }}>
              <Typography color='#EAEBF1' mr='4px' variant='B-1'>
                {t('Next')}
              </Typography>
              <ArrowCircleRight
                color='#FF4FB9'
                size='24'
                variant='Bulk'
              />
            </Grid>
          }
          <Grid alignItems='center' columnGap='10px' container direction={titleDirection} item justifyContent={titleAlignment ?? 'center'} p={title || TitleIcon ? '10px' : 0}>
            {
              TitleIcon
                ? <TitleIcon color={iconColor} size={iconSize} variant={iconVariant ?? 'Bold'} />
                : undefined
            }
            {
              title &&
              <Typography color='text.primary' sx={{ ...titleStyle, zIndex: 2 }} textTransform='uppercase' variant={titleVariant}>
                {title}
              </Typography>
            }
          </Grid>
          {
            RightItem &&
            <Grid alignItems='center' container item sx={{ position: 'absolute', pt: '15px', right: '15px', top: '5px', width: 'fit-content', zIndex: 2 }}>
              {RightItem}
            </Grid>
          }
          {
            !withoutTopBorder &&
            <GradientDivider />
          }
          <Gradient pt={pt} withoutBackground={withoutBackground} />
          <Box id='boxContainer' sx={{ maxHeight, overflow: 'hidden', overflowY: 'auto', position: 'relative', width: '100%' }}>
            {children}
          </Box>
        </Grid>
      </Container>
    </Dialog>
  );
}

export default React.memo(ExtensionPopup);
