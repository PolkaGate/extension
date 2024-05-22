// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { AccountJson } from '@polkadot/extension-base/background/types';
import { BN } from '@polkadot/util';

import { DisplayLogo, FormatBalance2, FormatPrice, Identicon, Identity, Infotip, Infotip2, OptionalCopyButton, ShortAddress2 } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import { FetchedBalance } from '../../../hooks/useAssetsBalances';
import { showAccount, tieAccount } from '../../../messaging';
import { getValue } from '../../../popup/account/util';
import { BALANCES_VALIDITY_PERIOD } from '../../../util/constants';
import getLogo2 from '../../../util/getLogo2';
import { BalancesInfo, Prices } from '../../../util/types';
import { amountToHuman } from '../../../util/utils';
import AccountIcons from './AccountIcons';
import AOC from './AOC';

interface PriceJSXType {
  balanceToShow: BalancesInfo | undefined;
  isPriceOutdated: boolean | undefined;
  price: number | undefined;
}

const Price = ({ balanceToShow, isPriceOutdated, price }: PriceJSXType) => (
  <Grid item sx={{ '> div span': { display: 'block' }, color: isPriceOutdated ? 'primary.light' : 'text.primary', fontWeight: 400 }}>
    <FormatPrice
      amount={getValue('total', balanceToShow)}
      decimals={balanceToShow?.decimal}
      price={price}
      skeletonHeight={22}
      width='80px'
    />
  </Grid>
);

interface BalanceJSXType {
  balanceToShow: BalancesInfo | undefined;
  isBalanceOutdated: boolean | undefined;
}

const Balance = ({ balanceToShow, isBalanceOutdated }: BalanceJSXType) => {
  const balance = getValue('total', balanceToShow);
  const decimal = balanceToShow?.decimal;
  const token = balanceToShow?.token;

  return (
    <>
      {balanceToShow?.decimal
        ? <Infotip2 text={`${amountToHuman(balance, decimal, decimal, true)}`}>
          <Grid item sx={{ color: isBalanceOutdated ? 'primary.light' : 'text.primary', fontWeight: 500 }}>
            <FormatBalance2
              decimalPoint={2}
              decimals={[decimal]}
              tokens={[token]}
              value={balance}
            />
          </Grid>
        </Infotip2>
        : <Skeleton animation='wave' height={22} sx={{ my: '2.5px', transform: 'none' }} variant='text' width={90} />
      }
    </>
  );
};

interface BalanceRowJSXType {
  balanceToShow: BalancesInfo | undefined;
  isPriceOutdated: boolean | undefined;
  isBalanceOutdated: boolean | undefined;
  price: number | undefined;
}

const BalanceRow = ({ balanceToShow, isBalanceOutdated, isPriceOutdated, price }: BalanceRowJSXType) => (
  <Grid alignItems='center' container fontSize='28px' item xs>
    <Balance balanceToShow={balanceToShow} isBalanceOutdated={isBalanceOutdated} />
    <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '30px', mx: '10px', my: 'auto' }} />
    <Price balanceToShow={balanceToShow} isPriceOutdated={isPriceOutdated} price={price} />
  </Grid>
);

interface SelectedAssetBoxJSXType {
  token: string | undefined;
  genesisHash: string | undefined;
  balanceToShow: BalancesInfo | undefined;
  isBalanceOutdated: boolean | undefined;
  isPriceOutdated: boolean;
  price: number | undefined;
}

const SelectedAssetBox = ({ balanceToShow, genesisHash, isBalanceOutdated, isPriceOutdated, price, token }: SelectedAssetBoxJSXType) => {
  const { t } = useTranslation();

  const logoInfo = useMemo(() => getLogo2(balanceToShow?.genesisHash || genesisHash, balanceToShow?.token || token), [genesisHash, balanceToShow?.genesisHash, token, balanceToShow?.token]);

  return (
    <Grid alignItems='center' container item justifyContent='center' minWidth='40%'>
      {genesisHash
        ? <>
          <Grid item pl='7px'>
            <DisplayLogo assetSize='42px' baseTokenSize='20px' genesisHash={balanceToShow?.genesisHash} logo={logoInfo?.logo as string} subLogo={logoInfo?.subLogo as string} />
          </Grid>
          <Grid item sx={{ fontSize: '28px', ml: '5px' }}>
            <BalanceRow balanceToShow={balanceToShow} isBalanceOutdated={isBalanceOutdated} isPriceOutdated={isPriceOutdated} price={price} />
          </Grid>
        </>
        : <Infotip iconTop={7} placement='right' showInfoMark text={t('Switch chain from top right, or click on an asset if any.')}>
          <Typography fontSize='18px' fontWeight={500} sx={{ pl: '10px' }}>
            {t('Account is in Any Chain mode')}
          </Typography>
        </Infotip>
      }
    </Grid>
  );
};

