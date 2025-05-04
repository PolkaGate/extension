// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { Variant } from '@mui/material/styles/createTypography';
import type { TransitionProps } from '@mui/material/transitions';
import type { OverridableStringUnion } from '@mui/types';

import { Box, Container, Dialog, Grid, Slide, type SxProps, type Theme, Typography, type TypographyPropsVariantOverrides } from '@mui/material';
import { ArrowCircleLeft, type Icon } from 'iconsax-react';
import React from 'react';

import { useTranslation } from '../hooks';
import { GradientBorder, GradientDivider, RedGradient } from '../style';
import CustomCloseSquare from './SVG/CustomCloseSquare';

export interface Props {
  TitleIcon?: Icon;
  children: React.ReactNode;
  handleClose?: () => void;
  iconSize?: number;
  iconColor?: string;
  iconVariant?: 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'Bulk' | 'TwoTone' | undefined;
  maxHeight?: string;
  onBack?: () => void;
  openMenu: boolean;
  pt?: number;
  style?: SxProps<Theme>;
  title: string;
  titleAlignment?: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  titleVariant?: OverridableStringUnion<Variant, TypographyPropsVariantOverrides> | undefined;
  titleDirection?: 'row' | 'column';
  titleStyle?: SxProps;
  withoutTopBorder?: boolean;
  withGradientBorder?: boolean;
  withoutBackground?: boolean;
  RightItem?: React.ReactNode;
}

const Transition = React.forwardRef(function Transition (props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
  return <Slide direction='up' easing='ease-in-out' ref={ref} timeout={250} {...props} />;
});

function ExtensionPopup ({ RightItem, TitleIcon, children, handleClose, iconColor = '#AA83DC', iconSize = 18, iconVariant, maxHeight = '440px', onBack, openMenu, pt, style, title, titleAlignment, titleDirection = 'row', titleStyle = {}, titleVariant = 'H-3', withGradientBorder = false, withoutBackground, withoutTopBorder = false }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

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
            backdropFilter: 'blur(7px)',
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
          <CustomCloseSquare color='#AA83DC' onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
        </Grid>
        <Grid alignItems='center' container id='container' item justifyContent='center' sx={{ bgcolor: '#1B133C', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: `calc(100% - ${60 + (pt ?? 0)}px)`, overflow: 'hidden', overflowY: 'scroll', p: '10px', pb: '10px', position: 'relative', width: '100%' }}>
          {withGradientBorder && <GradientBorder />}
          {!!onBack &&
            <Grid alignItems='center' container item onClick={onBack} sx={{ cursor: 'pointer', left: '15px', position: 'absolute', pt: '15px', zIndex: 2 }}>
              <ArrowCircleLeft
                color='#FF4FB9'
                size='24'
                variant='Bulk'
              />
              <Typography color='#EAEBF1' ml='4px' variant='B-1'>
                {t('Back')}
              </Typography>
            </Grid>}
          <Grid alignItems='center' columnGap='10px' container direction={titleDirection} item justifyContent={titleAlignment ?? 'center'} p='10px'>
            {TitleIcon
              ? <TitleIcon color={iconColor} size={iconSize} variant={iconVariant ?? 'Bold'} />
              : undefined
            }
            <Typography color='text.primary' sx={{ ...titleStyle, zIndex: 2 }} textTransform='uppercase' variant={titleVariant}>
              {title}
            </Typography>
          </Grid>
          {RightItem &&
            <Grid alignItems='center' container item sx={{ position: 'absolute', pt: '15px', right: '15px', top: '5px', width: 'fit-content', zIndex: 2 }}>
              {RightItem}
            </Grid>}
          {!withoutTopBorder && <GradientDivider />}
          {!withoutBackground && <RedGradient style={{ top: `${-140 + (pt ?? 0)}px` }} />}
          <Box sx={{ maxHeight, overflow: 'scroll', position: 'relative', width: '100%' }}>
            {children}
          </Box>
        </Grid>
      </Container>
    </Dialog>
  );
}

export default React.memo(ExtensionPopup);
