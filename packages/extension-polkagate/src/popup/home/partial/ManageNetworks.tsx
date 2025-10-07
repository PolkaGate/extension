// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTheme } from '@mui/material';
import { Setting4 } from 'iconsax-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { MyTooltip } from '@polkadot/extension-polkagate/src/components';
import { useIsExtensionPopup, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useIsHovered from '@polkadot/extension-polkagate/src/hooks/useIsHovered2';
import { windowOpen } from '@polkadot/extension-polkagate/src/messaging';

function ManageNetworks (): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();
  const { isHovered, ref } = useIsHovered();
  const navigate = useNavigate();

  const onClick = useCallback(() => {
    isExtension
      ? navigate('/settings-extension/chains', { state: { from: '/' } }) as void
      : windowOpen('/settingsfs/network').catch(console.error);
  }, [isExtension, navigate]);

  return (
    <MyTooltip content={t('Missing tokens? Manage Networks!')} placement='left'>
      <div
        ref={ref}
        style={{
          cursor: 'pointer',
          display: 'inline-block',
          transition: 'color 0.2s ease-in-out'
        }}
      >
        <Setting4
          color={isHovered ? '#EAEBF1' : theme.palette.menuIcon.active}
          onClick={onClick}
          size={isExtension ? '22' : '20'}
          variant={ isExtension ? 'Bulk' : 'Bold'}
        />
      </div>
    </MyTooltip>
  );
}

export default ManageNetworks;
