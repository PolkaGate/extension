// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { idKey } from '@polkadot/extension-polkagate/src/assets/animations';
import { AccountContext, ActionButton, DecisionButtons } from '@polkadot/extension-polkagate/src/components';
import { useSelectedAccount, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { createAccountExternal } from '@polkadot/extension-polkagate/src/messaging';
import AccountToggle from '@polkadot/extension-polkagate/src/popup/notification/partials/AccountToggle';
import { getSubstrateAddress, toShortAddress } from '@polkadot/extension-polkagate/src/util';

import { DraggableModal } from '../../components/DraggableModal';
import StyledSkeleton from './StyledSkeleton';
import useProxiedAccounts from './useProxiedAccounts';

interface Props {
    closePopup: ExtensionPopupCloser;
}

/**
 * ImportProxied component provides a modal interface to check if the selected account on the selected chain has any proxied accounts.
 *
 * Only has been used in full-screen mode!
 */
function ImportProxied({ closePopup }: Props): React.ReactElement {
    const { t } = useTranslation();
    const { accounts } = useContext(AccountContext);
    const selectedAddress = useSelectedAccount()?.address;
    const selectedGenesis = useAccountSelectedChain(selectedAddress);
    const proxiedAddresses = useProxiedAccounts(selectedAddress, selectedGenesis)?.proxied;

    const selectableProxiedAddresses = useMemo(() => {
        if (!proxiedAddresses) {
            return undefined;
        }

        const accountAddressLookup = new Set(
            accounts.map(({ address }) => address)
        );

        return proxiedAddresses.filter((proxiedAddress) => {
            const substrateAccountAddress = getSubstrateAddress(proxiedAddress);

            return substrateAccountAddress && !accountAddressLookup.has(substrateAccountAddress);
        });
    }, [accounts, proxiedAddresses]);

    const [selectedProxied, setSelectedProxied] = useState<string[]>([]);
    const [isBusy, setIsBusy] = useState<boolean>(false);

    const areAllSelected = selectedProxied.length === selectableProxiedAddresses?.length;

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
                ? [] // deselect all
                : selectableProxiedAddresses // select all
        );
    }, [selectableProxiedAddresses]);

    const onAdd = useCallback(() => {
        if (!selectedAddress || !selectedGenesis || selectedProxied.length === 0) {
            return;
        }

        setIsBusy(true);

        const promises = selectedProxied.map((address) => {
            const proxiedName = `Proxied ${toShortAddress(address)}`;

            return createAccountExternal(proxiedName, address, selectedGenesis);
        });

        Promise.all(promises)
            .finally(() => {
                setIsBusy(false);
                closePopup();
            })
            .catch(console.error);
    }, [closePopup, selectedAddress, selectedGenesis, selectedProxied]);

    return (
        <DraggableModal
            onClose={closePopup}
            open
            showBackIconAsClose
            style={{ marginBottom: 0, minHeight: '200px', padding: '16px' }}
            title={t('Import Proxied')}
        >
            <Grid container justifyContent='center'>
                <DotLottieReact autoplay loop={ selectableProxiedAddresses === undefined } src={idKey as string} style={{ height: 110 }} />
                <Typography color='text.secondary' pb='10px' textAlign='left' variant='B-4'>
                    {t('The accounts below are proxied by accounts already added to your extension. Select any to import as watch-only.')}
                </Typography>
                <Stack direction='column' sx={{ background: '#05091C', borderRadius: '14px', gap: '12px', height: '250px', m: '5px 09px 16px', maxHeight: '250px', overflowY: 'auto', p: '16px', width: '100%' }}>
                    {selectableProxiedAddresses === undefined &&
                        Array.from({ length: 6 }).map((_, index) => (
                            <StyledSkeleton index={index} key={index} />
                        ))}
                    {selectableProxiedAddresses?.map((address) => {
                        const isSelected = selectedProxied.includes(address);

                        return (
                            <AccountToggle
                                address={address}
                                checked={isSelected}
                                key={address}
                                onSelect={handleSelect}
                                showShortAddressID
                            />
                        );
                    })}
                    {selectableProxiedAddresses && selectableProxiedAddresses.length === 0 && (
                        <Typography color='text.secondary' m='auto' textAlign='center' variant='B-4'>
                            {t('No proxied account found')}!
                        </Typography>
                    )}
                </Stack>
                {selectableProxiedAddresses && selectableProxiedAddresses.length > 0 &&
                    <Grid container justifyContent='flex-end'>
                        <ActionButton
                            contentPlacement='center'
                            onClick={onSelectDeselectAll}
                            style={{
                                borderRadius: '8px',
                                height: '32px',
                                marginBottom: '18px',
                                marginTop: '-10px',
                                width: 'fit-content'
                            }}
                            text={areAllSelected
                                ? t('Deselect all ({{num}}) accounts', { replace: { num: selectableProxiedAddresses.length } })
                                : t('Select all ({{num}}) accounts', { replace: { num: selectableProxiedAddresses.length } })
                            }
                            variant='contained'
                        />
                    </Grid>}
                <DecisionButtons
                    cancelButton
                    direction='vertical'
                    disabled={selectedProxied.length === 0}
                    isBusy={isBusy}
                    onPrimaryClick={onAdd}
                    onSecondaryClick={closePopup}
                    primaryBtnText={ selectedProxied.length ? t('Add to Extension ({{num}})', { replace: { num: selectedProxied.length } }) : t('Add to Extension')}
                    secondaryBtnText={t('Cancel')}
                />
            </Grid>
        </DraggableModal>
    );
}

export default React.memo(ImportProxied);
