// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DecisionButtonProps } from './DecisionButtons';

import { Container, Stack, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { memo, type ReactNode } from 'react';

import { useIsBlueish, useIsExtensionPopup, useTranslation } from '../hooks';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { DecisionButtons, GradientButton } from '.';

interface Props {
  alertText: string;
  buttonText: string;
  decisionButtonProps: Partial<DecisionButtonProps> | undefined
  direction?: 'horizontal' | 'vertical';
  icon: ReactNode;
  isDisabled?: boolean;
  onClick: () => void;
  onDismiss?: () => void;
}

const NoPrivateKeySigningButton = ({ alertText, buttonText, decisionButtonProps, direction = 'horizontal', icon, isDisabled, onClick, onDismiss }: Props): React.ReactElement | null => {
  const isBlueish = useIsBlueish();
  const isExtension = useIsExtensionPopup();
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', rowGap: '8px'}}>
        <Warning2 color={isBlueish ? '#596AFF' : '#FFCE4F'} size={isExtension ? 35 : 24} style={{ height: 'fit-content' }} variant='Bold' />
        <Typography color={isBlueish ? 'text.highlight' : 'primary.main'} textAlign='left' variant='B-4'>
          {alertText}
        </Typography>
      </Container>
      {onDismiss
        ? (
          <DecisionButtons
            cancelButton
            direction={direction}
            disabled={isDisabled}
            onPrimaryClick={onClick}
            onSecondaryClick={onDismiss}
            primaryBtnText={buttonText}
            secondaryBtnText={t('Back')}
            style={{ width: '100%' }}
            {...decisionButtonProps}
          />)
        : <>
          {
            isBlueish
              ? (
                <StakingActionButton
                  disabled={isDisabled}
                  onClick={onClick}
                  startIcon={icon}
                  style={{ marginTop: '18px' }}
                  text={buttonText}

                />)
              : (
                <GradientButton
                  contentPlacement='center'
                  disabled={isDisabled}
                  onClick={onClick}
                  style={{
                    height: '44px',
                    marginTop: '18px'
                  }}
                  text={buttonText}
                />)
          }
        </>
      }
    </Stack>
  );
};

export default memo(NoPrivateKeySigningButton);
