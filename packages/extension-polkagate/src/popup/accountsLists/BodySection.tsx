// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountsOrder } from '@polkadot/extension-polkagate/src/util/types';

import { Box, Container, Stack } from '@mui/material';
import { AddCircle, Trash } from 'iconsax-react';
import React, { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { windowOpen } from '@polkadot/extension-polkagate/src/messaging';
import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/util/constants';

import { AccountContext, ActionButton, ActionContext, FadeOnScroll, GradientButton, MyTooltip, SearchField } from '../../components';
import { AccountProfileLabel } from '../../fullscreen/components';
import { useCategorizedAccountsInProfiles, useSelectedAccount, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import AccountRow from './AccountRowSimple';
import { PROFILE_MODE } from './type';

function BackDrop ({ setMode }: { setMode: React.Dispatch<React.SetStateAction<PROFILE_MODE>> }): React.ReactElement {
  return (
    <Box
      // eslint-disable-next-line react/jsx-no-bind
      onClick={() => setMode(PROFILE_MODE.NONE)}
      sx={{
        backdropFilter: 'blur(5px)',
        background: 'radial-gradient(50% 44.61% at 50% 50%, rgba(12, 3, 28, 0) 0%, rgba(12, 3, 28, 0.7) 100%)', // semi-transparent dark
        height: '100vh',
        left: 0,
        position: 'absolute',
        top: 1,
        width: '100vw',
        zIndex: 10
      }}
    />
  );
}

interface Props {
  mode: PROFILE_MODE;
  setMode: React.Dispatch<React.SetStateAction<PROFILE_MODE>>
  setShowDeleteConfirmation: React.Dispatch<React.SetStateAction<string | undefined>>;
}

function BodySection ({ mode, setMode, setShowDeleteConfirmation }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts: flatAccounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const refContainer = useRef<HTMLDivElement>(null);
  const selectedAccount = useSelectedAccount();
  const initialCategorizedAccounts = useCategorizedAccountsInProfiles();

  const isInSettingMode = mode === PROFILE_MODE.SETTING_MODE;
  const isProfileDropDownOpen = mode === PROFILE_MODE.DROP_DOWN;

  const [categorizedAccounts, setCategorizedAccounts] = useState<Record<string, AccountsOrder[]>>({});

  useEffect(() => {
    setCategorizedAccounts(initialCategorizedAccounts);
  }, [initialCategorizedAccounts]);

  useEffect(() => {
    if (flatAccounts.length === 0) { // when all accounts/profiles are deleted
      onAction('/');
    }
  }, [flatAccounts.length, onAction]);

  const onSearch = useCallback((keyword: string) => {
    console.log(keyword);
  }, []);

  const onCreateClick = useCallback(() => {
    windowOpen('/account/create').catch(console.error);
  }, []);

  const onApply = useCallback(() => {
    setMode(PROFILE_MODE.NONE);
  }, [setMode]);

  const onDeleteProfile = useCallback((label: string) => {
    setShowDeleteConfirmation(label);
  }, [setShowDeleteConfirmation]);

  return (
    <Container disableGutters sx={{ display: 'block', height: '100%', mt: '10px', position: 'relative', width: 'initial', zIndex: 1 }}>
      {isProfileDropDownOpen &&
        <BackDrop setMode={setMode} />
      }
      <SearchField
        onInputChange={onSearch}
        placeholder='🔍 Search Accounts'
      />
      <VelvetBox style={{ margin: '5px 0 15px' }}>
        <Stack ref={refContainer} style={{ maxHeight: '380px', minHeight: '88px', overflowY: 'scroll', position: 'relative' }}>
          {Object.keys(categorizedAccounts).length > 0 && (
            <>
              {Object.entries(categorizedAccounts).map(([label, accounts], profileIndex) => {
                return (
                  <>
                    {accounts.map((account, accIndex) => {
                      const isFirstProfile = profileIndex === 0;
                      const isFirstAccount = accIndex === 0;
                      const isLast = accIndex === accounts.length - 1;
                      const notLocalProfile = PROFILE_TAGS.LOCAL !== label;

                      return (
                        <React.Fragment key={account.account.address}>
                          {isFirstAccount &&
                            <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: '14px 14px 0 0', marginTop: isFirstProfile ? 0 : '4px', minHeight: '40px', paddingRight: '10px', width: '100%' }}>
                              <AccountProfileLabel
                                isInSettingMode={isInSettingMode}
                                label={label}
                              />
                              {
                                isInSettingMode && notLocalProfile &&
                                <MyTooltip content={t('Delete profile')}>
                                  <Box onClick={() => onDeleteProfile(label)} sx={{ alignItems: 'center', bgcolor: '#FF165C26', borderRadius: '128px', cursor: 'pointer', display: 'flex', height: '24px', justifyContent: 'center', width: '34px' }}>
                                    <Trash color='#FF165C' size='16' variant='Bulk' />
                                  </Box>
                                </MyTooltip>
                              }
                            </Stack>
                          }
                          <AccountRow
                            account={account.account}
                            isFirstAccount={isFirstAccount}
                            isFirstProfile={isFirstProfile}
                            isInSettingMode={isInSettingMode}
                            isLast={isLast}
                            isSelected={account.account.address === selectedAccount?.address}
                          />
                        </React.Fragment>
                      );
                    })}
                  </>
                );
              })}
            </>
          )}
        </Stack>
        <FadeOnScroll containerRef={refContainer} height='15px' ratio={0.3} />
      </VelvetBox>
      {
        isInSettingMode
          ? <GradientButton
            contentPlacement='center'
            onClick={onApply}
            style={{
              bottom: '10px',
              height: '44px',
              margin: '0 1%',
              position: 'absolute',
              width: '98%'
            }}
            text={t('Done')}
          />
          : <ActionButton
            StartIcon={AddCircle}
            contentPlacement='center'
            iconSize={18}
            iconVariant='Bold'
            onClick={onCreateClick}
            style={{
              '& .MuiButton-startIcon': {
                marginRight: '4px'
              },
              bottom: '10px',
              height: '44px',
              margin: '0 1%',
              position: 'absolute',
              width: '98%'
            }}
            text={ t('Create a new account')}
            variant='contained'
          />
      }
    </Container>
  );
}

export default memo(BodySection);
