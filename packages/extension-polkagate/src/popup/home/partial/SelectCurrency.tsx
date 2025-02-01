// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { CurrencyItemType } from '../../../fullscreen/homeFullScreen/partials/Currency';

import CheckIcon from '@mui/icons-material/Check';
import { Box, Fade, Grid, styled, Typography } from '@mui/material';
import { assetsBtcSVG, assetsEthSVG } from '@polkagate/apps-config/ui/logos/assets';
import { chainsPolkadotCircleSVG } from '@polkagate/apps-config/ui/logos/chains';
import * as flags from 'country-flag-icons/string/3x2';
import { BuyCrypto, Coin1, Hashtag } from 'iconsax-react';
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { CurrencyContext, ExtensionPopup, GradientButton, GradientDivider, SearchField } from '../../../components';
import { useTranslation } from '../../../hooks';
import { CRYPTO_AS_CURRENCY, CURRENCY_LIST } from '../../../util/currencyList';

interface Props {
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CurrencyOptionProps {
  handleCurrencySelect: (currency: CurrencyItemType) => () => void;
  selectedCurrency: CurrencyItemType | undefined;
}

interface CurrencyListProps extends CurrencyOptionProps {
  currencyList: CurrencyItemType[];
  type: 'crypto' | 'fiat';
  noLastDivider?: boolean;
}

const ListItem = styled(Grid)(() => ({
  '&.selected': {
    backgroundColor: '#6743944D',
    height: '50px',
    padding: '10px',
    paddingLeft: '20px'
  },
  '&:hover': {
    backgroundColor: '#6743944D'
  },
  alignItems: 'center',
  borderRadius: '12px',
  cursor: 'pointer',
  height: '40px',
  justifyContent: 'space-between',
  paddingLeft: '10px',
  transition: 'all 250ms ease-out'
}));

const CategoryHeader = ({ type }: { type: 'crypto' | 'fiat' }) => {
  const { t } = useTranslation();

  return (
    <Grid alignItems='center' columnGap='4px' container item p='15px 10px 5px'>
      {type === 'crypto'
        ? <BuyCrypto color='#AA83DC' size={22} variant='Bulk' />
        : <Coin1 color='#AA83DC' size={22} variant='Bulk' />
      }
      <Typography color='#7956A5' letterSpacing='1px' textTransform='uppercase' variant='S-1'>
        {type === 'crypto' ? t('Crypto') : t('Fiat')}
      </Typography>
    </Grid>
  );
};

const CurrencyList = ({ currencyList, handleCurrencySelect, noLastDivider = false, selectedCurrency, type }: CurrencyListProps) => {
  const flagSVG = useCallback((currency: CurrencyItemType) => {
    const countryCode = currency.code.slice(0, 2).toUpperCase();

    if (currency.code === 'BTC') {
      return assetsBtcSVG;
    }

    if (currency.code === 'ETH') {
      return assetsEthSVG;
    }

    if (currency.code === 'DOT') {
      return chainsPolkadotCircleSVG;
    }

    const svg = (flags as Record<string, string>)[countryCode];

    if (svg) {
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    return '';
  }, []);

  if (currencyList.length === 0) {
    return null;
  }

  return (
    <>
      <CategoryHeader type={type} />
      {currencyList.map((currency, index) => (
        <>
          <ListItem className={selectedCurrency === currency ? 'selected' : ''} container item key={currency.code} onClick={handleCurrencySelect(currency)}>
            <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
              <Box
                component='img'
                src={flagSVG(currency)}
                sx={{ borderRadius: '5px', height: '18px', width: '18px' }}
              />
              <Typography color='text.primary' variant='B-2'>
                {currency.country} - {currency.sign}
              </Typography>
            </Grid>
            <Fade in={selectedCurrency === currency} timeout={300}>
              <CheckIcon sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '999px', fontSize: '20px', p: '3px' }} />
            </Fade>
          </ListItem>
          {(!noLastDivider || index !== currencyList.length - 1) &&
            <GradientDivider style={{ my: '5px' }} />
          }
        </>
      ))}
    </>
  );
};

const CurrencyOptions = memo(function LanguageOptions ({ handleCurrencySelect, selectedCurrency }: CurrencyOptionProps): React.ReactElement {
  const { t } = useTranslation();

  const [searchedCurrencies, setSearchedCurrencies] = useState<CurrencyItemType[]>();

  const { cryptos, fiats } = useMemo(() => {
    const fiats = (searchedCurrencies ?? CURRENCY_LIST).filter(({ currency }) => !CRYPTO_AS_CURRENCY.find((item) => item.currency === currency));
    const cryptos = (searchedCurrencies ?? CURRENCY_LIST).filter(({ currency }) => CRYPTO_AS_CURRENCY.find((item) => item.currency === currency));

    return { cryptos, fiats };
  }, [searchedCurrencies]);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      return setSearchedCurrencies(undefined);
    }

    keyword = keyword.trim().toLowerCase();

    const filtered = CURRENCY_LIST.filter((currency) =>
      currency.code.toLowerCase().includes(keyword) ||
      currency.country.toLowerCase().includes(keyword) ||
      currency.currency.toLowerCase().includes(keyword)
    );

    setSearchedCurrencies([...filtered]);
  }, []);

  return (
    <Grid container item justifyContent='center'>
      <Grid container item>
        <SearchField
          onInputChange={onSearch}
          placeholder='🔍 Search currency'
        />
      </Grid>
      <Grid container item justifyContent='center' sx={{ display: 'block', height: '320px', maxHeight: '320px', overflow: 'scroll' }}>
        <CurrencyList
          currencyList={cryptos}
          handleCurrencySelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
          type='crypto'
        />
        <CurrencyList
          currencyList={fiats}
          handleCurrencySelect={handleCurrencySelect}
          noLastDivider
          selectedCurrency={selectedCurrency}
          type='fiat'
        />
        {[...cryptos, ...fiats].length === 0 &&
        <Typography color='text.primary' mt='15px' variant='B-2'>
          {t('Nothing found')}!
        </Typography>}
      </Grid>
    </Grid>
  );
});

function SelectCurrency ({ openMenu, setOpenMenu }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { currency, setCurrency } = useContext(CurrencyContext);

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyItemType | undefined>();

  useEffect(() => {
    !selectedCurrency && currency && setSelectedCurrency(currency);
  }, [currency, selectedCurrency]);

  const handleCurrencySelect = useCallback((currency: CurrencyItemType) => () => {
    setSelectedCurrency(currency);
  }, []);

  const handleClose = useCallback(() => setOpenMenu(false), [setOpenMenu]);

  const applyLanguageChange = useCallback(() => {
    selectedCurrency && setCurrency(selectedCurrency);
    handleClose();
  }, [selectedCurrency, setCurrency, handleClose]);

  return (
    <ExtensionPopup
      TitleIcon={Hashtag}
      handleClose={handleClose}
      openMenu={openMenu}
      title={t('Currency for your balance')}
      withoutBackground
      withoutTopBorder
    >
      <Grid container item justifyContent='center' sx={{ position: 'relative', py: '5px', zIndex: 1 }}>
        <CurrencyOptions
          handleCurrencySelect={handleCurrencySelect}
          selectedCurrency={selectedCurrency}
        />
        <GradientButton
          contentPlacement='center'
          disabled={currency === selectedCurrency}
          onClick={applyLanguageChange}
          style={{
            height: '44px',
            marginTop: '15px',
            width: '345px'
          }}
          text={t('Apply')}
        />
      </Grid>
    </ExtensionPopup>
  );
}

export default memo(SelectCurrency);
