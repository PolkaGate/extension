// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveAccountRegistration, DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { AccountJson, AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { IconTheme } from '@polkadot/react-identicon/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { faUsb } from '@fortawesome/free-brands-svg-icons';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useApi, useEndpoint, useMetadata, useOutsideClick, useProxies, useToast, useTranslation } from '../hooks';
import { showAccount } from '../messaging';
import { AccMenu } from '../partials';
import { getPrice } from '../util/api/getPrice';
import { DEFAULT_TYPE } from '../util/defaultType';
import { AddressPriceAll } from '../util/plusTypes';
import AccountDetail from './AccountDetail';
import AccountFeatures from './AccountFeatures';
import AccountIcons from './AccountIcons';
import { AccountContext, SettingsContext } from '.';
import type { ApiPromise } from '@polkadot/api';

export interface Props {
  actions?: React.ReactNode;
  address?: string | null;
  children?: React.ReactNode;
  genesisHash?: string | null;
  isExternal?: boolean | null;
  isHardware?: boolean | null;
  isHidden?: boolean;
  name?: string | null;
  parentName?: string | null;
  suri?: string;
  toggleActions?: number;
  type?: KeypairType;
  setAllPrices: React.Dispatch<React.SetStateAction<AddressPriceAll[] | undefined>>;
  allPrices: AddressPriceAll[] | undefined;
}

interface Recoded {
  account: AccountJson | null;
  formatted: string | null;
  genesisHash?: string | null;
  prefix?: number;
  type: KeypairType;
}

// find an account in our list
function findSubstrateAccount(accounts: AccountJson[], publicKey: Uint8Array): AccountJson | null {
  const pkStr = publicKey.toString();

  return accounts.find(({ address }): boolean =>
    decodeAddress(address).toString() === pkStr
  ) || null;
}

// find an account in our list
function findAccountByAddress(accounts: AccountJson[], _address: string): AccountJson | null {
  return accounts.find(({ address }): boolean =>
    address === _address
  ) || null;
}

// recodes an supplied address using the prefix/genesisHash, include the actual saved account & chain
function recodeAddress(address: string, accounts: AccountWithChildren[], chain: Chain | null, settings: SettingsStruct): Recoded {
  // decode and create a shortcut for the encoded address
  const publicKey = decodeAddress(address);

  // find our account using the actual publicKey, and then find the associated chain
  const account = findSubstrateAccount(accounts, publicKey);
  const prefix = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

  // always allow the actual settings to override the display
  return {
    account,
    formatted: account?.type === 'ethereum'
      ? address
      : encodeAddress(publicKey, prefix),
    genesisHash: account?.genesisHash,
    prefix,
    type: account?.type || DEFAULT_TYPE
  };
}

const defaultRecoded = { account: null, formatted: null, prefix: 42, type: DEFAULT_TYPE };
const isChainApi = (chain: Chain | null, api: ApiPromise | undefined) => (chain?.genesisHash && api?.genesisHash && chain.genesisHash === api.genesisHash?.toString());

