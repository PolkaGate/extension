// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SelectableProxied } from '../ProxiedAccount';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Grid, Stack, Typography } from '@mui/material';
import React, { memo } from 'react';

import { idKey } from '@polkadot/extension-polkagate/src/assets/animations';
import { ActionButton, DecisionButtons } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
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
    selectableProxiedAddresses: SelectableProxied[] | undefined;
    selectedProxied: string[];
}

function ProxiedModalContent({ areAllSelected,
    isBusy,
    isImportMode,
    onAdd,
    onClose,
    onSelect,
    onSelectDeselectAll,
    selectableProxiedAddresses,
    selectedProxied }: ProxiedModalContentProps): React.ReactElement {
    const { t } = useTranslation();
    const isLoading = selectableProxiedAddresses === undefined;
    const hasAccounts = (selectableProxiedAddresses?.length ?? 0) > 0;

    return (
        <>
            <DotLottieReact
                autoplay
                loop={isLoading}
                src={idKey as string}
                style={{ height: 110 }}
            />
            <Typography color='text.secondary' p={'0 4px 10px'} textAlign='left' variant='B-4'>
                {t('The accounts below are already proxied by accounts in your extension. Select any to import them.')}
            </Typography>
            <Stack
                direction='column'
                sx={{
                    background: '#05091C',
                    borderRadius: '14px',
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
                {selectableProxiedAddresses?.map(({ address, genesisHash }) => {
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
                {selectableProxiedAddresses && !hasAccounts && (
                    <Typography color='text.secondary' m='auto' textAlign='center' variant='B-4'>
                        {t('No proxied account found')}!
                    </Typography>
                )}
            </Stack>
            {hasAccounts && selectableProxiedAddresses &&
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
