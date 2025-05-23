// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { CheckCircleOutline as CheckIcon, InsertLinkRounded as LinkIcon } from '@mui/icons-material';
import React, { useContext } from 'react';
import styled from 'styled-components';

import Icon from '@polkadot/react-identicon';

import { AccountIconThemeContext } from '.';

interface Props {
  className?: string;
  iconTheme?: IconTheme;
  isSubId?: boolean;
  judgement?: RegExpMatchArray | null | undefined;
  onCopy?: () => void;
  prefix?: number;
  size: number;
  value?: AccountId | string | null;
}

function Identicon({ className, iconTheme, isSubId, judgement, onCopy, prefix, size, value }: Props): React.ReactElement<Props> {
  const { accountIconTheme } = useContext(AccountIconThemeContext);

  return (
    <div style={{ position: 'relative' }}>
      <div className={className}>
        <Icon
          className='icon'
          onCopy={onCopy}
          prefix={prefix}
          size={size}
          theme={accountIconTheme || iconTheme}
          value={value}
        />
      </div>
      {!!judgement?.length &&
        <>
          {
            isSubId
              ? <LinkIcon
                sx={{
                  bgcolor: 'success.main',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: 0.4 * size,
                  left: `${size * 0.6}px`,
                  position: 'absolute',
                  top: 0,
                  transform: 'rotate(-45deg)'
                }}
              />
              : <CheckIcon
                sx={{
                  bgcolor: 'success.main',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: 0.4 * size,
                  left: `${size * 0.6}px`,
                  position: 'absolute',
                  top: 0
                }}
              />
          }
        </>
      }
    </div>
  );
}

export default React.memo(styled(Identicon)(() => `
  background: rgba(192, 192, 292, 0.25);
  border-radius: 50%;
  display: flex;
  justify-content: center;

  .container:before {
    box-shadow: none;
  }

  svg {
    circle:first-of-type {
      display: none;
    }
  }
`));
