// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';
import type { FetchedBalance } from '../../../hooks/useAssetsBalances';

import { Badge, type BadgeProps, Collapse, Container, Divider, Grid, styled, Typography } from '@mui/material';
import { ArrowDown2, ArrowUp2, CloseCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';

import { selectableNetworks } from '@polkadot/networks';
import { BN_ZERO } from '@polkadot/util';

import { AssetLogo, CurrencyDisplay, FormatBalance2, FormatPrice } from '../../../components';
import { useAccountAssets, usePrices, useSelectedAccount, useSelectedChains } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave';
import getLogo2, { type LogoInfo } from '../../../util/getLogo2';

type Assets = Record<string, FetchedBalance[]> | null | undefined;
interface AssetDetailType {
  assets: FetchedBalance[];
  assetsTotalBalancePrice: number;
  assetsTotalBalanceBN: BN;
  genesisHash: string | undefined;
  logoInfo: LogoInfo | undefined;
  token: string | undefined;
  priceId: string | undefined;
  decimal: number | undefined;
}
type Summary = AssetDetailType[] | null | undefined;

const StyledBadge = styled(Badge)<BadgeProps>(() => ({
  '& .MuiBadge-badge': {
    background: '#05091C',
    color: '#AA83DC',
    right: 5,
    top: 10
  }
}));

export const Drawer = ({ length }: { length: number }) => {
  return (
    <Container disableGutters sx={{ display: 'flex', height: length === 0 ? 0 : length > 1 ? '18px' : '9px', justifyContent: 'center', overflow: 'hidden', position: 'relative', transition: 'all 250ms ease-out', transitionDelay: length ? '250ms' : 'unset', width: '100%' }}>
      <div style={{ background: '#24234DCC', borderRadius: '14px', height: length ? '50px' : 0, position: 'absolute', top: '-41px', transition: 'all 250ms ease-out', transitionDelay: length ? '250ms' : 'unset', width: '300px' }} />
      <div style={{ background: '#26255773', borderRadius: '14px', bottom: 0, height: length > 1 ? '50px' : 0, position: 'absolute', transition: 'all 250ms ease-out', transitionDelay: length ? '250ms' : 'unset', width: '275px' }} />
    </Container>
  );
};

export function DailyChangeInPercent ({ change }: { change: number }) {
  const { bgcolor, color } = useMemo(() => ({
    bgcolor: !change
      ? '#AA83DC26'
      : change > 0
        ? '#82FFA526'
        : '#FF165C26',
    color: !change
      ? '#AA83DC'
      : change > 0
        ? '#82FFA5'
        : '#FF165C'
  }), [change]);

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
}

export function TokenPriceInfo ({ priceId, token }: { priceId?: string, token?: string }) {
  const pricesInCurrency = usePrices();

  return (
    <Grid container direction='column' item sx={{ width: 'fit-content' }}>
      <Typography color='text.primary' fontFamily='Inter' fontSize='14px' fontWeight={600}>
        {token}
      </Typography>
      <Grid alignItems='center' container item sx={{ columnGap: '5px', width: 'fit-content' }}>
        <FormatPrice
          commify
          fontFamily='Inter'
          fontSize='12px'
          fontWeight={500}
          num={pricesInCurrency?.prices[priceId ?? '']?.value ?? 0}
          skeletonHeight={14}
          textColor='#AA83DC'
          width='fit-content'
        />
        {priceId && pricesInCurrency?.prices[priceId]?.change &&
          <DailyChangeInPercent
            change={pricesInCurrency.prices[priceId].change}
          />
        }
      </Grid>
    </Grid>
  );
}

export function TokenBalanceDisplay ({ decimal = 0, token = '', totalBalanceBN, totalBalancePrice }: { decimal?: number, totalBalanceBN: BN, totalBalancePrice: number, token?: string }) {
  return (
    <Grid alignItems='flex-end' container direction='column' item sx={{ '> div.balance': { color: '#BEAAD8', fontFamily: 'Inter', fontSize: '11px', fontWeight: 500 }, rowGap: '6px', width: 'fit-content' }}>
      <CurrencyDisplay
        amount={totalBalancePrice}
        decimal={decimal}
        decimalPartCount={totalBalancePrice > 1 ? 2 : 3}
        displayStyle='asset'
      />
      <FormatBalance2
        className='balance'
        decimalPoint={2}
        decimals={[decimal]}
        tokens={[token]}
        value={totalBalanceBN}
      />
    </Grid>
  );
}

function TokensItems ({ tokenDetail }: { tokenDetail: FetchedBalance }) {
  const pricesInCurrency = usePrices();

  const priceOf = useCallback((priceId: string): number => pricesInCurrency?.prices?.[priceId]?.value || 0, [pricesInCurrency?.prices]);
  const formatCamelCaseText = useCallback((input: string) => {
    return input
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before uppercase letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first letter
  }, []);

  const logoInfo = getLogo2(tokenDetail.genesisHash, tokenDetail.token);
  const balancePrice = calcPrice(priceOf(tokenDetail.priceId), tokenDetail.totalBalance, tokenDetail.decimal);

  return (
    <Grid alignItems='center' container item justifyContent='space-between'>
      <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
        <Grid item sx={{ border: '3px solid', borderColor: '#2D1E4A', borderRadius: '999px' }}>
          <AssetLogo assetSize='26px' baseTokenSize='18px' genesisHash={tokenDetail.genesisHash} logo={logoInfo?.logo} subLogo={logoInfo?.subLogo} subLogoPosition='-3px -8px auto auto' />
        </Grid>
        <Grid container direction='column' item sx={{ width: 'fit-content' }}>
          <Typography color='text.secondary' fontFamily='Inter' fontSize='13px' fontWeight={500} sx={{ bgcolor: '#2D1E4A', borderRadius: '8px', px: '3px', width: 'fit-content' }}>
            {tokenDetail.token}
          </Typography>
          <Typography color='text.secondary' fontFamily='Inter' fontSize='11px' fontWeight={500}>
            {formatCamelCaseText(tokenDetail.chainName)}
          </Typography>
        </Grid>
      </Grid>
      <TokenBalanceDisplay
        decimal={tokenDetail.decimal}
        token={tokenDetail.token}
        totalBalanceBN={tokenDetail.totalBalance}
        totalBalancePrice={balancePrice}
      />
    </Grid>
  );
}

function TokenBox ({ tokenDetail }: { tokenDetail: AssetDetailType }) {
  const [expand, setExpand] = useState<boolean>(false);

  const toggleExpand = useCallback(() => setExpand((isExpanded) => !isExpanded), []);

  return (
    <div>
      <Grid container item onClick={toggleExpand} sx={{ background: '#05091C', borderRadius: '14px', cursor: 'pointer', p: '10px' }}>
        <Container disableGutters sx={{ alignItems: 'center', display: 'flex' }}>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ transition: 'all 250ms ease-out' }} xs>
            <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
              <StyledBadge badgeContent={tokenDetail.assets.length}>
                <AssetLogo assetSize='36px' baseTokenSize='16px' genesisHash={tokenDetail.genesisHash} logo={tokenDetail.logoInfo?.logo ?? tokenDetail.logoInfo?.subLogo} subLogo={undefined} />
              </StyledBadge>
              <TokenPriceInfo
                priceId={tokenDetail.priceId}
                token={tokenDetail.token}
              />
            </Grid>
            <TokenBalanceDisplay
              decimal={tokenDetail.decimal}
              token={tokenDetail.token}
              totalBalanceBN={tokenDetail.assetsTotalBalanceBN}
              totalBalancePrice={tokenDetail.assetsTotalBalancePrice}
            />
          </Grid>
          <CloseCircle color='#674394' size='32' style={{ marginLeft: '8px', transition: 'all 250ms ease-out', transitionDelay: expand ? '200ms' : 'unset', width: expand ? '42px' : 0 }} variant='Bold' />
        </Container>
        <Collapse in={expand} sx={{ width: '100%' }}>
          <Grid container item sx={{ background: '#1B133C', borderRadius: '12px', mt: '10px', p: '12px 8px', rowGap: '8px' }}>
            {tokenDetail.assets.map((token, index) => {
              const showDivider = tokenDetail.assets.length !== index + 1;

              return (
                <>
                  <TokensItems
                    key={index}
                    tokenDetail={token}
                  />
                  {showDivider && <Divider sx={{ bgcolor: '#1B133C', height: '1px', width: '100%' }} />}
                </>
              );
            })}
          </Grid>
        </Collapse>
      </Grid>
      <Drawer length={expand ? 0 : tokenDetail.assets.length} />
    </div>
  );
}

