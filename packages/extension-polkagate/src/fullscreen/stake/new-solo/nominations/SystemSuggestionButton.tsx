// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Typography } from '@mui/material';
import { InfoCircle } from 'iconsax-react';
import React from 'react';

import { GradientSwitch, MyTooltip } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { SYSTEM_SUGGESTION_TEXT } from '../../../../util/constants';

interface SystemSuggestionProps {
  systemSuggestion: boolean;
  onSystemSuggestion: () => void;
  disabled: boolean;
}

export default function SystemSuggestion({ disabled, onSystemSuggestion, systemSuggestion }: SystemSuggestionProps) {
  const { t } = useTranslation();

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '6px', m: 0, width: 'fit-content' }}>
      <GradientSwitch
        checked={systemSuggestion}
        disabled={disabled}
        onChange={onSystemSuggestion}
      />
      <Typography color='text.secondary' variant='B-4'>
        {t('System Suggestions')}
      </Typography>
      <MyTooltip content={t(SYSTEM_SUGGESTION_TEXT)}>
        <InfoCircle color='#AA83DC' size='16' variant='Bold' />
      </MyTooltip>
    </Container>
  );
}
