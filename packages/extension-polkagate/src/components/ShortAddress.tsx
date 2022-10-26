// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import { Grid, SxProps, Theme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { SHORT_ADDRESS_CHARACTERS } from '../util/constants';
import CopyAddressButton from './CopyAddressButton';

interface Props {
  address: string | AccountId | undefined;
  charsCount?: number;
  addressStyle?: SxProps<Theme> | undefined;
  showCopy?: boolean;
  inParentheses?: boolean;
  clipped?: boolean;
}

export default function ShortAddress ({ address, clipped = false, charsCount = SHORT_ADDRESS_CHARACTERS, addressStyle, showCopy = false, inParentheses = false }: Props): React.ReactElement {
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
    <Grid
      alignItems='center'
      container
      justifyContent='center'
      ref={ref}
      sx={{ ...addressStyle }}
    >
      <Grid
        item
        ref={ref}
      >
        {inParentheses ? '(' : ''}
        {!charsCount ? address : `${address?.slice(0, charactersCount)}...${address?.slice(-charactersCount)}`}
        {inParentheses ? ')' : ''}
      </Grid>
      {showCopy &&
        <CopyAddressButton
          address={String(address)}
        />
      }
    </Grid>
  );
}
