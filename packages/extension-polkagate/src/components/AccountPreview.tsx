// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountRegistration, DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { IconTheme } from '@polkadot/react-identicon/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { faUsb } from '@fortawesome/free-brands-svg-icons';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { useApi, useEndpoint, useMetadata, useProxies, useTranslation } from '../hooks';
import { showAccount, updateMeta } from '../messaging';
import { AccMenu } from '../partials';
import { getPrice } from '../util/api/getPrice';
import { AddressPriceAll, LastBalances, SavedMetaData } from '../util/types';
import { getFormattedAddress, prepareMetaData } from '../util/utils';
import AccountDetail from '../partials/AccountDetail';
import AccountFeatures from './AccountFeatures';
import AccountIcons from './AccountIcons';
import { SettingsContext } from '.';

export interface Props {
  actions?: React.ReactNode;
  address: string;
  children?: React.ReactNode;
  genesisHash?: string | null;
  isExternal?: boolean | null;
  isHardware?: boolean | null;
  isHidden?: boolean;
  name?: string | undefined;
  parentName?: string | null;
  suri?: string;
  toggleActions?: number;
  type?: KeypairType;
  setAllPrices: React.Dispatch<React.SetStateAction<AddressPriceAll[] | undefined>>;
  allPrices: AddressPriceAll[] | undefined;
  balancesOnLocalStorage?: string;
}

const isChainApi = (chain: Chain | null, api: ApiPromise | undefined) => (chain?.genesisHash && api?.genesisHash && chain.genesisHash === api.genesisHash?.toString());

const prepareLastBalance = ({ availableBalance, decimals, freeBalance, frozenFee, frozenMisc, lockedBalance, reservedBalance, tokens, vestedBalance, vestedClaimable, votingBalance }): LastBalances => {
  return {
    availableBalance: new BN(availableBalance),
    decimals,
    tokens,
    freeBalance: new BN(freeBalance),
    reservedBalance: new BN(reservedBalance),
    frozenMisc: new BN(frozenMisc),
    frozenFee: new BN(frozenFee),
    lockedBalance: new BN(lockedBalance),
    vestedBalance: new BN(vestedBalance),
    vestedClaimable: new BN(vestedClaimable),
    votingBalance: new BN(votingBalance)
  };
};

export default function AccountPreview({ address, allPrices, genesisHash, isExternal, isHardware, isHidden, name, setAllPrices, toggleActions, balancesOnLocalStorage, type }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const history = useHistory();
  const settings = useContext(SettingsContext);
  const chain = useMetadata(genesisHash, true);
  const endpoint = useEndpoint(address, chain);
  const api = useApi(endpoint);
  const [formatted, setFormatted] = useState<string>();
  const proxies = useProxies(api, formatted);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [identity, setIdentity] = useState<DeriveAccountRegistration | undefined>();
  const [recoverable, setRecoverable] = useState<boolean | undefined>();
  const [balances, setBalances] = useState<DeriveBalancesAll | undefined>();
  const [price, setPrice] = useState<number>();
  const chainName = chain?.name?.replace(' Relay Chain', '');

  useEffect((): void => {
    if (balances && chain && api) {
      // eslint-disable-next-line no-void
      void updateMeta(address, prepareMetaData(chain, 'balancesOnLocalStorage', { balances, decimals: api.registry.chainDecimals, tokens: api.registry.chainTokens }));
    }
  }, [address, balances, chain, api]);

  const lastBalances = useMemo((): LastBalances | undefined => {
    if (!balancesOnLocalStorage) {
      return;
    }

    /** read balances saved in local storage */
    const parsedLastBalances = JSON.parse(balancesOnLocalStorage) as SavedMetaData;

    if (parsedLastBalances.chainName === chainName) {
      return prepareLastBalance(parsedLastBalances.metaData);
    }

    return undefined;
  }, [chainName, balancesOnLocalStorage]);

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
    if (address && chain && settings?.prefix) {
      setFormatted(getFormattedAddress(address, chain, settings.prefix));
    }
  }, [address, chain, settings]);

  useEffect(() => {
    setBalances(undefined);
    // eslint-disable-next-line no-void
    isChainApi(chain, api) && formatted && void api.derive.balances?.all(formatted).then(setBalances).catch(console.error);
  }, [api, chain, formatted]);

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

  const menuOnClick = useCallback(
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
    const displayName = identity?.display || name || t('<Unknown>');

    return (
      <>
        {!!name && (isExternal || isExternal) && (
          isHardware
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
        formatted={formatted || address}
        identiconTheme={identiconTheme}
        prefix={settings?.prefix}
        proxies={proxies}
        recoverable={recoverable}
      />
      <AccountDetail
        address={address}
        api={api}
        balances={balances}
        chain={chain}
        formatted={formatted}
        isHidden={isHidden}
        lastBalances={lastBalances}
        name={name}
        price={price}
        toggleVisibility={_toggleVisibility}
      />
      <AccountFeatures goToAccount={goToAccount} menuOnClick={menuOnClick} />
      {
        showActionsMenu &&
        <AccMenu
          address={address}
          chain={chain}
          formatted={formatted}
          isExternal={isExternal}
          isHardware={isHardware}
          isMenuOpen={showActionsMenu}
          name={name}
          setShowMenu={setShowActionsMenu}
          type={type}
        />
      }
    </Grid>
  );
}
