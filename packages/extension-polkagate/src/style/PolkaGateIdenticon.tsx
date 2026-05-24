// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme as BaseIconTheme } from '@polkadot/react-identicon/types';

import React, { useCallback, useContext } from 'react';
import { useTheme } from '@mui/material';
import styled from 'styled-components';

import Icon from '@polkadot/react-identicon';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { AccountIconThemeContext } from '../components';
import { useAlerts, useTranslation } from '../hooks';
import useBaseAddress from '../hooks/useBaseAddress';
import PolkaSoul from './PolkaSoul';

type IconTheme = BaseIconTheme | 'polkasoul';

interface Props {
  address?: string | null;
  className?: string;
  iconTheme?: IconTheme;
  // isSubId?: boolean;
  // judgement?: RegExpMatchArray | null | undefined;
  onCopy?: () => void;
  prefix?: number;
  size: number;
  style?: React.CSSProperties;
  withNotify?: boolean;
}

function PolkaGateIdenticon({ address, className, iconTheme, onCopy, prefix, size, style = {}, withNotify = true }: Props) {
  const theme = useTheme();
  const { accountIconTheme } = useContext(AccountIconThemeContext);
  const { t } = useTranslation();
  const { notify } = useAlerts();

  const baseAddress = useBaseAddress(address);

  const _theme = (iconTheme ?? accountIconTheme) as IconTheme | undefined;

  const onClick = useCallback(() => {
    withNotify && notify(t('Address copied!'), 'info');
  }, [notify, t, withNotify]);

  const _onCopy = useCallback(() => {
    if (!address) {
      return;
    }

    const formattedAddress = isEthereumAddress(address) ? address : baseAddress;

    formattedAddress && navigator.clipboard.writeText(formattedAddress)
      .catch((err) => console.error('Error copying text: ', err));
  }, [address, baseAddress]);

  return (
    <span className={className} onClick={onClick} style={{ '--pg-identicon-bg': theme.palette.mode === 'dark' ? '#2c2643' : '#E9ECF8', cursor: withNotify ? 'copy' : 'default', height: `${size}px`, width: `${size}px`, ...style } as React.CSSProperties}>
      {!_theme || _theme === 'polkasoul'
        ? (
          <PolkaSoul
            address={baseAddress ?? ''}
            size={size}
          />)
        : (
          <Icon
            className={_theme === 'polkadot' ? 'polkadot-icon' : 'icon'}
            isAlternative
            onCopy={onCopy ?? _onCopy}
            prefix={prefix}
            size={size}
            style={{ cursor: withNotify ? 'copy' : 'default' }}
            theme={_theme}
            value={baseAddress}
          />)
      }
    </span>
  );
}

export default React.memo(styled(PolkaGateIdenticon)(() => `
  .polkadot-icon .container:before {
    box-shadow: none;
  }

  .polkadot-icon svg {
    circle:first-of-type {
      fill: var(--pg-identicon-bg, #2c2643);
    }
  }
`));
