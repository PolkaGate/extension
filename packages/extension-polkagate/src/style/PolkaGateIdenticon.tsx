// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme as BaseIconTheme } from '@polkadot/react-identicon/types';

import React, { useCallback, useContext } from 'react';

import Icon from '@polkadot/react-identicon';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { AccountIconThemeContext } from '../components';
import { useAlerts, useTranslation } from '../hooks';
import PolkaSoul from './PolkaSoul';

type IconTheme = BaseIconTheme | 'polkasoul';

interface Props {
  address?: string | null;
  iconTheme?: IconTheme;
  // isSubId?: boolean;
  // judgement?: RegExpMatchArray | null | undefined;
  onCopy?: () => void;
  prefix?: number;
  size: number;
  style?: React.CSSProperties;
  withNotify?: boolean;
}

function PolkaGateIdenticon ({ address, iconTheme, onCopy, prefix, size, style = {}, withNotify = true }: Props) {
  const { accountIconTheme } = useContext(AccountIconThemeContext);
  const { t } = useTranslation();
  const { notify } = useAlerts();

  const _theme = isEthereumAddress(String(address))
    ? 'polkasoul'
    : (iconTheme ?? accountIconTheme) as IconTheme | undefined;

  const onClick = useCallback(() => {
    withNotify && notify(t('Address copied!'), 'info');
  }, [notify, t, withNotify]);

  return (
    <span onClick={onClick} style={{ cursor: withNotify ? 'copy' : 'default', height: `${size}px`, width: `${size}px`, ...style }}>
      {!_theme || _theme === 'polkasoul'
        ? (
          <PolkaSoul
            address={address ?? ''}
            size={size}
          />)
        : (
          <Icon
            className='icon'
            onCopy={onCopy}
            prefix={prefix}
            size={size}
            style={{ cursor: withNotify ? 'copy' : 'default'}}
            theme={_theme}
            value={address}
          />)
      }
    </span>
  );
}

export default PolkaGateIdenticon;
