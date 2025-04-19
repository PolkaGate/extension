// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { BalancesInfo } from '@polkadot/extension-polkagate/src/util/types';
import type { BN } from '@polkadot/util';
import type { ItemInformation } from '../nft/utils/types';

import { ChevronRight, MoreVert } from '@mui/icons-material';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import NftManager from '@polkadot/extension-polkagate/src/class/nftManager';
import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import PolkaGateIdenticon from '@polkadot/extension-polkagate/src/style/PolkaGateIdenticon';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util/utils';

import { AssetLogo, FormatPrice, Identity2 } from '../../components';
import { useAccountAssets, useCurrency, usePrices } from '../../hooks';

function MoreButton ({ address }: { address?: string }): React.ReactElement {
  const navigate = useNavigate();
  const [chevronHovered, setChevronHovered] = useState<boolean>(false);

  const onMouseEnter = useCallback(() => {
    setChevronHovered(true);
  }, []);

  const onMouseLeaveChevron = useCallback(() => {
    setChevronHovered(false);
  }, []);

  const goToAccountPage = useCallback(() => {
    address && navigate(`accountfs/${address}/0`);
  }, [address, navigate]);

  return (
    <Grid
      alignItems='center' container item justifyContent='center'
      onClick={goToAccountPage}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeaveChevron}
      sx={{ background: chevronHovered ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#05091C', borderRadius: '10px', border: '3px solid #1B133C', cursor: 'pointer', height: '36px', transition: 'all 0.2s ease-in-out', width: '36px' }}
    >
      <MoreVert sx={{ color: chevronHovered ? '#EAEBF1' : '#AA83DC', fontSize: '25px' }} />
    </Grid>
  );
}

function GoToAccountButton ({ address }: { address?: string }): React.ReactElement {
  const navigate = useNavigate();
  const [chevronHovered, setChevronHovered] = useState<boolean>(false);

  const onMouseEnter = useCallback(() => {
    setChevronHovered(true);
  }, []);

  const onMouseLeaveChevron = useCallback(() => {
    setChevronHovered(false);
  }, []);

  const goToAccountPage = useCallback(() => {
    address && navigate(`accountfs/${address}/0`);
  }, [address, navigate]);

  return (
    <Grid
      alignItems='center' container item justifyContent='center'
      onClick={goToAccountPage}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeaveChevron}
      sx={{ background: chevronHovered ? 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)' : '#05091C', borderRadius: '10px', border: '3px solid #1B133C', cursor: 'pointer', height: '36px', transition: 'all 0.2s ease-in-out', width: '36px' }}
    >
      <ChevronRight sx={{ color: chevronHovered ? '#EAEBF1' : '#AA83DC', fontSize: '28px' }} />
    </Grid>
  );
}

function Account ({ account }: { account: AccountWithChildren }): React.ReactElement {
  const navigate = useNavigate();
  const pricesInCurrencies = usePrices();
  const currency = useCurrency();
  const accountAssets = useAccountAssets(account.address);
  const nftManager = useMemo(() => new NftManager(), []);

  const [myNfts, setNfts] = useState<ItemInformation[] | null | undefined>();

  useEffect(() => {
    const address = account.address;

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
  }, [account.address, nftManager]);

  const calculatePrice = useCallback((amount: BN, decimal: number, price: number) => parseFloat(amountToHuman(amount, decimal)) * price, []);

  const totalBalance = useMemo(() => {
    if (accountAssets && pricesInCurrencies && currency) {
      const t = accountAssets.reduce((accumulator, { decimal, priceId, totalBalance }) => (accumulator + calculatePrice(totalBalance, decimal, pricesInCurrencies.prices?.[priceId]?.value ?? 0)), 0);

      return t;
    } else if (accountAssets === null) {
      return 0;
    }

    return undefined;
    /** we need currency as a dependency to update balance by changing currency*/
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountAssets, calculatePrice, currency, pricesInCurrencies]);

  const assetsToShow = useMemo(() => {
    if (!accountAssets || !pricesInCurrencies) {
      return accountAssets;
    }

    const sortedAssets = accountAssets
      .slice()
      .sort((a, b) => {
        if (!a.price) {
          return 0;
        }

        const aPrice = calculatePrice(a.totalBalance, a.decimal, pricesInCurrencies.prices?.[a.price]?.value ?? 0);
        const bPrice = calculatePrice(b.totalBalance, b.decimal, pricesInCurrencies.prices?.[b.token]?.value ?? 0);

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

    return uniqueAssets.filter((_asset) =>
      !getValue('total', _asset as unknown as BalancesInfo)?.isZero()
    );
  }, [accountAssets, calculatePrice, pricesInCurrencies]);

  const extraTokensCount = useMemo(() => assetsToShow ? assetsToShow.length - 4 : 0, [assetsToShow]);

  const goToNft = useCallback(() => {
    navigate(`/nft/${account.address}`);
  }, [account.address, navigate]);

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ m: '2px 0 10px', width: '95%' }}>
      <Stack alignItems='center' direction='row' justifyContent='flex-start' sx={{ m: '2px 10px', width: 'fit-content' }}>
        <PolkaGateIdenticon
          address={account.address}
          size={36}
        />
        <Stack alignItems='start' direction='column' justifyContent='flex-start' sx={{ ml: '5px', width: 'fit-content' }}>
          <Identity2
            address={account.address}
            genesisHash={account.genesisHash ?? POLKADOT_GENESIS}
            identiconSize={14}
            noIdenticon
            showShortAddress
            style={{ color: '#BEAAD8', variant: 'B-2' }}
          />
          <Box sx={{ alignItems: 'end', display: 'flex', mt: '3px', position: 'relative' }}>
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
                width: '10px'
              }}
            />
            <FormatPrice
              commify
              decimalColor='#BEAAD8'
              fontFamily='Inter'
              fontSize='16px'
              fontWeight={600}
              num={totalBalance}
              style={{ margin: '3px 0 0 20px' }}
              width='fit-content'
              withSmallDecimal
            />
            <Grid alignItems='center' container item sx={{ ml: '10px', position: 'relative' }} width='fit-content'>
              {assetsToShow?.slice(0, 4).map(({ genesisHash, token }, index) => {
                const logoInfo = getLogo2(genesisHash, token);

                return (
                  <Box key={`${genesisHash}+${token}`} sx={{ background: '#05091C', border: '2.57px solid #05091C', borderRadius: '50%', mb: '-4px', ml: index === 0 ? 0 : '-7px', position: 'relative', zIndex: index + 1 }}>
                    <AssetLogo assetSize='18px' baseTokenSize='10px' genesisHash={genesisHash} logo={logoInfo?.logo} />
                  </Box>
                );
              })}
            </Grid>
            {
              extraTokensCount > 0 &&
              <Grid alignItems='center' container item justifyContent='center' sx={{ border: '2px dashed #9C28B7', borderRadius: '9px', height: '18px', mb: '-2px', ml: '3px', minWidth: '24px', width: 'fit-content' }}>
                <Typography color='#EAEBF1' fontWeight={600} sx={{ letterSpacing: '-0.6px', lineHeight: 1, p: '0 4px 0 3px' }} variant='B-4'>
                  {`+${extraTokensCount}`}
                </Typography>
              </Grid>
            }
            {
              !!myNfts?.length &&
              <Stack alignItems='center' direction='row' mb='-2px' onClick={goToNft} sx={{ cursor: 'pointer' }}>
                <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.07) 0%, rgba(210, 185, 241, 0.35) 50.06%, rgba(210, 185, 241, 0.07) 100%)', width: '16px', height: '1px', transform: 'rotate(90deg)' }} />
                <Typography color='#AA83DC' variant='B-1'>
                  {`${myNfts?.length} NFTs`}
                </Typography>
              </Stack>
            }
          </Box>
        </Stack>
      </Stack>
      <Stack columnGap='5px' direction='row'>
        <MoreButton />
        <GoToAccountButton address={account?.address} />
      </Stack>
    </Stack>
  );
}

export default React.memo(Account);
