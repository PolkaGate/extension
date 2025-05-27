// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Typography } from '@mui/material';
import { CloseCircle, TickCircle } from 'iconsax-react';
import React from 'react';

import { useTranslation } from '../../../hooks';

interface Props {
  success: boolean;
  showLabel?: boolean;
  size?: number;
  style?: React.CSSProperties;
}

export default function FailSuccessIcon ({ showLabel = true, style = {}, success }: Props) {
  const { t } = useTranslation();

  return (
    <Container
      disableGutters
      sx={{ ...style }}
    >
      <Grid container item sx={{ backdropFilter: 'blur(4px)', border: '8px solid', borderColor: '#00000033', borderRadius: '999px', overflow: 'hidden', width: 'fit-content' }}>
        {success
          ? <TickCircle color='#82FFA5' size='50' style={{ background: '#000', borderRadius: '999px', margin: '-4px' }} variant='Bold' />
          : <CloseCircle color='#FF4FB9' size='50' style={{ background: '#000', borderRadius: '999px', margin: '-4px' }} variant='Bold' />
        }
      </Grid>
      {showLabel &&
        <Typography color='#AA83DC' pt='8px' textTransform='capitalize' variant='B-2'>
          {success ? t('Completed') : t('Failed')}
        </Typography>
      }
    </Container>
  );
}
