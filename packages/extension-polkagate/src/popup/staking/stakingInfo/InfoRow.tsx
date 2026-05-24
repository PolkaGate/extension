// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { TwoToneText } from '@polkadot/extension-polkagate/src/components';
import { useIsExtensionPopup } from '@polkadot/extension-polkagate/src/hooks';

interface Props {
  Icon: Icon;
  text: string;
  textPartInColor: string;
}

function InfoRow({ Icon, text, textPartInColor }: Props): React.ReactElement {
  const isExtension = useIsExtensionPopup();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const variant = isExtension ? 'B-3' : 'B-2';
  const iconColor = theme.palette.accent.icon;
  const iconBackground = isDark
    ? 'linear-gradient(180deg, #674394 0%, #4B2A75 50%, #171739 100%)'
    : 'linear-gradient(180deg, #E8DEF8 0%, #D6C7EA 52%, #C4B3DD 100%)';
  const textColor = theme.palette.accent.text;
  const highlightColor = isDark ? '#AA83DC' : '#9B6BE8';

  return (
    <Stack alignItems='center' columnGap='10px' direction='row'>
      <Stack
        alignItems='center' justifyContent='center' sx={{
          backgroundImage: iconBackground,
          borderRadius: '16px',
          boxShadow: isDark ? 'none' : '0 8px 18px rgba(116, 93, 139, 0.16)',
          height: 48,
          overflow: 'hidden',
          transform: 'rotate(-12deg)',
          width: 48
        }}
        width='70px'
      >
        <Icon
          color={iconColor}
          size={32}
          style={{ transform: 'rotate(-12deg)' }}
          variant='Bulk'
        />
      </Stack>
      <Stack sx={{ flexFlow: 'wrap' }} width='290px'>
        <Typography color={textColor} textAlign='left' variant={variant}>
          <TwoToneText
            color={highlightColor}
            text={text}
            textPartInColor={textPartInColor}
          />
        </Typography>
      </Stack>
    </Stack>
  );
}

export default InfoRow;
