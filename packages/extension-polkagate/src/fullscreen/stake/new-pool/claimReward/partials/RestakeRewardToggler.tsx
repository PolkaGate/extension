// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Stack, Typography, useTheme } from '@mui/material';
import { MagicStar } from 'iconsax-react';
import React, { useCallback } from 'react';

import { noop } from '@polkadot/util';

import { GradientSwitch } from '../../../../../components';
import { useIsExtensionPopup, useTranslation } from '../../../../../hooks';

export interface RestakeRewardTogglerProps {
  restake: boolean;
  setRestake: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RestakeRewardToggler ({ restake, setRestake }: RestakeRewardTogglerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  const bluishColor = isExtension ? theme.palette.text.highlight : '#AA83DC';

  const toggler = useCallback(() => setRestake((isChecked) => !isChecked), [setRestake]);

  return (
    <Container disableGutters onClick={toggler} sx={{ alignItems: 'center', bgcolor: isExtension ? '#110F2A' : '#05091C', borderRadius: '14px', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '12px', m: 0, mt: '8px', p: '14px 18px' }}>
      <MagicStar color={restake ? bluishColor : '#674394'} size='24' variant='Bold' />
      <Stack direction='column' sx={{ alignItems: 'flex-start', ml: 0, mr: 'auto', width: 'fit-content' }}>
        <Typography color={restake ? 'text.primary' : bluishColor} variant='B-3'>
          {t('Restake rewards')}
        </Typography>
        <Typography color={restake ? bluishColor : '#674394'} variant='B-1'>
          {t('Your tokens will return to stake')}
        </Typography>
      </Stack>
      <GradientSwitch
        checked={restake}
        onChange={noop}
      />
    </Container>
  );
}
