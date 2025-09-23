// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { BalancesInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { ItemInformation } from '../nft/utils/types';

import { Box, Grid, Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NftManager from '@polkadot/extension-polkagate/src/class/nftManager';
import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import { calcPrice } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { BN_ZERO } from '@polkadot/util';

import { AssetLogo, FormatPrice, Identity2, MySkeleton } from '../../components';
import { useAccountAssets, useAccountSelectedChain, useCurrency, usePrices } from '../../hooks';
import { setStorage } from '../../util';

interface Props {
  account: AccountWithChildren | undefined;
  onClick?: () => void;
  style?: React.CSSProperties;
  variant?: string;
  setDefaultGenesisAndAssetId?: React.Dispatch<React.SetStateAction<string | undefined>>
}

function Account ({ account, onClick, setDefaultGenesisAndAssetId, style = {}, variant = 'B-2' }: Props): React.ReactElement {
  const navigate = useNavigate();
  const pricesInCurrencies = usePrices();
  const currency = useCurrency();
  const accountAssets = useAccountAssets(account?.address);
  const savedSelectedChain = useAccountSelectedChain(account?.address);

  const nftManager = useMemo(() => new NftManager(), []);

  const [myNfts, setNfts] = useState<ItemInformation[] | null | undefined>();

  useEffect(() => {
    const address = account?.address;

    if (!address) {
      return;
    }

    // Handle updates after initialization
    const handleNftUpdate = (updatedAddress: string, updatedNfts: ItemInformation[]) => {
      if (updatedAddress === address) {
        setNfts(updatedNfts);
      }
    };

    // Waits for initialization
    nftManager.waitForInitialization()
      .then(() => {
        setNfts(nftManager.get(address));
      })
      .catch(console.error);

    // subscribe to the possible nft items for the account
    nftManager.subscribe(handleNftUpdate);

    // Cleanup
    return () => {
      nftManager.unsubscribe(handleNftUpdate);
    };
  }, [account?.address, nftManager]);

  const valueInCurrency = useMemo(() => {
    if (accountAssets && pricesInCurrencies && currency) {
      const t = accountAssets.reduce((accumulator, { decimal, priceId, totalBalance }) => (accumulator + calcPrice(pricesInCurrencies.prices?.[priceId]?.value, totalBalance, decimal)), 0);

      return t;
    } else if (accountAssets === null) {
      return 0;
    }

    return undefined;
    /** we need currency as a dependency to update balance by changing currency*/
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountAssets, currency, pricesInCurrencies]);

  const assetsToShow = useMemo(() => {
    if (!accountAssets || !pricesInCurrencies) {
      return accountAssets;
    }

    const nonZeroAssets = accountAssets.filter((_asset) =>
      !getValue('total', _asset as unknown as BalancesInfo)?.isZero()
    );

    const { prices } = pricesInCurrencies;

    const sortedAssets = nonZeroAssets
      .slice()
      .sort((a, b) => {
        const aTotalBalance = getValue('total', a as unknown as BalancesInfo) ?? BN_ZERO;
        const bTotalBalance = getValue('total', b as unknown as BalancesInfo) ?? BN_ZERO;

        const aPrice = calcPrice(prices?.[a.priceId]?.value, aTotalBalance, a.decimal);
        const bPrice = calcPrice(prices?.[b.priceId]?.value, bTotalBalance, b.decimal);

        return bPrice - aPrice;
      });

    // remove duplicates based on `token`
    const seen = new Set<string>();
    const uniqueAssets = [];

    for (const asset of sortedAssets) {
      if (!seen.has(asset.token)) {
        seen.add(asset.token);
        uniqueAssets.push(asset);
      }
    }

    return uniqueAssets;
  }, [accountAssets, pricesInCurrencies]);

  useEffect(() => {
    if (!accountAssets?.length) {
      return;
    }

    const prices = pricesInCurrencies?.prices;
    const assets = accountAssets.filter(({ genesisHash }) => genesisHash === savedSelectedChain);

    if (assets.length) {
      const init = {
        asset: assets[0],
        worth: calcPrice(prices?.[assets[0].priceId]?.value ?? 0, assets[0].totalBalance, assets[0].decimal)
      };

      const maxValueAsset = assets.reduce((max, asset) => {
        const price = prices?.[asset.priceId]?.value ?? 0;
        const worth = calcPrice(price, asset.totalBalance, asset.decimal);

        return worth > max.worth
          ? {
            asset,
            worth
          }
          : max;
      }, init);

      return setDefaultGenesisAndAssetId?.(`${maxValueAsset.asset.genesisHash}/${maxValueAsset.asset.assetId}`);
    }

    setDefaultGenesisAndAssetId?.(`${accountAssets[0].genesisHash}/${accountAssets[0].assetId}`);
  }, [account?.address, accountAssets, pricesInCurrencies?.prices, savedSelectedChain, setDefaultGenesisAndAssetId]);

  const extraTokensCount = useMemo(() => assetsToShow ? assetsToShow.length - 4 : 0, [assetsToShow]);

  const goToNft = useCallback(() => {
    if (!account?.address) {
      return;
    }

    setStorage(STORAGE_KEY.SELECTED_ACCOUNT, account.address)
      .finally(() =>
        navigate(`/nft/${account.address}`) as void
      ).catch(console.error);
  }, [account, navigate]);

  return (
    <Stack alignItems='start' direction='column' justifyContent='flex-start' sx={{ ml: '5px', width: '100%', ...style }}>
      <Identity2
        address={account?.address}
        genesisHash={account?.genesisHash ?? POLKADOT_GENESIS}
        nameStyle={{ maxWidth: '90%', overflow: 'hidden', textOverflow: 'ellipsis' }}
        noIdenticon
        onClick={onClick}
        socialStyles={{ mt: 0 }}
        style={{ color: '#BEAAD8', variant, width: '100%' }}
      />
      <Box sx={{ alignItems: 'end', display: 'flex', my: '3px', position: 'relative' }}>
        {/* Curve */}
        <Box
          sx={{
            borderBottom: '1px solid #674394',
            borderLeft: '1px solid #674394',
            borderRadius: '0 0 0 75%',
            height: '14px',
            left: '2px',
            position: 'absolute',
            top: '-2px',
            width: '11px'
          }}
        />
        <FormatPrice
          commify
          decimalColor='#BEAAD8'
          fontFamily='Inter'
          fontSize='16px'
          fontWeight={600}
          num={valueInCurrency}
          style={{ margin: '3px 0 0 20px' }}
          width={valueInCurrency ? 'fit-content' : '100px'}
          withSmallDecimal
        />
        {accountAssets === undefined &&
          <Stack direction='row' spacing={0.1} sx={{ ml: '17px', position: 'relative' }}>
            {[1, 2, 3].map((index) => (
              <MySkeleton
                height={18}
                key={index}
                width={18}
              />
            ))}
          </Stack>
        }
        <Grid alignItems='center' container item sx={{ ml: '10px', position: 'relative' }} width='fit-content'>
          {assetsToShow?.slice(0, 4).map(({ genesisHash, token }, index) => {
            const logoInfo = getLogo2(genesisHash, token);

            return (
              <Box key={`${genesisHash}+${token}+${index}`} sx={{ background: '#05091C', border: '2.57px solid #05091C', borderRadius: '50%', mb: '-4px', ml: index === 0 ? 0 : '-7px', position: 'relative', zIndex: index + 1 }}>
                <AssetLogo assetSize='18px' baseTokenSize='10px' genesisHash={genesisHash} logo={logoInfo?.logo} />
              </Box>
            );
          })}
        </Grid>
        {
          extraTokensCount > 0 &&
          <Grid alignItems='center' container item justifyContent='center' sx={{ border: '2px dashed #9C28B7', borderRadius: '9px', height: '18px', mb: '-2px', minWidth: '24px', ml: '3px', width: 'fit-content' }}>
            <Typography color='#EAEBF1' fontWeight={600} sx={{ letterSpacing: '-0.6px', lineHeight: 1, p: '0 4px 0 3px' }} variant='B-4'>
              {`+${extraTokensCount}`}
            </Typography>
          </Grid>
        }
        {
          !!myNfts?.length &&
          <Stack alignItems='center' direction='row' mb='-2px' onClick={goToNft} sx={{ cursor: 'pointer' }}>
            <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.07) 0%, rgba(210, 185, 241, 0.35) 50.06%, rgba(210, 185, 241, 0.07) 100%)', height: '1px', transform: 'rotate(90deg)', width: '16px' }} />
            <Typography color='#AA83DC' variant='B-1'>
              {`${myNfts?.length} NFTs`}
            </Typography>
          </Stack>
        }
      </Box>
    </Stack>
  );
}

export default React.memo(Account);
