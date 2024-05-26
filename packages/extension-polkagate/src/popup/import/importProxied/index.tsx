// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Typography } from '@mui/material';
import Chance from 'chance';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { AccountContext, ActionContext, Label, PButton, SelectChain } from '../../../components';
import { useGenesisHashOptions, useInfo, useProxiedAccounts, useTranslation } from '../../../hooks';
import { createAccountExternal, getMetadata, tieAccount } from '../../../messaging';
import HeaderBrand from '../../../partials/HeaderBrand';
import { PROXY_CHAINS, WESTEND_GENESIS_HASH } from '../../../util/constants';
import getLogo from '../../../util/getLogo';
import AddressDropdown from '../../newAccount/deriveAccount/AddressDropdown';
import ProxiedTable from './ProxiedTable';

function ImportProxied (): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { accounts } = useContext(AccountContext);
  const genesisOptions = useGenesisHashOptions();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const chance = new Chance();

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

    genesisHash && tieAccount(selectedAddress ?? '', genesisHash)
      .then(() => getMetadata(genesisHash, true))
      .then(setChain)
      .catch(console.error);
  }, [selectedAddress]);

  const onParentChange = useCallback((address: string) => {
    setSelectedProxied([]);
    setSelectedAddress(address);
  }, []);

  const onImport = useCallback(() => {
    setIsBusy(true);
    selectedProxied.forEach((address, index) => {
      const randomName = (chance?.name() as string)?.split(' ')?.[0] || `Proxied ${index + 1}`;

      createAccountExternal(randomName, address, chain?.genesisHash ?? WESTEND_GENESIS_HASH).catch((error: Error) => {
        setIsBusy(false);
        console.error(error);
      });
    });

    onAction('/');
  }, [chain?.genesisHash, chance, onAction, selectedProxied]);

  const onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <>
      <HeaderBrand
        onBackClick={onBackClick}
        showBackArrow
        text={t('Import Proxied')}
      />
      <Typography fontSize='14px' fontWeight={300} m='25px auto' textAlign='left' width='88%'>
        {t('Import proxied account(s) to have it as watch-only account in the extension.')}
      </Typography>
      <Label
        label={t('Choose proxy account')}
        style={{ margin: 'auto', width: '92%' }}
      >
        <AddressDropdown
          allAddresses={allAddresses}
          onSelect={onParentChange}
          selectedAddress={selectedAddress}
          selectedGenesis={accountGenesishash}
          selectedName={accountName}
          withoutChainLogo
        />
      </Label>
      {selectedAddress && <SelectChain
        address={selectedAddress}
        fullWidthDropdown
        icon={getLogo(chain ?? undefined)}
        label={t('Select the chain')}
        onChange={onChangeGenesis}
        options={selectableChains}
        style={{ m: '15px auto', width: '92%' }}
      />}
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
