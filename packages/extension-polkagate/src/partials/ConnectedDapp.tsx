// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountJson, AuthUrlInfo } from '@polkadot/extension-base/background/types';

import { Avatar, Container, Grid, Typography } from '@mui/material';
import { ArrowSwapHorizontal, MonitorMobbile, User } from 'iconsax-react';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { AccountContext, DecisionButtons, ExtensionPopup, GradientDivider, GradientSwitch } from '../components';
import { sortAccounts } from '../components/AccountsTable';
import { useTranslation } from '../hooks';
import { getAuthList, updateAuthorization } from '../messaging';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { extractBaseUrl, noop } from '../util/utils';

interface Tab {
  url?: string;
  favIconUrl?: string;
}

const DappInfo = ({ dappName, favicon }: { favicon?: string, dappName: string }) => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#1B133C', border: '1px solid', borderColor: '#BEAAD833', borderRadius: '14px', display: 'flex', justifyContent: 'center', my: '15px', p: '4px', width: '90%' }}>
      <Avatar
        src={favicon}
        sx={{
          borderRadius: '10px',
          height: '32px',
          width: '32px'
        }}
        variant='square'
      />
      <Grid alignItems='center' container item justifyContent='center' xs>
        <Typography color='text.secondary' sx={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant='B-2'>
          {dappName}
        </Typography>
      </Grid>
    </Container>
  );
};

