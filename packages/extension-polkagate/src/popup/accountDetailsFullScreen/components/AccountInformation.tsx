// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faShieldHalved, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckCircleOutline as CheckIcon, InsertLinkRounded as LinkIcon } from '@mui/icons-material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Avatar, Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { ActionContext, ChainLogo, FormatBalance2, FormatPrice, Identicon, Identity, Infotip, ShortAddress2, ShowBalance } from '../../../components';
import { useAccount, useAccountInfo, useDecimal, useProxies, useToken, useTranslation } from '../../../hooks';
import { showAccount, windowOpen } from '../../../messaging';
import { BALANCES_VALIDITY_PERIOD, CHAINS_WITH_BLACK_LOGO } from '../../../util/constants';
import getLogo from '../../../util/getLogo';
import { BalancesInfo, Price } from '../../../util/types';
import { getValue } from '../../account/util';
import { AssetsOnOtherChains } from '..';

interface AddressDetailsProps {
  address: string | undefined;
  api: ApiPromise | undefined;
  assetsOnOtherChains: AssetsOnOtherChains[] | undefined;
  chain: Chain | null | undefined;
  formatted: string | undefined;
  chainName: string | undefined;
  isDarkTheme: boolean;
  balances: BalancesInfo | undefined;
  price: Price | undefined;
}

