// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtraFilters } from './types';

import { Chart, CloseCircle, TickCircle } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import { DropSelect } from '../../components';
import { useTranslation } from '../../hooks';
import { ANY_STATUS } from './consts';

interface Props {
  setExtraFilters: React.Dispatch<React.SetStateAction<ExtraFilters>>;
  extraFilters: ExtraFilters
}

function StatusDropDown ({ extraFilters, setExtraFilters }: Props): React.ReactElement {
  const { t } = useTranslation();

  const options = useMemo(() => {
    return [
      {
        Icon: <Chart color='#AA83DC' size='20' variant='Bulk' />,
        text: t('Any status'),
        value: ANY_STATUS
      },
      {
        Icon: <TickCircle color='#82FFA5' size='14' variant='Bold' />,
        text: t('Completed'),
        value: 'Completed'
      },
      {
        Icon: <CloseCircle color='#FF4FB9' size='14' variant='Bold' />,
        text: t('Failed'),
        value: 'Failed'
      }
    ];
  }, [t]);

  const handleChange = useCallback((value: string | number) => {
    setExtraFilters((prev) => ({ ...prev, status: String(value) }));
  }, [setExtraFilters]);

  return (
    <DropSelect
      contentDropWidth={150}
      displayContentType='iconOption'
      onChange={handleChange}
      options={options}
      scrollTextOnOverflow
      showCheckAsIcon
      style={{ height: '42px', margin: '0', width: '140px' }}
      value={extraFilters?.status ?? ANY_STATUS}
    />
  );
}

export default StatusDropDown;
