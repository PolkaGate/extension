// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Chain } from '@polkadot/extension-chains/types';
import type { HexString } from '@polkadot/util/types';

import { Typography } from '@mui/material';
import Chance from 'chance';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';

import { AccountContext, ActionContext, GenesisHashOptionsContext, Label, PButton, SelectChain } from '../../../components';
import { useInfo, useProxiedAccounts, useTranslation } from '../../../hooks';
import { createAccountExternal, getMetadata, tieAccount } from '../../../messaging';
import HeaderBrand from '../../../partials/HeaderBrand';
import { PROXY_CHAINS, WESTEND_GENESIS_HASH } from '../../../util/constants';
import getLogo from '../../../util/getLogo';
import AddressDropdown from '../../newAccount/deriveAccount/AddressDropdown';
import ProxiedTable from './ProxiedTable';

function ImportProxied(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);
  const genesisOptions = useContext(GenesisHashOptionsContext);

  const random = useMemo(() => new Chance(), []);

  const selectableChains = useMemo(() => genesisOptions.filter(({ value }) => PROXY_CHAINS.includes(value as string)), [genesisOptions]);

  const allAddresses = useMemo(() =>
    accounts
      .filter(({ isExternal, isHardware, isQR }) => !isExternal || isQR || isHardware)
      .map(({ address, genesisHash, name }): [string, string | null, string | undefined] => [address, genesisHash || null, name])
    , [accounts]);

  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(undefined);
  const [selectedProxied, setSelectedProxied] = useState<string[]>([]);
  const [chain, setChain] = useState<Chain | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const proxiedAccounts = useProxiedAccounts(chain ? selectedAddress : undefined);
  const { api, formatted } = useInfo(chain ? selectedAddress : undefined);

  const { accountGenesishash, accountName } = useMemo(() => {
    const selectedAccount = accounts.find(({ address }) => address === selectedAddress);

    return { accountGenesishash: selectedAccount?.genesisHash, accountName: selectedAccount?.name };
  }, [accounts, selectedAddress]);

  const onChangeGenesis = useCallback((genesisHash?: string | null) => {
    setSelectedProxied([]);

    genesisHash && tieAccount(selectedAddress ?? '', genesisHash as HexString)
      .then(() => getMetadata(genesisHash, true))
      .then(setChain)
      .catch(console.error);
  }, [selectedAddress]);

  const onParentChange = useCallback((address: string) => {
    setSelectedProxied([]);
    setSelectedAddress(address);
  }, []);

  const createProxids = useCallback(async () => {
    setIsBusy(true);

    for (let index = 0; index < selectedProxied.length; index++) {
      const address = selectedProxied[index];
      const randomName = random?.name()?.split(' ')?.[0] || `Proxied ${index + 1}`;

      await createAccountExternal(randomName, address, (chain?.genesisHash ?? WESTEND_GENESIS_HASH) as HexString);
    }
  }, [chain?.genesisHash, random, selectedProxied]);

  const onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const onImport = useCallback(() => {
    setIsBusy(true);
    createProxids().then(() => {
      setIsBusy(false);
      setStorage('profile', PROFILE_TAGS.WATCH_ONLY).catch(console.error);
      onBackClick();
    }).catch(console.error);
  }, [createProxids, onBackClick]);

  return (
    <>
      <HeaderBrand
        onBackClick={onBackClick}
        showBackArrow
        text={t('Import Proxied')}
      />
      <Typography fontSize='14px' fontWeight={300} m='25px auto' textAlign='left' width='88%'>
        {t('Import proxied account(s) to have them as watch-only accounts in the extension.')}
      </Typography>
      <Label
        label={t('Choose proxy account')}
        style={{ margin: 'auto', width: '92%' }}
      >
        <AddressDropdown
          allAddresses={allAddresses}
          onSelect={onParentChange}
          selectedAddress={selectedAddress}
          selectedGenesis={accountGenesishash as string}
          selectedName={accountName as string}
          withoutChainLogo
        />
      </Label>
      {selectedAddress &&
        <SelectChain
          address={selectedAddress}
          fullWidthDropdown
          icon={getLogo(chain ?? undefined)}
          label={t('Select the chain')}
          onChange={onChangeGenesis}
          options={selectableChains}
          style={{ m: '15px auto', width: '92%' }}
        />
      }
      {selectedAddress && chain &&
        <ProxiedTable
          api={api}
          chain={chain}
          label={t('Proxied account(s)')}
          maxHeight='140px'
          proxiedAccounts={proxiedAccounts?.proxy === formatted ? proxiedAccounts?.proxied : undefined}
          selectedProxied={selectedProxied}
          setSelectedProxied={setSelectedProxied}
          style={{ m: '0 auto', width: '92%' }}
        />
      }
      <PButton
        _isBusy={isBusy}
        _onClick={onImport}
        disabled={!selectedAddress || !chain || selectedProxied.length === 0}
        text={t('Import selected')}
      />
    </>
  );
}

export default React.memo(ImportProxied);