interface ConnectedAccountsProps {
  closePopup: () => void;
  dappInfo: AuthUrlInfo;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

function ConnectedAccounts ({ closePopup, dappInfo, setRefresh }: ConnectedAccountsProps) {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const allAccounts = dappInfo.authorizedAccounts;
  const noChanges = selectedAccounts.length === allAccounts.length;
  const isAllSelected = accounts.every(({ address }) => selectedAccounts.includes(address));

  useEffect(() => {
    setSelectedAccounts(allAccounts);
  }, [allAccounts]);

  // Sort only on the first render, store result in a ref
  const sortedAccountsRef = useRef<AccountJson[] | null>(null);

  const accountsToShow = useMemo(() => {
    const filtered = [...accounts].filter(({ isExternal, isHardware, isHidden, isQR }) =>
      !isExternal ||
      !isHardware ||
      !isQR ||
      !isHidden
    );

    // Only sort accounts when:
    // 1. We're in manage authorized accounts mode (manageConnectedAccounts is true)
    // 2. The accounts haven't been sorted yet (sortedAccountsRef.current is null)
    // 3. There are some selected accounts (selectedAccounts.length !== 0)
    if (!sortedAccountsRef.current && selectedAccounts.length !== 0) {
      sortedAccountsRef.current = [...filtered].sort((a, b) => sortAccounts(a, b, selectedAccounts));
    }

    return filtered; // .sort((a, b) => sortAccounts(a, b, selectedAccounts))
  }, [accounts, selectedAccounts]);

  const handleSelect = useCallback((address: string) => () => {
    const isAlreadySelected = selectedAccounts.includes(address);

    const updatedSelectedAccountsInfo = isAlreadySelected
      ? selectedAccounts.filter((account) => account !== address) // remove an item on deselect
      : [...selectedAccounts, address]; // add an item on select

    setSelectedAccounts(updatedSelectedAccountsInfo);
  }, [selectedAccounts]);

  const selectAllAccounts = useCallback(() => {
    setSelectedAccounts(isAllSelected ? [] : accountsToShow.map(({ address }) => address));
  }, [accountsToShow, isAllSelected]);

  const handleButtons = useCallback((isApplying: boolean) => () => {
    // If there are no authorized accounts, it means the dApp is rejected.
    // To allow access, authorized accounts must be added.
    const accountsToAuthorize = isApplying ? selectedAccounts : [];

    updateAuthorization(accountsToAuthorize, dappInfo.id)
      .then(() => {
        setRefresh(true);
        closePopup();
      })
      .catch(console.error);
  }, [selectedAccounts, dappInfo.id, setRefresh, closePopup]);

  return (
    <Grid container item justifyContent='center' sx={{ position: 'relative', zIndex: 1 }}>
      <Grid container item sx={{ height: '275px', pb: '10px' }}>
        <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'column', height: 'fit-content', justifyContent: 'flex-start', p: '4px' }}>
          <Grid alignItems='center' container item justifyContent='space-between' p='10px 15px'>
            <Grid container item sx={{ columnGap: '8px', width: 'fit-content' }}>
              <User color='#AA83DC' size='18' variant='Bulk' />
              <Typography color='#AA83DC' variant='B-2'>
                {t('Accounts')}
              </Typography>
            </Grid>
            <Grid container item onClick={selectAllAccounts} sx={{ columnGap: '8px', cursor: 'pointer', width: 'fit-content' }}>
              <Typography color='#AA83DC' variant='B-4'>
                {isAllSelected ? t('Disconnect all') : t('Connect all')}
              </Typography>
              <GradientSwitch
                checked={isAllSelected}
                onChange={noop}
              />
            </Grid>
          </Grid>
          <Container disableGutters sx={{ background: '#1B133C', borderRadius: '10px', height: 'fit-content', maxHeight: '215px', overflowY: 'scroll', p: '8px 12px', width: '100%' }}>
            {accountsToShow.map(({ address, name }, index) => {
              const noDivider = accountsToShow.length === index + 1;

              return (
                <>
                  <Grid alignItems='center' container item justifyContent='space-between' key={index} py='8px'>
                    <Grid alignItems='center' container item sx={{ columnGap: '8px', width: 'fit-content' }}>
                      <PolkaGateIdenticon
                        address={address}
                        size={24}
                      />
                      <Typography color='text.primary' sx={{ maxWidth: '150px', overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant='B-4'>
                        {name}
                      </Typography>
                    </Grid>
                    <GradientSwitch
                      checked={selectedAccounts.includes(address)}
                      onChange={handleSelect(address)}
                    />
                  </Grid>
                  {!noDivider && <GradientDivider />}
                </>
              );
            })}
          </Container>
        </Container>
      </Grid>
      <DecisionButtons
        cancelButton
        disabled={noChanges}
        divider
        flexibleWidth
        onPrimaryClick={handleButtons(true)}
        onSecondaryClick={handleButtons(false)}
        primaryBtnText={t('Apply')}
        secondaryBtnText={t('Disconnect all')}
      />
    </Grid>
  );
}

export default function ConnectedDapp (): React.ReactElement {
  const { t } = useTranslation();

  const [checking, setChecking] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | undefined>(undefined);
  const [favIconUrl, setFavIconUrl] = useState<string | undefined>(undefined);
  const [dapp, setDapp] = useState<AuthUrlInfo | undefined>(undefined);
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [refresh, setRefresh] = useState<boolean>(false);

  const checkTab = useCallback(async () => {
    setChecking(true);

    try {
      const { list: authList } = await getAuthList();

      const [tab] = await new Promise<Tab[]>((resolve) =>
        chrome.tabs.query({ active: true, currentWindow: true }, resolve)
      );

      if (!tab?.url) {
        setIsConnected(false);

        return;
      }

      const availableDapp = Object.values(authList).find(({ url }) => extractBaseUrl(tab.url) === extractBaseUrl(url));

      setDapp(availableDapp);
      setIsConnected(!!availableDapp);
      setFavIconUrl(tab.favIconUrl);
    } catch (error) {
      console.error('Error checking tab:', error);
      setIsConnected(false);
    } finally {
      setChecking(false);
      setRefresh(false);
    }
  }, []);

  useEffect(() => {
    if ((isConnected === undefined && !checking && favIconUrl === undefined) || refresh) {
      checkTab().catch(console.error);
    }
  }, [checkTab, checking, favIconUrl, isConnected, refresh]);

  const openPopup = useCallback(() => {
    dapp && setOpenMenu(true);
  }, [dapp]);

  const closePopup = useCallback(() => {
    setOpenMenu(false);
  }, []);

  if (isConnected === undefined || !dapp) {
    return <></>;
  }

  return (
    <>
      <Container className='ConnectedDapp' disableGutters sx={{ alignItems: 'center', display: 'flex', width: 'fit-content' }}>
        <ArrowSwapHorizontal color='#82FFA5' size='15' style={{ background: '#BFA1FF26' }} />
        <Grid alignItems='center' container item onClick={openPopup} sx={{ bgcolor: '#82FFA533', border: '2px solid', borderColor: '#BFA1FF26', borderRadius: '10px', cursor: 'pointer', p: '3px', width: 'fit-content' }}>
          <MonitorMobbile color='#82FFA5' size='22' variant='Bulk' />
          <Typography color='#82FFA5' fontFamily='Inter' fontSize='14px' fontWeight={700}>
            {dapp.authorizedAccounts.length}
          </Typography>
        </Grid>
      </Container>
      <ExtensionPopup
        TitleIcon={MonitorMobbile}
        handleClose={closePopup}
        openMenu={openMenu}
        title={t('Connected Accounts')}
        withoutTopBorder
      >
        <Grid container item justifyContent='center' sx={{ overflow: 'hidden', position: 'relative', pt: '5px', zIndex: 1 }}>
          <Typography color='text.secondary' variant='B-4'>
            {t('Here you can manage the current connections to your accounts')}
          </Typography>
          <DappInfo
            dappName={dapp.id}
            favicon={favIconUrl}
          />
          <ConnectedAccounts
            closePopup={closePopup}
            dappInfo={dapp}
            setRefresh={setRefresh}
          />
        </Grid>
      </ExtensionPopup>
    </>
  );
}
