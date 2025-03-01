// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { IconTheme } from '@polkadot/react-identicon/types';
import type { KeypairType } from '@polkadot/util-crypto/types';

import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { ActionContext } from '../../components';
import AccountFeatures from '../../components/AccountFeatures';
import AccountIcons from '../../components/AccountIcons';
import { useInfo, useMyAccountIdentity } from '../../hooks';
import useIsExtensionPopup from '../../hooks/useIsExtensionPopup';
import { showAccount } from '../../messaging';
import { AccountMenu } from '../../partials';
import QuickAction from '../../partials/QuickAction';
import AccountDetail from './AccountDetail';

export interface Props {
  actions?: React.ReactNode;
  address: string;
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

function AccountPreview({ address, hideNumbers, isHidden, name, quickActionOpen, setQuickActionOpen, toggleActions, type }: Props): React.ReactElement<Props> {
  const onExtension = useIsExtensionPopup();
  const { chain, formatted } = useInfo(address);
  const onAction = useContext(ActionContext);
  const identity = useMyAccountIdentity(address);

  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const _judgement = identity && JSON.stringify(identity.judgements).match(/reasonable|knownGood/gi);

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
    <Grid alignItems='center' container overflow='hidden' p='15px 0 13px' position='relative'>
      <AccountIcons
        address={address}
        identiconTheme={identiconTheme}
        isSubId={!!identity?.displayParent}
        judgements={_judgement}
        prefix={chain?.ss58Format ?? 42}
      />
      <AccountDetail
        address={address}
        chain={chain}
        formatted={formatted}
        goToAccount={goToAccount}
        hideNumbers={hideNumbers}
        identity={identity}
        isHidden={isHidden}
        menuOnClick={menuOnClick}
        name={name}
        toggleVisibility={_toggleVisibility}
      />
      <AccountFeatures chain={chain} goToAccount={goToAccount} menuOnClick={menuOnClick} />
      <AccountMenu
        address={address}
        isMenuOpen={showAccountMenu}
        setShowMenu={setShowAccountMenu}
      />
      <Grid item sx={{ bottom: 0, left: 0, position: 'absolute', top: 0, width: 'fit-content' }}>
        <QuickAction address={address} quickActionOpen={quickActionOpen} setQuickActionOpen={setQuickActionOpen} />
      </Grid>
    </Grid>
  );
}

export default React.memo(AccountPreview);
