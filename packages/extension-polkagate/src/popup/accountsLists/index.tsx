// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { AddCircle, Setting2 } from 'iconsax-react';
import React, { memo, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/util/constants';

import { ActionButton, ActionContext, FadeOnScroll, Motion, SearchField } from '../../components';
import { AccountProfileLabel } from '../../fullscreen/components';
import { useAccountsOrder, useProfileAccounts, useSelectedAccount, useSelectedProfile, useTranslation } from '../../hooks';
import { UserDashboardHeader } from '../../partials';
import { VelvetBox } from '../../style';
import AccountRow from './AccountRowSimple';
import BackButton from './BackButton';
import ProfilesDropDown from './ProfilesDropDown';

function AccountsLists(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const refContainer = useRef<HTMLDivElement>(null);
  const initialAccountList = useAccountsOrder(true);
  const selectedProfile = useSelectedProfile();
  const selectedAccount = useSelectedAccount();
  const profileAccounts = useProfileAccounts(initialAccountList);

  const [open, setOpen] = useState<boolean>(false);

  const categorizedAccounts = useMemo(() => {
    if (!initialAccountList || !selectedProfile || !profileAccounts) {
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

  let totalAccountsBefore = 0; // ← track accounts of previous profiles

  const backHome = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const onSearch = useCallback((keyword: string) => {
    console.log(keyword)
  }, []);

  const onAddClick = useCallback(() => {

  }, []);

  return (

    <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <Motion style={{ padding: '0 5px', margin: '0 10px' }} variant='slide'>
        <Stack direction='row' mt='8px' justifyContent='space-between'>
          <Stack columnGap='8px' direction='row'>
            <BackButton
              onClick={backHome}
            />
            <ProfilesDropDown
              open={open}
              setOpen={setOpen}
            />
          </Stack>
          <Box alignItems='center' justifyContent='center' sx={{ '&:hover': { backgroundColor: '#674394' }, bgcolor: '#BFA1FF26', borderRadius: '12px', cursor: 'pointer', display: 'flex', height: '32px', width: '32px' }}>
            <Setting2 color='#AA83DC' size='18px' variant='Bulk' />
          </Box>
        </Stack>
        <Container disableGutters sx={{ display: 'block', height: '100%', mt: '10px', position: 'relative', width: 'initial' }}>
          {open && (
            <Box
              onClick={() => setOpen(false)}
              sx={{
                position: 'absolute',
                top: 1,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'radial-gradient(50% 44.61% at 50% 50%, rgba(12, 3, 28, 0) 0%, rgba(12, 3, 28, 0.7) 100%)', // semi-transparent dark
                backdropFilter: 'blur(5px)',
                zIndex: 10
              }}
            />
          )}
          <SearchField
            onInputChange={onSearch}
            placeholder='🔍 Search Accounts'
          />
          <VelvetBox style={{ margin: '5px 0 15px' }}>
            <Stack ref={refContainer} style={{ maxHeight: '380px', minHeight: '100px', overflowY: 'scroll', position: 'relative' }}>
              {Object.entries(categorizedAccounts)?.map(([label, accounts], profileIndex) => {
                const renderedAccounts = accounts?.map((account, accIndex) => {
                  const isFirstProfile = profileIndex === 0;
                  const isFirstAccount = accIndex === 0;
                  const isLast = accIndex === accounts.length - 1;
                  const justOneAccount = isFirstAccount && isLast;

                  const totalIndex = totalAccountsBefore + accIndex;
                  const delay = totalIndex * 0.4;

                  return (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 10 }}
                      key={`${label}-${profileIndex}-${accIndex}`}
                      transition={{ delay, duration: 0.4 }}
                    >
                      <Stack
                        direction='column'
                        sx={{
                          bgcolor: '#05091C',
                          borderRadius: justOneAccount
                            ? '14px'
                            : isFirstAccount
                              ? '14px 14px 0 0'
                              : isLast
                                ? '0 0 14px 14px'
                                : 0,
                          minHeight: '40px',
                          mt: isFirstProfile && isFirstAccount ? 0 : isFirstAccount ? '4px' : '2px',
                          mx: '1px',
                          width: '100%'
                        }}
                      >
                        {isFirstAccount && <AccountProfileLabel label={label} />}
                        <AccountRow account={account.account} isSelected={account.account.address === selectedAccount?.address} />
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
            <FadeOnScroll containerRef={refContainer} height='15px' />
          </VelvetBox>
          <ActionButton
            StartIcon={AddCircle}
            contentPlacement='center'
            iconSize={14}
            onClick={onAddClick}
            style={{
              '& .MuiButton-startIcon': {
                marginRight: '5px'
              },
              bottom: '10px',
              height: '44px',
              margin: '0 1%',
              position: 'absolute',
              width: '98%'
            }}
            text={{
              firstPart: t('Create a new account')
            }}
            variant='contained'
          />
        </Container>
      </Motion>
    </Grid>
  );
}

export default memo(AccountsLists);
