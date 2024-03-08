// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faShieldHalved, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckCircleOutline as CheckIcon, InsertLinkRounded as LinkIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Skeleton, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { AccountJson } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { ActionContext, DisplayLogo, FormatBalance2, FormatPrice, Identicon, Identity, Infotip, ShortAddress2 } from '../../../components';
import { useAccount, useAccountInfo, useTranslation } from '../../../hooks';
import { FetchedBalance } from '../../../hooks/useAssetsOnChains2';
import { showAccount, tieAccount, windowOpen } from '../../../messaging';
import { ACALA_GENESIS_HASH, ASSET_HUBS, BALANCES_VALIDITY_PERIOD, IDENTITY_CHAINS, KUSAMA_GENESIS_HASH, POLKADOT_GENESIS_HASH, PROXY_CHAINS, SOCIAL_RECOVERY_CHAINS, WESTEND_GENESIS_HASH } from '../../../util/constants';
import { BalancesInfo, Prices3, Proxy } from '../../../util/types';
import { amountToHuman } from '../../../util/utils';
import { getValue } from '../../account/util';
import AOC from './AOC';

interface AddressDetailsProps {
  address: string | undefined;
  api: ApiPromise | undefined;
  accountAssets: FetchedBalance[] | null | undefined;
  chain: Chain | null | undefined;
  formatted: string | undefined;
  chainName: string | undefined;
  isDarkTheme: boolean;
  balances: BalancesInfo | undefined;
  setSelectedAsset: React.Dispatch<React.SetStateAction<FetchedBalance | undefined>>;
  selectedAsset: FetchedBalance | undefined;
  price: number | undefined;
  pricesInCurrency: Prices3 | null | undefined;
}

export type DisplayLogoAOC = {
  base: string | null | undefined;
  symbol: string | undefined;
}

const onAssetHub = (genesisHash: string | null | undefined) => ASSET_HUBS.includes(genesisHash ?? '');

const displayLogoAOC = (genesisHash: string | null | undefined, symbol: string | undefined): DisplayLogoAOC => {
  if (onAssetHub(genesisHash)) {
    if (ASSET_HUBS[0] === genesisHash) {
      return {
        base: WESTEND_GENESIS_HASH,
        symbol
      };
    } else if (ASSET_HUBS[1] === genesisHash) {
      return {
        base: KUSAMA_GENESIS_HASH,
        symbol
      };
    } else {
      return {
        base: POLKADOT_GENESIS_HASH,
        symbol
      };
    }
  }

  if (ACALA_GENESIS_HASH === genesisHash) {
    if (symbol?.toLowerCase() === 'aca') {
      return {
        base: ACALA_GENESIS_HASH,
        symbol: undefined
      };
    } else {
      return {
        base: undefined,
        symbol
      };
    }
  }

  return {
    base: genesisHash,
    symbol: undefined
  };
};

const Price = ({ balanceToShow, isPriceOutdated, price }: { balanceToShow: BalancesInfo | undefined, isPriceOutdated: boolean | undefined, price: number | undefined }) => (
  <Grid item sx={{ '> div span': { display: 'block' }, color: isPriceOutdated ? 'primary.light' : 'text.primary', fontWeight: 400 }}>
    <FormatPrice
      amount={getValue('total', balanceToShow)}
      decimals={balanceToShow?.decimal}
      price={price}
      skeletonHeight={22}
      width='80px'
    />
  </Grid>
);

const Balance = ({ balanceToShow, isBalanceOutdated }: { balanceToShow: BalancesInfo | undefined, isBalanceOutdated: boolean | undefined }) => (
  <>
    {balanceToShow?.decimal
      ? <Grid item sx={{ color: isBalanceOutdated ? 'primary.light' : 'text.primary', fontWeight: 500 }}>
        <FormatBalance2
          decimalPoint={2}
          decimals={[balanceToShow.decimal]}
          tokens={[balanceToShow.token]}
          value={getValue('total', balanceToShow)}
        />
      </Grid>
      : <Skeleton animation='wave' height={22} sx={{ my: '2.5px', transform: 'none' }} variant='text' width={90} />
    }
  </>
);

const BalanceRow = ({ balanceToShow, isBalanceOutdated, isPriceOutdated, price }: { balanceToShow: BalancesInfo | undefined, isPriceOutdated: boolean | undefined, isBalanceOutdated: boolean | undefined, price: number | undefined }) => (
  <Grid alignItems='center' container fontSize='28px' item xs>
    <Balance balanceToShow={balanceToShow} isBalanceOutdated={isBalanceOutdated} />
    <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '30px', mx: '10px', my: 'auto' }} />
    <Price balanceToShow={balanceToShow} isPriceOutdated={isPriceOutdated} price={price} />
  </Grid>
);

