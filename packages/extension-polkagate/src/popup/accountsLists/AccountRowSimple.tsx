// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Divider, Stack } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { motion } from 'framer-motion';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AccountDropDown from '@polkadot/extension-polkagate/src/fullscreen/home/AccountDropDown';
import PolkaGateIdenticon from '@polkadot/extension-polkagate/src/style/PolkaGateIdenticon';

import { Identity2 } from '../../components';
import { useUpdateSelectedAccount } from '../../hooks';

interface Props {
  account: AccountWithChildren;
  isSelected: boolean;
  style?: React.CSSProperties;
  isFirstAccount?: boolean;
  isFirstProfile?: boolean;
  isInSettingMode?: boolean;
  isLast?: boolean;
}

function AccountRowSimple ({ account, isFirstAccount, isFirstProfile, isInSettingMode, isLast, isSelected }: Props): React.ReactElement {
  const navigate = useNavigate();

  const [appliedAddress, setAppliedAddress] = useState<string>();

  useUpdateSelectedAccount(appliedAddress, false, () => navigate('/'));

  const _onClick = useCallback(() => {
    const address = account?.address;

    if (!address) {
      return;
    }

    setAppliedAddress(address);
  }, [account?.address]);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4 }}
    >
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: isLast ? '0 0 14px 14px' : 0, minHeight: '40px', mt: isFirstProfile && isFirstAccount ? 0 : isFirstAccount ? 0 : '2px', mx: '1px', width: '100%' }}>
        <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ borderRadius: '12px', m: '5px 8px 5px 15px', minHeight: '36px', position: 'relative', width: '100%' }}>
          {
            isSelected && !isInSettingMode &&
           <Divider orientation='vertical' sx={{ background: '#FF4FB9', borderRadius: '0 9px 9px 0', height: '24px', left: '1px', position: 'absolute', width: '3px' }} />
          }
          <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='flex-start' onClick={_onClick} sx={{ '&:hover': { padding: isInSettingMode ? undefined : '0 8px' }, cursor: 'pointer', transition: 'all 250ms ease-out', width: '80%', overflow: 'hidden' }}>
            <PolkaGateIdenticon
              address={account.address}
              size={isInSettingMode ? 18 : 24}
            />
            <Identity2
              address={account?.address}
              genesisHash={account?.genesisHash ?? POLKADOT_GENESIS}
              noIdenticon
              // nameStyle={{ maxWidth: '90%'}}
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