export default function AccountPreview({ actions, address, allPrices, children, genesisHash, isExternal, isHardware, isHidden, name, parentName, setAllPrices, suri, toggleActions, type: givenType }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const history = useHistory();
  const { accounts } = useContext(AccountContext);
  const settings = useContext(SettingsContext);
  const [{ account, formatted, genesisHash: recodedGenesis, prefix, type }, setRecoded] = useState<Recoded>(defaultRecoded);
  const chain = useMetadata(genesisHash || recodedGenesis, true);
  const endpoint = useEndpoint(address, chain);
  const api = useApi(endpoint);
  const proxies = useProxies(api, formatted);

  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actMenuRef = useRef<HTMLDivElement>(null);

  const [identity, setIdentity] = useState<DeriveAccountRegistration | undefined>();
  const [recoverable, setRecoverable] = useState<boolean | undefined>();
  const [balances, setBalances] = useState<DeriveBalancesAll | undefined>();
  const [price, setPrice] = useState<number>();

  useEffect(() => {
    if (!chain) {
      return;
    }

    setPrice(undefined);
    // eslint-disable-next-line no-void
    void getPrice(chain).then((p) => {
      setPrice(p);
    });
  }, [chain]);

  useEffect((): void => {
    // eslint-disable-next-line no-void
    api && api.query?.recovery && api.query.recovery.recoverable(formatted).then((r) => r.isSome && setRecoverable(r.unwrap()));
  }, [api, formatted]);

  useEffect((): void => {
    if (balances === undefined || price === undefined || !api) {
      return;
    }

    const decimals = api.registry.chainDecimals[0];
    const temp = allPrices ?? {};

    temp[String(balances.accountId)] = { balances, decimals, price };
    setAllPrices({ ...temp });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, balances, price, setAllPrices]);

  useEffect((): void => {
    if (!address) {
      return setRecoded(defaultRecoded);
    }

    const account = findAccountByAddress(accounts, address);

    setRecoded(
      (
        chain?.definition.chainType === 'ethereum' ||
        account?.type === 'ethereum' ||
        (!account && givenType === 'ethereum')
      )
        ? { account, formatted: address, type: 'ethereum' }
        : recodeAddress(address, accounts, chain, settings)
    );
  }, [accounts, address, chain, givenType, settings]);

  useEffect(() => {
    setBalances(undefined);
    // eslint-disable-next-line no-void
    isChainApi(chain, api) && formatted && void api.derive.balances?.all(formatted).then(setBalances).catch(console.error);
  }, [api, chain, formatted]);

  // useEffect(() => {
  //   if (!showActionsMenu) {
  //     setIsMovedMenu(false);
  //   } else if (actMenuRef.current) {
  //     const { bottom } = actMenuRef.current.getBoundingClientRect();

  //     if (bottom > ACCOUNTS_SCREEN_HEIGHT) {
  //       setIsMovedMenu(true);
  //     }
  //   }
  // }, [showActionsMenu]);

  useEffect((): void => {
    setShowActionsMenu(false);
  }, [toggleActions]);

  useEffect((): void => {
    // eslint-disable-next-line no-void
    api && formatted && void api.derive.accounts.info(formatted).then((info) => {
      setIdentity(info?.identity);
    });
  }, [api, formatted]);

  const judgement = useMemo(
    () =>
      identity?.judgements && JSON.stringify(identity?.judgements).match(/reasonable|knownGood/gi)
    , [identity?.judgements]
  );

  const identiconTheme = (
    type === 'ethereum'
      ? 'ethereum'
      : (chain?.icon || 'polkadot')
  ) as IconTheme;

  const _onClick = useCallback(
    () => setShowActionsMenu(!showActionsMenu),
    [showActionsMenu]
  );

  const _toggleVisibility = useCallback(
    (): void => {
      address && showAccount(address, isHidden || false).catch(console.error);
    },
    [address, isHidden]
  );

  const Name = () => {
    const accountName = name || account?.name;
    const displayName = identity?.display || accountName || t('<Unknown>');

    return (
      <>
        {!!accountName && (account?.isExternal || isExternal) && (
          (account?.isHardware || isHardware)
            ? (
              <FontAwesomeIcon
                className='hardwareIcon'
                icon={faUsb}
                rotation={270}
                title={t('hardware wallet account')}
              />
            )
            : (
              <FontAwesomeIcon
                className='externalIcon'
                icon={faQrcode}
                title={t('external account')}
              />
            )
        )}
        <span title={displayName}>{displayName}</span>
      </>);
  };

  const goToAccount = useCallback(() => {
    genesisHash && address && formatted && history.push({
      pathname: `/account/${genesisHash}/${address}/${formatted}/`,
      state: { api, balances, identity }
    });
  }, [balances, history, genesisHash, address, formatted, api, identity]);

  return (
    <Grid alignItems='center' container py='15px'>
      <AccountIcons
        address={formatted}
        identiconTheme={identiconTheme}
        prefix={prefix}
        proxies={proxies}
        recoverable={recoverable}
      />
      <AccountDetail
        address={formatted}
        balances={balances}
        chain={chain}
        isHidden={isHidden}
        name={name || account?.name}
        price={price}
        toggleVisibility={_toggleVisibility}
      />
      <AccountFeatures goOnClick={goToAccount} moreOnClick={_onClick} />
      {
        showActionsMenu &&
        <AccMenu
          account={account}
          address={formatted}
          chain={chain}
          isMenuOpen={showActionsMenu}
          reference={actMenuRef}
          setShowMenu={setShowActionsMenu}
        />
      }
    </Grid>
  );
}
