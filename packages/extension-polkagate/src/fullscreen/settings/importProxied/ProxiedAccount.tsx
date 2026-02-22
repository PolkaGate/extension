// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';
import type { HexString } from '@polkadot/util/types';

import { Grid } from '@mui/material';
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountContext } from '@polkadot/extension-polkagate/src/components';
import { useSelectedAccount, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { createAccountExternal, updateMeta } from '@polkadot/extension-polkagate/src/messaging';
import { getSubstrateAddress, setStorage, toShortAddress, updateStorage } from '@polkadot/extension-polkagate/src/util';
import { ExtensionPopups, PROFILE_TAGS, STATEMINE_GENESIS_HASH, STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { DraggableModal } from '../../components/DraggableModal';
import ProxiedModalContent from './partials/ProxiedModalContent';
import useCheckProxied from './useCheckProxied';
import useProxiedAccounts from './useProxiedAccounts';

export interface SelectableProxied {
    address: string;
    genesisHash?: string;
}

interface ImportModeProps {
    closePopup: ExtensionPopupCloser;
    mode: 'import';
}

interface CheckModeProps {
    mode?: 'check';
    closePopup?: never;
}

type Props = ImportModeProps | CheckModeProps;

const addProxied = async(address: string, genesisHash: HexString) => {
    const proxiedName = toShortAddress(address);

    const metaData = JSON.stringify({ profile: PROFILE_TAGS.PROXIED });

    return Promise.all([
        createAccountExternal(proxiedName, address, genesisHash),
        updateMeta(address, metaData)
    ]);
};

/**
 * ProxiedAccounts — unified component that merges `ImportProxied` and `CheckProxied`.
 *
 * ### Modes
 * - **`import`** (full-screen): Pass `mode="import"` and `closePopup`. Checks the
 *   currently selected account on its selected chain. Shows a lottie animation and
 *   skeleton loaders while fetching. Intended for full-screen use.
 *
 * - **`check`** (popup / default): Pass `mode="check"` (or omit `mode`). Scans all
 *   extension accounts across Polkadot & Kusama, persists checked state to storage,
 *   and self-manages its visibility via `useExtensionPopups`.
 */
function ProxiedAccount({ closePopup, mode = 'check' }: Props): React.ReactElement | null {
    const { t } = useTranslation();
    const { accounts } = useContext(AccountContext);

    const isImportMode = mode === 'import';

    const selectedAddress = useSelectedAccount()?.address;
    const selectedGenesis = useAccountSelectedChain(selectedAddress);
    const fetchedProxiedAddresses = useProxiedAccounts(
        isImportMode ? selectedAddress : undefined,
        isImportMode ? selectedGenesis : undefined
    )?.proxied;

    const { accountsToCheck, allFoundProxiedAccounts } = useCheckProxied(isImportMode ? [] : accounts);
    const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

    const selectableProxiedAddresses = useMemo<SelectableProxied[] | undefined>(() => {
        const accountAddressLookup = new Set(accounts.map(({ address }) => address));

        if (isImportMode) {
            if (!fetchedProxiedAddresses) {
                return undefined;
            }

            return fetchedProxiedAddresses
                .filter((addr) => { // Exclude accounts that are already proxied in the extension
                    const substrate = getSubstrateAddress(addr);

                    return substrate && !accountAddressLookup.has(substrate);
                })
                .map((address) => ({ address, genesisHash: selectedGenesis as string }));
        }

        // check mode
        if (!allFoundProxiedAccounts) {
            return undefined;
        }

        return allFoundProxiedAccounts.flatMap(({ genesisHash, proxied }) =>
            proxied
                .filter((addr) => !accountAddressLookup.has(getSubstrateAddress(addr) ?? ''))
                .map((address) => ({ address, genesisHash }))
        );
    }, [accounts, allFoundProxiedAccounts, fetchedProxiedAddresses, isImportMode, selectedGenesis]);

    const [selectedProxied, setSelectedProxied] = useState<string[]>([]);
    const [isBusy, setIsBusy] = useState<boolean>(false);

    const areAllSelected = selectedProxied.length === selectableProxiedAddresses?.length;

    useEffect(() => {
        if (isImportMode) {
            return;
        }

        if (
            extensionPopup === ExtensionPopups.CHECK_PROXIED ||
            !selectableProxiedAddresses ||
            selectableProxiedAddresses.length === 0 ||
            accountsToCheck?.length === 0
        ) {
            return;
        }

        extensionPopupOpener(ExtensionPopups.CHECK_PROXIED)();
    }, [selectableProxiedAddresses, extensionPopup, extensionPopupOpener, accountsToCheck?.length, isImportMode]);

    const handleSelect = useCallback((newSelected: string) => {
        setSelectedProxied((prev) => {
            const selectedSet = new Set(prev);

            selectedSet.has(newSelected)
                ? selectedSet.delete(newSelected)
                : selectedSet.add(newSelected);

            return [...selectedSet];
        });
    }, []);

    const onSelectDeselectAll = useCallback(() => {
        if (!selectableProxiedAddresses) {
            return;
        }

        setSelectedProxied((prev) =>
            prev.length === selectableProxiedAddresses.length
                ? []
                : selectableProxiedAddresses.map(({ address }) => address)
        );
    }, [selectableProxiedAddresses]);

    const onClose = useCallback(() => {
        if (isImportMode) {
            closePopup?.();

            return;
        }

        updateStorage(STORAGE_KEY.CHECK_PROXIED, { checkedAddresses: accountsToCheck ?? [], timestamp: Date.now() })
            .then(() => extensionPopupCloser())
            .catch(console.error);
    }, [accountsToCheck, closePopup, extensionPopupCloser, isImportMode]);

    const onAdd = useCallback(() => {
        if (isImportMode) {
            if (!selectedAddress || !selectedGenesis || selectedProxied.length === 0) {
                return;
            }

            setIsBusy(true);

            const promises = selectedProxied.map((address) => {
                return addProxied(address, selectedGenesis);
            });

            Promise.all(promises)
                .finally(() => {
                    setIsBusy(false);
                    setStorage(STORAGE_KEY.SELECTED_PROFILE, PROFILE_TAGS.PROXIED).catch(console.error);
                    closePopup?.();
                })
                .catch(console.error);
        } else {
            if (selectedProxied.length === 0) {
                return;
            }

            setIsBusy(true);

            const promises = selectedProxied.map((address) => {
                const selectedProxiedChain = allFoundProxiedAccounts?.find(({ proxied }) => proxied.includes(address))?.genesisHash ?? STATEMINE_GENESIS_HASH;

                return addProxied(address, selectedProxiedChain as HexString);
            });

            Promise
                .all([
                    setStorage(STORAGE_KEY.SELECTED_PROFILE, PROFILE_TAGS.PROXIED),
                    ...promises
                ])
                .then(() => {
                    setIsBusy(false);
                    onClose();
                })
                .catch(console.error);
        }
    }, [allFoundProxiedAccounts, closePopup, isImportMode, onClose, selectedAddress, selectedGenesis, selectedProxied]);

    // Check mode: only render when the popup is active and there are accounts to show
    if (!isImportMode && (extensionPopup !== ExtensionPopups.CHECK_PROXIED || !selectableProxiedAddresses || selectableProxiedAddresses.length === 0)) {
        return null;
    }

    return (
        <DraggableModal
            onClose={onClose}
            open
            showBackIconAsClose
            style={{
                ...(isImportMode ? { marginBottom: 0 } : {}),
                minHeight: '200px',
                padding: '16px'
            }}
            title={t('Import Proxied')}
        >
            <Grid container justifyContent='center'>
                <ProxiedModalContent
                    areAllSelected={areAllSelected}
                    isBusy={isBusy}
                    isImportMode={isImportMode}
                    onAdd={onAdd}
                    onClose={onClose}
                    onSelect={handleSelect}
                    onSelectDeselectAll={onSelectDeselectAll}
                    selectableProxiedAddresses={selectableProxiedAddresses}
                    selectedProxied={selectedProxied}
                />
            </Grid>
        </DraggableModal>
    );
}

export default memo(ProxiedAccount);
