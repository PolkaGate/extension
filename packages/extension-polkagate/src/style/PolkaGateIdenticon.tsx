// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme as BaseIconTheme } from '@polkadot/react-identicon/types';

import React, { useContext } from 'react';

import Icon from '@polkadot/react-identicon';

import { AccountIconThemeContext } from '../components';
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
}

function PolkaGateIdenticon ({ address, iconTheme, onCopy, prefix, size, style = {} }: Props) {
  const { accountIconTheme } = useContext(AccountIconThemeContext);

  const _theme = (iconTheme ?? accountIconTheme) as IconTheme | undefined;

  return (
    <span style={{ ...style }}>
      {!_theme || _theme === 'polkasoul'
        ? <PolkaSoul
          address={address ?? ''}
          size={size}
        />
        : <Icon
          className='icon'
          onCopy={onCopy}
          prefix={prefix}
          size={size}
          theme={_theme}
          value={address}
        />
      }
    </span>
  );
}

export default PolkaGateIdenticon;
