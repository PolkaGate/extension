// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';
import type { HexString } from '@polkadot/util/types';
import type { FetchedBalance } from '../../../hooks/useAssetsBalances';
import type { BalancesInfo, Prices } from '../../../util/types';

import { Divider, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { AssetLogo, FormatBalance2, FormatPrice, Infotip, Infotip2 } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import { tieAccount } from '../../../messaging';
import { getValue } from '../../../popup/account/util';
import { BALANCES_VALIDITY_PERIOD } from '../../../util/constants';
import getLogo2 from '../../../util/getLogo2';
import { amountToHuman } from '../../../util/utils';
import AccountBodyFs from '../../homeFullScreen/partials/AccountBodyFs';
import AccountIdenticonIconsFS from '../../homeFullScreen/partials/AccountIdenticonIconsFS';
import AOC from './AOC';

interface PriceJSXType {
  balanceToShow: BalancesInfo | undefined;
  isPriceOutdated: boolean | undefined;
  price: number | undefined;
}

const Price = ({ balanceToShow, isPriceOutdated, price }: PriceJSXType) => (
  <FormatPrice
    amount={getValue('total', balanceToShow)}
    decimals={balanceToShow?.decimal}
    fontSize='21px'
    fontWeight={400}
    price={price}
    skeletonHeight={22}
    textColor={isPriceOutdated ? 'primary.light' : 'text.primary'}
    width='80px'
  />
);

interface BalanceJSXType {
  balanceToShow: BalancesInfo | undefined;
  isBalanceOutdated: boolean | undefined;
}

const Balance = ({ balanceToShow, isBalanceOutdated }: BalanceJSXType) => {
  const total = getValue('total', balanceToShow);
  const decimal = balanceToShow?.decimal;
  const token = balanceToShow?.token;

  return (
    <>
      {decimal && token
        ? <Infotip2 text={`${amountToHuman(total, decimal, decimal, true)}`}>
          <Grid item sx={{ color: isBalanceOutdated ? 'primary.light' : 'text.primary', fontWeight: 500 }}>
            <FormatBalance2
              decimalPoint={2}
              decimals={[decimal]}
              tokens={[token]}
              value={total}
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
  <Grid alignItems='center' container fontSize='21px' item xs>
    <Balance balanceToShow={balanceToShow} isBalanceOutdated={isBalanceOutdated} />
    <Divider orientation='vertical' sx={{ backgroundColor: 'divider', height: '30px', mx: '10px', my: 'auto' }} />
    <Price balanceToShow={balanceToShow} isPriceOutdated={isPriceOutdated} price={price} />
  </Grid>
);

interface SelectedAssetBoxJSXType {
  token: string | undefined;
  genesisHash: string | undefined | null;
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
            <AssetLogo assetSize='32px' baseTokenSize='20px' genesisHash={balanceToShow?.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} />
          </Grid>
          <Grid item sx={{ ml: '10px' }}>
            <BalanceRow balanceToShow={balanceToShow} isBalanceOutdated={isBalanceOutdated} isPriceOutdated={isPriceOutdated} price={price} />
          </Grid>
        </>
        : genesisHash === null
          ? <Infotip iconTop={7} placement='right' showInfoMark text={t('Switch chain from top right, or click on an asset if any.')}>
            <Typography fontSize='18px' fontWeight={500} sx={{ pl: '10px' }}>
              {t('Account is in Any Chain mode')}
            </Typography>
          </Infotip>
          : <>
            <Skeleton
              animation='wave'
              height='42px'
              sx={{ ml: 1 }}
              variant='circular'
              width='42px'
            />
            <Skeleton
              animation='wave'
              height='30px'
              sx={{ ml: 1 }}
              variant='rounded'
              width='200px'
            />
          </>
      }
    </Grid>
  );
};

interface AddressDetailsProps {
  accountAssets: FetchedBalance[] | null | undefined;
  address: string | undefined;
  label?: React.ReactElement | undefined;
  price: number | undefined;
  pricesInCurrency: Prices | null | undefined;
  selectedAsset: FetchedBalance | undefined;
  setSelectedAsset: React.Dispatch<React.SetStateAction<FetchedBalance | undefined>>;
  setAssetIdOnAssetHub: React.Dispatch<React.SetStateAction<number | string | undefined>>;
}

function AccountInformationForDetails({ accountAssets, address, label, price, pricesInCurrency, selectedAsset, setAssetIdOnAssetHub, setSelectedAsset }: AddressDetailsProps): React.ReactElement {
  const theme = useTheme();
  const { account, chain, genesisHash, token } = useInfo(address);

  const calculatePrice = useCallback((amount: BN, decimal: number, _price: number) => {
    return parseFloat(amountToHuman(amount, decimal)) * _price;
  }, []);

  const isBalanceOutdated = useMemo(() => selectedAsset?.date ? Date.now() - selectedAsset.date > BALANCES_VALIDITY_PERIOD : undefined, [selectedAsset]);
  const isPriceOutdated = useMemo(() => pricesInCurrency && Date.now() - pricesInCurrency.date > BALANCES_VALIDITY_PERIOD, [pricesInCurrency]);

  const sortedAccountAssets = useMemo(() => {
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

  const nonZeroSortedAssets = useMemo(() => {
    if (!sortedAccountAssets) {
      return sortedAccountAssets; // null or undefined!
    } else {
      return sortedAccountAssets.filter((_asset) => !getValue('total', _asset as unknown as BalancesInfo)?.isZero());
    }
  }, [sortedAccountAssets]);

  const showAOC = useMemo(() => !!(nonZeroSortedAssets === undefined || (nonZeroSortedAssets && nonZeroSortedAssets.length > 0)), [nonZeroSortedAssets]);

  useEffect(() => {
    /** if chain has been switched and its not among the accounts assets */
    if (account?.genesisHash && !accountAssets?.find(({ genesisHash }) => genesisHash === account.genesisHash)) {
      return setSelectedAsset(undefined);
    }
  }, [account?.genesisHash, accountAssets, setSelectedAsset]);

  const onAssetBoxClicked = useCallback((asset: FetchedBalance | undefined) => {
    address && asset && tieAccount(address, asset.genesisHash as HexString).finally(() => {
      setAssetIdOnAssetHub(undefined);
      setSelectedAsset(asset);
    }).catch(console.error);
  }, [address, setSelectedAsset, setAssetIdOnAssetHub]);

  return (
    <Grid alignItems='center' container item sx={{ bgcolor: 'background.paper', border: '0px solid', borderBottomWidth: '8px', borderBottomColor: theme.palette.mode === 'light' ? 'black' : 'secondary.light', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', mb: '15px', p: `20px 20px ${showAOC ? '5px' : '20px'} 20px`, position: 'relative' }}>
      {label}
      <Grid container item>
        <AccountIdenticonIconsFS
          address={address}
        />
        <Grid container item sx={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 60%) max-content' }} xs>
          <AccountBodyFs
            address={address}
          />
          <SelectedAssetBox
            balanceToShow={selectedAsset as unknown as BalancesInfo}
            genesisHash={chain === null ? null : genesisHash}
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
            accountAssets={nonZeroSortedAssets}
            address={address}
            mode='Detail'
            onclick={onAssetBoxClicked}
            selectedAsset={selectedAsset}
          />
        </>
      }
    </Grid>
  );
}

export default React.memo(AccountInformationForDetails);
