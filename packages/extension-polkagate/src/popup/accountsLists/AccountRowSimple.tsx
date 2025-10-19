// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { DragIndicator } from '@mui/icons-material';
import { Divider, Stack } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { motion } from 'framer-motion';
import React, { useCallback, useMemo, useState } from 'react';
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
  showDrag?: boolean;
}

const MAX_ACCOUNT_NAME_WIDTH = 255;
const OFFSET = 30;

function AccountRowSimple ({ account, isFirstAccount, isFirstProfile, isInSettingMode, isLast, isSelected, showDrag }: Props): React.ReactElement {
  const navigate = useNavigate();
  const { address, genesisHash, name } = account;
  const [appliedAddress, setAppliedAddress] = useState<string>();

  useUpdateSelectedAccount(appliedAddress, false, () => navigate('/') as void);

  const identiconSize = useMemo(() => isInSettingMode ? 18 : 24, [isInSettingMode]);

  const _onClick = useCallback(() => {
    if (isInSettingMode) {
      return;
    }

    if (!address) {
      return;
    }

    setAppliedAddress(address);
  }, [address, isInSettingMode]);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.4 }}
    >
      <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: isLast ? '0 0 14px 14px' : 0, minHeight: '40px', mt: isFirstProfile && isFirstAccount ? 0 : isFirstAccount ? 0 : '2px', px: '1px', width: '100%' }}>
        <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ borderRadius: '12px', m: '5px 8px 5px 15px', minHeight: '36px', width: '100%' }}>
          {
            isSelected && !isInSettingMode &&
            <Divider orientation='vertical' sx={{ background: '#FF4FB9', borderRadius: '0 9px 9px 0', height: '24px', left: '1px', position: 'absolute', width: '3px' }} />
          }
          <Stack alignItems='center' columnGap='5px' direction='row' justifyContent='flex-start' onClick={_onClick} sx={{ '&:hover': { padding: isInSettingMode ? undefined : '0 8px' }, cursor: isInSettingMode ? undefined : 'pointer', maxWidth: `${MAX_ACCOUNT_NAME_WIDTH}px`, overflow: 'hidden', transition: 'all 250ms ease-out', width: 'fit-content' }}>
            {
              showDrag &&
              <DragIndicator sx={{ color: '#674394', fontSize: '19px' }} />
            }
            <PolkaGateIdenticon
              address={address}
              size={identiconSize}
            />
            <Identity2
              address={address}
              genesisHash={genesisHash ?? POLKADOT_GENESIS}
              nameStyle={{ width: `${MAX_ACCOUNT_NAME_WIDTH - OFFSET}px` }}
              noIdenticon
              style={{ color: (isInSettingMode || isSelected) ? '#EAEBF1' : '#BEAAD8', variant: isInSettingMode ? 'B-4' : 'B-2' }}
            />
          </Stack>
          {!isInSettingMode &&
            <AccountDropDown
              address={address}
              iconSize='24px'
              name={name}
            />
          }
        </Stack>
      </Stack>
    </motion.div>
  );
}

export default React.memo(AccountRowSimple);