interface AddressDetailsProps {
  accountAssets: FetchedBalance[] | null | undefined;
  address: string | undefined;
  label?: string | undefined;
  price: number | undefined;
  pricesInCurrency: Prices | null | undefined;
  selectedAsset: FetchedBalance | undefined;
  setSelectedAsset: React.Dispatch<React.SetStateAction<FetchedBalance | undefined>>;
  setAssetIdOnAssetHub: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function AccountInformation ({ accountAssets, address, label, price, pricesInCurrency, selectedAsset, setAssetIdOnAssetHub, setSelectedAsset }: AddressDetailsProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { account, api, chain, formatted, genesisHash, token } = useInfo(address);

  const calculatePrice = useCallback((amount: BN, decimal: number, _price: number) => {
    return parseFloat(amountToHuman(amount, decimal)) * _price;
  }, []);

  const isBalanceOutdated = useMemo(() => selectedAsset && Date.now() - selectedAsset.date > BALANCES_VALIDITY_PERIOD, [selectedAsset]);
  const isPriceOutdated = useMemo(() => pricesInCurrency && Date.now() - pricesInCurrency.date > BALANCES_VALIDITY_PERIOD, [pricesInCurrency]);

  const assetsToShow = useMemo(() => {
    if (!accountAssets) {
      return accountAssets; // null or undefined!
    } else {
      return accountAssets.sort((a, b) => {
        const aPrice = calculatePrice(b.totalBalance, b.decimal, pricesInCurrency?.prices?.[b.priceId]?.value ?? 0);
        const bPrice = calculatePrice(a.totalBalance, a.decimal, pricesInCurrency?.prices?.[a.priceId]?.value ?? 0);

        return aPrice - bPrice;
      });
    }
  }, [accountAssets, calculatePrice, pricesInCurrency?.prices]);

  const showAOC = useMemo(() => !!(assetsToShow === undefined || (assetsToShow && assetsToShow.length > 0)), [assetsToShow]);

  useEffect(() => {
    /** if chain has been switched and its not among the selected chains */
    if (account?.genesisHash && !accountAssets?.find(({ genesisHash }) => genesisHash === account.genesisHash)) {
      return setSelectedAsset(undefined);
    }
  }, [account?.genesisHash, accountAssets, setSelectedAsset]);

  const onAssetBoxClicked = useCallback((asset: FetchedBalance | undefined) => {
    address && asset && tieAccount(address, asset.genesisHash).finally(() => {
      setAssetIdOnAssetHub(undefined);
      setSelectedAsset(asset);
    }).catch(console.error);
  }, [address, setSelectedAsset, setAssetIdOnAssetHub]);

  const toggleVisibility = useCallback((): void => {
    address && showAccount(address, account?.isHidden || false).catch(console.error);
  }, [account?.isHidden, address]);

  return (
    <Grid alignItems='center' container item sx={{ bgcolor: 'background.paper', border: '0px solid', borderBottomWidth: '8px', borderBottomColor: theme.palette.mode === 'light' ? 'black' : 'secondary.light', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', mb: '15px', p: `20px 20px ${showAOC ? '5px' : '20px'} 20px`, position: 'relative' }}>
      <Grid item sx={{ bgcolor: theme.palette.nay.main, color: 'white', fontSize: '10px', left: 0, ml: 4, position: 'absolute', px: 1, top: 0, width: 'fit-content' }}>
        {label}
      </Grid>
      <Grid container item>
        <Grid container item sx={{ borderRight: '1px solid', borderRightColor: 'divider', pr: '8px', width: 'fit-content' }}>
          <Grid container item pr='7px' sx={{ '> div': { height: 'fit-content' }, m: 'auto', width: 'fit-content' }}>
            <Identicon
              iconTheme={chain?.icon ?? 'polkadot'}
              prefix={chain?.ss58Format ?? 42}
              size={70}
              value={formatted || address}
            />
          </Grid>
          <AccountIcons
            address={address}
            api={api}
            formatted={formatted}
          />
        </Grid>
        <Grid container item sx={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 60%) max-content' }} xs>
          <Grid container direction='column' item sx={{ borderRight: '1px solid', borderRightColor: 'divider', px: '7px' }}>
            <Grid container item justifyContent='space-between'>
              <Identity
                address={address}
                api={api}
                chain={chain}
                noIdenticon
                style={{ width: 'calc(100% - 40px)' }}
                // subIdOnly
              />
              <Grid item width='40px'>
                <Infotip text={account?.isHidden && t('This account is hidden from websites')}>
                  <IconButton onClick={toggleVisibility} sx={{ height: '20px', ml: '7px', mt: '13px', p: 0, width: '28px' }}>
                    <vaadin-icon icon={account?.isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ color: `${theme.palette.secondary.light}`, height: '20px' }} />
                  </IconButton>
                </Infotip>
              </Grid>
            </Grid>
            <Grid alignItems='center' container item>
              <Grid container item sx={{ '> div div:last-child': { width: 'auto' } }} xs>
                <ShortAddress2 address={formatted || address} clipped style={{ fontSize: '10px', fontWeight: 300 }} />
              </Grid>
              <Grid container item width='fit-content'>
                <OptionalCopyButton address={address} />
              </Grid>
            </Grid>
          </Grid>
          <SelectedAssetBox
            balanceToShow={ selectedAsset}
            genesisHash={genesisHash}
            isBalanceOutdated={isBalanceOutdated}
            isPriceOutdated={!!isPriceOutdated}
            price={price}
            token={token}
          />
        </Grid>
      </Grid>
      {showAOC &&
        <>
          <Divider sx={{ bgcolor: 'divider', height: '1px', my: '15px', width: '100%' }} />
          <AOC
            accountAssets={assetsToShow}
            api={api}
            mode='Detail'
            onclick={onAssetBoxClicked}
            selectedAsset={selectedAsset}
          />
        </>
      }
    </Grid>
  );
}
