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

function ShortAddress({ address, clipped = false, charsCount = SHORT_ADDRESS_CHARACTERS, addressStyle, showCopy = false, inParentheses = false }: Props): React.ReactElement {
  const [charactersCount, setCharactersCount] = useState<number>(1);
  const pRef = useRef(null);
  const cRef = useRef(null);

  useEffect(() => {
    if (!clipped) {
      setCharactersCount(charsCount);

      return;
    }

    const offset = showCopy ? 55 : 25;

    (cRef?.current?.offsetWidth < pRef?.current?.offsetWidth - offset) && setCharactersCount(charactersCount + 1);
  }, [charsCount, clipped, showCopy, cRef.current?.offsetWidth, pRef.current?.offsetWidth, charactersCount]);

  return (
    <Grid
      alignItems='center'
      container
      justifyContent='center'
      ref={pRef}
      sx={{ ...addressStyle }}
      width='100%'
    >
      <Grid
        item
        ref={cRef}
        width='fit-content'
      >
        {inParentheses ? '(' : ''}
        {!charsCount || (charactersCount === address?.length / 2) ? address : `${address?.slice(0, charactersCount)}...${address?.slice(-charactersCount)}`}
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

export default React.memo(ShortAddress);