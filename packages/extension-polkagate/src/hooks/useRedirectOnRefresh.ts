// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useRedirectOnRefresh(path: string | undefined): void {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.performance) {
      if (performance.navigation.type === 1) {
        navigate(
          path
        );
      }
    }
  }, [path, navigate]);
}
