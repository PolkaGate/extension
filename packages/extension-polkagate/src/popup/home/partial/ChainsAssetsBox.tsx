// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { FetchedBalance } from '../../../hooks/useAssetsBalances';

import { Divider, Grid, Typography } from '@mui/material';
import React, { memo, useCallback, useMemo } from 'react';

import { selectableNetworks } from '@polkadot/networks';

import { AssetLogo, FormatPrice } from '../../../components';
import { useAccountAssets, usePrices, useSelectedAccount, useSelectedChains } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import getLogo2, { type LogoInfo } from '../../../util/getLogo2';
import { TokenBalanceDisplay, TokenPriceInfo } from './TokensAssetsBox';

type Assets = Record<string, FetchedBalance[]> | null | undefined;
interface AssetDetailType {
  assets: FetchedBalance[];
  chainTotalBalance: number;
  chainName: string | undefined;
  genesisHash: string;
  logoInfo: LogoInfo | undefined;
  token: string | undefined;
}
type Summary = AssetDetailType[] | null | undefined;

function AssetsHeader ({ assetsDetail }: { assetsDetail: AssetDetailType }) {
  return (
    <Grid alignItems='center' container item justifyContent='space-between'>
      <Grid alignItems='center' container item sx={{ bgcolor: '#C6AECC26', borderRadius: '9px', columnGap: '4px', p: '2px 3px', pr: '4px', width: 'fit-content' }}>
        <AssetLogo assetSize='18px' baseTokenSize='16px' genesisHash={assetsDetail.genesisHash} logo={assetsDetail?.logoInfo?.logo} subLogo={undefined} />
        <Typography color='text.secondary' variant='B-2'>
          {assetsDetail.chainName}
        </Typography>
      </Grid>
      <Grid container item sx={{ bgcolor: '#C6AECC26', borderRadius: '9px', columnGap: '4px', p: '4px', width: 'fit-content' }}>
        <FormatPrice
          commify
          fontFamily='Inter'
          fontSize='12px'
          fontWeight={500}
          num={assetsDetail.chainTotalBalance}
          skeletonHeight={14}
          textColor='#AA83DC'
          width='fit-content'
        />
      </Grid>
    </Grid>
  );
}

function AssetsDetail ({ asset }: { asset: FetchedBalance }) {
  const pricesInCurrency = usePrices();

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const logoInfo = getLogo2(asset.genesisHash, asset.token);
  const balancePrice = calcPrice(priceOf(asset.priceId), asset.totalBalance, asset.decimal);

  return (
    <Grid alignItems='center' container item justifyContent='space-between'>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
        <AssetLogo assetSize='36px' baseTokenSize='16px' genesisHash={asset.genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
        <TokenPriceInfo
          priceId={asset.priceId}
          token={asset.token}
        />
      </Grid>
      <TokenBalanceDisplay
        decimal={asset.decimal}
        token={asset.token}
        totalBalanceBN={asset.totalBalance}
        totalBalancePrice={balancePrice}
      />
    </Grid>
  );
}

function ChainsAssetsBox () {
  const account = useSelectedAccount();
  const pricesInCurrency = usePrices();
  const accountAssets = useAccountAssets(account?.address);
  const selectedChains = useSelectedChains();

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const assets: Assets = useMemo(() => {
    if (!selectedChains) {
      return undefined;
    }

    if (accountAssets) {
      if (accountAssets.length === 0) {
        return null;
      }

      // filter non selected chains
      const filtered = accountAssets.filter(({ genesisHash }) => selectedChains.includes(genesisHash));

      return filtered.reduce<Record<string, FetchedBalance[]>>((acc, balance) => {
        const { genesisHash } = balance;

        // Initialize the array for the genesisHash if it doesn't exist
        if (!acc[genesisHash]) {
          acc[genesisHash] = [];
        }

        // Push the current balance item to the respective array
        acc[genesisHash].push(balance);

        return acc;
      }, {});
    } else {
      return accountAssets;
    }
  }, [accountAssets, selectedChains]);

  const summary: Summary = useMemo(() => {
    if (!assets) {
      return assets;
    }

    return Object.entries(assets).map(([genesisHash, balances]) => {
      const chainTotalBalance = balances.reduce((sum, balance) => {
        const totalPrice = calcPrice(priceOf(balance.priceId), balance.totalBalance, balance.decimal);

        return sum + totalPrice;
      }, 0);

      const network = selectableNetworks.find(({ genesisHash: networkGenesisHash, symbols }) => genesisHash === networkGenesisHash[0] && symbols.length);
      const token = network?.symbols[0];
      const logoInfo = getLogo2(genesisHash, token);
      const chainName = network?.displayName;

      return {
        assets: balances,
        chainName,
        chainTotalBalance,
        genesisHash,
        logoInfo,
        token
      };
    });
  }, [assets, priceOf]);

  return (
    <>
      {summary?.map((assetsDetail, index) => (
        <Grid container item key={index} sx={{ background: '#05091C', borderRadius: '14px', p: '10px', rowGap: '10px' }}>
          <AssetsHeader
            assetsDetail={assetsDetail}
          />
          {assetsDetail.assets.map((asset, index) => {
            const showDivider = assetsDetail.assets.length !== index + 1;

            return (
              <>
                <AssetsDetail
                  asset={asset}
                  key={index}
                />
                {showDivider && <Divider sx={{ bgcolor: '#1B133C', height: '1px', ml: '-10px', width: '325px' }} />}
              </>
            );
          })}
        </Grid>
      ))}
    </>
  );
}

export default memo(ChainsAssetsBox);
