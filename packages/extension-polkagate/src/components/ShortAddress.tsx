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

export default function ShortAddress({ address, clipped = false, charsCount = SHORT_ADDRESS_CHARACTERS, addressStyle, showCopy = false, inParentheses = false }: Props): React.ReactElement {
  const [charactersCount, setCharactersCount] = useState<number>(address?.length / 2);
  const ref = useRef(null);

  useEffect(() => {
    if (!clipped) {
      setCharactersCount(charsCount);
      return;
    }

    (ref?.current?.offsetHeight > 30) && setCharactersCount(charactersCount - 1);
  }, [charsCount, clipped, showCopy, ref.current?.offsetWidth, ref.current?.offsetHeight, charactersCount]);

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
