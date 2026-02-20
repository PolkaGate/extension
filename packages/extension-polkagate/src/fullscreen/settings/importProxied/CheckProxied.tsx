// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { ProxiedAccounts } from '@polkadot/extension-polkagate/src/util/types';
import type { HexString } from '@polkadot/util/types';

import { Grid, Stack, Typography } from '@mui/material';
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountContext, ActionButton, DecisionButtons } from '@polkadot/extension-polkagate/src/components';
import { useChainInfo, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { createAccountExternal } from '@polkadot/extension-polkagate/src/messaging';
import AccountToggle from '@polkadot/extension-polkagate/src/popup/notification/partials/AccountToggle';
import { getAndWatchStorage, getSubstrateAddress, toShortAddress, updateStorage } from '@polkadot/extension-polkagate/src/util';
import { ExtensionPopups, STATEMINE_GENESIS_HASH, STATEMINT_GENESIS_HASH, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { DraggableModal } from '../../components/DraggableModal';
import { fetchAllProxies, filterProxiedAccountsForDelegate } from './useProxiedAccounts';

const PROXIED_CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

function useCheckProxied(accounts: AccountJson[]) {
    const { api: polkadotAPI } = useChainInfo(STATEMINT_GENESIS_HASH);
    const { api: kusamaAPI } = useChainInfo(STATEMINE_GENESIS_HASH);

    const [accountsToCheck, setAccountsToCheck] = useState<string[] | undefined>(undefined);
    const [allFoundProxiedAccounts, setAllFoundProxiedAccounts] = useState<ProxiedAccounts[] | undefined>(undefined);

    useEffect(() => {
        const unsubscribe = getAndWatchStorage(STORAGE_KEY.CHECK_PROXIED, (load) => {
            const checkProxied = load as { checkedAddresses: string[]; timestamp: number } | undefined;
            const checkedAccounts = checkProxied?.checkedAddresses;

            let toCheck: string[] = [];
            const isTimeExpired = ((checkProxied?.timestamp ?? 0) + PROXIED_CHECK_INTERVAL) < Date.now();

            if (!checkedAccounts || isTimeExpired) { // if it is undefined means this feature is for the first time published
                toCheck = accounts.map(({ address }) => address);

                setAccountsToCheck(toCheck);

                return;
            }

            toCheck = accounts.filter(({ address }) => !checkedAccounts.includes(address)).map(({ address }) => address);

            setAccountsToCheck(toCheck);
        });

        return unsubscribe;
    }, [accounts]);

    const checkForProxied = useCallback(async(api: ApiPromise) => {
        if (!accountsToCheck) { // just to satisfy lint/ts
            return [];
        }

        const proxies = await fetchAllProxies(api);

        const foundProxiedAccounts: ProxiedAccounts[] = [];

        for (const proxy of accountsToCheck) {
            const proxied = filterProxiedAccountsForDelegate(proxies, proxy, true);

            if (proxied.length === 0) {
                continue;
            }

            foundProxiedAccounts.push({
                genesisHash: api.genesisHash.toHex(),
                proxied,
                proxy
            });
        }

        return foundProxiedAccounts;
    }, [accountsToCheck]);

    useEffect(() => {
        if (!accountsToCheck || !polkadotAPI) {
            return;
        }

        if (accountsToCheck.length === 0) { // resets the setAllFoundProxiedAccounts when the popup gets closed either added or canceled
            return setAllFoundProxiedAccounts(undefined);
        }

        checkForProxied(polkadotAPI)
            .then((response) => {
                setAllFoundProxiedAccounts((perv) => {
                    if (!perv) {
                        return response;
                    }

                    return perv.concat(response);
                });
            })
            .catch(console.error);
    }, [accountsToCheck, checkForProxied, polkadotAPI]);

    useEffect(() => {
        if (!accountsToCheck || !kusamaAPI) {
            return;
        }

        if (accountsToCheck.length === 0) { // resets the setAllFoundProxiedAccounts when the popup gets closed either added or canceled
            return setAllFoundProxiedAccounts(undefined);
        }

        checkForProxied(kusamaAPI)
            .then((response) => {
                setAllFoundProxiedAccounts((perv) => {
                    if (!perv) {
                        return response;
                    }

                    return perv.concat(response);
                });
            })
            .catch(console.error);
    }, [accountsToCheck, checkForProxied, kusamaAPI]);

    return { accountsToCheck, allFoundProxiedAccounts };
}

function CheckProxied() {
    const { t } = useTranslation();
    const { accounts } = useContext(AccountContext);
    const { accountsToCheck, allFoundProxiedAccounts } = useCheckProxied(accounts);

    const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

    const [selectedProxied, setSelectedProxied] = useState<string[]>([]);
    const [isBusy, setIsBusy] = useState<boolean>(false);

    const selectableProxiedAddresses = useMemo(() => {
        if (!allFoundProxiedAccounts) {
            return undefined;
        }

        const accountAddressLookup = new Set(
            accounts.map(({ address }) => address)
        );

        return allFoundProxiedAccounts.flatMap(({ genesisHash, proxied }) => {
            const filteredProxied = proxied.filter((proxied) => {
                const substrateAccountAddress = getSubstrateAddress(proxied);

                return !accountAddressLookup.has(substrateAccountAddress ?? '');
            });

            return filteredProxied.map((item) => ({ address: item, genesisHash }));
        });
    }, [accounts, allFoundProxiedAccounts]);

    const areAllSelected = selectedProxied.length === selectableProxiedAddresses?.length;

    useEffect(() => {
        if (extensionPopup === ExtensionPopups.CHECK_PROXIED || !selectableProxiedAddresses || selectableProxiedAddresses.length === 0 || accountsToCheck?.length === 0) {
            return;
        }

        extensionPopupOpener(ExtensionPopups.CHECK_PROXIED)();
    }, [selectableProxiedAddresses, extensionPopup, extensionPopupOpener, accountsToCheck?.length]);

    const handleSelect = useCallback((newSelected: string) => {
        setSelectedProxied((prev) => {
            const selectedSet = new Set(prev);

            selectedSet.has(newSelected)
                ? selectedSet.delete(newSelected)
                : selectedSet.add(newSelected);

            return [...selectedSet];
        });
    }, []);

    const onClose = useCallback(() => {
        updateStorage(STORAGE_KEY.CHECK_PROXIED, { checkedAddresses: accountsToCheck ?? [], timestamp: Date.now() })
            .then(() => extensionPopupCloser())
            .catch(console.error);
    }, [accountsToCheck, extensionPopupCloser]);

    const onAdd = useCallback(() => {
        if (selectedProxied.length === 0) {
            return;
        }

        setIsBusy(true);

        const promises = selectedProxied.map((address) => {
            const proxiedName = `Proxied ${toShortAddress(address)}`;
            const selectedProxiedChain = allFoundProxiedAccounts?.find(({ proxied }) => proxied.includes(address))?.genesisHash ?? STATEMINE_GENESIS_HASH;

            return createAccountExternal(proxiedName, address, selectedProxiedChain as HexString);
        });

        Promise.all(promises)
            .catch(console.error)
            .finally(() => {
                setIsBusy(false);
                onClose();
            });
    }, [allFoundProxiedAccounts, onClose, selectedProxied]);

    const onSelectDeselectAll = useCallback(() => {
        if (!selectableProxiedAddresses) {
            return;
        }

        setSelectedProxied((prev) =>
            prev.length === selectableProxiedAddresses.length
                ? [] // deselect all
                : selectableProxiedAddresses.map(({ address }) => address) // select all
        );
    }, [selectableProxiedAddresses]);

    if (extensionPopup === ExtensionPopups.CHECK_PROXIED && selectableProxiedAddresses && selectableProxiedAddresses.length > 0) {
        return (
            <DraggableModal
                onClose={onClose}
                open
                showBackIconAsClose
                style={{ minHeight: '200px', padding: '16px' }}
                title={t('Import Proxied')}
            >
                <>
                    <Typography color='text.secondary' py='20px' textAlign='left' variant='B-4'>
                        {t('The accounts below are proxied by accounts already added to your extension. Select any to import as watch-only.')}
                    </Typography>
                    <Stack direction='column' sx={{ background: '#05091C', borderRadius: '14px', gap: '8px', height: '250px', maxHeight: '250px', my: '10px', overflowY: 'auto', p: '8px' }}>
                        {selectableProxiedAddresses.map(({ address, genesisHash }) => {
                            const isSelected = selectedProxied.includes(address);

                            return (
                                <AccountToggle
                                    address={address}
                                    checked={isSelected}
                                    genesisHash={genesisHash}
                                    key={address}
                                    onSelect={handleSelect}
                                    showShortAddressID
                                />
                            );
                        })}
                    </Stack>
                    <Grid container justifyContent='flex-end'>
                        <ActionButton
                            contentPlacement='center'
                            onClick={onSelectDeselectAll}
                            style={{
                                borderRadius: '8px',
                                height: '32px',
                                marginBottom: '18px',
                                // marginTop: '-10px',
                                width: 'fit-content'
                            }}
                            text={areAllSelected
                                ? t('Deselect all ({{num}}) accounts', { replace: { num: selectableProxiedAddresses.length } })
                                : t('Select all ({{num}}) accounts', { replace: { num: selectableProxiedAddresses.length } })
                            }
                            variant='contained'
                        />
                    </Grid>
                    <DecisionButtons
                        cancelButton
                        direction='vertical'
                        disabled={selectedProxied.length === 0}
                        isBusy={isBusy}
                        onPrimaryClick={onAdd}
                        onSecondaryClick={onClose}
                        primaryBtnText={t('Add to Extension ({{num}})', { replace: { num: selectedProxied.length } })}
                        secondaryBtnText={t('Cancel')}
                    />
                </>
            </DraggableModal>
        );
    }

    return null;
}

export default memo(CheckProxied);
