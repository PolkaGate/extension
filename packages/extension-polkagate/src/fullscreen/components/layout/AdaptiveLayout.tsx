// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useContext, useRef } from 'react';

import { AccountContext } from '../../../components';
import OnboardingLayout from '../../onboarding/OnboardingLayout';
import HomeLayout from './index';

interface Props {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function AdaptiveLayout ({ children, style = {} }: Props): React.ReactElement {
  const { accounts } = useContext(AccountContext);
  const isOnboarding = useRef(!accounts?.length);
  const ChosenLayout = isOnboarding.current ? OnboardingLayout : HomeLayout;

  return (
    <ChosenLayout childrenStyle={{ margin: isOnboarding.current ? undefined : '30px 0 0 25px', maxWidth: '550px', ...style }}>
      {children}
    </ChosenLayout>
  );
}

export default React.memo(AdaptiveLayout);
