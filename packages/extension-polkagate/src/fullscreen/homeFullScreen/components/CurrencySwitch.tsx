// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Collapse, Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { CurrencyContext, InputFilter } from '../../../components';
import { setStorage } from '../../../components/Loading';
import { useTranslation } from '../../../hooks';
import { CURRENCY_LIST } from '../../../util/currencyList';
import { CurrencyItemType } from '../partials/Currency';
import CurrencyItem from './CurrencyItem';

interface Props {
  anchorEl: HTMLButtonElement | null;
  setAnchorEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
  setCurrencyToShow: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function CurrencySwitch({ anchorEl, setAnchorEl, setCurrencyToShow }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setCurrency } = useContext(CurrencyContext);

  const [showOtherCurrencies, setShowOtherCurrencies] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchedCurrency, setSearchedCurrency] = useState<CurrencyItemType[]>();

  useEffect(() => {
    if (anchorEl === null) {
      setShowOtherCurrencies(false);
      setSearchKeyword('');
    }
  }, [anchorEl]);

  const changeCurrency = useCallback((currency: CurrencyItemType) => {
    setAnchorEl(null);
    setCurrency(currency);
    setCurrencyToShow(currency.sign);
    setStorage('currency', currency).catch(console.error);
  }, [setAnchorEl, setCurrency, setCurrencyToShow]);

  const onOtherCurrencies = useCallback(() => setShowOtherCurrencies(!showOtherCurrencies), [showOtherCurrencies]);

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
    <Grid container item sx={{ maxHeight: '550px', overflow: 'hidden', overflowY: 'scroll', transition: 'height 5000ms ease-in-out', width: '230px' }}>
      {[...CURRENCY_LIST.slice(0, 3)].map((item, index) => (
        <CurrencyItem
          currency={item}
          key={index}
          onclick={changeCurrency}
        />
      ))}
      <Grid container item onClick={onOtherCurrencies} sx={{ bgcolor: 'secondary.main', borderRadius: '5px', cursor: 'pointer' }}>
        <ArrowForwardIosRoundedIcon
          sx={{
            color: 'background.default',
            fontSize: '20px',
            m: 'auto',
            stroke: `${theme.palette.background.default}`,
            strokeWidth: 1.5,
            transform: showOtherCurrencies ? 'rotate(-90deg)' : 'rotate(90deg)',
            transition: 'transform 150ms ease-in-out'
          }}
        />
      </Grid>
      <Collapse in={showOtherCurrencies} timeout={{ enter: 700, exit: 150 }}>
        <Grid container p='5px'>
          <InputFilter
            autoFocus
            onChange={onSearch}
            placeholder={t<string>('🔍 Search currency')}
            theme={theme}
            value={searchKeyword ?? ''}
          />
        </Grid>
        {[...(searchedCurrency ?? CURRENCY_LIST.slice(3))].map((item, index) => (
          <CurrencyItem
            currency={item}
            key={index}
            onclick={changeCurrency}
          />
        ))}
      </Collapse>
    </Grid>
  );
}

export default React.memo(CurrencySwitch);
