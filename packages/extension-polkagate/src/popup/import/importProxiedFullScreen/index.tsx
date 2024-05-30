// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Typography, useTheme } from '@mui/material';
import Chance from 'chance';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';

import { AccountContext, Label, SelectChain, TwoButtons } from '../../../components';
import { FullScreenHeader } from '../../../fullscreen/governance/FullScreenHeader';
import { useFullscreen, useGenesisHashOptions, useInfo, useProxiedAccounts, useTranslation } from '../../../hooks';
import { createAccountExternal, getMetadata, tieAccount } from '../../../messaging';
import { FULLSCREEN_WIDTH, PROXY_CHAINS, WESTEND_GENESIS_HASH } from '../../../util/constants';
import getLogo from '../../../util/getLogo';
import AddressDropdownFullScreen from '../../newAccount/deriveFromAccountsFullscreen/AddressDropdownFullScreen';
import ProxiedTable from '../importProxied/ProxiedTable';

function ImportProxiedFS (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const { accounts } = useContext(AccountContext);
  const genesisOptions = useGenesisHashOptions();
  const chance = new Chance();

  const selectableChains = useMemo(() => genesisOptions.filter(({ value }) => PROXY_CHAINS.includes(value as string)), [genesisOptions]);

  const allAddresses = useMemo(() =>
    accounts
      // .filter(({ isExternal, isHardware, isQR }) => !isExternal || isQR || isHardware)
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

    window.close();
  }, [chain?.genesisHash, chance, selectedProxied]);

  const backHome = useCallback(() => {
    window.close();
  }, []);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll', position: 'relative' }}>
        <Grid container item sx={{ display: 'block', mb: '20px', px: '10%' }}>
          <Grid alignContent='center' alignItems='center' container item>
            <Grid item sx={{ mr: '20px' }}>
              <vaadin-icon icon='vaadin:sitemap' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px', transform: 'rotate(180deg)' }} />
            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t('Import proxied accounts')}
              </Typography>
            </Grid>
          </Grid>
          <Typography fontSize='16px' fontWeight={400} textAlign='left' width='100%'>
            {t('Import proxied account(s) to have them as watch-only accounts in the extension.')}
          </Typography>
          <Grid container item sx={{ my: '30px' }}>
            <Label
              label={t('Choose proxy account')}
              style={{ margin: 'auto', width: '100%' }}
            >
              <AddressDropdownFullScreen
                allAddresses={allAddresses}
                onSelect={onParentChange}
                selectedAddress={selectedAddress}
                selectedGenesis={accountGenesishash}
                selectedName={accountName}
                withoutChainLogo
              />
            </Label>
            <SelectChain
              address={selectedAddress}
              fullWidthDropdown
              icon={getLogo(chain ?? undefined)}
              label={t('Select the chain')}
              onChange={onChangeGenesis}
              options={selectableChains}
              style={{ m: '15px 0', width: '60%' }}
            />
            {selectedAddress && chain &&
              <ProxiedTable
                api={api}
                chain={chain}
                label={t('Proxied account(s)')}
                maxHeight='200px'
                proxiedAccounts={proxiedAccounts?.proxy === formatted ? proxiedAccounts?.proxied : undefined}
                selectedProxied={selectedProxied}
                setSelectedProxied={setSelectedProxied}
                style={{ m: '0 auto' }}
              />
            }
            <Grid container item sx={{ '> div': { m: 0, width: '64%' }, borderTop: '1px solid', borderTopColor: 'divider', bottom: '40px', height: '50px', justifyContent: 'flex-end', left: '10%', position: 'absolute', width: '80%' }}>
              <TwoButtons
                disabled={!selectedAddress || !chain || selectedProxied.length === 0}
                isBusy={isBusy}
                mt='1px'
                onPrimaryClick={onImport}
                onSecondaryClick={backHome}
                primaryBtnText={t('Import selected')}
                secondaryBtnText={t('Cancel')}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(ImportProxiedFS);
