// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsContext, AuthorizeRequest, MetadataRequest, SigningRequest } from '@polkadot/extension-base/background/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { AccountIconThemeContextType, AccountsAssetsContextType, AlertContextType, APIsContext, CurrencyContextType, DropdownOption, FetchingRequests, ReferendaContextType, UserAddedChains } from '../util/types';

import React from 'react';

import settings from '@polkadot/ui-settings';
import { noop } from '@polkadot/util';

const AccountContext = React.createContext<AccountsContext>({ accounts: [], hierarchy: [], master: undefined });
const AccountsAssetsContext = React.createContext<AccountsAssetsContextType>({ accountsAssets: undefined, setAccountsAssets: noop });
const ActionContext = React.createContext<(to?: string) => void>(noop);
const APIContext = React.createContext<APIsContext>({ apis: {}, setIt: noop });
const AlertContext = React.createContext<AlertContextType>({ alerts: [], setAlerts: noop });
const AuthorizeReqContext = React.createContext<AuthorizeRequest[]>([]);
const CurrencyContext = React.createContext<CurrencyContextType>({ currency: undefined, setCurrency: noop });
const FetchingContext = React.createContext<FetchingRequests>({ fetching: {}, set: noop });
const ReferendaContext = React.createContext<ReferendaContextType>({ refs: {}, setRefs: noop });
const MediaContext = React.createContext<boolean>(false);
const MetadataReqContext = React.createContext<MetadataRequest[]>([]);
const SettingsContext = React.createContext<SettingsStruct>(settings.get());
const SigningReqContext = React.createContext<SigningRequest[]>([]);
const ToastContext = React.createContext<({ show: (message: string) => void })>({ show: noop });
const UserAddedChainContext = React.createContext<UserAddedChains>({});
const GenesisHashOptionsContext = React.createContext<DropdownOption[]>([]);
const AccountIconThemeContext = React.createContext<AccountIconThemeContextType>({ accountIconTheme: undefined, setAccountIconTheme: noop });
const WorkerContext = React.createContext<MessagePort | undefined>(undefined);

export {
  AccountContext,
  AccountIconThemeContext,
  AccountsAssetsContext,
  ActionContext,
  AlertContext,
  APIContext,
  AuthorizeReqContext,
  CurrencyContext,
  FetchingContext,
  GenesisHashOptionsContext,
  MediaContext,
  MetadataReqContext,
  ReferendaContext,
  SettingsContext,
  SigningReqContext,
  ToastContext,
  UserAddedChainContext,
  WorkerContext
};
