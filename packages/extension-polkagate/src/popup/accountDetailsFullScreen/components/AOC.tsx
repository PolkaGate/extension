// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Collapse, Grid, Skeleton, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountJson } from '@polkadot/extension-base/background/types';

import { DisplayLogo, FormatPrice, ShowBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import { BalancesInfo } from '../../../util/types';
import { AssetsOnOtherChains } from '..';
import { DisplayLogoAOC } from './AccountInformation';

interface Props {
  account: AccountJson | undefined;
  api: ApiPromise | undefined;
  assetId: number | undefined;
  displayLogoAOC: (genesisHash: string | null | undefined, symbol: string | undefined) => DisplayLogoAOC;
  balanceToShow: BalancesInfo | undefined;
  assetsOnOtherChains: AssetsOnOtherChains[] | null | undefined;
  borderColor: string;
  onclick: (genesisHash: string, id: number | undefined) => void;
  mode?: 'Home' | 'Detail';
}

function AOC({ account, api, assetId, assetsOnOtherChains, balanceToShow, borderColor, displayLogoAOC, mode = 'Detail', onclick }: Props) {
  const { t } = useTranslation();

  const [showMore, setShowMore] = useState<boolean>(false);

  const toggleAssets = useCallback(() => setShowMore(!showMore), [showMore]);

  const assets = useMemo(() => {
    if (assetsOnOtherChains && assetsOnOtherChains.length > 0) {
      const aOC = [...assetsOnOtherChains];

      return aOC;
    } else {
      return [undefined, undefined];
    }
  }, [assetsOnOtherChains]);

  const BalanceColumn = ({ asset }: { asset: AssetsOnOtherChains }) => (
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
          price={asset.price}
        />
      </Grid>
    </Grid>
  );

  const OtherAssetBox = ({ asset }: { asset: AssetsOnOtherChains | undefined }) => {
    const selectedAsset = asset && asset.genesisHash === account?.genesisHash && (asset.token === balanceToShow?.token || (asset.assetId && asset.assetId === assetId));
    const homeMode = (mode === 'Home' && selectedAsset);

    return (
      // eslint-disable-next-line react/jsx-no-bind
      <Grid alignItems='center' container item justifyContent='center' onClick={() => asset ? onclick(asset?.genesisHash, asset?.assetId) : null} sx={{ border: asset ? `${selectedAsset ? '3px' : '1px'} solid` : 'none', borderColor: 'secondary.light', borderRadius: '8px', boxShadow: selectedAsset ? '0px 2px 5px 2px #00000040' : 'none', cursor: asset ? 'pointer' : 'default', height: 'fit-content', p: asset ? '5px' : 0, width: 'fit-content' }}>
        {asset
          ? <>
            <Grid alignItems='center' container item width='fit-content'>
              <DisplayLogo assetSize='25px' assetToken={displayLogoAOC(asset.genesisHash, asset.token)?.symbol} baseTokenSize='16px' genesisHash={displayLogoAOC(asset.genesisHash, asset.token)?.base} />
            </Grid>
            {(mode === 'Detail' || homeMode) &&
              <BalanceColumn
                asset={asset}
              />
            }
          </>
          : <>
            <Skeleton animation='wave' height={38} sx={{ transform: 'none' }} variant='text' width={99} />
          </>
        }
      </Grid>
    );
  };

  return (
    <Grid container item sx={{ borderTop: '1px solid', borderTopColor: borderColor, minHeight: '58px', mt: '10px', pt: '15px' }}>
      <Typography fontSize='18px' fontWeight={400} m='auto' px='10px' width='fit-content'>
        {t<string>('Assets')}
      </Typography>
      <Grid alignItems='center' container item xs>
        <Collapse collapsedSize={42} in={showMore} orientation='vertical' sx={{ width: '100%' }}>
          <Grid container gap='10px 15px' item justifyContent='flex-start' sx={{ height: 'fit-content', overflow: 'hidden', px: '3%' }}>
            {assets.map((asset, index) => (
              <OtherAssetBox
                asset={asset}
                key={index}
              />
            ))}
          </Grid>
        </Collapse>
      </Grid>
      {assetsOnOtherChains && assetsOnOtherChains.length > 5 &&
        <Grid alignItems='center' container item justifyContent='center' onClick={toggleAssets} sx={{ cursor: 'pointer', width: '65px' }}>
          <Typography fontSize='14px' fontWeight={400} sx={{ borderLeft: '1px solid', borderLeftColor: borderColor, height: 'fit-content', pl: '8px' }}>
            {t<string>(showMore ? 'Less' : 'More')}
          </Typography>
          <ArrowDropDownIcon sx={{ color: 'secondary.light', fontSize: '20px', stroke: '#BA2882', strokeWidth: '2px', transform: showMore ? 'rotate(-180deg)' : 'rotate(0deg)', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
        </Grid>}
    </Grid>
  );
}

export default React.memo(AOC);
