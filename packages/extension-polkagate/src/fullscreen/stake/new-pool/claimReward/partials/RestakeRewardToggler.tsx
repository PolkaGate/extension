// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Stack, Typography, useTheme } from '@mui/material';
import { MagicStar } from 'iconsax-react';
import React, { useCallback } from 'react';

import { noop } from '@polkadot/util';

import { MySwitch } from '../../../../../components';
import { useIsExtensionPopup, useTranslation } from '../../../../../hooks';

export interface RestakeRewardTogglerProps {
  restake: boolean;
  setRestake: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RestakeRewardToggler({ restake, setRestake }: RestakeRewardTogglerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();
  const isDark = theme.palette.mode === 'dark';
  const isLightExtension = isExtension && !isDark;

  const enabledColor = isExtension
    ? isDark
      ? theme.palette.text.highlight
      : '#745E9F'
    : isDark
      ? '#AA83DC'
      : '#745E9F';
  const disableColor = isExtension
    ? isDark
      ? '#809acb8c'
      : '#9D8BBF'
    : isDark
      ? '#674394'
      : '#9D8BBF';
  const primaryTextColor = isLightExtension ? '#3B2C68' : 'text.primary';

  const toggler = useCallback(() => setRestake((isChecked) => !isChecked), [setRestake]);

  return (
    <Container
      disableGutters
      onClick={toggler}
      sx={{
        alignItems: 'center',
        bgcolor: isExtension ? (isDark ? '#110F2A' : '#FFFFFF') : isDark ? '#05091C' : '#FFFFFF',
        border: isDark ? 'none' : '1px solid #DDE3F4',
        borderRadius: '14px',
        boxShadow: isDark ? 'none' : '0 14px 28px rgba(133, 140, 176, 0.12)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        m: 0,
        mt: '8px',
        p: isExtension ? '14px 3px' : '14px 18px'
      }}
    >
      <MagicStar color={restake ? enabledColor : disableColor} size='24' variant='Bold' />
      <Stack direction='column' sx={{ alignItems: 'flex-start', ml: 0, mr: 'auto', width: 'fit-content' }}>
        <Typography color={restake ? primaryTextColor : enabledColor} variant='B-3'>
          {t('Restake rewards')}
        </Typography>
        <Typography color={restake ? enabledColor : disableColor} variant='B-1'>
          {t('Your tokens will return to stake')}
        </Typography>
      </Stack>
      <MySwitch
        checked={restake}
        onChange={noop}
      />
    </Container>
  );
}
