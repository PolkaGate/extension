// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowDropDown as ArrowDropDownIcon, ArrowDropDown as DownIcon, ArrowDropUp as UpIcon } from '@mui/icons-material';
import { Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { DisplayLogo } from '../../../components';
import { nFormatter } from '../../../components/FormatPrice';
import { useCurrency, usePrices, useTranslation } from '../../../hooks';
import { FetchedBalance } from '../../../hooks/useAssetsBalances';
import getLogo2 from '../../../util/getLogo2';

interface Props {
  groupedAssets: AssetsWithUiAndPrice[] | undefined
}

export interface AssetsWithUiAndPrice extends FetchedBalance {
  percent: number;
  price: number;
  ui: {
    color: string | undefined;
    logo: string | undefined;
  };
}

function WatchList ({ groupedAssets }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const currency = useCurrency();
  const pricesInCurrencies = usePrices();

  const [showMore, setShowMore] = useState<boolean>(false);

  const toggleAssets = useCallback(() => setShowMore(!showMore), [showMore]);

  const DisplayAssetRow = ({ asset }: { asset: FetchedBalance }) => {
    const logoInfo = useMemo(() => asset && getLogo2(asset.genesisHash, asset.token), [asset]);
    const change = pricesInCurrencies ? pricesInCurrencies.prices[asset.priceId]?.change : 0;

    return (
      <Grid container item justifyContent='space-between'>
        <Grid alignItems='center' container item width='fit-content'>
          <DisplayLogo assetSize='20px' baseTokenSize='14px' genesisHash={asset.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} />
          <Typography fontSize='16px' fontWeight={500} pl='5px' width='150px'>
            {asset.token} - {currency?.code}
          </Typography>
        </Grid>
        <Grid alignItems='center' columnGap='10px' container item width='fit-content'>
          <Typography fontSize='16px' fontWeight={600}>
            { `${currency?.sign ?? ''}${nFormatter(asset.price ?? 0, asset.price > 1 ? 2 : 4)}`}
          </Typography>
          <Divider orientation='vertical' sx={{ bgcolor: 'divider', height: '21px', m: 'auto', width: '3px' }} />
          {change > 0
            ? <UpIcon sx={{ color: 'success.main', fontSize: '40px' }} />
            : <DownIcon sx={{ color: 'warning.main', fontSize: '40px' }} />
          }
          <Typography fontSize='16px' fontWeight={400} m='auto' width='40px'>
            { `${(change ?? 0).toFixed(2)}%`}
          </Typography>
        </Grid>
      </Grid>
    );
  };

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
    <Grid alignItems='center' container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', height: 'fit-content', p: '15px 30px', width: '430px' }}>
      { uniqueAssets && uniqueAssets.length > 0 &&
          <Grid container item pt='10px'>
            {uniqueAssets.slice(0, 3).map((asset, index) => (
              <DisplayAssetRow
                asset={asset}
                key={index}
              />
            ))}
            {uniqueAssets.length > 3 &&
              <Grid container item justifyContent='flex-end'>
                <Collapse in={showMore} orientation='vertical' sx={{ '> .MuiCollapse-wrapper .MuiCollapse-wrapperInner': { display: 'grid', rowGap: '10px' }, width: '100%' }}>
                  {uniqueAssets.slice(3).map((asset, index) => (
                    <DisplayAssetRow
                      asset={asset}
                      key={index}
                    />
                  ))}
                </Collapse>
                <Divider sx={{ bgcolor: 'divider', height: '2px', mt: '10px', width: '100%' }} />
                <Grid alignItems='center' container item onClick={toggleAssets} sx={{ cursor: 'pointer', p: '5px', width: 'fit-content' }}>
                  <Typography color='secondary.light' fontSize='16px' fontWeight={400}>
                    {t<string>(showMore ? t('Less') : t('More'))}
                  </Typography>
                  <ArrowDropDownIcon sx={{ color: 'secondary.light', fontSize: '20px', stroke: '#BA2882', strokeWidth: '2px', transform: showMore ? 'rotate(-180deg)' : 'rotate(0deg)', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
                </Grid>
              </Grid>
            }
          </Grid>
      }
    </Grid>
  );
}

export default React.memo(WatchList);
