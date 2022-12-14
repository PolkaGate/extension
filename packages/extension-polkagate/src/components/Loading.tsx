// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { useTranslation } from '../hooks';

interface Props {
  children?: React.ReactNode;
}

export default function Loading({ children }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  if (!children) {
    return (
      <div>{t<string>('... PolkaGate is loading ...')}</div>
    );
  }

  return (
    <>{children}</>
  );
}