export default function AccountInformation({ address, api, assetsOnOtherChains, balances, chain, chainName, formatted, isDarkTheme, price }: AddressDetailsProps): React.ReactElement {
  const { t } = useTranslation();
  const account = useAccount(address);
  const accountInfo = useAccountInfo(api, formatted);
  const theme = useTheme();
  const token = useToken(address);
  const onAction = useContext(ActionContext);
  const proxies = useProxies(api, formatted);

  const [hasID, setHasID] = useState<boolean | undefined>();
  const [recoverable, setRecoverable] = useState<boolean | undefined>();
  const [balanceToShow, setBalanceToShow] = useState<BalancesInfo>();
  const [showMore, setShowMore] = useState<boolean>(false);

  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);
  const isBalanceOutdated = useMemo(() => balances && Date.now() - balances.date > BALANCES_VALIDITY_PERIOD, [balances]);
  const isPriceOutdated = useMemo(() => price !== undefined && Date.now() - price.date > BALANCES_VALIDITY_PERIOD, [price]);
  const otherAssetsToShow = useMemo(() => {
    if (!assetsOnOtherChains || assetsOnOtherChains.length === 0) {
      return undefined;
    } else {
      return assetsOnOtherChains.filter((asset) => !asset.totalBalance.isZero() && asset.token !== token);
    }
  }, [assetsOnOtherChains, token]);

  useEffect((): void => {
    api && api?.query.identity && api?.query.identity.identityOf(address).then((id) => setHasID(!id.isEmpty)).catch(console.error);
    api && api.query?.recovery && api.query.recovery.recoverable(formatted).then((r) => r.isSome && setRecoverable(r.unwrap())).catch(console.error);
  }, [api, address, formatted]);

  useEffect(() => {
    if (balances?.chainName === chainName) {
      return setBalanceToShow(balances);
    }

    setBalanceToShow(undefined);
  }, [balances, chainName]);

  // const subscanLink = useCallback((address: string) => {
  //   if (chainName === 'WestendAssetHub') {
  //     return `https://westmint.statescan.io/#/accounts/${String(address)}`;
  //   }

  //   if (chainName?.includes('AssetHub')) {
  //     return `https://assethub-${chainName.replace(/AssetHub/, '')}.subscan.io/account/${String(address)}`;
  //   }

  //   return `https://${chainName}.subscan.io/account/${String(address)}`;
  // }, [chainName]);

  const Balance = () => (
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
        : <Skeleton height={22} sx={{ my: '2.5px', transform: 'none' }} variant='text' width={90} />
      }
    </>
  );

  const Price = () => (
    <>
      {price === undefined || !balanceToShow || balanceToShow?.chainName?.toLowerCase() !== price?.chainName
        ? <Skeleton height={22} sx={{ my: '2.5px', transform: 'none' }} variant='text' width={80} />
        : <Grid item sx={{ '> div span': { display: 'block' }, color: isPriceOutdated ? 'primary.light' : 'text.primary', fontWeight: 400 }}>
          <FormatPrice
            amount={getValue('total', balanceToShow)}
            decimals={balanceToShow.decimal}
            price={price.amount}
          />
        </Grid>
      }
    </>
  );

  const BalanceRow = () => (
    <Grid alignItems='center' container fontSize='28px' item xs>
      <Balance />
      <Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '30px', mx: '10px', my: 'auto' }} />
      <Price />
    </Grid>
  );

  const toggleAssets = useCallback(() => setShowMore(!showMore), [showMore]);

  const BalanceColumn = ({ asset }: { asset: AssetsOnOtherChains }) => (
    <Grid alignItems='flex-start' container direction='column' item xs>
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

  const OtherAssetBox = ({ asset }: { asset: AssetsOnOtherChains }) => (
    <Grid alignItems='center' container item justifyContent='center' sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '8px', p: '5px' }} width='fit-content'>
      <Grid alignItems='center' container item pr='5px' width='fit-content'>
        <Avatar src={getLogo(asset.chainName)} sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(asset.chainName) && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: 22, width: 22 }} variant='square' />
      </Grid>
      <BalanceColumn
        asset={asset}
      />
    </Grid>
  );

  const OtherAssets = ({ assetsOnOtherChains }: { assetsOnOtherChains: AssetsOnOtherChains[] }) => (
    <Grid container item sx={{ borderTop: '1px solid', borderTopColor: borderColor, mt: '10px', pt: '15px' }}>
      <Typography fontSize='14px' fontWeight={400} width='80px'>
        {t<string>('Assets on other chains')}
      </Typography>
      <Grid container gap='15px' item justifyContent='flex-start' sx={{ height: showMore ? 'fit-content' : '42px', overflow: 'hidden', px: '5%', transitionDuration: '0.2s', transitionProperty: 'transform' }} xs>
        {assetsOnOtherChains.map((asset, index) => (
          <OtherAssetBox
            asset={asset}
            key={index}
          />
        ))}
      </Grid>
      {assetsOnOtherChains.length > 5 &&
        <Grid container item justifyContent='center' onClick={toggleAssets} sx={{ cursor: 'pointer', width: '65px' }}>
          <Typography fontSize='14px' fontWeight={400} sx={{ borderLeft: '1px solid', borderLeftColor: borderColor, height: 'fit-content', pl: '8px' }}>
            {t<string>(showMore ? 'Less' : 'More')}
          </Typography>
          <ArrowDropDownIcon sx={{ color: 'secondary.light', fontSize: '20px', stroke: '#BA2882', strokeWidth: '2px', transform: showMore ? 'rotate(-180deg)' : 'rotate(0deg)', transitionDuration: '0.2s', transitionProperty: 'transform' }} />
        </Grid>}
    </Grid>
  );

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
    <Grid alignItems='center' container item sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '20px 30px 15px', position: 'relative' }}>
      <Grid container item>
        <Grid container item sx={{ borderRight: '1px solid', borderRightColor: borderColor, pr: '15px', width: 'fit-content' }}>
          <Grid container item pr='5px' width='fit-content'>
            <Identicon
              iconTheme={chain?.icon ?? 'polkadot'}
              prefix={chain?.ss58Format ?? 42}
              size={60}
              value={formatted || address}
            />
          </Grid>
          <Grid container direction='column' display='grid' item justifyContent='center' justifyItems='center' width='fit-content'>
            <Grid item onClick={openIdentity} sx={{ border: '1px solid', borderRadius: '5px', borderColor: 'success.main', cursor: 'pointer', display: hasID ? 'inherit' : 'none', p: '2px', width: 'fit-content' }}>
              {hasID
                ? accountInfo?.identity?.displayParent
                  ? <LinkIcon sx={{ bgcolor: 'success.main', border: '1px solid', borderRadius: '50%', color: 'white', fontSize: '18px', transform: 'rotate(-45deg)' }} />
                  : <CheckIcon sx={{ bgcolor: 'success.main', border: '1px solid', borderRadius: '50%', color: 'white', fontSize: '18px' }} />
                : undefined
              }
            </Grid>
            <Grid item width='fit-content'>
              <Infotip placement='bottom-start' text={t('Is recoverable')}>
                <IconButton
                  onClick={openSocialRecovery}
                  sx={{ height: '16px', width: '16px' }}
                >
                  <FontAwesomeIcon
                    icon={faShieldHalved}
                    style={{ border: '1px solid', borderRadius: '5px', color: recoverable ? theme.palette.success.main : theme.palette.action.disabledBackground, fontSize: '16px', padding: '3px' }}
                  />
                </IconButton>
              </Infotip>
            </Grid>
            <Grid item width='fit-content'>
              <Infotip placement='bottom-end' text={t('Has proxy')}>
                <IconButton onClick={openManageProxy} sx={{ height: '16px', width: '16px' }}>
                  <FontAwesomeIcon
                    icon={faSitemap}
                    style={{ border: '1px solid', borderRadius: '5px', color: proxies?.length ? theme.palette.success.main : theme.palette.action.disabledBackground, fontSize: '16px', padding: '2px' }}
                  />
                </IconButton>
              </Infotip>
            </Grid>
          </Grid>
        </Grid>
        <Grid container direction='column' item sx={{ borderRight: '1px solid', borderRightColor: borderColor, px: '10px' }} xs={5}>
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
            <ShortAddress2 address={formatted} charsCount={40} showCopy style={{ fontSize: '10px', fontWeight: 300 }} />
          </Grid>
        </Grid>
        <Grid alignItems='center' container item xs>
          <Grid item px='10px'>
            <ChainLogo genesisHash={account?.genesisHash ?? ''} size={42} />
          </Grid>
          <Grid item sx={{ fontSize: '28px', ml: '5px' }}>
            <BalanceRow />
          </Grid>
        </Grid>
      </Grid>
      {otherAssetsToShow && otherAssetsToShow.length > 0 &&
        <OtherAssets
          assetsOnOtherChains={otherAssetsToShow}
        />
      }
      {theme.palette.mode === 'light' &&
        <Grid item sx={{ bgcolor: 'black', borderRadius: '0 0 5px 5px', height: '6px', inset: 'auto 0 0 0', position: 'absolute' }}></Grid>
      }
    </Grid>
  );
}
