// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '@polkadot/extension-polkagate/src/util/types';
import type { ExtraFilters } from './types';

import { Discover } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import { DropSelect } from '../../components';
import { resolveActionType, toTitleCase } from '../../util';
import { ALL_TYPES } from './consts';
import HistoryIcon from './HistoryIcon';

interface Props {
  allHistories: TransactionDetail[] | null | undefined;
  setExtraFilters: React.Dispatch<React.SetStateAction<ExtraFilters>>;
  extraFilters: ExtraFilters
}

function TransactionTypeDropDown ({ allHistories, extraFilters, setExtraFilters }: Props): React.ReactElement {
  const options = useMemo(() => {
    const _actions: Record<string, { Icon?: React.JSX.Element; action: string; count: number }> = {
      [ALL_TYPES]: {
        Icon: <Discover color='#AA83DC' size='20' variant='Bulk' />,
        action: 'all',
        count: allHistories?.length || 0
      }
    };

    allHistories?.forEach((item) => {
      const action = resolveActionType(item);
      const subAction = item.subAction || 'unknown';

      if (!_actions[subAction]) {
        _actions[subAction] = { action, count: 0 };
      }

      _actions[subAction].count = _actions[subAction].count + 1;
    });

    return Object.entries(_actions).map(([key, { Icon, action, count }]) => ({
      Icon: Icon ?? <HistoryIcon action={action} />,
      count,
      text: toTitleCase(key) ?? 'unknown',
      value: key
    }));
  }, [allHistories]);

  const handleChange = useCallback((value: string | number) => {
    setExtraFilters((prev) => ({ ...prev, type: String(value) }));
  }, [setExtraFilters]);

  return (
    <DropSelect
      contentDropWidth={250}
      displayContentType='iconOption'
      onChange={handleChange}
      options={options}
      scrollTextOnOverflow
      showCheckAsIcon
      style={{ height: '42px', margin: '0', width: '180px' }}
      value={extraFilters?.type ?? ALL_TYPES}
    />
  );
}

export default TransactionTypeDropDown;
