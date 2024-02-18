// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Collapse, Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { InputFilter } from '../../../components';
import { useTranslation } from '../../../hooks';
import { currencyList } from '../../../util/defaultAssets';
import { CurrencyItemType } from '../partials/Currency';
import CurrencyItem from './CurrencyItem';

interface Props {
  anchorEl: HTMLButtonElement | null;
  setAnchorEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
}

function CurrencyList({ anchorEl, setAnchorEl }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();

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

    // setCurrencyToShow(currency);
    window.localStorage.setItem('currency', JSON.stringify(currency));
  }, [setAnchorEl]);

  const onOtherCurrencies = useCallback(() => setShowOtherCurrencies(!showOtherCurrencies), [showOtherCurrencies]);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      setSearchKeyword('');

      return setSearchedCurrency(undefined);
    }

    setSearchKeyword(keyword);
    keyword = keyword.trim().toLowerCase();

    const _filtered = currencyList.filter((currency) =>
      currency.code.toLowerCase().includes(keyword) ||
      currency.country.toLowerCase().includes(keyword) ||
      currency.currency.toLowerCase().includes(keyword)
    );

    setSearchedCurrency([..._filtered]);
  }, []);

  return (
    <Grid container item sx={{ maxHeight: '550px', overflow: 'hidden', overflowY: 'scroll', transition: 'height 5000ms ease-in-out', width: '230px' }}>
      {[...currencyList.slice(0, 3)].map((item, index) => (
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
        {[...(searchedCurrency ?? currencyList.slice(3))].map((item, index) => (
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

export default React.memo(CurrencyList);
