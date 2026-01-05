// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { ExpandMore } from '@mui/icons-material';
import { Box, Collapse, Stack, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useProfileInfo from '@polkadot/extension-polkagate/src/fullscreen/home/useProfileInfo';

import { GlowCheckbox, Identity2 } from '../../components';

interface Props {
  accounts: AccountJson[];
  defaultProfile?: string;
  label: string;
  maybeNewName?: string | null | undefined;
  selectedAddresses: Set<string>;
  setSelectedAddresses: React.Dispatch<React.SetStateAction<Set<string>>>;
}

function ProfileAccountSelection ({ accounts, defaultProfile = '', label, maybeNewName, selectedAddresses, setSelectedAddresses }: Props): React.ReactElement {
  const profileInfo = useProfileInfo(label);

  const [openTab, setOpen] = useState<string>(defaultProfile);
  const isOpen = openTab === label;

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
    <Stack alignItems='center' direction='column' justifyContent='start' sx={{ bgcolor: '#060518', borderRadius: '14px', mb: '7px', width: '100%' }}>
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ p: '10px 13px 10px 15px', width: '100%' }}>
        <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='start' onClick={onClick} sx={{ cursor: 'pointer', width: '90%' }}>
          <profileInfo.Icon color='#AA83DC' size='18' variant='Bulk' />
          <Typography color={isOpen ? '#AA83DC' : '#EAEBF1'} sx={{ maxWidth: '80%', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'noWrap' }} variant='B-2'>
            {maybeNewName ?? label}
          </Typography>
          <ExpandMore sx={{ color: '#AA83DC', fontSize: '23px', transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'all 250ms ease-out' }} />
        </Stack>
        <GlowCheckbox
          changeState={handleAllCheck}
          checked={allSelected}
          style={{ justifyContent: 'end', width: 'fit-content' }}
        />
      </Stack>
      <Collapse easing={{ enter: '200ms', exit: '150ms' }} in={isOpen} sx={{ bgcolor: '#222540A6', borderRadius: '10px', m: '0 3px 3px', width: 'fill-available' }}>
        <Stack alignItems='center' direction='column'>
          {accounts.map(({ address, genesisHash }, index) => (
            <Stack direction='column' key={index} sx={{ width: '100%' }}>
              {!!index &&
                <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', width: '337' }} />
              }
              <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ p: '11px 17px 10px 20px' }}>
                <Identity2
                  address={address}
                  genesisHash={genesisHash ?? POLKADOT_GENESIS}
                  identiconSize={18}
                  style={{ color: '#EAEBF1', variant: 'B-1', width: '90%' }}
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
