// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { IconTheme } from '@polkadot/react-identicon/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { ActionContext } from '../../components';
import AccountFeatures from '../../components/AccountFeatures';
import AccountIcons from '../../components/AccountIcons';
import { useApi, useChain, useFormatted, useMyAccountIdentity, useProxies } from '../../hooks';
import useIsExtensionPopup from '../../hooks/useIsExtensionPopup';
import { showAccount } from '../../messaging';
import { AccountMenu } from '../../partials';
import QuickAction from '../../partials/QuickAction';
import AccountDetail from './AccountDetail';

export interface Props {
  actions?: React.ReactNode;
  address: string;
  children?: React.ReactNode;
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

export default function AccountPreview({ address, hideNumbers, isHidden, name, quickActionOpen, setQuickActionOpen, toggleActions, type }: Props): React.ReactElement<Props> {
  const chain = useChain(address);
  const api = useApi(address);
  const formatted = useFormatted(address);
  const proxies = useProxies(api, formatted);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [recoverable, setRecoverable] = useState<boolean | undefined>();
  const identity = useMyAccountIdentity(address);
  const _judgement = identity && JSON.stringify(identity.judgements).match(/reasonable|knownGood/gi);
  const onAction = useContext(ActionContext);
  const onExtension = useIsExtensionPopup();

  useEffect((): void => {
    api && api.query?.recovery && api.query.recovery.recoverable(formatted).then((r) => setRecoverable(!!r.isSome));
  }, [api, formatted]);

  useEffect((): void => {
    setShowAccountMenu(false);
  }, [toggleActions]);

  const identiconTheme = (
    type === 'ethereum'
      ? 'ethereum'
      : (chain?.icon || 'polkadot')
  ) as IconTheme;

  const menuOnClick = useCallback(
    () => setShowAccountMenu(!showAccountMenu),
    [showAccountMenu]
  );

  const _toggleVisibility = useCallback((): void => {
    address && showAccount(address, isHidden || false).catch(console.error);
  }, [address, isHidden]);

  const goToAccount = useCallback(() => {
    if (chain?.genesisHash && onExtension) {
      onAction(`/account/${chain.genesisHash}/${address}/`);
    } else if (!onExtension) {
      onAction(`/accountfs/${address}/0`);
    }
  }, [address, chain?.genesisHash, onAction, onExtension]);

  return (
    <Grid alignItems='center' container position='relative' p='15px 0 13px'>
      <AccountIcons
        chain={chain as any}
        formatted={formatted || address}
        identiconTheme={identiconTheme}
        isSubId={!!identity?.displayParent}
        judgements={_judgement}
        prefix={chain?.ss58Format ?? 42}
        proxies={proxies}
        recoverable={recoverable}
      />
      <AccountDetail
        address={address}
        chain={chain as any}
        formatted={formatted}
        goToAccount={goToAccount}
        hideNumbers={hideNumbers}
        identity={identity}
        isHidden={isHidden}
        menuOnClick={menuOnClick}
        name={name}
        toggleVisibility={_toggleVisibility}
      />
      <AccountFeatures chain={chain as any} goToAccount={goToAccount} menuOnClick={menuOnClick} />
      {
        showAccountMenu &&
        <AccountMenu
          address={address}
          isMenuOpen={showAccountMenu}
          setShowMenu={setShowAccountMenu}
        />
      }
      <Grid item sx={{ bottom: 0, left: 0, position: 'absolute', top: 0, width: 'fit-content' }}>
        <QuickAction address={address} quickActionOpen={quickActionOpen} setQuickActionOpen={setQuickActionOpen} />
      </Grid>
    </Grid>
  );
}
