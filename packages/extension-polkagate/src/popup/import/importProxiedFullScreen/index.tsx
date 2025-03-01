// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Chain } from '@polkadot/extension-chains/types';
import type { HexString } from '@polkadot/util/types';

import { Grid, Typography, useTheme } from '@mui/material';
import Chance from 'chance';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { setStorage } from '@polkadot/extension-polkagate/src/components/Loading';
import { openOrFocusTab } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import Bread from '@polkadot/extension-polkagate/src/fullscreen/partials/Bread';
import { Title } from '@polkadot/extension-polkagate/src/fullscreen/sendFund/InputPage';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';

import { AccountContext, GenesisHashOptionsContext, Label, ProfileInput, SelectChain, TwoButtons, VaadinIcon } from '../../../components';
import FullScreenHeader from '../../../fullscreen/governance/FullScreenHeader';
import { useFullscreen, useInfo, useProxiedAccounts, useTranslation } from '../../../hooks';
import { createAccountExternal, getMetadata, tieAccount, updateMeta } from '../../../messaging';
import { FULLSCREEN_WIDTH, PROXY_CHAINS, WESTEND_GENESIS_HASH } from '../../../util/constants';
import getLogo from '../../../util/getLogo';
import AddressDropdownFullScreen from '../../newAccount/deriveFromAccountsFullscreen/AddressDropdownFullScreen';
import ProxiedTable from '../importProxied/ProxiedTable';

function ImportProxiedFS(): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
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
  const [profileName, setProfileName] = useState<string>();

  const proxiedAccounts = useProxiedAccounts(chain ? selectedAddress : undefined);
  const { api, formatted } = useInfo(chain ? selectedAddress : undefined);

  const { accountGenesishash, accountName } = useMemo(() => {
    const selectedAccount = accounts.find(({ address }) => address === selectedAddress);

    return { accountGenesishash: selectedAccount?.genesisHash, accountName: selectedAccount?.name };
  }, [accounts, selectedAddress]);

  const tableMinHeight = useMemo(() => {
    const TABLE_MAX_POSSIBLE_HEIGHT = window.innerHeight - 550;
    const HEIGHT_PER_ROW = 47;
    const _minHeight = proxiedAccounts?.proxied?.length ? (proxiedAccounts.proxied.length + 1) * HEIGHT_PER_ROW : undefined;

    return _minHeight && _minHeight > TABLE_MAX_POSSIBLE_HEIGHT ? TABLE_MAX_POSSIBLE_HEIGHT : _minHeight;
  }, [proxiedAccounts?.proxied?.length]);

  const onChangeGenesis = useCallback((genesisHash?: string | null) => {
    setSelectedProxied([]);

    genesisHash && tieAccount(selectedAddress ?? '', genesisHash as HexString)
      .then(() => getMetadata(genesisHash, true))
      .then(setChain)
      .catch(console.error);
  }, [selectedAddress]);

  const onParentChange = useCallback((address: string) => {
    setSelectedProxied([]);
    setChain(null);
    setSelectedAddress(address);
  }, []);

  const createProxids = useCallback(async () => {
    try {
      for (let index = 0; index < selectedProxied.length; index++) {
        const address = selectedProxied[index];
        const randomName = random?.name()?.split(' ')?.[0] || `Proxied ${index + 1}`;

        await createAccountExternal(randomName, address, (chain?.genesisHash ?? WESTEND_GENESIS_HASH) as HexString);

        /** add the proxied account to the profile if has chosen by user */
        if (profileName) {
          const metaData = JSON.stringify({ profile: profileName });

          await updateMeta(address, metaData);
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to create proxied accounts:', error);

      return false;
    }
  }, [chain?.genesisHash, random, selectedProxied, profileName]);

  const onImport = useCallback(() => {
    setIsBusy(true);
    createProxids().then(() => {
      setIsBusy(false);
      setStorage('profile', profileName || PROFILE_TAGS.WATCH_ONLY).catch(console.error);
      openOrFocusTab('/', true);
    }).catch(console.error);
  }, [createProxids, profileName]);

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
          <Bread />
          <Title
            height='85px'
            logo={
              <VaadinIcon icon='vaadin:cluster' style={{ color: `${theme.palette.text.primary}`, height: '25px', width: '25px' }} />
            }
            text={t('Import proxied accounts')}
          />
          <Typography fontSize='16px' fontWeight={400} pt='20px' textAlign='left' width='100%'>
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
              defaultValue={chain?.genesisHash}
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
                minHeight={tableMinHeight ? `${tableMinHeight}px` : undefined}
                proxiedAccounts={proxiedAccounts?.proxy === formatted ? proxiedAccounts?.proxied : undefined}
                selectedProxied={selectedProxied}
                setSelectedProxied={setSelectedProxied}
                style={{ m: '0 auto' }}
              />
            }
            {proxiedAccounts && proxiedAccounts?.proxy === formatted && !!proxiedAccounts.proxied.length &&
              <ProfileInput
                helperText={t('You can add your imported proxied accounts to a profile if you wish. If not, they\'ll be visible in \'All\' and \'Watch-only\' profiles.')}
                label={t('Choose a profile name:')}
                profileName={profileName}
                setProfileName={setProfileName}
                style={{ my: '30px', width: '54%' }}
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
