// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DecisionButtonProps } from './DecisionButtons';

import { Container, Stack, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { memo, type ReactNode } from 'react';

import { useIsBlueish, useIsExtensionPopup, useTranslation } from '../hooks';
import { DecisionButtons, VariantButton } from '.';

interface Props {
  alertText: string;
  buttonText: string;
  decisionButtonProps: Partial<DecisionButtonProps> | undefined
  direction?: 'horizontal' | 'vertical';
  icon: ReactNode;
  isDisabled?: boolean;
  onClick: () => void;
  onDismiss?: () => void;
  withCancel?: boolean;
}

const NoPrivateKeySigningButton = ({ alertText, buttonText, decisionButtonProps, direction = 'horizontal', icon, isDisabled, onClick, onDismiss, withCancel }: Props): React.ReactElement | null => {
  const { t } = useTranslation();
  const isBlueish = useIsBlueish();
  const isExtension = useIsExtensionPopup();

  return (
    <Stack direction='column' sx={{ rowGap: '8px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', columnGap: '8px' }}>
        <Warning2 color={isBlueish ? '#596AFF' : '#FFCE4F'} size={isExtension ? 35 : 24} style={{ height: 'fit-content' }} variant='Bold' />
        <Typography color={isBlueish ? 'text.highlight' : 'primary.main'} textAlign='left' variant='B-4'>
          {alertText}
        </Typography>
      </Container>
      {onDismiss && withCancel
        ? (<DecisionButtons
          cancelButton
          direction={direction}
          disabled={isDisabled}
          flexibleWidth
          onPrimaryClick={onClick}
          onSecondaryClick={onDismiss}
          primaryBtnText={buttonText}
          secondaryBtnText={t('Back')}
          style={{ width: '100%' }}
          {...decisionButtonProps}
        />)
        : (<VariantButton
          disabled={isDisabled}
          isBlueish={isBlueish}
          onClick={onClick}
          startIcon={icon}
          style={{ height: '44px', marginTop: '18px' }}
          text={buttonText}
        />)
      }
    </Stack>
  );
};

export default memo(NoPrivateKeySigningButton);
