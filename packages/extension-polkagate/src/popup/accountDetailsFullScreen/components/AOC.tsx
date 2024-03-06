// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowDropDown as ArrowDropDownIcon, MoreHoriz as MoreHorizIcon } from '@mui/icons-material';
import { Collapse, Grid, Skeleton, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountJson } from '@polkadot/extension-base/background/types';

import { DisplayLogo, FormatPrice, ShowBalance } from '../../../components';
import { usePrices3, useTranslation } from '../../../hooks';
import { FetchedBalance } from '../../../hooks/useAssetsOnChains2';
import { AccountAssets, BalancesInfo, Prices3 } from '../../../util/types';
import { DisplayLogoAOC } from './AccountInformation';

interface Props {
  account: AccountJson | undefined;
  api: ApiPromise | undefined;
  assetId: number | undefined;
  displayLogoAOC: (genesisHash: string | null | undefined, symbol: string | undefined) => DisplayLogoAOC;
  balanceToShow: BalancesInfo | undefined;
  accountAssets: FetchedBalance[] | null | undefined;
  borderColor: string;
  onclick: (genesisHash: string, asset: AccountAssets | undefined) => void;
  mode?: 'Home' | 'Detail';
}

const BalanceRow = ({ api, asset, pricesInCurrencies }: { asset: FetchedBalance, api: ApiPromise | undefined, pricesInCurrencies: Prices3 | null | undefined }) => (
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

const AssetsBoxes = ({ account, api, asset, assetId, balanceToShow, displayLogoAOC, mode, onclick, pricesInCurrencies }: { api: ApiPromise | undefined, pricesInCurrencies: Prices3 | null | undefined, displayLogoAOC: (genesisHash: string | null | undefined, symbol: string | undefined) => DisplayLogoAOC, account: AccountJson | undefined, assetId: number | undefined, balanceToShow: BalancesInfo | undefined, asset: FetchedBalance | undefined, mode: 'Home' | 'Detail', onclick: (genesisHash: string, asset: AccountAssets | undefined) => void }) => {
  const selectedAsset = asset && asset.genesisHash === account?.genesisHash && (asset.token === balanceToShow?.token || (asset.assetId && asset.assetId === assetId));
  const homeMode = (mode === 'Home' && selectedAsset);

  return (
    // eslint-disable-next-line react/jsx-no-bind
    <Grid alignItems='center' container item justifyContent='center' onClick={() => asset ? onclick(asset?.genesisHash, asset) : null} sx={{ border: asset ? `${selectedAsset ? '3px' : '1px'} solid` : 'none', borderColor: 'secondary.light', borderRadius: '8px', boxShadow: selectedAsset ? '0px 2px 5px 2px #00000040' : 'none', cursor: asset ? 'pointer' : 'default', height: 'fit-content', p: asset ? '5px' : 0, width: 'fit-content' }}>
      {asset
        ? <>
          <Grid alignItems='center' container item width='fit-content'>
            <DisplayLogo assetSize='25px' assetToken={displayLogoAOC(asset.genesisHash, asset.token)?.symbol} baseTokenSize='16px' genesisHash={displayLogoAOC(asset.genesisHash, asset.token)?.base} />
          </Grid>
          {(mode === 'Detail' || homeMode) &&
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

function AOC({ account, accountAssets, api, assetId, balanceToShow, borderColor, displayLogoAOC, mode = 'Detail', onclick }: Props) {
  const { t } = useTranslation();
  const pricesInCurrencies = usePrices3();

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
          <Grid container gap='15px' item justifyContent='flex-start' sx={{ height: 'fit-content', minHeight: '50px', overflow: 'hidden', p: '5px 3%' }}>
            {assets.map((asset, index) => (
              <AssetsBoxes
                account={account}
                api={api}
                asset={asset}
                assetId={assetId}
                balanceToShow={balanceToShow}
                displayLogoAOC={displayLogoAOC}
                key={index}
                onclick={onclick}
                pricesInCurrencies={pricesInCurrencies}
              />
            ))}
          </Grid>
        </Collapse>
      </Grid>
      {accountAssets && accountAssets.length > 5 &&
        <Grid alignItems='center' container item justifyContent='center' onClick={toggleAssets} sx={{ cursor: 'pointer', width: '65px' }}>
          {mode === 'Detail'
            ? <>
              <Typography fontSize='14px' fontWeight={400} sx={{ borderLeft: '1px solid', borderLeftColor: borderColor, height: 'fit-content', pl: '8px' }}>
                {t<string>(showMore ? 'Less' : 'More')}
              </Typography>
              <ArrowDropDownIcon sx={{ color: 'secondary.light', fontSize: '20px', stroke: '#BA2882', strokeWidth: '2px', transform: showMore ? 'rotate(-180deg)' : 'rotate(0deg)', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
            </>
            : <MoreHorizIcon sx={{ color: 'secondary.light', fontSize: '33px' }} />
          }
        </Grid>
      }
    </Grid>
  );
}

export default React.memo(AOC);
