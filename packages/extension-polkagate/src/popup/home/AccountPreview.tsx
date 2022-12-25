// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { IconTheme } from '@polkadot/react-identicon/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { SettingsContext } from '../../components';
import AccountFeatures from '../../components/AccountFeatures';
import AccountIcons from '../../components/AccountIcons';
import { useApi, useChain, useMyAccountIdentity, useProxies } from '../../hooks';
import { showAccount } from '../../messaging';
import { AccMenu } from '../../partials';
import QuickAction from '../../partials/QuickAction';
import { getFormattedAddress } from '../../util/utils';
import AccountDetail from './AccountDetail';

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
  balancesOnLocalStorage?: string;
  quickActionOpen?: string | boolean;
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
}

export default function AccountPreview({ address, genesisHash, isExternal, isHardware, isHidden, name, toggleActions, type, quickActionOpen, setQuickActionOpen }: Props): React.ReactElement<Props> {
  const history = useHistory();
  const settings = useContext(SettingsContext);
  const chain = useChain(address);
  const api = useApi(address);
  const [formatted, setFormatted] = useState<string>();
  const proxies = useProxies(api, formatted);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [recoverable, setRecoverable] = useState<boolean | undefined>();
  const identity = useMyAccountIdentity(address);

  useEffect((): void => {
    // eslint-disable-next-line no-void
    api && api.query?.recovery && api.query.recovery.recoverable(formatted).then((r) => r.isSome && setRecoverable(r.unwrap()));
  }, [api, formatted]);

  useEffect((): void => {
    if (address && chain && settings?.prefix) {
      setFormatted(getFormattedAddress(address, chain, settings.prefix));
    }
  }, [address, chain, settings]);

  useEffect((): void => {
    setShowActionsMenu(false);
  }, [toggleActions]);

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

  const goToAccount = useCallback(() => {
    genesisHash && address && formatted && history.push({
      pathname: `/account/${genesisHash}/${address}/`,
      state: { api, identity }
    });
  }, [history, genesisHash, address, formatted, api, identity]);

  return (
    <Grid alignItems='center' container position='relative' py='15px'>
      <AccountIcons
        formatted={formatted || address}
        identiconTheme={identiconTheme}
        judgements={identity?.judgements} // TODO: to fix the type issue
        prefix={chain?.ss58Format ?? 42}
        proxies={proxies}
        recoverable={recoverable}
      />
      <AccountDetail
        address={address}
        chain={chain}
        formatted={formatted}
        identity={identity}
        isHidden={isHidden}
        name={name}
        toggleVisibility={_toggleVisibility}
      />
      <AccountFeatures goToAccount={goToAccount} menuOnClick={menuOnClick} chain={chain} />
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
      <Grid sx={{ bottom: '20px', left: 0, position: 'absolute', transition: 'all 0.3s', width: quickActionOpen === undefined ? '14px' : '100%' }}>
        <QuickAction address={address} quickActionOpen={quickActionOpen} setQuickActionOpen={setQuickActionOpen} />
      </Grid>
    </Grid>
  );
}
