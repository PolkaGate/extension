// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Prices } from '../../../util/types';
import type { CurrencyItemType } from './Currency';
import type { AssetsWithUiAndPrice } from './TotalBalancePieChart';

import { ArrowDropDown as ArrowDropDownIcon, ArrowDropDown as DownIcon, ArrowDropUp as UpIcon } from '@mui/icons-material';
import { Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { AssetLogo } from '../../../components';
import FormatPrice from '../../../components/FormatPrice';
import { useCurrency, usePrices, useTranslation } from '../../../hooks';
import getLogo2 from '../../../util/getLogo2';

interface Props {
  groupedAssets: AssetsWithUiAndPrice[] | undefined;
}

interface AssetPriceChangeProps {
  asset: AssetsWithUiAndPrice;
  currency: CurrencyItemType | undefined;
  pricesInCurrencies: Prices | null | undefined;
}

const AssetPriceChange = React.memo(function AssetPriceChange({ asset, currency, pricesInCurrencies }: AssetPriceChangeProps) {
  const logoInfo = useMemo(() => asset && getLogo2(asset.genesisHash, asset.token), [asset]);
  const change = pricesInCurrencies ? pricesInCurrencies.prices[asset.priceId]?.change : undefined;

  return (
    <Grid container item justifyContent='space-between'>
      <Grid alignItems='center' container item width='fit-content'>
        <AssetLogo assetSize='20px' baseTokenSize='14px' genesisHash={asset.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} />
        <Typography fontSize='16px' fontWeight={500} pl='5px' width='150px'>
          {asset.token} - {currency?.code}
        </Typography>
      </Grid>
      <Grid alignItems='center' columnGap='10px' container item width='fit-content'>
        <FormatPrice
          decimalPoint={asset.price > 1 ? 2 : 4}
          fontSize='16px'
          fontWeight={600}
          num={asset.price}
        />
        <Divider orientation='vertical' sx={{ bgcolor: 'divider', height: '21px', m: 'auto', width: '3px' }} />
        <Grid alignItems='center' container item width='fit-content'>
          {change !== undefined && change > 0
            ? <UpIcon sx={{ color: 'success.main', fontSize: '40px' }} />
            : <DownIcon sx={{ color: 'warning.main', fontSize: '40px' }} />
          }
          <Typography color={change !== undefined ? change > 0 ? 'success.main' : 'warning.main' : undefined} fontSize='16px' fontWeight={400} ml='-5px' width='40px'>
            {`${(change ?? 0).toFixed(2)}%`}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
});

function WatchList({ groupedAssets }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const currency = useCurrency();
  const pricesInCurrencies = usePrices();

  const [showMore, setShowMore] = useState<boolean>(false);

  const toggleAssets = useCallback(() => setShowMore(!showMore), [showMore]);
  const uniqueAssets = useMemo(() => {
    const seenTokens = new Set();

    return groupedAssets?.filter((asset) => {
      if (asset.price && !seenTokens.has(asset.token)) {
        seenTokens.add(asset.token);

        return true;
      }

      return false;
    });
  }, [groupedAssets]);

  return (
    <Grid alignItems='center' container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', height: 'fit-content', p: '15px 30px 10px', width: '430px' }}>
      {uniqueAssets && uniqueAssets.length > 0 &&
        <Grid container item pt='10px'>
          {uniqueAssets.slice(0, 3).map((asset, index) => (
            <AssetPriceChange
              asset={asset}
              currency={currency}
              key={index}
              pricesInCurrencies={pricesInCurrencies}
            />
          ))}
          {uniqueAssets.length > 3 &&
            <Grid container item justifyContent='flex-end'>
              <Collapse in={showMore} orientation='vertical' sx={{ '> .MuiCollapse-wrapper .MuiCollapse-wrapperInner': { display: 'grid', rowGap: '10px' }, width: '100%' }}>
                {uniqueAssets.slice(3).map((asset, index) => (
                  <AssetPriceChange
                    asset={asset}
                    currency={currency}
                    key={index}
                    pricesInCurrencies={pricesInCurrencies}
                  />
                ))}
              </Collapse>
              <Divider sx={{ bgcolor: 'divider', height: '2px', mt: '10px', width: '100%' }} />
              <Grid alignItems='center' container item onClick={toggleAssets} sx={{ cursor: 'pointer', p: '5px', width: 'fit-content' }}>
                <Typography color='secondary.light' fontSize='14px' fontWeight={400}>
                  {t(showMore ? t('Less') : t('More'))}
                </Typography>
                <ArrowDropDownIcon sx={{ color: 'secondary.light', fontSize: '20px', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: showMore ? 'rotate(-180deg)' : 'rotate(0deg)', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
              </Grid>
            </Grid>
          }
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(WatchList);
