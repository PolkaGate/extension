// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AuthUrlInfo } from '@polkadot/extension-base/background/types';

import { Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { EyeSlash, User } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { noop } from '@polkadot/util';

import { DecisionButtons, GradientDivider, GradientSwitch, MyTooltip } from '../components';
import { sortAccounts } from '../components/sortAccounts';
import { useAccounts, useTranslation } from '../hooks';
import { approveAuthRequest, ignoreAuthRequest, showAccount, updateAuthorization } from '../messaging';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';

interface Props {
  closePopup: () => void;
  dappInfo?: AuthUrlInfo;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  requestId: string | undefined;
  hasBanner: boolean;
  style?: SxProps<Theme>;
}

export default function ConnectedAccounts({ closePopup, dappInfo, hasBanner, requestId, setRefresh, style }: Props) {
  const { t } = useTranslation();
  const accounts = useAccounts();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // Sort only on the first render, store result in a ref
  const sortedAccountsRef = useRef<AccountJson[] | null>(null);
  const initializedDappIdRef = useRef<string | undefined>(undefined);

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

    return filtered;
  }, [accounts, selectedAccounts]);

  const connectableAddresses = useMemo(() => accounts.filter(({ isHidden }) => !isHidden).map(({ address }) => address), [accounts]);

  const allAccounts = useMemo(
    () => dappInfo?.authorizedAccounts.filter((address) => connectableAddresses.includes(address)) ?? connectableAddresses,
    [connectableAddresses, dappInfo?.authorizedAccounts]
  );

  const noChanges = useMemo(
    () => !dappInfo
      ? !selectedAccounts.length
      : selectedAccounts.length === allAccounts.length && selectedAccounts.every((address) => allAccounts.includes(address)),
    [allAccounts, dappInfo, selectedAccounts]
  );
  const isAllSelected = connectableAddresses.length > 0 && connectableAddresses.every((address) => selectedAccounts.includes(address));

  useEffect(() => {
    if (!dappInfo || initializedDappIdRef.current === dappInfo.id || accounts.length === 0) {
      return;
    }

    initializedDappIdRef.current = dappInfo.id;
    setSelectedAccounts(allAccounts);
  }, [accounts.length, allAccounts, dappInfo]);

  const handleSelect = useCallback((address: string) => () => {
    const isAlreadySelected = selectedAccounts.includes(address);

    const updatedSelectedAccountsInfo = isAlreadySelected
      ? selectedAccounts.filter((account) => account !== address) // remove an item on deselect
      : [...selectedAccounts, address]; // add an item on select

    setSelectedAccounts(updatedSelectedAccountsInfo);
  }, [selectedAccounts]);

  const selectAllAccounts = useCallback(() => {
    setSelectedAccounts(isAllSelected ? [] : connectableAddresses);
  }, [connectableAddresses, isAllSelected]);

  const makeAccountVisible = useCallback((address: string) => (event: React.MouseEvent): void => {
    event.stopPropagation();

    showAccount(address, true).catch(console.error);
  }, []);

  const handleButtons = useCallback((handle: 'update' | 'ignore' | 'approve' | 'disconnect') => () => {
    // If there are no authorized accounts, it means the dApp is rejected.
    // To allow access, authorized accounts must be added.
    const accountsToAuthorize = ['update', 'approve'].includes(handle) ? selectedAccounts : [];

    if (handle === 'approve') {
      approveAuthRequest(accountsToAuthorize, requestId ?? '')
        .then(() => {
          setRefresh(true);
          closePopup();
        })
        .catch((error: Error) => console.error(error));
    } else if (handle === 'ignore') {
      ignoreAuthRequest(requestId ?? '')
        .then(() => {
          setRefresh(true);
          closePopup();
        })
        .catch((error: Error) => console.error(error));
    } else {
      updateAuthorization(accountsToAuthorize, dappInfo?.id ?? '')
        .then(() => {
          setRefresh(true);
          closePopup();
        })
        .catch(console.error);
    }
  }, [selectedAccounts, dappInfo?.id, requestId, setRefresh, closePopup]);

  return (
    <Grid container item justifyContent='center' sx={{ position: 'relative', zIndex: 1, ...style }}>
      <Grid container item sx={{ height: 'fit-content', pb: '10px' }}>
        <Container disableGutters sx={{ alignItems: 'center', bgcolor: theme.palette.surface.input, border: isDark ? 'none' : '1px solid', borderColor: isDark ? 'transparent' : theme.palette.border.strong, borderRadius: '14px', display: 'flex', flexDirection: 'column', height: 'fit-content', justifyContent: 'flex-start', p: '4px' }}>
          <Grid
            alignItems='center'
            container
            item
            justifyContent='space-between'
            sx={{
              pb: '10px',
              pl: '15px',
              pr: isDark ? '15px' : '12px',
              pt: '10px'
            }}
          >
            <Grid container item sx={{ columnGap: '8px', width: 'fit-content' }}>
              <User color={isDark ? theme.palette.primary.main : theme.palette.text.secondary} size='18' variant='Bulk' />
              <Typography color={isDark ? theme.palette.primary.main : theme.palette.text.secondary} variant='B-2'>
                {t('Accounts')}
              </Typography>
            </Grid>
            <Grid container item onClick={selectAllAccounts} sx={{ columnGap: '8px', cursor: 'pointer', width: 'fit-content' }}>
              <Typography color={isDark ? theme.palette.primary.main : theme.palette.text.secondary} variant='B-4'>
                {isAllSelected ? t('Disconnect all') : t('Connect all')}
              </Typography>
              <GradientSwitch
                checked={isAllSelected}
                onChange={noop}
              />
            </Grid>
          </Grid>
          <Container disableGutters sx={{ background: theme.palette.surface.panel, border: isDark ? 'none' : `1px solid ${theme.palette.border.subtle}`, borderRadius: '10px', height: 'fit-content', maxHeight: hasBanner ? '185px' : '223px', overflowY: 'auto', p: isDark ? '8px 12px' : 'none', width: '100%' }}>
            {accountsToShow.map(({ address, isHidden, name }, index) => {
              const noDivider = accountsToShow.length === index + 1;

              return (
                <React.Fragment key={index}>
                  <Grid alignItems='center' container item justifyContent='space-between' key={index} py={isDark ? '8px' : '2px'}>
                    <Grid
                      alignItems='center'
                      container
                      item
                      justifyContent='space-between'
                      sx={{
                        background: isDark ? 'transparent' : theme.palette.surface.input,
                        border: isDark ? 'none' : `1px solid ${theme.palette.border.subtle}`,
                        borderRadius: '12px',
                        boxShadow: isDark ? 'none' : theme.palette.shadow.card,
                        px: isDark ? 0 : '10px',
                        py: isDark ? 0 : '6px'
                      }}
                    >
                      <Grid alignItems='center' container item sx={{ columnGap: '8px', flexWrap: 'nowrap', minWidth: 0, width: 'fit-content' }}>
                        <PolkaGateIdenticon
                          address={address}
                          size={24}
                        />
                        <Typography color='text.primary' sx={{ maxWidth: '150px', overflowX: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} variant='B-4'>
                          {name}
                        </Typography>
                        {isHidden &&
                          <MyTooltip content={t('This account is invisible to websites')}>
                            <Grid alignItems='center' container item justifyContent='center' onClick={makeAccountVisible(address)} sx={{ bgcolor: isDark ? '#6743944D' : '#F1F4FF', border: '1px solid', borderColor: isDark ? '#AA83DC26' : '#D7DDF0', borderRadius: '999px', cursor: 'pointer', height: '22px', width: '22px' }}>
                              <EyeSlash color={theme.palette.accent.icon} size='13' variant='Bold' />
                            </Grid>
                          </MyTooltip>
                        }
                      </Grid>
                      <GradientSwitch
                        checked={!isHidden && selectedAccounts.includes(address)}
                        disabled={isHidden}
                        onChange={handleSelect(address)}
                      />
                    </Grid>
                  </Grid>
                  {!noDivider && <GradientDivider />}
                </React.Fragment>
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
        onPrimaryClick={handleButtons(requestId ? 'approve' : 'update')}
        onSecondaryClick={handleButtons(requestId ? 'ignore' : 'disconnect')}
        primaryBtnText={t('Apply')}
        secondaryBtnText={requestId ? t('Ignore') : t('Disconnect all')}
      />
    </Grid>
  );
}
