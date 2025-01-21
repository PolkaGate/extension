// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransitionProps } from '@mui/material/transitions';
import type { Icon } from 'iconsax-react';

import { Box, Container, Dialog, Grid, Slide, Typography } from '@mui/material';
import React from 'react';

import { GradientDivider, RedGradient } from '../style';
import CustomCloseSquare from './SVG/CustomCloseSquare';

export interface Props {
  children: React.ReactNode;
  handleClose?: () => void;
  openMenu: boolean;
  TitleIcon?: Icon;
  title: string;
  withoutTopBorder?: boolean;
  withoutBackground?: boolean;
}

const Transition = React.forwardRef(function Transition (props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
  return <Slide direction='up' easing='ease-in-out' ref={ref} timeout={250} {...props} />;
});

function ExtensionPopup ({ TitleIcon, children, handleClose, openMenu, title, withoutBackground, withoutTopBorder = false }: Props): React.ReactElement<Props> {
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
            backdropFilter: 'blur(10px)',
            background: 'radial-gradient(50% 44.61% at 50% 50%, rgba(12, 3, 28, 0) 0%, rgba(12, 3, 28, 0.7) 100%)',
            bgcolor: 'transparent'
          }
        }
      }}
      fullScreen
      open={openMenu}
    >
      <Container disableGutters sx={{ height: '100%', width: '100%' }}>
        <Grid alignItems='center' container item justifyContent='center' sx={{ pb: '12px', pt: '18px' }}>
          <CustomCloseSquare color='#AA83DC' onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
        </Grid>
        <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#1B133C', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: 'calc(100% - 78px)', overflow: 'hidden', overflowY: 'scroll', p: '10px', pb: '10px', position: 'relative', width: '100%' }}>
          <Grid alignItems='center' columnGap='10px' container item justifyContent='center' p='10px'>
            {TitleIcon
              ? <TitleIcon color='#AA83DC' size={28} variant='Bold' />
              : undefined
            }
            <Typography color='text.primary' fontFamily='OdibeeSans' fontSize='24px' fontWeight={400} textTransform='uppercase'>
              {title}
            </Typography>
          </Grid>
          {!withoutTopBorder && <GradientDivider />}
          {!withoutBackground && <RedGradient style={{ top: '-140px' }} />}
          <Box sx={{ maxHeight: '440px', overflow: 'scroll', position: 'relative', width: '100%' }}>
            {children}
          </Box>
        </Grid>
      </Container>
    </Dialog>
  );
}

export default React.memo(ExtensionPopup);
