// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, Theme, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

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

function ShortAddress({ address, clipped = false, charsCount = SHORT_ADDRESS_CHARACTERS, style, showCopy = false, inParentheses = false }: Props): React.ReactElement {
  const [charactersCount, setCharactersCount] = useState<number>(1);
  const [enoughChar, setEnoughChar] = useState<boolean>(false);
  const pRef = useRef(null);
  const cRef = useRef(null);

  useEffect(() => {
    if (!clipped) {
      setCharactersCount(charsCount);

      return;
    }

    const addChar = (cRef?.current?.offsetWidth < pRef?.current?.offsetWidth);

    !addChar && setEnoughChar(true);

    addChar && !enoughChar && setCharactersCount(charactersCount + 1);
    enoughChar && !addChar && setCharactersCount(charactersCount - 1);
  }, [charsCount, clipped, showCopy, cRef?.current?.offsetWidth, pRef?.current?.offsetWidth, charactersCount, enoughChar]);

  return (
    <Grid alignItems='center' container justifyContent='center' sx={{ ...style }}>
      <Grid container item ref={pRef} xs={10.2}>
        <Typography ref={cRef} sx={style} width='fit-content'>
          {`${inParentheses ? '(' : ''}${!charsCount || (charactersCount === address?.length / 2) ? address : `${address?.slice(0, charactersCount)}...${address?.slice(-charactersCount)}`}${inParentheses ? ')' : ''}`}
        </Typography>
      </Grid>
      {showCopy &&
        <Grid container item justifyContent='flex-end' xs={1.8}>
          <CopyAddressButton address={String(address)} />
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(ShortAddress);
