// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { FetchedBalance } from '@polkadot/extension-polkagate/hooks/useAssetsBalances';

import { Container, Divider, Grid, Typography } from '@mui/material';
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import { selectableNetworks } from '@polkadot/networks';

import { AssetLogo, CurrencyDisplay, FormatPrice } from '../../../components';
import { useAccountAssets, usePrices, useSelectedAccount, useSelectedChains } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import getLogo2, { type LogoInfo } from '../../../util/getLogo2';

interface ChainsSubBoxProps {
  accountAssets: FetchedBalance[] | null | undefined;
  selectedChains: string[] | undefined;
}

type Assets = Record<string, FetchedBalance[]> | null | undefined;
interface ChainAssetDetail {
  assets: FetchedBalance[];
  chainTotalBalance: number;
  chainName: string | undefined;
  genesisHash: string;
  logoInfo: LogoInfo | undefined;
  token: string | undefined;
}
type Summary = ChainAssetDetail[] | null | undefined;

const DailyChangeInPercent = ({ change }: { change: number }) => {
  const bgcolor = useMemo(() => {
    return !change
      ? '#AA83DC26'
      : change > 0
        ? '#82FFA526'
        : '#FF165C26';
  }, [change]);

  const color = useMemo(() => {
    return !change
      ? '#AA83DC'
      : change > 0
        ? '#82FFA5'
        : '#FF165C';
  }, [change]);

  return (
    <Grid alignItems='center' container item sx={{ bgcolor, borderRadius: '8px', p: '2px', width: 'fit-content' }}>
      {change > 0
        ? <ArrowUp2 color={color} size='12' variant='Bold' />
        : change < 0
          ? <ArrowDown2 color={color} size='12' variant='Bold' />
          : null
      }
      <Typography color={color} fontFamily='Inter' fontSize='12px' fontWeight={500}>
        {Math.abs(change).toFixed(2)}%
      </Typography>
    </Grid>
  );
};

function ChainAssetsHeader ({ chainAssetsDetail }: { chainAssetsDetail: ChainAssetDetail }) {
  return (
    <Grid alignItems='center' container item justifyContent='space-between'>
      <Grid alignItems='center' container item sx={{ bgcolor: '#C6AECC26', borderRadius: '9px', columnGap: '4px', p: '2px 3px', pr: '4px', width: 'fit-content' }}>
        <AssetLogo assetSize='18px' baseTokenSize='16px' genesisHash={chainAssetsDetail.genesisHash} logo={chainAssetsDetail?.logoInfo?.logo} subLogo={undefined} />
        <Typography color='text.secondary' fontFamily='Inter' fontSize='14px' fontWeight={600}>
          {chainAssetsDetail.chainName}
        </Typography>
      </Grid>
      <Grid container item sx={{ bgcolor: '#C6AECC26', borderRadius: '9px', columnGap: '4px', p: '4px', width: 'fit-content' }}>
        <FormatPrice
          commify
          fontFamily='Inter'
          fontSize='12px'
          fontWeight={500}
          num={chainAssetsDetail.chainTotalBalance}
          skeletonHeight={14}
          textColor='#AA83DC'
          width='fit-content'
        />
      </Grid>
    </Grid>
  );
}

function ChainAssetsDetail ({ asset }: { asset: FetchedBalance }) {
  const pricesInCurrency = usePrices();

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);

  const logoInfo = getLogo2(asset.genesisHash, asset.token);
  const balancePrice = calcPrice(priceOf(asset.priceId), asset.totalBalance, asset.decimal);

  return (
    <Grid alignItems='center' container item justifyContent='space-between'>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
        <AssetLogo assetSize='36px' baseTokenSize='16px' genesisHash={asset.genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
        <Grid container direction='column' item sx={{ width: 'fit-content' }}>
          <Typography color='text.primary' fontFamily='Inter' fontSize='14px' fontWeight={600}>
            {asset.token}
          </Typography>
          <Grid alignItems='center' container item sx={{ columnGap: '5px', width: 'fit-content' }}>
            <FormatPrice
              commify
              fontFamily='Inter'
              fontSize='12px'
              fontWeight={500}
              num={pricesInCurrency?.prices[asset.priceId]?.value ?? 0}
              skeletonHeight={14}
              textColor='#AA83DC'
              width='fit-content'
            />
            {pricesInCurrency?.prices[asset.priceId]?.change &&
              <DailyChangeInPercent
                change={pricesInCurrency.prices[asset.priceId].change}
              />
            }
          </Grid>
        </Grid>
      </Grid>
      <Grid container item sx={{ width: 'fit-content' }}>
        <CurrencyDisplay
          amount={balancePrice ?? 0}
          decimal={asset.decimal}
          decimalPartCount={balancePrice > 1 ? 2 : 3}
          displayStyle='asset'
        />
      </Grid>
    </Grid>
  );
}

function ChainsSubBox ({ accountAssets, selectedChains }: ChainsSubBoxProps) {
  const pricesInCurrency = usePrices();

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
      {summary?.map((chainAssetsDetail, index) => (
        <Grid container item key={index} sx={{ background: '#05091C', borderRadius: '14px', p: '10px', rowGap: '10px' }}>
          <ChainAssetsHeader
            chainAssetsDetail={chainAssetsDetail}
          />
          {chainAssetsDetail.assets.map((asset, index) => {
            const showDivider = chainAssetsDetail.assets.length !== index + 1;

            return (
              <>
                <ChainAssetsDetail
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

function AssetsBox (): React.ReactElement {
  const account = useSelectedAccount();
  const accountAssets = useAccountAssets(account?.address);
  const selectedChains = useSelectedChains();

  return (
    <Container disableGutters sx={{ bgcolor: '#1B133C', borderRadius: '18px', mx: '15px', p: '4px', width: '100%' }}>
      <Grid container item sx={{ borderRadius: '14px', display: 'grid', maxHeight: '290px', overflowY: 'scroll', rowGap: '4px' }}>
        <ChainsSubBox
          accountAssets={accountAssets}
          selectedChains={selectedChains}
        />
      </Grid>
    </Container>
  );
}

export default AssetsBox;
