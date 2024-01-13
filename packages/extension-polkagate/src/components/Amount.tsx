// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { InputAdornment, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useCallback } from 'react';

import { MAX_AMOUNT_LENGTH } from '../util/constants';

const CssTextField = styled(TextField)(({ theme }) => ({
  // '& label.Mui-focused': {
  //   color: 'green',
  // },
  // '& .MuiInput-underline:after': {
  //   borderBottomColor: 'green',
  // },
  '& .MuiOutlinedInput-root': {
    borderRadius: 5,
    height: '48px',
    fontWeight: 400,
    fontSize: '28px',
    letterSpacing: '-0.015em',
    color: theme.palette.text.primary,
    padding: 0,
    '& fieldset': {
      border: `1px solid ${theme.palette.primary.main}`
    },
    '&:hover fieldset': {
      borderColor: theme.palette.secondary.main
    }
    // '&.Mui-focused fieldset': {
    //   borderColor: 'green',
    // },
  }
}));

interface Props {
  setValue: React.Dispatch<React.SetStateAction<string>>;
  value: string | undefined;
  token: string | undefined;
  decimals: number;
}

export default function CustomizedTextField({ decimals, setValue, value }: Props) {
  const _onChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLSelectElement>) => {
      if (parseInt(value).toString().length > decimals - 1) {
        console.log(`The amount digits is more than decimal:${decimals}`);

        return;
      }

      setValue(value.slice(0, MAX_AMOUNT_LENGTH));
    },
    [decimals, setValue]
  );

  return (
    <CssTextField
      // InputProps={{
      //   endAdornment: (
      //     <InputAdornment
      //       position='end'
      //       sx={{
      //         color: (theme) => theme.palette.text.primary,
      //         fontSize: '18px', fontWeight: 400, letterSpacing: '-0.015em', pr: '10px'
      //       }}>
      //       {token ?? ''}
      //     </InputAdornment>
      //   ),
      //   inputProps: { min: 0 }
      // }}
      autoComplete='off'
      fullWidth
      onChange={_onChange}
      size='small'
      // sx={{ pt: '6px' }}
      // type='number'
      placeholder='00.00'
      value={value ?? ''}
    />
  );
}
