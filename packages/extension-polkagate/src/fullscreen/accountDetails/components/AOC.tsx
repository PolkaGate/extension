// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { FetchedBalance } from '../../../hooks/useAssetsBalances';
import type { BalancesInfo, Prices } from '../../../util/types';

import { ArrowDropDown as ArrowDropDownIcon, MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { Collapse, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';

import { AssetLogo, FormatPrice, ShowBalance } from '../../../components';
import { useApi, useNotifyOnChainChange, usePrices, useSelectedChains, useTranslation } from '../../../hooks';
import getLogo2 from '../../../util/getLogo2';

interface Props {
  address: string | undefined;
  selectedAsset: FetchedBalance | undefined;
  accountAssets: FetchedBalance[] | null | undefined;
  onclick: (asset: FetchedBalance | undefined) => void;
  mode?: 'Home' | 'Detail';
  hideNumbers?: boolean | undefined
}

interface AssetBoxProps {
  api: ApiPromise | undefined,
  pricesInCurrencies: Prices | null | undefined,
  selectedAsset: FetchedBalance | undefined,
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

const BalanceRow = ({ api, asset, pricesInCurrencies }: BalanceRowProps) => {
  const total = getValue('total', asset as unknown as BalancesInfo);

  return (
    <Grid alignItems='flex-start' container direction='column' item pl='5px' xs>
      <Grid item sx={{ fontSize: '14px', fontWeight: 600, lineHeight: 1 }}>
        <ShowBalance
          api={api}
          balance={total}
          decimal={asset.decimal}
          decimalPoint={2}
          token={asset.token}
        />
      </Grid>
      <FormatPrice
        amount={total}
        decimals={asset.decimal}
        fontSize='13px'
        fontWeight={400}
        price={pricesInCurrencies?.prices?.[asset.priceId]?.value ?? 0}
      />
    </Grid>
  );
};

const AssetsBoxes = ({ api, asset, hideNumbers, mode, onclick, pricesInCurrencies, selectedAsset }: AssetBoxProps) => {
  const theme = useTheme();

  const isAssetSelected = asset?.genesisHash === selectedAsset?.genesisHash && asset?.token === selectedAsset?.token && asset?.assetId === selectedAsset?.assetId;
  const _assetToShow = isAssetSelected && selectedAsset?.date && asset?.date && selectedAsset.date > asset.date ? selectedAsset : asset;

  const homeMode = (mode === 'Home' && isAssetSelected);
  const logoInfo = useMemo(() => _assetToShow && getLogo2(_assetToShow.genesisHash, _assetToShow.token), [_assetToShow]);

  return (
    <Grid
      // eslint-disable-next-line react/jsx-no-bind
      alignItems='center' container item justifyContent='center' onClick={() => _assetToShow ? onclick(_assetToShow) : null}
      sx={{
        border: _assetToShow ? `${isAssetSelected ? '1.5px' : '1px'} solid` : 'none',
        borderColor: isAssetSelected
          ? 'secondary.light'
          : theme.palette.mode === 'dark'
            ? '#464141'
            : 'divider',
        borderRadius: '8px',
        boxShadow: isAssetSelected ? '0px 2px 5px 2px #00000040' : 'none',
        cursor: _assetToShow ? 'pointer' : 'default',
        height: 'fit-content',
        p: _assetToShow ? '5px' : 0,
        width: 'fit-content'
      }}
    >
      {_assetToShow
        ? <>
          <Grid alignItems='center' container item mr={logoInfo?.subLogo && '2px'} width='fit-content'>
            <AssetLogo assetSize='25px' baseTokenSize='16px' genesisHash={_assetToShow.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} />
          </Grid>
          {(mode === 'Detail' || (homeMode && !hideNumbers)) &&
            <BalanceRow
              api={api}
              asset={_assetToShow}
              pricesInCurrencies={pricesInCurrencies}
            />
          }
        </>
        : <Skeleton animation='wave' height={38} sx={{ transform: 'none' }} variant='text' width={99} />
      }
    </Grid>
  );
};

function AOC({ accountAssets, address, hideNumbers, mode = 'Detail', onclick, selectedAsset }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const api = useApi(address);
  const pricesInCurrencies = usePrices();
  const selectedChains = useSelectedChains();

  useNotifyOnChainChange(address);

  const [showMore, setShowMore] = useState<boolean>(false);

  const toggleAssets = useCallback(() => setShowMore(!showMore), [showMore]);

  const assets = useMemo(() => {
    if (accountAssets && accountAssets.length > 0 && selectedChains) {
      // filter non selected chains

      return accountAssets.filter(({ genesisHash }) => selectedChains.includes(genesisHash));
    } else {
      return [undefined, undefined]; // two undefined to show two skeletons
    }
  }, [accountAssets, selectedChains]);

  const shouldShowCursor = useMemo(() => (mode === 'Detail' && accountAssets && accountAssets.length > 5) || (mode !== 'Detail' && accountAssets && accountAssets.length > 6), [accountAssets, mode]);

  return (
    <Grid container item>
      <Typography color='secondary.contrastText' fontSize='18px' fontWeight={400} mt='13px' px='10px' width='fit-content'>
        {t('Assets')}
      </Typography>
      <Grid alignItems='center' container item xs>
        <Collapse collapsedSize={53} in={showMore} orientation='vertical' sx={{ width: '100%' }}>
          <Grid container gap='15px' item justifyContent='flex-start' sx={{ height: 'fit-content', minHeight: '50px', overflow: 'hidden', p: '5px 1%' }}>
            {assets.map((asset, index) => (
              <AssetsBoxes
                api={api}
                asset={asset}
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
      {!!accountAssets?.length &&
        <Grid alignItems='center' container item justifyContent='center' onClick={toggleAssets} sx={{ cursor: shouldShowCursor ? 'pointer' : 'default', width: '65px' }}>
          {mode === 'Detail'
            ? accountAssets.length > 5 &&
            <>
              <Typography fontSize='14px' fontWeight={400} sx={{ borderLeft: '1px solid', borderLeftColor: 'divider', height: 'fit-content', pl: '8px' }}>
                {showMore ? t('Less') : t('More')}
              </Typography>
              <ArrowDropDownIcon sx={{ color: 'secondary.light', fontSize: '20px', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: showMore ? 'rotate(-180deg)' : 'rotate(0deg)', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
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
