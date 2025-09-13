// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DateAmount } from '../../hooks/useSoloStakingInfo';

import { Container, Grid, Stack, Typography } from '@mui/material';
import React from 'react';

import { FormatBalance2, GradientButton, GradientDivider } from '../../components';
import { useChainInfo, useTranslation } from '../../hooks';
import { formatTimestamp } from '../../util/utils';
import { DraggableModal } from '../components/DraggableModal';

interface Props {
  genesisHash: string | undefined;
  onClose: () => void;
  onRestake?: () => void;
  toBeReleased: DateAmount[] | undefined;
}

export default function ToBeReleased ({ genesisHash, onClose, onRestake, toBeReleased }: Props) {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  return (
    <DraggableModal
      maxHeight={475}
      minHeight={475}
      onClose={onClose}
      open
      showBackIconAsClose
      title={t('Unstaking')}
    >
      <Stack direction='column' sx={{ position: 'relative', width: '100%', zIndex: 1 }}>
        <Container disableGutters sx={{ height: '300px', maxHeight: '300px', mb: '10px', overflowY: 'auto', p: '16px' }}>
          <Typography color='text.highlight' fontFamily='Inter' fontSize='11px' fontWeight={600} sx={{ letterSpacing: '1px', mb: '25px', textTransform: 'uppercase', width: 'fit-content' }}>
            {t('To be released')}
          </Typography>
          {toBeReleased?.map((info, index) => {
            const noDivider = toBeReleased.length === index + 1;

            return (
              <React.Fragment key={index}>
                <Grid alignItems='center' container item justifyContent='space-between' key={index} sx={{ bgcolor: '#05091C', borderRadius: '12px', mb: '4px', p: '10px' }}>
                  <Typography color='text.highlight' variant='B-1' width='fit-content'>
                    {formatTimestamp(info.date, ['month', 'day', 'hours', 'minutes', 'ampm'])}
                  </Typography>
                  <FormatBalance2
                    decimalPoint={2}
                    decimals={[decimal ?? 0]}
                    style={{
                      color: '#ffffff',
                      fontFamily: 'Inter',
                      fontSize: '13px',
                      fontWeight: 500,
                      width: 'max-content'
                    }}
                    tokens={[token ?? '']}
                    value={info.amount}
                  />
                </Grid>
                {!noDivider && <GradientDivider style={{ my: '4px' }} />}
              </React.Fragment>
            );
          })}
        </Container>
        {onRestake &&
          <GradientButton
            onClick={onRestake}
            style={{ marginInline: 'auto', marginTop: '15px', width: '92%' }}
            text={t('Restake')}
          />}
      </Stack>
    </DraggableModal>
  );
}
