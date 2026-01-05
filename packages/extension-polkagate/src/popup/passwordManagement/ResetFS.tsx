// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import OnboardingLayout from '@polkadot/extension-polkagate/src/fullscreen/onboarding/OnboardingLayout';

import { ResetContent } from './Reset';

function ResetFS (): React.ReactElement {
  return (
    <OnboardingLayout childrenStyle={{ justifyContent: 'center', margin: '75px 0', width: '404px' }} showBread={false} showLeftColumn={false}>
      <ResetContent />
    </OnboardingLayout>
  );
}

export default (ResetFS);
