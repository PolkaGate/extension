// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DateAmount } from '../../hooks/useSoloStakingInfo';

import { Container, Grid, Stack, Typography } from '@mui/material';
import React from 'react';

import { DisplayBalance, GradientButton, GradientDivider } from '../../components';
import { useChainInfo, useIsDark, useTranslation } from '../../hooks';
import { formatTimestamp } from '../../util';
import { DraggableModal } from '../components/DraggableModal';

interface Props {
  genesisHash: string | undefined;
  onClose: () => void;
  onRestake?: () => void;
  toBeReleased: DateAmount[] | undefined;
}

export default function ToBeReleased({ genesisHash, onClose, onRestake, toBeReleased }: Props) {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const labelColor = isDark ? '#AA83DC' : '#745E9F';
  const valueColor = isDark ? '#FFFFFF' : '#3B2C68';
  const rowTextColor = isDark ? '#FFFFFF' : '#6F5A96';
  const rowBgColor = isDark ? '#05091C' : '#FFFFFF';
  const rowBorder = isDark ? 'none' : '1px solid #E3E8F7';
  const rowShadow = isDark ? 'none' : '0px 12px 24px rgba(148, 163, 184, 0.12)';

  return (
    <DraggableModal
      closeOnAnyWhereClick
      maxHeight={475}
      minHeight={475}
      onClose={onClose}
      open
      showBackIconAsClose
      title={t('Unstaking')}
    >
      <Stack direction='column' sx={{ position: 'relative', width: '100%', zIndex: 1 }}>
        <Container disableGutters sx={{ height: '300px', maxHeight: '300px', mb: '10px', overflowY: 'auto', p: '16px' }}>
          <Typography color={labelColor} fontFamily='Inter' fontSize='11px' fontWeight={600} sx={{ letterSpacing: '1px', mb: '25px', textTransform: 'uppercase', width: 'fit-content' }}>
            {t('To be released')}
          </Typography>
          {toBeReleased?.map(({ amount, date }, index) => {
            const noDivider = toBeReleased.length === index + 1;

            return (
              <React.Fragment key={index}>
                <Grid
                  alignItems='center'
                  container
                  item
                  justifyContent='space-between'
                  key={index}
                  sx={{
                    bgcolor: rowBgColor,
                    border: rowBorder,
                    borderRadius: '12px',
                    boxShadow: rowShadow,
                    mb: '4px',
                    p: '10px'
                  }}
                >
                  <Typography color={rowTextColor} variant='B-1' width='fit-content'>
                    {formatTimestamp(date, ['month', 'day', 'hours', 'minutes', 'ampm'])}
                  </Typography>
                  <DisplayBalance
                    balance={amount}
                    decimal={decimal}
                    decimalPoint={2}
                    style={{
                      color: valueColor,
                      width: 'max-content'
                    }}
                    token={token}
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
