// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { CurrencyItemType } from '../partials/Currency';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { CurrencyContext, InputFilter } from '../../../components';
import { setStorage } from '../../../components/Loading';
import { useTranslation } from '../../../hooks';
import { CURRENCY_LIST } from '../../../util/currencyList';
import CurrencyItem from './CurrencyItem';

interface Props {
  anchorEl: HTMLButtonElement | null;
  setAnchorEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
  setCurrencyToShow: React.Dispatch<React.SetStateAction<CurrencyItemType | undefined>>;
}

function CurrencyList({ anchorEl, setAnchorEl, setCurrencyToShow }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setCurrency } = useContext(CurrencyContext);

  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchedCurrency, setSearchedCurrency] = useState<CurrencyItemType[]>();

  useEffect(() => {
    if (anchorEl === null) {
      setSearchKeyword('');
    }
  }, [anchorEl]);

  const changeCurrency = useCallback((currency: CurrencyItemType) => {
    setAnchorEl(null);
    setCurrency(currency);
    setCurrencyToShow(currency);
    setStorage('currency', currency).catch(console.error);
  }, [setAnchorEl, setCurrency, setCurrencyToShow]);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      setSearchKeyword('');

      return setSearchedCurrency(undefined);
    }

    setSearchKeyword(keyword);
    keyword = keyword.trim().toLowerCase();

    const filtered = CURRENCY_LIST.filter((currency) =>
      currency.code.toLowerCase().includes(keyword) ||
      currency.country.toLowerCase().includes(keyword) ||
      currency.currency.toLowerCase().includes(keyword)
    );

    setSearchedCurrency([...filtered]);
  }, []);

  return (
    <Grid container item sx={{ transition: 'height 5000ms ease-in-out', width: '230px' }}>
      <Grid container item justifyContent='space-between' px='5px' role='dialog'>
        <Typography color='secondary.contrastText' fontSize='14px' fontWeight={400} py='10px' textAlign='center' width='100%'>
          {t('Select the currency for your balance')}
        </Typography>
      </Grid>
      <Divider sx={{ bgcolor: 'divider', height: '2px', mb: '5px', width: '100%' }} />
      <Grid container p='5px' sx={{ display: 'list-item' }}>
        <InputFilter
          autoFocus
          fontSize='14px'
          onChange={onSearch}
          placeholder={t('🔍 Search currency')}
          theme={theme}
          value={searchKeyword ?? ''}
        />
      </Grid>
      <Grid container item role='listbox' sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'hidden', overflowY: 'scroll' }}>
        {(searchedCurrency ?? CURRENCY_LIST).map((item, index) => (
          <CurrencyItem
            currency={item}
            key={index}
            onclick={changeCurrency}
          />
        ))}
      </Grid>
    </Grid>
  );
}

export default React.memo(CurrencyList);
