// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { BalancesInfo } from '../../../util/types';

import { AvatarGroup, Container, Grid, useTheme } from '@mui/material';
// @ts-ignore
import { Wordpress } from 'better-react-spinkit';
import React, { useCallback, useMemo } from 'react';

import { AssetLogo } from '../../../components';
import { useAccountAssets, usePrices } from '../../../hooks';
import { amountToHuman } from '../../../util';
import getLogo2 from '../../../util/getLogo2';
import { getValue } from '../../account/util';

const MAX_ASSETS_TO_SHOW = 4; // we're gonna display up to 2 assets if they were available!

interface AssetsGroupProps {
  address: string | undefined;
}

function AssetsGroup({ address }: AssetsGroupProps): React.ReactElement {
  const theme = useTheme();
  const accountAssets = useAccountAssets(address);
  const pricesInCurrencies = usePrices();

  const calculatePrice = useCallback((amount: BN, decimal: number, price: number) => parseFloat(amountToHuman(amount, decimal)) * price, []);

  const assetsToShow = useMemo(() => {
    if (!accountAssets || !pricesInCurrencies) {
      return accountAssets; // null  or undefined
    } else {
      const sortedAssets = accountAssets.sort((a, b) => calculatePrice(b.totalBalance, b.decimal, pricesInCurrencies.prices?.[b.priceId]?.value ?? 0) - calculatePrice(a.totalBalance, a.decimal, pricesInCurrencies.prices?.[a.priceId]?.value ?? 0));

      return sortedAssets.filter((_asset) => !getValue('total', _asset as unknown as BalancesInfo)?.isZero());
    }
  }, [accountAssets, calculatePrice, pricesInCurrencies]);

  if (assetsToShow === null || assetsToShow?.length === 0) {
    return <></>;
  }

  if (assetsToShow === undefined) {
    return (
      <Grid alignItems='center' container item px='10px' width='fit-content'>
        <Wordpress
          color={theme.palette.text.disabled}
          size={15}
          timingFunction='linear'
        />
      </Grid>
    );
  }

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', m: 0, width: 'fit-content' }}>
      <AvatarGroup
        sx={{
          '> .MuiAvatar-root.MuiAvatar-square': {
            border: '2px solid',
            borderColor: '#2D1E4A',
            filter: 'none',
            ml: '-2px'
          }
        }}
      >
        {assetsToShow?.slice(0, MAX_ASSETS_TO_SHOW).map(({ genesisHash, token }, index) => (
          <AssetLogo
            assetSize='15px'
            baseTokenSize='8px'
            genesisHash={genesisHash}
            key={index}
            logo={getLogo2(genesisHash, token)?.subLogo ?? getLogo2(genesisHash, token)?.logo}
            subLogo={undefined}
          />
        ))}
      </AvatarGroup>
    </Container>
  );
}

export default AssetsGroup;
