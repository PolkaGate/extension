// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, AuthUrlInfo } from '@polkadot/extension-base/background/types';

import { Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { User } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { noop } from '@polkadot/util';

import { DecisionButtons, GradientDivider, GradientSwitch } from '../components';
import { sortAccounts } from '../components/sortAccounts';
import { useAccounts, useTranslation } from '../hooks';
import { approveAuthRequest, ignoreAuthRequest, updateAuthorization } from '../messaging';
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

  const allAddresses = useMemo(() => accounts.map(({ address }) => address), [accounts]);

  const allAccounts = dappInfo?.authorizedAccounts ?? allAddresses;
  const noChanges = (!dappInfo && !selectedAccounts.length) ?? selectedAccounts.length === allAccounts.length;
  const isAllSelected = accounts.every(({ address }) => selectedAccounts.includes(address));

  useEffect(() => {
    dappInfo && setSelectedAccounts(allAccounts);
  }, [allAccounts, dappInfo]);

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

    return filtered;
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
        <Container disableGutters sx={{ alignItems: 'center', bgcolor: isDark ? '#05091C' : '#FFFFFF', border: isDark ? 'none' : '1px solid', borderColor: isDark ? 'transparent' : '#DDE3F4', borderRadius: '14px', display: 'flex', flexDirection: 'column', height: 'fit-content', justifyContent: 'flex-start', p: '4px' }}>
          <Grid
            alignItems='center'
            container
            item
            justifyContent='space-between'
            sx={{
              pb: '10px',
              pl: '15px',
              pr: isDark ? '15px' : '22px',
              pt: '10px'
            }}
          >
            <Grid container item sx={{ columnGap: '8px', width: 'fit-content' }}>
              <User color={isDark ? '#AA83DC' : '#7A69A8'} size='18' variant='Bulk' />
              <Typography color={isDark ? '#AA83DC' : '#7A69A8'} variant='B-2'>
                {t('Accounts')}
              </Typography>
            </Grid>
            <Grid container item onClick={selectAllAccounts} sx={{ columnGap: '8px', cursor: 'pointer', width: 'fit-content' }}>
              <Typography color={isDark ? '#AA83DC' : '#7A69A8'} variant='B-4'>
                {isAllSelected ? t('Disconnect all') : t('Connect all')}
              </Typography>
              <GradientSwitch
                checked={isAllSelected}
                onChange={noop}
              />
            </Grid>
          </Grid>
          <Container disableGutters sx={{ background: isDark ? '#1B133C' : '#F8FAFF', border: isDark ? 'none' : '1px solid #E6EAF7', borderRadius: '10px', height: 'fit-content', maxHeight: hasBanner ? '185px' : '223px', overflowY: 'auto', p: '8px 12px', width: '100%' }}>
            {accountsToShow.map(({ address, name }, index) => {
              const noDivider = accountsToShow.length === index + 1;

              return (
                <React.Fragment key={index}>
                  <Grid alignItems='center' container item justifyContent='space-between' key={index} py='8px'>
                    <Grid
                      alignItems='center'
                      container
                      item
                      justifyContent='space-between'
                      sx={{
                        background: isDark ? 'transparent' : '#FFFFFF',
                        border: isDark ? 'none' : '1px solid #E6EAF7',
                        borderRadius: '12px',
                        boxShadow: isDark ? 'none' : '0 8px 18px rgba(133, 140, 176, 0.08)',
                        px: isDark ? 0 : '10px',
                        py: isDark ? 0 : '8px'
                      }}
                    >
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
