// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';

import { Grid, type SxProps, type Theme } from '@mui/material';
import { t } from 'i18next';
import React, { useCallback, useContext } from 'react';

import { AccountIconThemeContext } from './contexts';
import { setStorage } from './Loading';
import Select2 from './Select2';

interface Props {
  style?: SxProps<Theme> | undefined;
  fullWidthDropdown?: boolean;
}

function SelectIdenticonTheme ({ style = {} }: Props) {
  const { accountIconTheme, setAccountIconTheme } = useContext(AccountIconThemeContext);

  const options = [
    { text: 'Dot', value: 'polkadot' },
    { text: 'Ball', value: 'beachball' },
    { text: 'Cube', value: 'ethereum' }
  ];

  const onChangeTheme = useCallback((iconTheme: string | number) => {
    setStorage('iconTheme', iconTheme).catch(console.error);
    setAccountIconTheme(iconTheme as IconTheme);
  }, [setAccountIconTheme]);

  return (
    <Grid
      container
      item
      sx={{ ...style }}
    >
      <Select2
        defaultValue={accountIconTheme}
        isIdenticon
        label={t('Account Icon')}
        labelAlignment='flex-start'
        labelFontSize='14px'
        labelPaddingLeft='0px'
        onChange={onChangeTheme}
        options={options}
        rounded={false}
        textFontSize='18px'
      />
    </Grid>
  );
}

export default React.memo(SelectIdenticonTheme);
