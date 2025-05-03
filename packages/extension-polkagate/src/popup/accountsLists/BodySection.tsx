// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import type { AccountsOrder } from '@polkadot/extension-polkagate/src/util/types';

import { closestCenter, DndContext } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  console.log(activeId); // should be removed if not decided on drag and drop

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

  const handleDragStart = useCallback(({ active }: { active: { id: UniqueIdentifier } }) => {
    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    // If dropped outside
    if (!over) {
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) {
      return;
    } // No movement if same account

    let sourceProfile: string | undefined;
    let destinationProfile: string | undefined;

    // Find the source and destination profiles based on activeId and overId
    for (const [profile, accounts] of Object.entries(categorizedAccounts)) {
      if (accounts.some((acc) => acc.account.address === activeId)) {
        sourceProfile = profile;
      }

      if (accounts.some((acc) => acc.account.address === overId)) {
        destinationProfile = profile;
      }
    }

    if (!sourceProfile || !destinationProfile) {
      return; // Exit if no valid source or destination found
    }

    // Find the account being dragged from sourceProfile
    const activeAccount = categorizedAccounts[sourceProfile].find((acc) => acc.account.address === activeId);

    if (!activeAccount) {
      return;
    } // Exit if no account found for activeId

    // If moving within the same profile
    if (sourceProfile === destinationProfile) {
      const accounts = categorizedAccounts[sourceProfile];
      const oldIndex = accounts.findIndex((acc) => acc.account.address === activeId);
      const newIndex = accounts.findIndex((acc) => acc.account.address === overId);

      const newAccounts = arrayMove(accounts, oldIndex, newIndex);

      setCategorizedAccounts({
        ...categorizedAccounts,
        [sourceProfile]: newAccounts
      });
    } else {
      // Moving to a different profile
      const newSourceAccounts = categorizedAccounts[sourceProfile].filter((acc) => acc.account.address !== activeId);
      const newDestinationAccounts = [...categorizedAccounts[destinationProfile], activeAccount];

      // Update the categorizedAccounts state correctly for source and destination profiles
      setCategorizedAccounts({
        ...categorizedAccounts,
        [sourceProfile]: newSourceAccounts,
        [destinationProfile]: newDestinationAccounts
      });
    }
  }, [categorizedAccounts]);

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
            <DndContext collisionDetection={closestCenter} modifiers={[restrictToParentElement]} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
              {Object.entries(categorizedAccounts).map(([label, accounts], profileIndex) => {
                return (
                  <SortableContext
                    items={accounts.map((acc) => acc.account.address)}
                    key={label}
                    strategy={verticalListSortingStrategy}
                  >
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
                  </SortableContext>
                );
              })}
              {/* <DragOverlay>
                {activeId
                  ? <AccountRow
                    account={Object.values(categorizedAccounts).flat().find((acc) => acc.account.address === activeId)?.account}
                    isSelected={false} // We don't need selected state here for the preview
                    style={{ background: '#1B133C', borderRadius: '12px', color: 'white', opacity: 0.8, padding: '5px' }}
                  />
                  : null
                }
              </DragOverlay> */}
            </DndContext>
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
            iconVariant='Bold'
            contentPlacement='center'
            iconSize={18}
            onClick={onCreateClick}
            style={{
              bottom: '10px',
              height: '44px',
              margin: '0 1%',
              position: 'absolute',
              width: '98%',
              '& .MuiButton-startIcon': {
                marginRight: '4px'
              }
            }}
            text={ t('Create a new account')}
            variant='contained'
          />
      }
    </Container>
  );
}

export default memo(BodySection);