const SelectedAsset = ({ account, balanceToShow, isBalanceOutdated, isPriceOutdated, price }: { account: AccountJson | undefined, balanceToShow: BalancesInfo | undefined, isBalanceOutdated: boolean | undefined, isPriceOutdated: boolean, price: number | undefined }) => (
  <Grid alignItems='center' container item minWidth='40%'>
    <Grid item pl='7px'>
      <DisplayLogo assetToken={displayLogoAOC(account?.genesisHash, balanceToShow?.token)?.symbol} genesisHash={displayLogoAOC(account?.genesisHash, balanceToShow?.token)?.base} size={42} />
    </Grid>
    <Grid item sx={{ fontSize: '28px', ml: '5px' }}>
      <BalanceRow balanceToShow={balanceToShow} isBalanceOutdated={isBalanceOutdated} isPriceOutdated={isPriceOutdated} price={price} />
    </Grid>
  </Grid>
);

export default function AccountInformation ({ accountAssets, address, api, balances, chain, chainName, formatted, isDarkTheme, price, pricesInCurrency, selectedAsset, setSelectedAsset }: AddressDetailsProps): React.ReactElement {
  const { t } = useTranslation();

  const account = useAccount(address);
  const accountInfo = useAccountInfo(api, formatted);
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const [hasID, setHasID] = useState<boolean | undefined>();
  const [isRecoverable, setIsRecoverable] = useState<boolean | undefined>();
  const [hasProxy, setHasProxy] = useState<boolean | undefined>();
  const [balanceToShow, setBalanceToShow] = useState<BalancesInfo>();

  const calculatePrice = useCallback((amount: BN, decimal: number, _price: number) => {
    return parseFloat(amountToHuman(amount, decimal)) * _price;
  }, []);

  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);
  const isBalanceOutdated = useMemo(() => balances && Date.now() - balances.date > BALANCES_VALIDITY_PERIOD, [balances]);
  const isPriceOutdated = useMemo(() => pricesInCurrency && Date.now() - pricesInCurrency.date > BALANCES_VALIDITY_PERIOD, [pricesInCurrency]);

  const assetsToShow = useMemo(() => {
    if (!accountAssets) {
      return accountAssets; // null or undefined!
    } else {
      return accountAssets.sort((a, b) => calculatePrice(b.totalBalance, b.decimal, pricesInCurrency?.prices?.[b.priceId]?.value ?? 0) - calculatePrice(a.totalBalance, a.decimal, pricesInCurrency?.prices?.[a.priceId]?.value ?? 0));
    }
  }, [accountAssets, calculatePrice, pricesInCurrency?.prices]);

  const recoverableToolTipTxt = useMemo(() => {
    switch (isRecoverable) {
      case true:
        return 'Recoverable';
      case false:
        return 'Not Recoverable';
      default:
        return 'Checking';
    }
  }, [isRecoverable]);

  const proxyTooltipTxt = useMemo(() => {
    if (hasProxy) {
      return 'Has Proxy';
    } else if (hasProxy === false) {
      return 'No Proxy';
    } else {
      return 'Checking';
    }
  }, [hasProxy]);

  const showAOC = useMemo(() => !!(assetsToShow === undefined || (assetsToShow && assetsToShow?.length > 0)), [assetsToShow]);

  useEffect((): void => {
    setHasID(undefined);
    setIsRecoverable(undefined);
    setHasProxy(undefined);

    if (!api || !address || !account?.genesisHash || api.genesisHash.toHex() !== account.genesisHash) {
      return;
    }

    if (api.query.identity && IDENTITY_CHAINS.includes(account.genesisHash)) {
      api.query.identity.identityOf(formatted).then((id) => setHasID(!id.isEmpty)).catch(console.error);
    } else {
      setHasID(false);
    }

    if (api.query?.recovery && SOCIAL_RECOVERY_CHAINS.includes(account.genesisHash)) {
      api.query.recovery.recoverable(formatted).then((r) => setIsRecoverable(r.isSome)).catch(console.error);
    } else {
      setIsRecoverable(false);
    }

    if (api.query?.proxy && PROXY_CHAINS.includes(account.genesisHash)) {
      api.query.proxy.proxies(formatted).then((p) => {
        const fetchedProxies = JSON.parse(JSON.stringify(p[0])) as unknown as Proxy[];

        setHasProxy(fetchedProxies.length > 0);
      }).catch(console.error);
    } else {
      setHasProxy(false);
    }
  }, [api, address, formatted, account?.genesisHash]);

  useEffect(() => {
    if (balances?.chainName === chainName) {
      return setBalanceToShow(balances);
    }

    setBalanceToShow(undefined);
  }, [balances, chainName]);

  const onAssetBoxClicked = useCallback((asset: FetchedBalance | undefined) => {
    address && asset && tieAccount(address, asset.genesisHash).finally(() => {
      setSelectedAsset(asset);
      // (asset?.assetId === undefined || asset?.assetId === -1) && setSelectedAsset(undefined);
    }).catch(console.error);
  }, [address, setSelectedAsset]);

  const openIdentity = useCallback(() => {
    address && windowOpen(`/manageIdentity/${address}`);
  }, [address]);

  const openSocialRecovery = useCallback(() => {
    address && windowOpen(`/socialRecovery/${address}/false`);
  }, [address]);

  const openManageProxy = useCallback(() => {
    address && chain && onAction(`/manageProxies/${address}`);
  }, [address, chain, onAction]);

  const toggleVisibility = useCallback((): void => {
    address && showAccount(address, account?.isHidden || false).catch(console.error);
  }, [account?.isHidden, address]);

  return (
    <Grid alignItems='center' container item sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : '0px solid', borderBottomWidth: '8px', borderColor: 'secondary.light', borderBottomColor: theme.palette.mode === 'light' ? 'black' : 'secondary.light', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: `20px 20px ${showAOC ? '5px' : '20px'} 20px` }}>
      <Grid container item>
        <Grid container item sx={{ borderRight: '1px solid', borderRightColor: borderColor, pr: '8px', width: 'fit-content' }}>
          <Grid container item pr='7px' sx={{ '> div': { height: 'fit-content' }, m: 'auto', width: 'fit-content' }}>
            <Identicon
              iconTheme={chain?.icon ?? 'polkadot'}
              prefix={chain?.ss58Format ?? 42}
              size={70}
              value={formatted || address}
            />
          </Grid>
          <Grid alignItems='center' container direction='column' display='grid' item justifyContent='center' justifyItems='center' width='fit-content'>
            <Grid item onClick={openIdentity} sx={{ border: '1px solid', borderColor: 'success.main', borderRadius: '5px', cursor: 'pointer', display: hasID ? 'inherit' : 'none', height: '24px', m: 'auto', p: '2px', width: 'fit-content' }}>
              {hasID
                ? accountInfo?.identity?.displayParent
                  ? <LinkIcon sx={{ bgcolor: 'success.main', border: '1px solid', borderRadius: '50%', color: 'white', fontSize: '18px', transform: 'rotate(-45deg)' }} />
                  : <CheckIcon sx={{ bgcolor: 'success.main', border: '1px solid', borderRadius: '50%', color: 'white', fontSize: '18px' }} />
                : undefined
              }
            </Grid>
            <Grid height='24px' item width='24px'>
              <Infotip placement='right' text={t(recoverableToolTipTxt)}>
                <IconButton
                  onClick={openSocialRecovery}
                  sx={{ height: '24px', width: '24px' }}
                >
                  <FontAwesomeIcon
                    icon={faShieldHalved}
                    style={{ border: '1px solid', borderRadius: '5px', color: isRecoverable ? theme.palette.success.main : theme.palette.action.disabledBackground, fontSize: '16px', padding: '3px' }}
                  />
                </IconButton>
              </Infotip>
            </Grid>
            <Grid height='24px' item width='fit-content'>
              <Infotip placement='right' text={t(proxyTooltipTxt)}>
                <IconButton onClick={openManageProxy} sx={{ height: '16px', width: '16px' }}>
                  <FontAwesomeIcon
                    icon={faSitemap}
                    style={{ border: '1px solid', borderRadius: '5px', color: hasProxy ? theme.palette.success.main : theme.palette.action.disabledBackground, fontSize: '16px', padding: '2px' }}
                  />
                </IconButton>
              </Infotip>
            </Grid>
          </Grid>
        </Grid>
        <Grid container item sx={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 60%) max-content' }} xs>
          <Grid container direction='column' item sx={{ borderRight: '1px solid', borderRightColor: borderColor, px: '7px' }}>
            <Grid container item justifyContent='space-between'>
              <Identity
                address={address}
                api={api}
                chain={chain}
                noIdenticon
                style={{ width: 'calc(100% - 40px)' }}
                subIdOnly
              />
              <Grid item width='40px'>
                <Infotip text={account?.isHidden && t('This account is hidden from websites')}>
                  <IconButton onClick={toggleVisibility} sx={{ height: '20px', ml: '7px', mt: '13px', p: 0, width: '28px' }}>
                    <vaadin-icon icon={account?.isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ color: `${theme.palette.secondary.light}`, height: '20px' }} />
                  </IconButton>
                </Infotip>
              </Grid>
            </Grid>
            <Grid alignItems='center' container item sx={{ '> div div:last-child': { width: 'auto' } }} xs>
              <ShortAddress2 address={formatted || address} clipped showCopy style={{ fontSize: '10px', fontWeight: 300 }} />
            </Grid>
          </Grid>
          <SelectedAsset
            account={account}
            balanceToShow={balanceToShow}
            isBalanceOutdated={isBalanceOutdated}
            isPriceOutdated={!!isPriceOutdated}
            price={price}
          />
        </Grid>
      </Grid>
      {showAOC &&
        <>
          <Divider sx={{ bgcolor: borderColor, height: '1px', my: '15px', width: '100%' }} />
          <AOC
            account={account}
            accountAssets={assetsToShow}
            api={api}
            balanceToShow={balanceToShow}
            borderColor={borderColor}
            displayLogoAOC={displayLogoAOC}
            mode='Detail'
            onclick={onAssetBoxClicked}
            selectedAsset={selectedAsset}
          />
        </>
      }
    </Grid>
  );
}
