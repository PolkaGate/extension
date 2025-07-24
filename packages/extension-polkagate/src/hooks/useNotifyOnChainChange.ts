// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useRef } from 'react';

import { toTitleCase } from '../fullscreen/governance/utils/util';
import { useAlerts, useInfo, useTranslation } from '.';

/**
 * @description
 * notify users on chain switch
 * @returns nothing
 */
export default function useNotifyOnChainChange(address: string | undefined): undefined {
  const { accountName, chainName } = useInfo(address);
  const { t } = useTranslation();
  const { notify } = useAlerts();
  const ref = useRef(chainName);

  useEffect(() => {
    if (chainName && ref.current && ref.current !== chainName) {
      notify(
        t('{{accountName}} default chain switched to {{chainName}}.',
          { replace: { accountName: accountName || 'Unknown', chainName: toTitleCase(chainName) } }),
        'info'
      );
    }

    if (chainName) {
      ref.current = chainName;
    }
  }, [accountName, chainName, notify, t]);
}
