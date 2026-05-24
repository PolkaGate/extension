// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Divider, Stack, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { motion } from 'framer-motion';
import React, { useCallback } from 'react';

import { Identity } from '../../components';

interface Props {
  account: AccountWithChildren;
  handleSelect: React.Dispatch<React.SetStateAction<string | undefined>>;
  isSelected: boolean;
  isFirstAccount?: boolean;
  isFirstProfile?: boolean;
  isLast?: boolean;
  maybeSelected: string | undefined;
  onDoubleClick: () => void
}

function AccountRowSimple({ account, handleSelect, isFirstAccount, isFirstProfile, isLast, isSelected, maybeSelected, onDoubleClick }: Props): React.ReactElement {
  const theme = useTheme();
  const { address, type } = account ?? {};
  const isDark = theme.palette.mode === 'dark';
  const isActive = maybeSelected === address || (isSelected && !maybeSelected);

  const _onClick = useCallback(() => {
    handleSelect(address);
  }, [address, handleSelect]);

  const _genesisHash = type === 'ethereum' ? undefined : POLKADOT_GENESIS;
  const rowBg = isDark ? '#05091C' : (isActive ? '#F3F6FD' : '#FFFFFF');
  const rowBorderColor = isDark ? 'transparent' : (isActive ? '#E0E6F7' : '#DDE3F4');
  const textColor = isActive ? theme.palette.text.primary : theme.palette.text.secondary;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
    >
      <Stack alignItems='center' direction='row' justifyContent='space-between' onDoubleClick={onDoubleClick} sx={{ bgcolor: rowBg, border: '1px solid', borderColor: rowBorderColor, borderRadius: isLast ? '0 0 14px 14px' : '0px', minHeight: '40px', mt: isFirstProfile && isFirstAccount ? 0 : '2px', p: '5px 8px 5px 15px', position: 'relative', width: '100%' }}>
        {
          isSelected &&
          <Divider orientation='vertical' sx={{ background: '#FF4FB9', borderRadius: '0 9px 9px 0', height: '24px', left: '1px', position: 'absolute', width: '3px' }} />
        }
        <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='flex-start' onClick={_onClick} sx={{ '&:hover': { padding: '0 8px' }, cursor: 'pointer', transition: 'all 250ms ease-out', width: '100%' }}>
          <Identity
            address={address}
            genesisHash={_genesisHash}
            identiconSize={24}
            isSelected={maybeSelected === address || (isSelected && !maybeSelected)}
            name={account.name}
            showShortAddress
            style={{ color: textColor, variant: 'B-2' }}
          />
        </Stack>
      </Stack>
    </motion.div>
  );
}

export default React.memo(AccountRowSimple);
