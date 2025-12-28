// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { CurrencyItemType } from '../../../fullscreen/home/partials/type';

import { Box, Grid, styled, Typography } from '@mui/material';
import { assetsBtcSVG, assetsEthSVG } from '@polkagate/apps-config/ui/logos/assets';
import { chainsPolkadotCircleSVG } from '@polkagate/apps-config/ui/logos/chains';
import * as flags from 'country-flag-icons/string/3x2';
import { BuyCrypto, Coin1, Hashtag } from 'iconsax-react';
import React, { Fragment, memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { NothingFound } from '@polkadot/extension-polkagate/src/partials';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { CurrencyContext, GlowCheck, GradientButton, GradientDivider, SearchField } from '../../../components';
import { setStorage } from '../../../components/Loading';
import { useTranslation } from '../../../hooks';
import SharePopup from '../../../partials/SharePopup';
import { CRYPTO_AS_CURRENCY, CURRENCY_LIST } from '../../../util/currencyList';

interface Props {
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
}

interface CurrencyOptionProps {
  handleCurrencySelect: (currency: CurrencyItemType) => () => void;
  selectedCurrency: CurrencyItemType | undefined;
  onDoubleClick?: () => void
}

interface CurrencyListProps extends CurrencyOptionProps {
  currencyList: CurrencyItemType[];
  type: 'crypto' | 'fiat';
  noLastDivider?: boolean;
}

const ListItem = styled(Grid)(() => ({
  '&.selected': {
    backgroundColor: '#6743944D',
    height: '49px',
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
    <Grid alignItems='center' columnGap='4px' container item p='5px 10px 5px'>
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

const CurrencyList = memo(function CL ({ currencyList, handleCurrencySelect, noLastDivider = false, onDoubleClick, selectedCurrency, type }: CurrencyListProps) {
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
      {currencyList.map((currency, index) => {
        const isSelected = selectedCurrency?.code === currency.code;

        return (
          <Fragment key={index}>
            <ListItem className={isSelected ? 'selected' : ''} container item key={currency.code} onClick={handleCurrencySelect(currency)} onDoubleClick={onDoubleClick}>
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
              <GlowCheck
                show={isSelected}
              />
            </ListItem>
            {(!noLastDivider || index !== currencyList.length - 1) &&
              <GradientDivider style={{ my: '3px' }} />
            }
          </Fragment>
        );
      })}
    </>
  );
});

const CurrencyOptions = memo(function CO ({ handleCurrencySelect, onDoubleClick, selectedCurrency }: CurrencyOptionProps): React.ReactElement {
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
    <Grid container item justifyContent='center' sx={{ position: 'relative' }}>
      <Grid container item>
        <SearchField
          onInputChange={onSearch}
          placeholder={t('🔍 Search currency')}
        />
      </Grid>
      <Grid container item justifyContent='center' sx={{ display: 'block', height: '315px', maxHeight: '315px', mb: '60px', overflowY: 'auto', pt: '5px' }}>
        <NothingFound
          show={searchedCurrencies?.length === 0}
          style={{ pt: '50px' }}
          text={t('Crypto/Fiat Not Found')}
        />
        <CurrencyList
          currencyList={cryptos}
          handleCurrencySelect={handleCurrencySelect}
          onDoubleClick={onDoubleClick}
          selectedCurrency={selectedCurrency}
          type='crypto'
        />
        <CurrencyList
          currencyList={fiats}
          handleCurrencySelect={handleCurrencySelect}
          noLastDivider
          onDoubleClick={onDoubleClick}
          selectedCurrency={selectedCurrency}
          type='fiat'
        />
      </Grid>
    </Grid>
  );
});

function Content ({ setOpenMenu }: { setOpenMenu: React.Dispatch<React.SetStateAction<boolean>> }): React.ReactElement {
  const { t } = useTranslation();
  const { currency, setCurrency } = useContext(CurrencyContext);

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyItemType | undefined>();

  useEffect(() => {
    !selectedCurrency && currency && setSelectedCurrency(currency);
  }, [currency, selectedCurrency]);

  const handleCurrencySelect = useCallback((currency: CurrencyItemType) => () => setSelectedCurrency(currency), []);

  const applyLanguageChange = useCallback(() => {
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
      setStorage(STORAGE_KEY.CURRENCY, selectedCurrency).then(() => {
        setOpenMenu(false);
      }).catch(console.error);
    }
  }, [selectedCurrency, setCurrency, setOpenMenu]);

  return (
    <Grid container item justifyContent='center' sx={{ position: 'relative', py: '1px', zIndex: 1 }}>
      <CurrencyOptions
        handleCurrencySelect={handleCurrencySelect}
        onDoubleClick={applyLanguageChange}
        selectedCurrency={selectedCurrency}
      />
      <GradientButton
        contentPlacement='center'
        disabled={currency === selectedCurrency}
        onClick={applyLanguageChange}
        style={{
          bottom: '6px',
          height: '44px',
          position: 'absolute',
          zIndex: 10
        }}
        text={t('Apply')}
      />
    </Grid>
  );
}

function SelectCurrency ({ openMenu, setOpenMenu }: Props): React.ReactElement {
  const { t } = useTranslation();

  const handleClose = useCallback(() => setOpenMenu(false), [setOpenMenu]);

  return (
    <SharePopup
      modalProps={{ showBackIconAsClose: true }}
      onClose={handleClose}
      open={openMenu}
      popupProps={{
        TitleIcon: Hashtag,
        iconVariant: 'Linear',
        pt: 60,
        style: {
          'div#container div#boxContainer': {
            overflow: 'hidden'
          }
        },
        titleAlignment: 'flex-start',
        withoutBackground: true,
        withoutTopBorder: true
      }}
      title={t('Balance Display Currency')}
    >
      <Content setOpenMenu={setOpenMenu} />
    </SharePopup>
  );
}

export default memo(SelectCurrency);
