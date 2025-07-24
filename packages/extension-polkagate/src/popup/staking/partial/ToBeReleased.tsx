// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DateAmount } from '../../../hooks/useSoloStakingInfo';

import { Container, Grid, Typography } from '@mui/material';
import { LockSlash } from 'iconsax-react';
import React from 'react';

import { ExtensionPopup, FormatBalance2, GradientDivider } from '../../../components';
import { useTranslation } from '../../../hooks';
import { formatTimestamp } from '../../../util/utils';
import StakingActionButton from './StakingActionButton';

interface Props {
  openMenu: boolean;
  handleClose: () => void;
  onRestake?: () => void;
  toBeReleased: DateAmount[];
  token: string;
  decimal: number;
}

export default function ToBeReleased ({ decimal, handleClose, onRestake, openMenu, toBeReleased, token }: Props) {
  const { t } = useTranslation();

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
        <Typography color='text.highlight' fontFamily='Inter' fontSize='11px' fontWeight={600} sx={{ letterSpacing: '1px', mb: '25px', textTransform: 'uppercase', width: 'fit-content' }}>
          {t('To be released')}
        </Typography>
        {toBeReleased.map((info, index) => {
          const noDivider = toBeReleased.length === index + 1;

          return (
            <>
              <Grid alignItems='center' container item justifyContent='space-between' key={index}>
                <Typography color='text.highlight' variant='B-1' width='fit-content'>
                  {formatTimestamp(info.date, ['month', 'day', 'hours', 'minutes', 'ampm'])}
                </Typography>
                <FormatBalance2
                  decimalPoint={2}
                  decimals={[decimal]}
                  style={{
                    color: '#ffffff',
                    fontFamily: 'Inter',
                    fontSize: '13px',
                    fontWeight: 500,
                    width: 'max-content'
                  }}
                  tokens={[token]}
                  value={info.amount}
                />
              </Grid>
              {!noDivider && <GradientDivider style={{ my: '4px' }} />}
            </>
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
