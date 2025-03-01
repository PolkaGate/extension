// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { Grid, type SxProps, type Theme } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { SHORT_ADDRESS_CHARACTERS } from '../util/constants';
import ObserveResize from '../util/ObserveResize';
import CopyAddressButton from './CopyAddressButton';

interface Props {
  address: string | AccountId | undefined;
  charsCount?: number;
  style?: SxProps<Theme> | undefined;
  showCopy?: boolean;
  inParentheses?: boolean;
  clipped?: boolean;
}

function ShortAddress({ address, charsCount = SHORT_ADDRESS_CHARACTERS, clipped = false, inParentheses = false, showCopy = false, style }: Props): React.ReactElement {
  const [charactersCount, setCharactersCount] = useState<number>(1);
  const pRef = useRef(null);
  const cRef = useRef(null);

  const decreaseCharactersCount = useCallback(() => clipped && setCharactersCount(charactersCount - 1), [charactersCount, clipped]);

  ObserveResize(pRef?.current as unknown as Element, cRef?.current?.clientHeight + 3, decreaseCharactersCount);

  useEffect(() => {
    if (!clipped) {
      setCharactersCount(charsCount);

      return;
    }

    const offset = showCopy ? 55 : 25;

    (cRef?.current?.offsetWidth < pRef?.current?.offsetWidth - offset) && setCharactersCount(charactersCount + 1);
  }, [charsCount, clipped, showCopy, cRef.current?.offsetWidth, pRef.current?.offsetWidth, charactersCount]);

  return (
    <Grid alignItems='center' container justifyContent='center' ref={pRef} sx={{ ...style }} width='100%'>
      <Grid item ref={cRef} width='fit-content'>
        {inParentheses ? '(' : ''}
        {!charsCount || (charactersCount >= (address?.length ?? 2) / 2) ? address : `${address?.slice(0, charactersCount)}...${address?.slice(-charactersCount)}`}
        {inParentheses ? ')' : ''}
      </Grid>
      {showCopy &&
        <CopyAddressButton address={String(address)} />
      }
    </Grid>
  );
}

export default React.memo(ShortAddress);
