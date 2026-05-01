// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Container, Stack, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { NothingFound } from '@polkadot/extension-polkagate/src/partials';

import { FadeOnScroll, GradientButton, SearchField } from '../../components';
import { useAccountSelectedChain, useCategorizedAccountsInProfiles, useChainInfo, useFormatted, useSelectedAccount, useTranslation, useUpdateSelectedAccount } from '../../hooks';
import { VelvetBox } from '../../style';
import ProfileTabsFS from '../home/ProfileTabsFS';
import AccountRowSimple from './AccountRowSimple';
import { DraggableModal } from './DraggableModal';
import { AccountProfileLabel } from '.';

interface ChooseAccountMenuProps {
  genesisHash?: string | undefined;
  open: boolean;
  handleClose: () => void;
  onApply?: () => void;
  isSelectedAccountApplicable?: boolean; // to let enable apply on selected account
  setAddress?: React.Dispatch<React.SetStateAction<string | null | undefined>> | undefined;
  showAll?: boolean;
  showAddressBook?: boolean;
}

export default function AccountListModal({ genesisHash, handleClose, isSelectedAccountApplicable, onApply, open, setAddress, showAddressBook, showAll }: ChooseAccountMenuProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const selectedAccount = useSelectedAccount();
  const selectedAccountChain = useAccountSelectedChain(selectedAccount?.address);
  const refContainer = useRef<HTMLDivElement>(null);
  const { categorizedAccounts: initialCategorizedAccounts, initialAccountList } = useCategorizedAccountsInProfiles();
  const { chain: chainFromProps } = useChainInfo(genesisHash, true);
  const { chain: chainFromSelectedAccount } = useChainInfo(selectedAccountChain, true);
  const _chain = chainFromProps || chainFromSelectedAccount;
  const isEvmChain = _chain?.definition?.chainType === 'ethereum';

  const [categorizedAccounts, setCategorizedAccounts] = useState<Record<string, AccountJson[]>>({});
  const [maybeSelected, setMayBeSelected] = useState<string | undefined>(isSelectedAccountApplicable ? selectedAccount?.address : undefined);
  const [appliedAddress, setAppliedAddress] = useState<string>();
  const [searchKeyword, setSearchKeyword] = useState<string>();

  const formatted = useFormatted(maybeSelected, genesisHash);
  const isDark = theme.palette.mode === 'dark';
  const modalBg = isDark ? '#1B133C' : theme.palette.background.paper;
  const profileHeaderBg = isDark ? '#05091C' : '#F7F8FF';

  const _handleClose = useCallback(() => {
    setMayBeSelected(undefined);
    setAppliedAddress(undefined);
    setSearchKeyword(undefined);
    handleClose();
  }, [handleClose]);

  useUpdateSelectedAccount(appliedAddress, open, _handleClose);

  useEffect(() => {
    setCategorizedAccounts(initialCategorizedAccounts);
  }, [initialCategorizedAccounts]);

  const _onApply = useCallback(() => {
    if (!maybeSelected) {
      return _handleClose();
    }

    if (setAddress) {
      setAddress(formatted ?? maybeSelected);
      onApply ? onApply() : _handleClose();

      return;
    }

    setAppliedAddress(maybeSelected);
  }, [maybeSelected, setAddress, _handleClose, formatted, onApply]);

  const onSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const filteredCategorizedAccounts = useMemo(() => {
    if (!searchKeyword) {
      return categorizedAccounts;
    }

    const keywordLower = searchKeyword.toLowerCase();

    return Object.entries(categorizedAccounts).reduce((acc, [label, accounts]) => {
      const filteredAccounts = accounts.filter((account) =>
        account.name?.toLowerCase().includes(keywordLower) ||
        account.address.toLowerCase().includes(keywordLower)
      );

      if (filteredAccounts.length > 0) {
        acc[label] = filteredAccounts;
      }

      return acc;
    }, {} as Record<string, AccountJson[]>);
  }, [categorizedAccounts, searchKeyword]);

  const hasFilteredAccounts = Object.keys(filteredCategorizedAccounts).length > 0;

  return (
    <DraggableModal
      closeOnAnyWhereClick
      onClose={_handleClose}
      open={open}
      showBackIconAsClose
      style={{ backgroundColor: modalBg, borderColor: isDark ? '#FFFFFF0D' : '#DDE3F4', minHeight: '600px', padding: ' 20px 10px 10px' }}
      title={t('Select account')}
    >
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 20px)', minHeight: '505px', mt: '10px', pb: '50px', position: 'relative', width: 'initial', zIndex: 1 }}>
        <SearchField
          onInputChange={onSearch}
          placeholder={t('🔍 Search accounts')}
        />
        <ProfileTabsFS
          initialAccountList={initialAccountList}
          showAddressBook={showAddressBook}
          width='99%'
        />
        <VelvetBox
          noGlowBall={!isDark}
          style={{
            flex: 1,
            height: hasFilteredAccounts ? undefined : 'calc(100% - 105px)',
            margin: '5px 0 15px'
          }}
        >
          <Stack
            ref={refContainer}
            style={{
              height: hasFilteredAccounts ? undefined : '100%',
              maxHeight: hasFilteredAccounts ? '345px' : undefined,
              minHeight: hasFilteredAccounts ? '88px' : '100%',
              overflow: 'hidden',
              overflowY: 'auto',
              position: 'relative'
            }}
          >
            {
              hasFilteredAccounts
                ? <>
                  {Object.entries(filteredCategorizedAccounts).map(([label, accounts], profileIndex) => {
                    return (
                      <React.Fragment key={profileIndex}>
                        {accounts.map((account, accIndex) => {
                          const isFirstProfile = profileIndex === 0;
                          const isFirstAccount = accIndex === 0;
                          const isLast = accIndex === accounts.length - 1;

                          const isAddressBookContact = !Object.hasOwn(account, 'type');

                          if (!showAll && isEvmChain !== (account.type === 'ethereum') && !isAddressBookContact) {
                            return null;
                          }

                          return (
                            <React.Fragment key={account.address}>
                              {isFirstAccount &&
                                <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ bgcolor: profileHeaderBg, borderRadius: '14px 14px 0 0', marginTop: isFirstProfile ? 0 : '4px', minHeight: '40px', paddingRight: '10px', width: '100%' }}>
                                  <AccountProfileLabel
                                    label={label}
                                  />
                                </Stack>
                              }
                              <AccountRowSimple
                                account={account}
                                handleSelect={setMayBeSelected}
                                isFirstAccount={isFirstAccount}
                                isFirstProfile={isFirstProfile}
                                isLast={isLast}
                                isSelected={account.address === selectedAccount?.address}
                                maybeSelected={maybeSelected}
                                onDoubleClick={_onApply}
                              />
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </>
                : <NothingFound
                  animationStyle={{
                    filter: isDark ? undefined : 'saturate(0.7) brightness(1.15)'
                  }}
                  show
                  style={{ height: '100%', pt: 0 }}
                  text={t('Account Not Found')}
                />
            }
          </Stack>
          <FadeOnScroll containerRef={refContainer} height='15px' ratio={0.3} />
        </VelvetBox>
        {
          hasFilteredAccounts &&
          <GradientButton
            contentPlacement='center'
            disabled={!maybeSelected}
            onClick={_onApply}
            style={{
              bottom: '10px',
              height: '44px',
              margin: '0 1%',
              position: 'absolute',
              width: '98%'
            }}
            text={t('Apply')}
          />
        }
      </Container>
    </DraggableModal>
  );
}
