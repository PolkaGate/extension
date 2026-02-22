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

  const enabledColor = isExtension ? theme.palette.text.highlight : '#AA83DC';
  const disableColor = isExtension ? '#809acb8c' : '#674394';

  const toggler = useCallback(() => setRestake((isChecked) => !isChecked), [setRestake]);

  return (
    <Container disableGutters onClick={toggler} sx={{ alignItems: 'center', bgcolor: isExtension ? '#110F2A' : '#05091C', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '12px', m: 0, mt: '8px', p: isExtension ? '14px 3px' : '14px 18px' }}>
      <MagicStar color={restake ? enabledColor : disableColor} size='24' variant='Bold' />
      <Stack direction='column' sx={{ alignItems: 'flex-start', ml: 0, mr: 'auto', width: 'fit-content' }}>
        <Typography color={restake ? 'text.primary' : enabledColor} variant='B-3'>
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
