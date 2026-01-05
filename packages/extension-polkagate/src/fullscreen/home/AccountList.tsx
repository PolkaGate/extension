// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useRef } from 'react';

import { FadeOnScroll } from '../../components';
import { useCategorizedAccountsInProfiles } from '../../hooks';
import { VelvetBox } from '../../style';
import { AccountProfileLabel } from '../components';
import AccountRow from './AccountRow';
import ProfileTabsFS from './ProfileTabsFS';

function AccountList (): React.ReactElement {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { categorizedAccounts, initialAccountList } = useCategorizedAccountsInProfiles();

  let totalAccountsBefore = 0; // ← track accounts of previous profiles

  return (
    <Stack alignItems='flex-start' direction='column' justifyContent='flex-start'>
      <ProfileTabsFS initialAccountList={initialAccountList} />
      <VelvetBox style={{ marginTop: '5px' }}>
        <Stack ref={scrollContainerRef} style={{ maxHeight: 'calc(100vh - 190px)', minHeight: '100px', overflow: 'hidden', overflowY: 'auto', position: 'relative' }}>
          {Object.entries(categorizedAccounts)?.map(([label, accounts], profileIndex) => {
            const renderedAccounts = accounts?.map((account, accIndex) => {
              const isFirstProfile = profileIndex === 0;
              const isFirstAccount = accIndex === 0;
              const isLast = accIndex === accounts.length - 1;
              const justOneAccount = isFirstAccount && isLast;

              const totalIndex = totalAccountsBefore + accIndex;
              const delay = totalIndex * 0.2;

              return (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  key={`${label}-${profileIndex}-${accIndex}`}
                  transition={{ delay, duration: 0.4 }}
                >
                  <Stack
                    direction='column'
                    justifyContent='center'
                    sx={{
                      bgcolor: '#05091C',
                      borderRadius: justOneAccount
                        ? '14px'
                        : isFirstAccount
                          ? '14px 14px 0 0'
                          : isLast
                            ? '0 0 14px 14px'
                            : 0,
                      mt: isFirstProfile && isFirstAccount ? 0 : isFirstAccount ? '4px' : '2px',
                      pt: '5px',
                      px: '1px',
                      width: '100%'
                    }}
                  >
                    {
                      isFirstAccount &&
                      <AccountProfileLabel label={label} />
                    }
                    <AccountRow account={account} />
                  </Stack>
                </motion.div>
              );
            });

            totalAccountsBefore += accounts.length;

            return (
              <div key={`${label}-${profileIndex}`}>
                {renderedAccounts}
              </div>
            );
          })}
        </Stack>
      </VelvetBox>
      <FadeOnScroll containerRef={scrollContainerRef} height='50px' ratio={0.3} />
    </Stack>
  );
}

export default React.memo(AccountList);
