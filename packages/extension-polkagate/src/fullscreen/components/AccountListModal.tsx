// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson } from '@polkadot/extension-base/background/types';

import { Container, Stack } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Progress from '@polkadot/extension-polkagate/src/popup/staking/partial/Progress';

import { FadeOnScroll, GradientButton, SearchField } from '../../components';
import { useCategorizedAccountsInProfiles, useFormatted3, useSelectedAccount, useTranslation, useUpdateSelectedAccount } from '../../hooks';
import { VelvetBox } from '../../style';
import ProfileTabsFS from '../home/ProfileTabsFS';
import AccountRowSimple from './AccountRowSimple';
import { DraggableModal } from './DraggableModal';
import { AccountProfileLabel } from '.';

interface ChooseAccountMenuProps {
  genesisHash?: string | undefined;
  open: boolean;
  handleClose: () => void;
  setAddress?: React.Dispatch<React.SetStateAction<string | null | undefined>> | undefined;
}

export default function AccountListModal ({ genesisHash, handleClose, open, setAddress }: ChooseAccountMenuProps): React.ReactElement {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const refContainer = useRef<HTMLDivElement>(null);
  const { categorizedAccounts: initialCategorizedAccounts, initialAccountList } = useCategorizedAccountsInProfiles();

  const [categorizedAccounts, setCategorizedAccounts] = useState<Record<string, AccountJson[]>>({});
  const [maybeSelected, setMayBeSelected] = useState<string>();
  const [appliedAddress, setAppliedAddress] = useState<string>();
  const [searchKeyword, setSearchKeyword] = useState<string>();

  const formatted = useFormatted3(maybeSelected, genesisHash);

  const _handleClose = useCallback(() => {
    setMayBeSelected(undefined);
    setAppliedAddress(undefined);
    setSearchKeyword(undefined);
    handleClose();
  }, [handleClose]);

  useUpdateSelectedAccount(appliedAddress, true, _handleClose);

  useEffect(() => {
    setCategorizedAccounts(initialCategorizedAccounts);
  }, [initialCategorizedAccounts]);

  const onApply = useCallback(() => {
    if (!maybeSelected) {
      return _handleClose();
    }

    if (setAddress) {
      setAddress(formatted ?? maybeSelected);
      _handleClose();

      return;
    }

    setAppliedAddress(maybeSelected);
  }, [maybeSelected, setAddress, _handleClose, formatted]);

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

  return (
    <DraggableModal
      onClose={_handleClose}
      open={open}
      style={{ backgroundColor: '#1B133C', minHeight: '600px', padding: ' 20px 10px 10px' }}
      title={t('Select account')}
    >
      <Container disableGutters sx={{ display: 'block', height: '505px', mt: '10px', pb: '50px', position: 'relative', width: 'initial', zIndex: 1 }}>
        <SearchField
          onInputChange={onSearch}
          placeholder='🔍 Search accounts'
        />
        <ProfileTabsFS initialAccountList={initialAccountList} width='99%' />
        <VelvetBox style={{ margin: '5px 0 15px' }}>
          <Stack ref={refContainer} style={{ maxHeight: '345px', minHeight: '88px', overflow: 'hidden', overflowY: 'auto', position: 'relative' }}>
            {
              Object.keys(filteredCategorizedAccounts).length > 0
                ? <>
                  {Object.entries(filteredCategorizedAccounts).map(([label, accounts], profileIndex) => {
                    return (
                      <>
                        {accounts.map((account, accIndex) => {
                          const isFirstProfile = profileIndex === 0;
                          const isFirstAccount = accIndex === 0;
                          const isLast = accIndex === accounts.length - 1;

                          return (
                            <React.Fragment key={account.address}>
                              {isFirstAccount &&
                              <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: '14px 14px 0 0', marginTop: isFirstProfile ? 0 : '4px', minHeight: '40px', paddingRight: '10px', width: '100%' }}>
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
                              />
                            </React.Fragment>
                          );
                        })}
                      </>
                    );
                  })}
                </>
                : <Progress text={t('Loading, please wait ...')} />
            }
          </Stack>
          <FadeOnScroll containerRef={refContainer} height='15px' ratio={0.3} />
        </VelvetBox>
        {
          !!Object.keys(filteredCategorizedAccounts).length &&
          <GradientButton
            contentPlacement='center'
            disabled={!maybeSelected}
            onClick={onApply}
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
