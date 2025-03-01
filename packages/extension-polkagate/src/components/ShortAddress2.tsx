// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { Grid, type SxProps, type Theme } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { SHORT_ADDRESS_CHARACTERS } from '../util/constants';
import CopyAddressButton from './CopyAddressButton';

interface Props {
  address: string | AccountId | undefined;
  charsCount?: number;
  style?: SxProps<Theme> | undefined;
  showCopy?: boolean;
  inParentheses?: boolean;
  clipped?: boolean;
}

function ShortAddress2({ address, charsCount = SHORT_ADDRESS_CHARACTERS, clipped = false, inParentheses = false, showCopy = false, style }: Props): React.ReactElement {
  const [charactersCount, setCharactersCount] = useState<number>(charsCount);
  const pRef = useRef<HTMLDivElement>(null);
  const cRef = useRef<HTMLDivElement>(null);

  const resizer = useCallback(() => {
    const offset = showCopy ? 55 : 25;

    const wholeWidth = pRef.current?.offsetWidth ? pRef.current.offsetWidth - offset : 0;
    const requiredWidth = cRef.current?.scrollWidth ?? 0;
    const availableWidth = wholeWidth - requiredWidth;

    if (availableWidth > 15 && charactersCount < String(address).length) {
      setCharactersCount(charactersCount + 3);
    } else if (availableWidth <= 5) {
      setCharactersCount(charactersCount - 1);
    }
  }, [address, charactersCount, showCopy]);

  useEffect(() => {
    if (!clipped) {
      setCharactersCount(charsCount);

      return;
    }

    resizer();
  }, [resizer, charsCount, clipped, pRef.current?.offsetWidth]);

  return (
    <Grid alignItems='center' container justifyContent='space-between' ref={pRef} sx={style}>
      <Grid item maxWidth='82%' ref={cRef} width='fit-content'>
        {inParentheses && '('}
        {!charactersCount || charactersCount >= (address?.length ?? 2) / 2
          ? address
          : `${String(address)?.slice(0, charactersCount)}...${String(address)?.slice(-charactersCount)}`}
        {inParentheses && ')'}
      </Grid>
      {showCopy && (
        <Grid item width='fit-content'>
          <CopyAddressButton address={String(address)} />
        </Grid>
      )}
    </Grid>
  );
}

export default React.memo(ShortAddress2);
