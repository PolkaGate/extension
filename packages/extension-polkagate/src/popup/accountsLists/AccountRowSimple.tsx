// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { Divider, Stack } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { motion } from 'framer-motion';
import React, { useCallback, useContext } from 'react';

import AccountDropDown from '@polkadot/extension-polkagate/src/fullscreen/home/AccountDropDown';
import { updateMeta } from '@polkadot/extension-polkagate/src/messaging';
import PolkaGateIdenticon from '@polkadot/extension-polkagate/src/style/PolkaGateIdenticon';

import { AccountContext, Identity2 } from '../../components';
import { useNavigate } from 'react-router-dom';

interface Props {
  account: AccountWithChildren;
  isSelected: boolean;
  style?: React.CSSProperties;
  isFirstAccount?: boolean;
  isFirstProfile?: boolean;
  isInSettingMode?: boolean;
  isLast?: boolean;
}

function AccountRowSimple({ account, isFirstAccount, isFirstProfile, isInSettingMode, isLast, isSelected }: Props): React.ReactElement {
  const { accounts } = useContext(AccountContext);
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: account?.address });

  const onClick = useCallback(() => {
    const address = account?.address;

    if (!address) {
      return;
    }

    // update account as selected to be consistent with extension
    const accountToUnselect = accounts.find(({ address: accountAddress, selected }) => selected && address !== accountAddress);

    Promise.all([
      updateMeta(address, JSON.stringify({ selected: true })),
      ...(accountToUnselect ? [updateMeta(accountToUnselect.address, JSON.stringify({ selected: false }))] : [])
    ])
      .catch(console.error)
      .finally(() => navigate('/'));
  }, [account?.address, accounts, navigate]);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
      transition={{ duration: 0.4 }}
    >
      <Stack {...attributes} alignItems='center' direction='row' justifyContent='space-between'
        sx={{
          bgcolor: '#05091C',
          borderRadius: isLast
            ? '0 0 14px 14px'
            : 0,
          minHeight: '40px',
          mt: isFirstProfile && isFirstAccount ? 0 : isFirstAccount ? 0 : '2px',
          mx: '1px',
          width: '100%'
        }}
      >
        {
          isInSettingMode &&
          <DragIndicatorIcon {...listeners} sx={{ ':active': { cursor: 'grabbing' }, color: '#674394', cursor: 'grab', fontSize: '20px' }} />
        }
        <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ '&:hover': { backgroundColor: isInSettingMode ? undefined : '#1B133C', padding: isInSettingMode ? undefined : '0 8px' }, borderRadius: '12px', m: `5px 8px 5px ${isInSettingMode ? '5px' : '15px'}`, position: 'relative', transition: 'all 250ms ease-out', width: '100%' }}>
          {
            isSelected && !isInSettingMode &&
            <Divider orientation='vertical' sx={{ background: '#FF4FB9', height: '24px', left: '-13px', position: 'absolute', width: '3px' }} />
          }
          <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='flex-start' onClick={onClick} sx={{ cursor: 'pointer', width: '80%' }}>
            <PolkaGateIdenticon
              address={account.address}
              size={isInSettingMode ? 18 : 24}
            />
            <Identity2
              address={account?.address}
              genesisHash={account?.genesisHash ?? POLKADOT_GENESIS}
              noIdenticon
              style={{ color: (isInSettingMode || isSelected) ? '#EAEBF1' : '#BEAAD8', variant: isInSettingMode ? 'B-4' : 'B-2' }}
            />
          </Stack>
          {!isInSettingMode &&
            <AccountDropDown
              address={account?.address}
              iconSize='24px'
            />
          }
        </Stack>
      </Stack>
    </motion.div>
  );
}

export default React.memo(AccountRowSimple);