function TokensAssetsBox () {
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
        const { token } = balance;

        // Initialize the array for the token if it doesn't exist
        if (!acc[token]) {
          acc[token] = [];
        }

        // Push the current balance item to the respective array
        acc[token].push(balance);

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

    return Object.entries(assets).map(([token, assets]) => {
      const assetsTotalBalance = assets.reduce((sum, asset) => ({
        totalBalanceBN: sum.totalBalanceBN.add(asset.totalBalance),
        totalBalancePrice: sum.totalBalancePrice + calcPrice(priceOf(asset.priceId), asset.totalBalance, asset.decimal)
      }), { totalBalanceBN: BN_ZERO, totalBalancePrice: 0 });

      const network = selectableNetworks.find(({ symbols }) => symbols[0]?.toLowerCase() === token.toLowerCase());
      const priceId = assets[0].priceId;

      let genesisHash: string | undefined;
      let logoInfo: LogoInfo | undefined;
      let decimal: number | undefined;

      if (network) {
        genesisHash = network?.genesisHash[0].toString();
        logoInfo = getLogo2(network?.genesisHash.toString(), token);
        decimal = network?.decimals[0];
      } else {
        const network = assets.find(({ token: tokenNetwork }) => tokenNetwork.toLowerCase() === token.toLowerCase());

        genesisHash = network?.genesisHash.toString();
        logoInfo = getLogo2(genesisHash, token);
        decimal = network?.decimal;
      }

      return {
        assets,
        assetsTotalBalanceBN: assetsTotalBalance.totalBalanceBN,
        assetsTotalBalancePrice: assetsTotalBalance.totalBalancePrice,
        decimal,
        genesisHash,
        logoInfo,
        priceId,
        token
      };
    });
  }, [assets, priceOf]);

  return (
    <>
      {summary?.map((tokenDetail, index) => (
        <TokenBox
          key={index}
          tokenDetail={tokenDetail}
        />
      ))}
    </>
  );
}

export default memo(TokensAssetsBox);
