// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';
import type { AccountId } from '@polkadot/types/interfaces/runtime';

import { Grid, type SxProps, type Theme, Typography } from '@mui/material';
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
  variant?: unknown;
}

function ShortAddress ({ address, charsCount = SHORT_ADDRESS_CHARACTERS, clipped = false, inParentheses = false, showCopy = false, style, variant }: Props): React.ReactElement {
  const [charactersCount, setCharactersCount] = useState<number>(1);
  const pRef = useRef<HTMLDivElement>(null);
  const cRef = useRef<HTMLSpanElement>(null);

  const decreaseCharactersCount = useCallback(() => clipped && setCharactersCount(charactersCount - 1), [charactersCount, clipped]);

  ObserveResize(pRef?.current as unknown as Element, (cRef.current?.clientHeight ?? 0) + 3, decreaseCharactersCount);

  useEffect(() => {
    if (!clipped) {
      setCharactersCount(charsCount);

      return;
    }

    const offset = showCopy ? 55 : 25;

    if (cRef.current && cRef.current.offsetWidth < (pRef?.current?.offsetWidth ?? 0) - offset) {
      setCharactersCount((prev) => prev + 1);
    }
  }, [charsCount, clipped, showCopy, cRef.current?.offsetWidth, pRef.current?.offsetWidth]);

  return (
    <Grid alignItems='center' container justifyContent='center' ref={pRef} sx={{ ...style }} width='100%'>
      <Typography ref={cRef} variant={variant as Variant} width='fit-content'>
        {inParentheses ? '(' : ''}
        {!charsCount || (charactersCount >= (address?.length ?? 2) / 2) ? String(address) : `${String(address)?.slice(0, charactersCount)}...${String(address)?.slice(-charactersCount)}`}
        {inParentheses ? ')' : ''}
      </Typography>
      {showCopy &&
        <CopyAddressButton address={String(address)} />
      }
    </Grid>
  );
}

export default React.memo(ShortAddress);
