// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';

import OnboardingLayout from '@polkadot/extension-polkagate/src/fullscreen/onboarding/OnboardingLayout';
import { switchToOrOpenTab } from '@polkadot/extension-polkagate/src/util/switchToOrOpenTab';

import { ForgotPasswordContent } from './ForgotPassword';

export default function ForgotPasswordFS(): React.ReactElement {
  const onClose = useCallback(() => {
    switchToOrOpenTab('/');
  }, []);

  return (
    <OnboardingLayout childrenStyle={{ justifyContent: 'center', margin: '75px 0', width: '404px' }} showBread={false} showLeftColumn={false}>
      <ForgotPasswordContent onClose={onClose} />
    </OnboardingLayout>
  );
}
