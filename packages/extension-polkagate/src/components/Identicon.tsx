// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';
import type { ThemeProps } from '../types';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import React from 'react';
import styled from 'styled-components';

import Icon from '@polkadot/react-identicon';

interface Props {
  className?: string;
  iconTheme?: IconTheme;
  isExternal?: boolean | null;
  onCopy?: () => void;
  prefix?: number;
  value?: string | null;
  size?: number;
  judgement?: RegExpMatchArray | null | undefined
}

function Identicon({ className, iconTheme, judgement, onCopy, prefix, size, value }: Props): React.ReactElement<Props> {
  return (
    <div style={{ position: 'relative' }}>
      <div className={className}>
        <Icon
          className='icon'
          onCopy={onCopy}
          prefix={prefix}
          size={size}
          theme={iconTheme}
          value={value}
        />
      </div>
      {judgement?.length &&
        <CheckCircleOutlineIcon
          sx={{
            bgcolor: 'success.main',
            borderRadius: '50%',
            color: 'white',
            // stroke: 'white',
            fontSize: 10,
            left: '15px',
            position: 'absolute',
            top: 0
          }}
        />
      }
    </div>
  );
}

export default styled(Identicon)(({ theme }: ThemeProps) => `
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
`);