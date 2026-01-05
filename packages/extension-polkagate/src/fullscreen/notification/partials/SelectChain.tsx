// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TextValuePair } from '@polkadot/extension-polkagate/src/popup/notification/NotificationSettings';

import { Stack } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { GradientButton, Motion } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import ChainToggle from '@polkadot/extension-polkagate/src/popup/notification/partials/ChainToggle';
import { sanitizeChainName } from '@polkadot/extension-polkagate/src/util';

interface Props {
  onChains: (addresses: string[]) => () => void;
  previousState: string[] | undefined;
  options: TextValuePair[];
}

export default function SelectChain ({ onChains, options, previousState }: Props) {
  const { t } = useTranslation();

  const [selectedChains, setSelectedChains] = useState<string[]>(previousState ?? []);

  // Ensure state updates when previousState changes
  useEffect(() => {
    if (previousState) {
      setSelectedChains(previousState);
    }
  }, [previousState]);

  // Handles selecting or deselecting
  const handleSelect = useCallback((newSelect: string) => {
    setSelectedChains((prev) => {
      const alreadySelected = prev.includes(newSelect);

    if (alreadySelected) {
      // If is already selected, remove it
      return prev.filter((chain) => chain !== newSelect);
    }

    // add
    return [...prev, newSelect];
    });
  }, []);

  return (
    <Motion style={{ paddingInline: '5px', paddingTop: '12px', position: 'relative', zIndex: 1 }} variant='slide'>
      <Stack direction='column' sx={{ gap: '16px', height: '430px', maxHeight: '430px', overflowY: 'auto', position: 'relative', px: '6px' }}>
        {options.map(({ text, value }) => {
          const isSelected = selectedChains.includes(value);

          return (
            <ChainToggle
              checked={isSelected}
              genesis={value}
              key={value}
              onSelect={handleSelect}
              text={sanitizeChainName(text)}
            />
          );
        })}
      </Stack>
      <GradientButton
        onClick={onChains(selectedChains)}
        style={{ marginTop: '10px' }}
        text={t('Apply')}
      />
    </Motion>
  );
}
