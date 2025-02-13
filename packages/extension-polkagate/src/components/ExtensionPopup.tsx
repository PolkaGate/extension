// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Variant } from '@mui/material/styles/createTypography';
import type { TransitionProps } from '@mui/material/transitions';
import type { OverridableStringUnion } from '@mui/types';
import type { Icon } from 'iconsax-react';

import { Box, Container, Dialog, Grid, Slide, type SxProps, Typography, type TypographyPropsVariantOverrides } from '@mui/material';
import React from 'react';

import { GradientBorder, GradientDivider, RedGradient } from '../style';
import CustomCloseSquare from './SVG/CustomCloseSquare';

export interface Props {
  children: React.ReactNode;
  handleClose?: () => void;
  openMenu: boolean;
  TitleIcon?: Icon;
  iconSize?: number;
  iconColor?: string;
  iconVariant?: 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'Bulk' | 'TwoTone' | undefined;
  title: string;
  pt?: number;
  titleAlignment?: string;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  titleVariant?: OverridableStringUnion<Variant, TypographyPropsVariantOverrides> | undefined;
  titleDirection?: 'row' | 'column';
  titleStyle?: SxProps;
  withoutTopBorder?: boolean;
  withGradientBorder?: boolean;
  withoutBackground?: boolean;
}

const Transition = React.forwardRef(function Transition (props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
  return <Slide direction='up' easing='ease-in-out' ref={ref} timeout={250} {...props} />;
});

function ExtensionPopup ({ TitleIcon, children, handleClose, iconColor = '#AA83DC', iconSize = 18, iconVariant, openMenu, pt, title, titleAlignment, titleDirection = 'row', titleStyle = {}, titleVariant = 'H-3', withGradientBorder = false, withoutBackground, withoutTopBorder = false }: Props): React.ReactElement<Props> {
  return (
    <Dialog
      PaperProps={{
        sx: {
          backgroundImage: 'unset',
          bgcolor: 'transparent',
          boxShadow: 'unset'
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
      <Container disableGutters sx={{ height: '100%', width: '100%' }}>
        <Grid alignItems='center' container item justifyContent='center' sx={{ pb: '12px', pt: `${pt ?? 18}px` }}>
          <CustomCloseSquare color='#AA83DC' onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
        </Grid>
        <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#1B133C', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: `calc(100% - ${60 + (pt ?? 0)}px)`, overflow: 'hidden', overflowY: 'scroll', p: '10px', pb: '10px', position: 'relative', width: '100%' }}>
          {withGradientBorder && <GradientBorder />}
          <Grid alignItems='center' columnGap='10px' container direction={titleDirection} item justifyContent={titleAlignment ?? 'center'} p='10px'>
            {TitleIcon
              ? <TitleIcon color={iconColor} size={iconSize} variant={iconVariant ?? 'Bold'} />
              : undefined
            }
            <Typography color='text.primary' textTransform='uppercase' variant={titleVariant} sx={{ ...titleStyle }}>
              {title}
            </Typography>
          </Grid>
          {!withoutTopBorder && <GradientDivider />}
          {!withoutBackground && <RedGradient style={{ top: `${-140 + (pt ?? 0)}px` }} />}
          <Box sx={{ maxHeight: '440px', overflow: 'scroll', position: 'relative', width: '100%' }}>
            {children}
          </Box>
        </Grid>
      </Container>
    </Dialog>
  );
}

export default React.memo(ExtensionPopup);
