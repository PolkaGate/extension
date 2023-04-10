// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { IconTheme } from '@polkadot/react-identicon/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import AccountFeatures from '../../components/AccountFeatures';
import AccountIcons from '../../components/AccountIcons';
import { useApi, useChain, useFormatted, useMyAccountIdentity, useProxies } from '../../hooks';
import { showAccount } from '../../messaging';
import { AccMenu } from '../../partials';
import QuickAction from '../../partials/QuickAction';
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
  quickActionOpen?: string | boolean;
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
  hideNumbers: boolean | undefined;
}

export default function AccountPreview({ address, genesisHash, hideNumbers, isExternal, isHardware, isHidden, name, quickActionOpen, setQuickActionOpen, toggleActions, type }: Props): React.ReactElement<Props> {
  const history = useHistory();
  const chain = useChain(address);
  const api = useApi(address);
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [recoverable, setRecoverable] = useState<boolean | undefined>();
  const identity = useMyAccountIdentity(address);

  useEffect((): void => {
    // eslint-disable-next-line no-void
    api && api.query?.recovery && api.query.recovery.recoverable(formatted).then((r) => r.isSome && setRecoverable(r.unwrap()));
  }, [api, formatted]);

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

  const _toggleVisibility = useCallback((): void => {
    address && showAccount(address, isHidden || false).catch(console.error);
  }, [address, isHidden]);

  const goToAccount = useCallback(() => {
    genesisHash && address && formatted && history.push({
      pathname: `/account/${genesisHash}/${address}/`,
      state: { api, identity }
    });
  }, [history, genesisHash, address, formatted, api, identity]);

  return (
    <Grid alignItems='center' container position='relative' py='15px'>
      <AccountIcons
        chain={chain}
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
        hideNumbers={hideNumbers}
        identity={identity}
        isHidden={isHidden}
        menuOnClick={menuOnClick}
        name={name}
        toggleVisibility={_toggleVisibility}
      />
      <AccountFeatures chain={chain} goToAccount={goToAccount} menuOnClick={menuOnClick} />
      {
        showActionsMenu &&
        <AccMenu
          address={address}
          chain={chain}
          formatted={formatted}
          isExternal={isExternal}
          isHardware={isHardware}
          isMenuOpen={showActionsMenu}
          setShowMenu={setShowActionsMenu}
        />
      }
      <Grid item sx={{ bottom: '20px', left: 0, position: 'absolute', width: 'fit-content' }}>
        <QuickAction address={address} quickActionOpen={quickActionOpen} setQuickActionOpen={setQuickActionOpen} />
      </Grid>
    </Grid>
  );
}
