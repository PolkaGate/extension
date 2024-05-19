// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowDropDown as ArrowDropDownIcon, MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { Collapse, Grid, Skeleton, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountJson } from '@polkadot/extension-base/background/types';

import { DisplayLogo, FormatPrice, ShowBalance } from '../../../components';
import { usePrices, useTranslation } from '../../../hooks';
import { FetchedBalance } from '../../../hooks/useAssetsBalances';
import getLogo2 from '../../../util/getLogo2';
import { BalancesInfo, Prices } from '../../../util/types';

interface Props {
  account: AccountJson | undefined;
  api: ApiPromise | undefined;
  selectedAsset: FetchedBalance | undefined;
  balanceToShow: BalancesInfo | undefined;
  accountAssets: FetchedBalance[] | null | undefined;
  onclick: (asset: FetchedBalance | undefined) => void;
  mode?: 'Home' | 'Detail';
  hideNumbers?: boolean | undefined
}

interface AssetBoxProps {
  api: ApiPromise | undefined,
  pricesInCurrencies: Prices | null | undefined,
  account: AccountJson | undefined,
  selectedAsset: FetchedBalance | undefined,
  balanceToShow: BalancesInfo | undefined,
  asset: FetchedBalance | undefined,
  mode: 'Home' | 'Detail',
  onclick: (asset: FetchedBalance | undefined) => void;
  hideNumbers?: boolean | undefined
}

interface BalanceRowProps {
  asset: FetchedBalance,
  api: ApiPromise | undefined,
  pricesInCurrencies: Prices | null | undefined
}

const BalanceRow = ({ api, asset, pricesInCurrencies }: BalanceRowProps) => (
  <Grid alignItems='flex-start' container direction='column' item pl='5px' xs>
    <Grid item sx={{ fontSize: '14px', fontWeight: 600, lineHeight: 1 }}>
      <ShowBalance
        api={api}
        balance={asset.totalBalance}
        decimal={asset.decimal}
        decimalPoint={2}
        token={asset.token}
      />
    </Grid>
    <Grid item sx={{ fontSize: '13px', fontWeight: 400, lineHeight: 1 }}>
      <FormatPrice
        amount={asset.totalBalance}
        decimals={asset.decimal}
        price={pricesInCurrencies?.prices?.[asset.priceId]?.value ?? 0}
      />
    </Grid>
  </Grid>
);

const AssetsBoxes = ({ account, api, asset, balanceToShow, hideNumbers, mode, onclick, pricesInCurrencies, selectedAsset }: AssetBoxProps) => {
  const isAssetSelected = (asset && asset.genesisHash === account?.genesisHash && asset.token === balanceToShow?.token) || (asset?.genesisHash === selectedAsset?.genesisHash && asset?.token === selectedAsset?.token);

  const homeMode = (mode === 'Home' && isAssetSelected);
  const logoInfo = useMemo(() => asset && getLogo2(asset.genesisHash, asset.token), [asset]);

  return (
    <Grid alignItems='center' container item justifyContent='center' onClick={() => asset ? onclick(asset) : null} sx={{ border: asset ? `${isAssetSelected ? '3px' : '1px'} solid` : 'none', borderColor: 'secondary.light', borderRadius: '8px', boxShadow: isAssetSelected ? '0px 2px 5px 2px #00000040' : 'none', cursor: asset ? 'pointer' : 'default', height: 'fit-content', p: asset ? '5px' : 0, width: 'fit-content' }}>
      {asset
        ? <>
          <Grid alignItems='center' container item mr={logoInfo?.subLogo && '2px'} width='fit-content'>
            <DisplayLogo assetSize='25px' baseTokenSize='16px' genesisHash={asset.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} />
          </Grid>
          {(mode === 'Detail' || (homeMode && !hideNumbers)) &&
            <BalanceRow
              api={api}
              asset={asset}
              pricesInCurrencies={pricesInCurrencies}
            />
          }
        </>
        : <Skeleton animation='wave' height={38} sx={{ transform: 'none' }} variant='text' width={99} />
      }
    </Grid>
  );
};

function AOC ({ account, accountAssets, api, balanceToShow, hideNumbers, mode = 'Detail', onclick, selectedAsset }: Props) {
  const { t } = useTranslation();
  const pricesInCurrencies = usePrices();

  const [showMore, setShowMore] = useState<boolean>(false);

  const toggleAssets = useCallback(() => setShowMore(!showMore), [showMore]);

  const assets = useMemo(() => {
    if (accountAssets && accountAssets.length > 0) {
      return accountAssets;
    } else {
      return [undefined, undefined];
    }
  }, [accountAssets]);

  return (
    <Grid container item>
      <Typography fontSize='18px' fontWeight={400} mt='13px' px='10px' width='fit-content'>
        {t('Assets')}
      </Typography>
      <Grid alignItems='center' container item xs>
        <Collapse collapsedSize={53} in={showMore} orientation='vertical' sx={{ width: '100%' }}>
          <Grid container gap='15px' item justifyContent='flex-start' sx={{ height: 'fit-content', minHeight: '50px', overflow: 'hidden', p: '5px 1%' }}>
            {assets.map((asset, index) => (
              <AssetsBoxes
                account={account}
                api={api}
                asset={asset}
                balanceToShow={balanceToShow}
                hideNumbers={hideNumbers}
                key={index}
                mode={mode}
                onclick={onclick}
                pricesInCurrencies={pricesInCurrencies}
                selectedAsset={selectedAsset}
              />
            ))}
          </Grid>
        </Collapse>
      </Grid>
      {accountAssets?.length &&
        <Grid alignItems='center' container item justifyContent='center' onClick={toggleAssets} sx={{ cursor: 'pointer', width: '65px' }}>
          {mode === 'Detail'
            ? accountAssets.length > 5 &&
            <>
              <Typography fontSize='14px' fontWeight={400} sx={{ borderLeft: '1px solid', borderLeftColor: 'divider', height: 'fit-content', pl: '8px' }}>
                {showMore ? t('Less') : t('More')}
              </Typography>
              <ArrowDropDownIcon sx={{ color: 'secondary.light', fontSize: '20px', stroke: '#BA2882', strokeWidth: '2px', transform: showMore ? 'rotate(-180deg)' : 'rotate(0deg)', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
            </>
            : accountAssets.length > 6 &&
            <MoreHorizIcon sx={{ color: 'secondary.light', fontSize: '27px' }} />
          }
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(AOC);
