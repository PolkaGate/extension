// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import { Grid, IconButton, useTheme } from '@mui/material';
import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { SHORT_ADDRESS_CHARACTERS } from '../util/constants';

interface Props {
  address: string | AccountId | undefined;
  charsCount?: number;
  addressStyle?: any;
  showCopy?: boolean;
  inParentheses?: boolean;
}

export default function ShortAddress({ address, charsCount = SHORT_ADDRESS_CHARACTERS, addressStyle = {}, showCopy = false, inParentheses = false }: Props): React.ReactElement {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container justifyContent='center' sx={addressStyle}>
      <Grid item pr={showCopy ? 1 : 0}>
        {inParentheses ? '(' : ''}
        {!charsCount ? address : `${address?.slice(0, charsCount)}...${address?.slice(-charsCount)}`}
        {inParentheses ? ')' : ''}
      </Grid>
      {showCopy &&
        <Grid item>
          <CopyToClipboard text={String(address)}>
            <IconButton
              sx={{ height: '20px', p: '0px', width: '20px' }}
            // onClick={_onCopy}
            >
              <vaadin-icon icon='vaadin:copy-o' style={{ color: `${theme.palette.secondary.light}` }} />
            </IconButton>
          </CopyToClipboard>
        </Grid>
      }
    </Grid>
  );
}
