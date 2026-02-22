// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AssetsWithUiAndPrice } from './types';

import { Container, useTheme } from '@mui/material';
import React, { useContext, useMemo } from 'react';

import { calcPrice } from '@polkadot/extension-polkagate/src/util';
import { TEST_NETS } from '@polkadot/extension-polkagate/src/util/constants';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { BN, BN_ZERO } from '@polkadot/util';

import { AccountsAssetsContext, AssetNull } from '../../../components';
import { usePortfolio, usePrices, useTranslation } from '../../../hooks';
import { VelvetBox } from '../../../style';
import AssetsRows from './AssetsRows';
import { adjustColor, getMaxBalanceAsset } from './helpers';
import PortfolioBar from './PortfolioBar';

function AssetsBars(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const pricesInCurrencies = usePrices();
  const youHave = usePortfolio();
  const { accountsAssets } = useContext(AccountsAssetsContext);

  const assets = useMemo((): AssetsWithUiAndPrice[] | undefined => {
    if (!accountsAssets || !youHave || !pricesInCurrencies) {
      return undefined;
    }

    const allAccountsAssets = Object.values(accountsAssets.balances).flatMap((byChain) =>
      Object.entries(byChain)
        .filter(([genesisHash]) => !TEST_NETS.includes(genesisHash))
        .flatMap(([, assets]) => assets as unknown as AssetsWithUiAndPrice[])
    );

    const groupedAssets = allAccountsAssets.reduce((acc, asset) => {
      const key = asset.priceId; // Group by priceId

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(asset);

      return acc;
    }, {} as Record<string, AssetsWithUiAndPrice[]>);

    const aggregatedAssets = Object.keys(groupedAssets).map((index) => {
      const assetSample = getMaxBalanceAsset(groupedAssets[index]);
      const ui = getLogo2(assetSample?.genesisHash, assetSample?.token);
      const assetPrice = pricesInCurrencies.prices[assetSample.priceId]?.value;

      const accumulatedBalancePerPriceId = groupedAssets[index].reduce((sum, { totalBalance }) => sum.add(new BN(totalBalance)), BN_ZERO);

      const balancePrice = calcPrice(assetPrice, accumulatedBalancePerPriceId, assetSample.decimal ?? 0);

      const percent = (balancePrice / youHave.portfolio) * 100;

      return ({
        ...assetSample,
        percent,
        price: assetPrice,
        totalBalance: balancePrice,
        ui: {
          color: adjustColor(assetSample.token, ui?.color, theme),
          logo: ui?.logo
        }
      });
    });

    aggregatedAssets.sort((a, b) => b.percent - a.percent);

    return aggregatedAssets;
  }, [accountsAssets, youHave, pricesInCurrencies, theme]);

  return (
    <Container disableGutters>
      {
        !!assets?.length && !!youHave?.portfolio &&
        <PortfolioBar assets={assets} />
      }
      <VelvetBox style={{ margin: '8px', minHeight: '200px' }}>
        {
          !assets?.length || !youHave?.portfolio
            ? <AssetNull text={t("You don't have any valuable tokens yet")} />
            : <AssetsRows assets={assets} />
        }
      </VelvetBox>
    </Container>
  );
}

export default React.memo(AssetsBars);
