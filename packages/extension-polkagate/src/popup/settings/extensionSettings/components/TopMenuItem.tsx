// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { noop } from '@polkadot/util';

import { ActionContext } from '../../../../components/contexts';
import useIsDark from '../../../../hooks/useIsDark';

interface Props {
  Icon: Icon
  label: string;
  path: string;
  setPosition: React.Dispatch<React.SetStateAction<DOMRect | null>>
}

function TopMenuItem ({ Icon, label, path, setPosition }: Props): React.ReactElement {
  const onAction = useContext(ActionContext);
  const { pathname } = useLocation();
  const isDark = useIsDark();
  const refContainer = useRef<HTMLDivElement>(null);

  const isSelected = pathname === `/settings-extension/${path}`;
  const onClick = useCallback(() => onAction(`/settings-extension/${path}`), [onAction, path]);

  useEffect(() => {
    if (isSelected && refContainer.current) {
      setPosition(refContainer.current.getBoundingClientRect());
    }
  }, [isSelected, setPosition]);

  return (
    <Stack columnGap='4px' onClick={onClick} direction='row' ref={refContainer} sx={{ cursor: 'pointer' }}>
      <Icon color={isDark ? (isSelected ? '#EAEBF1' : '#AA83DC') : (isSelected ? '#FF4FB9' : '#8F97B8')} onClick={noop} size='18' style={{ cursor: 'pointer' }} variant='Bulk' />
      <Typography color={isDark ? (isSelected ? '#EAEBF1' : '#AA83DC') : (isSelected ? '#291443' : '#8F97B8')} variant='B-2'>
        {label}
      </Typography>
    </Stack>
  );
}

export default React.memo(TopMenuItem);
