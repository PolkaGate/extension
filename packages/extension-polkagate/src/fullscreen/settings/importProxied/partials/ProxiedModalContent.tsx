// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SelectableProxied } from '../ProxiedAccount';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { memo } from 'react';

import { idKey } from '@polkadot/extension-polkagate/src/assets/animations';
import { ActionButton, DecisionButtons } from '@polkadot/extension-polkagate/src/components';
import { useChainInfo, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import AccountToggle from '@polkadot/extension-polkagate/src/popup/notification/partials/AccountToggle';

import StyledSkeleton from './StyledSkeleton';

interface ProxiedModalContentProps {
    areAllSelected: boolean;
    isBusy: boolean;
    isImportMode: boolean;
    onAdd: () => void;
    onClose: () => void;
    onSelectDeselectAll: () => void;
    onSelect: (address: string) => void;
    proxiedAddresses: SelectableProxied[] | undefined;
    selectedProxied: string[];
    genesisHash: `0x${string}` | null | undefined

}

function ProxiedModalContent({ areAllSelected,
    genesisHash,
    isBusy,
    isImportMode,
    onAdd,
    onClose,
    onSelect,
    onSelectDeselectAll,
    proxiedAddresses,
    selectedProxied }: ProxiedModalContentProps): React.ReactElement {
    const { t } = useTranslation();
    const theme = useTheme();
    const { chainName } = useChainInfo(genesisHash, true);
    const isDark = theme.palette.mode === 'dark';
    const isLoading = proxiedAddresses === undefined;
    const hasAccounts = (proxiedAddresses?.length ?? 0) > 0;
    const isPlural = (proxiedAddresses?.length ?? 0) > 1;

    return (
        <>
            <DotLottieReact
                autoplay
                loop={isLoading}
                src={idKey as string}
                style={{ height: 110 }}
            />
            <Typography color='text.secondary' p={'0 4px 10px'} textAlign='left' variant='B-4'>
                {isLoading
                    ? t('Looking for accounts that are proxied by the selected account on the {{chainName}} chain.', { replace: { chainName } })
                    : isImportMode
                        ? t(
                            'The account{{s}} below {{verb}} already proxied by the selected account on the {{chainName}} chain in your extension. Select {{selectionText}} to import.',
                            {
                                replace: {
                                    chainName,
                                    s: isPlural ? 's' : '',
                                    selectionText: isPlural ? 'accounts' : 'the account',
                                    verb: isPlural ? 'are' : 'is'
                                }
                            }
                        )
                        : t('The accounts below are already proxied by accounts in your extension. Select any to import them.')
                }
            </Typography>
            <Stack
                direction='column'
                sx={{
                    background: isDark ? '#05091C' : '#FFFFFF',
                    border: isDark ? 'none' : '1px solid #E3E8F7',
                    borderRadius: '14px',
                    boxShadow: isDark ? 'none' : '0 10px 24px rgba(133, 140, 176, 0.12)',
                    gap: '12px',
                    height: '250px',
                    m: '5px 0px 16px',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    p: '16px',
                    width: '100%'
                }}
            >
                {isImportMode && isLoading &&
                    Array.from({ length: 6 }).map((_, index) => (
                        <StyledSkeleton index={index} key={index} />
                    ))
                }
                {proxiedAddresses?.map(({ address, genesisHash }) => {
                    const isSelected = selectedProxied.includes(address);

                    return (
                        <AccountToggle
                            address={address}
                            checked={isSelected}
                            {...(genesisHash ? { genesisHash } : {})}
                            key={address}
                            onSelect={onSelect}
                            showShortAddressID
                        />
                    );
                })}
                {proxiedAddresses && !hasAccounts && (
                    <Typography color='text.secondary' m='auto' textAlign='center' variant='B-4'>
                        {t('No proxied account found')}!
                    </Typography>
                )}
            </Stack>
            {hasAccounts && proxiedAddresses &&
                <Grid container justifyContent='flex-end'>
                    <ActionButton
                        contentPlacement='center'
                        onClick={onSelectDeselectAll}
                        style={{
                            '&:hover': isDark ? {
                                background: '#3A255E'
                            } : undefined,
                            background: isDark ? '#2D1E4A' : '#FFFFFF',
                            border: isDark ? undefined : '1px solid #E3E8F7',
                            borderRadius: '8px',
                            height: '32px',
                            marginBottom: '18px',
                            marginTop: '-10px',
                            boxShadow: isDark ? 'none' : '0 6px 16px rgba(133, 140, 176, 0.10)',
                            width: 'fit-content'
                        }}
                        text={areAllSelected
                            ? t('Deselect all ({{num}}) accounts', { replace: { num: proxiedAddresses.length } })
                            : t('Select all ({{num}}) accounts', { replace: { num: proxiedAddresses.length } })
                        }
                        variant='contained'
                    />
                </Grid>
            }
            <DecisionButtons
                cancelButton
                direction='horizontal'
                disabled={selectedProxied.length === 0}
                isBusy={isBusy}
                onPrimaryClick={onAdd}
                onSecondaryClick={onClose}
                primaryBtnText={
                    selectedProxied.length
                        ? t('Add to Extension ({{num}})', { replace: { num: selectedProxied.length } })
                        : t('Add to Extension')
                }
                secondaryBtnText={t('Cancel')}
            />
        </>
    );
}

export default memo(ProxiedModalContent);
