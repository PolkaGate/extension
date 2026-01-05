// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

export class AiInsightErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  override componentDidCatch(error: Error) {
    console.error('AiInsight render error:', error);
  }

  override render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
