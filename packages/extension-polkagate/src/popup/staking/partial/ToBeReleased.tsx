// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DateAmount } from '../../../hooks/useSoloStakingInfo';

import { Container, Grid, Typography } from '@mui/material';
import { LockSlash } from 'iconsax-react';
import React from 'react';

import { DisplayBalance, ExtensionPopup, GradientDivider } from '../../../components';
import { useIsDark, useTranslation } from '../../../hooks';
import { formatTimestamp } from '../../../util';
import StakingActionButton from './StakingActionButton';

interface Props {
  openMenu: boolean;
  handleClose: () => void;
  onRestake?: () => void;
  toBeReleased: DateAmount[];
  token: string;
  decimal: number;
}

export default function ToBeReleased({ decimal, handleClose, onRestake, openMenu, toBeReleased, token }: Props) {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const labelColor = isDark ? '#AA83DC' : '#745E9F';
  const valueColor = isDark ? '#FFFFFF' : '#3B2C68';
  const rowTextColor = isDark ? '#FFFFFF' : '#6F5A96';
  const rowBgColor = isDark ? 'transparent' : '#FFFFFF';
  const rowBorder = isDark ? 'none' : '1px solid #E3E8F7';
  const rowShadow = isDark ? 'none' : '0px 12px 24px rgba(148, 163, 184, 0.12)';

  return (
    <ExtensionPopup
      TitleIcon={LockSlash}
      darkBackground
      handleClose={handleClose}
      iconSize={22}
      openMenu={openMenu}
      style={{
        '> div#container': {
          height: 'fit-content',
          zIndex: 1
        },
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'flex-end'
      }}
      title={t('Unstaking')}
      withoutTopBorder
    >
      <Container disableGutters sx={{ maxHeight: '360px', mb: '15px', overflowY: 'auto', p: '8px' }}>
        <Typography color={labelColor} fontFamily='Inter' fontSize='11px' fontWeight={600} sx={{ letterSpacing: '1px', mb: '25px', textTransform: 'uppercase', width: 'fit-content' }}>
          {t('To be released')}
        </Typography>
        {toBeReleased.map((info, index) => {
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
                  p: isDark ? 0 : '10px'
                }}
              >
                <Typography color={rowTextColor} variant='B-1' width='fit-content'>
                  {formatTimestamp(info.date, ['month', 'day', 'hours', 'minutes', 'ampm'])}
                </Typography>
                <DisplayBalance
                  balance={info.amount}
                  decimal={decimal}
                  decimalPoint={2}
                  style={{
                    color: valueColor,
                    fontFamily: 'Inter',
                    fontSize: '13px',
                    fontWeight: 500,
                    width: 'max-content'
                  }}
                  token={token}
                />
              </Grid>
              {!noDivider && <GradientDivider style={{ my: '4px' }} />}
            </React.Fragment>
          );
        })}
        {onRestake &&
          <StakingActionButton
            onClick={onRestake}
            style={{ marginTop: '35px', width: '337px' }}
            text={t('Restake')}
          />}
      </Container>
    </ExtensionPopup>
  );
}
