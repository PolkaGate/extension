// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

export default function useRedirectOnRefresh(path: string | undefined): void {
  const history = useHistory();

  useEffect(() => {
    if (window.performance) {
      if (performance.navigation.type === 1) {
        history.push({
          pathname: path
        });
      }
    }
  }, [path, history]);
}
