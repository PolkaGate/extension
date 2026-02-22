// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '../../../util/handleExtensionPopup';
import type { TextValuePair } from '../NotificationSettings';

import { Stack } from '@mui/material';
import { UserOctagon } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { sanitizeChainName } from '@polkadot/extension-polkagate/src/util';

import { ExtensionPopup, GradientButton, GradientDivider } from '../../../components';
import { useTranslation } from '../../../hooks';
import ChainToggle from './ChainToggle';

interface Props {
  onClose: ExtensionPopupCloser;
  open: boolean;
  onChains: (addresses: string[]) => () => void;
  previousState: string[] | undefined;
  options: TextValuePair[];
  title: string;
}

/**
 * A component for selecting chains. It allows the user to choose
 * on which chains see their notifications.
 *
 * Only has been used in extension mode!
 */
function SelectChain({ onChains, onClose, open, options, previousState, title }: Props): React.ReactElement {
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
    <ExtensionPopup
      TitleIcon={UserOctagon}
      handleClose={onClose}
      iconSize={24}
      openMenu={open}
      pt={20}
      style={{ '> div#container': { pt: '8px' } }}
      title={title}
      withoutTopBorder
    >
      <Stack direction='column' sx={{ gap: '12px', position: 'relative', zIndex: 1 }}>
        <GradientDivider />
        <Stack direction='column' sx={{ gap: '12px', height: '350px', maxHeight: '350px', overflowY: 'auto', px: '6px' }}>
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
      </Stack>
    </ExtensionPopup>
  );
}

export default React.memo(SelectChain);
