// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useContext } from 'react';

import { AccountContext } from '../../../components';
import OnboardingLayout from '../../onboarding/OnboardingLayout';
import HomeLayout from './index';

interface Props {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function AdaptiveLayout ({ children, style = {} }: Props): React.ReactElement {
  const { accounts } = useContext(AccountContext);
  const isOnboarding = !accounts?.length;
  const ChosenLayout = isOnboarding ? OnboardingLayout : HomeLayout;

  return (
    <ChosenLayout childrenStyle={{ margin: isOnboarding ? undefined : '30px 0 0 25px', maxWidth: '550px', ...style }}>
      {children}
    </ChosenLayout>
  );
}

export default React.memo(AdaptiveLayout);
