// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import { Grid, IconButton, SxProps, Theme, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { SHORT_ADDRESS_CHARACTERS } from '../util/constants';

interface Props {
  address: string | AccountId | undefined;
  charsCount?: number;
  addressStyle?: SxProps<Theme> | undefined;
  showCopy?: boolean;
  inParentheses?: boolean;
  clipped?: boolean;
}

export default function ShortAddress({ address, clipped = false, charsCount = SHORT_ADDRESS_CHARACTERS, addressStyle, showCopy = false, inParentheses = false }: Props): React.ReactElement {
  const theme = useTheme();
  const [charactersCount, setCharactersCount] = useState<number>(charsCount);
  const ref = useRef(null);

  useEffect(() => {
    if (!clipped) {
      return;
    }

    const charLong = ref?.current?.offsetHeight > 30 ? 15 : 14;
    const counter = Math.round((ref?.current?.offsetWidth) / charLong);

    counter % 2 === 0 ? setCharactersCount(counter) : setCharactersCount(counter - 1);
  }, [charsCount, clipped, showCopy, ref?.current?.offsetWidth, ref?.current?.offsetHeight]);

  return (
    <Grid alignItems='center' container justifyContent='center' ref={ref} sx={{ ...addressStyle }}>
      <Grid item ref={ref}>
        {inParentheses ? '(' : ''}
        {!charsCount ? address : `${address?.slice(0, charactersCount)}...${address?.slice(-charactersCount)}`}
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
