// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { ExpandMore } from '@mui/icons-material';
import { Box, Collapse, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useProfileInfo from '@polkadot/extension-polkagate/src/fullscreen/home/useProfileInfo';
import useIsDark from '@polkadot/extension-polkagate/src/hooks/useIsDark';

import { GlowCheckbox, Identity } from '../../components';

interface Props {
  accounts: AccountJson[];
  defaultProfile?: string;
  label: string;
  maybeNewName?: string | null | undefined;
  selectedAddresses: Set<string>;
  setSelectedAddresses: React.Dispatch<React.SetStateAction<Set<string>>>;
}

function ProfileAccountSelection({ accounts, defaultProfile = '', label, maybeNewName, selectedAddresses, setSelectedAddresses }: Props): React.ReactElement {
  const theme = useTheme();
  const isDark = useIsDark();
  const profileInfo = useProfileInfo(label);

  const [openTab, setOpen] = useState<string>(defaultProfile);
  const isOpen = openTab === label;
  const iconColor = isDark ? '#AA83DC' : profileInfo.color ?? '#745D8B';
  const titleColor = isOpen ? iconColor : isDark ? '#EAEBF1' : '#2D1E4A';

  const allSelected = useMemo(() => {
    if (accounts.length === 0) {
      return false;
    }

    return accounts.every(({ address }) => selectedAddresses.has(address));
  }, [accounts, selectedAddresses]);

  useEffect(() => {
    defaultProfile && setSelectedAddresses((prev) => {
      const next = new Set(prev);

      accounts.every(({ address, profile }) => profile?.includes(defaultProfile) && next.add(address));

      return next;
    });
  }, [accounts, defaultProfile, setSelectedAddresses]);

  const onClick = useCallback(() => {
    setOpen((pre) => pre ? '' : label);
  }, [label]);

  const handleCheck = useCallback((checked: boolean, address: string) => {
    setSelectedAddresses((prev) => {
      const next = new Set(prev);

      if (checked) {
        next.add(address);
      } else {
        next.delete(address);
      }

      return next;
    });
  }, [setSelectedAddresses]);

  const handleAllCheck = useCallback((checked: boolean) => {
    setSelectedAddresses((prev) => {
      const next = new Set(prev);

      accounts.every(({ address }) => checked ? next.add(address) : next.delete(address));

      return next;
    });
  }, [accounts, setSelectedAddresses]);

  return (
    <Stack alignItems='center' direction='column' justifyContent='start' sx={{ bgcolor: isDark ? '#060518' : '#FFFFFF', border: isDark ? 'none' : '1px solid #DDE3F4', borderRadius: '14px', boxShadow: isDark ? 'none' : '0 8px 24px rgba(75, 85, 139, 0.08)', mb: '7px', width: '100%' }}>
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ p: '10px 13px 10px 15px', width: '100%' }}>
        <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start' onClick={onClick} sx={{ cursor: 'pointer', width: '90%' }}>
          <profileInfo.Icon color={iconColor} size='18' variant='Bulk' />
          <Typography color={titleColor} sx={{ maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'noWrap' }} variant='B-2'>
            {maybeNewName ?? label}
          </Typography>
          <ExpandMore sx={{ color: iconColor, fontSize: '23px', transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'all 250ms ease-out' }} />
        </Stack>
        <GlowCheckbox
          changeState={handleAllCheck}
          checked={allSelected}
          style={{ justifyContent: 'end', width: 'fit-content' }}
        />
      </Stack>
      <Collapse easing={{ enter: '200ms', exit: '150ms' }} in={isOpen} sx={{ bgcolor: isDark ? '#222540A6' : '#F0ECF8', borderRadius: '10px', m: '0 3px 3px', width: 'fill-available' }}>
        <Stack alignItems='center' direction='column'>
          {accounts.map(({ address, genesisHash }, index) => (
            <Stack direction='column' key={index} sx={{ width: '100%' }}>
              {!!index &&
                <Box sx={{ background: isDark ? theme.palette.dividerGradient : 'linear-gradient(90deg, rgba(116, 93, 139, 0.04) 0%, rgba(116, 93, 139, 0.16) 50.06%, rgba(116, 93, 139, 0.04) 100%)', height: '1px', width: '337' }} />
              }
              <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ p: '11px 17px 10px 20px' }}>
                <Identity
                  address={address}
                  genesisHash={genesisHash ?? '' }
                  identiconSize={18}
                  style={{ color: isDark ? '#EAEBF1' : '#2D1E4A', variant: 'B-1', width: '90%' }}
                />
                <GlowCheckbox
                  // eslint-disable-next-line react/jsx-no-bind
                  changeState={(value) => handleCheck(value, address)}
                  checked={selectedAddresses.has(address)}
                  style={{ justifyContent: 'end', width: '10%' }}
                />
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Collapse>
    </Stack>
  );
}

export default React.memo(ProfileAccountSelection);
