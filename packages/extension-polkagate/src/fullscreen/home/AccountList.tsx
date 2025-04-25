// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack } from '@mui/material';
import { motion } from 'framer-motion';
import React, { useMemo, useRef } from 'react';

import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/util/constants';

import { FadeOnScroll } from '../../components';
import { useAccountsOrder, useProfileAccounts, useSelectedProfile } from '../../hooks';
import { VelvetBox } from '../../style';
import { AccountProfileLabel } from '../components';
import AccountRow from './AccountRow';
import ProfileTabsFS from './ProfileTabsFS';

export const DEFAULT_PROFILE_TAGS = {
  LEDGER: 'Hardware',
  LOCAL: 'Local',
  QR_ATTACHED: 'QR-attached',
  WATCH_ONLY: 'Watch-only'
};

function AccountList (): React.ReactElement {
  const initialAccountList = useAccountsOrder(true);
  const selectedProfile = useSelectedProfile();
  const profileAccounts = useProfileAccounts(initialAccountList);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categorizedAccounts = useMemo(() => {
    if (!initialAccountList || !selectedProfile) {
      return {};
    }

    if (selectedProfile === PROFILE_TAGS.ALL) {
      return {
        [PROFILE_TAGS.LEDGER]: initialAccountList.filter(({ account: { isHardware } }) => isHardware),
        [PROFILE_TAGS.LOCAL]: initialAccountList.filter(({ account: { isExternal } }) => !isExternal),
        [PROFILE_TAGS.QR_ATTACHED]: initialAccountList.filter(({ account: { isQR } }) => isQR),
        [PROFILE_TAGS.WATCH_ONLY]: initialAccountList.filter(({ account: { isExternal, isHardware, isQR } }) => isExternal && !isQR && !isHardware)
      };
    }

    return {
      [selectedProfile]: profileAccounts
    };
  }, [initialAccountList, profileAccounts, selectedProfile]);

  return (
    <Stack alignItems='flex-start' direction='column' justifyContent='flex-start'>
      <ProfileTabsFS />
      <VelvetBox style={{ marginTop: '5px' }}>
        <Stack ref={scrollContainerRef} style={{ maxHeight: '595px', minHeight: '100px', overflowY: 'scroll', position: 'relative' }}>
          {
            Object.entries(categorizedAccounts)?.map(([label, accounts], profileIndex) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 10 }}
                key={`${label}-${profileIndex}`}
                transition={{ delay: profileIndex * (accounts?.length ?? 1) * 0.4, duration: profileIndex === 0 ? 0.3 : 0.8 }}
              >
                {
                  accounts?.map((account, accIndex) => {
                    const isFirstProfile = profileIndex === 0;
                    const isFirstAccount = accIndex === 0;
                    const isLast = accIndex === accounts.length - 1;
                    const justOneAccount = isFirstAccount && isLast;

                    return (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 10 }}
                        key={`${label}-${profileIndex}`}
                        transition={{ delay: accIndex * 0.2, duration: profileIndex === 0 ? 0.3 : 1 }}
                      >
                        <Stack
                          direction='column'
                          key={accIndex}
                          sx={{
                            bgcolor: '#05091C',
                            borderRadius: justOneAccount ? '14px' : isFirstAccount ? '14px 14px 0 0' : isLast ? '0 0 14px 14px' : 0,
                            minHeight: '63px',
                            mt: isFirstProfile && isFirstAccount ? 0 : isFirstAccount ? '4px' : '2px',
                            mx: '1px',
                            width: '100%'
                          }}
                        >
                          {
                            isFirstAccount &&
                            <AccountProfileLabel label={label} />
                          }
                          <AccountRow account={account.account} />
                        </Stack>
                      </motion.div>
                    );
                  })
                }
              </motion.div>
            ))
          }
        </Stack>
      </VelvetBox>
      <FadeOnScroll containerRef={scrollContainerRef} height='50px' ratio={0.3} />
    </Stack>
  );
}

export default React.memo(AccountList);
