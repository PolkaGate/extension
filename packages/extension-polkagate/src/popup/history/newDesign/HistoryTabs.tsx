// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Tab, Tabs, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { useChainInfo, useTranslation } from '../../../hooks';
import { GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../../util/constants';

export enum TAB {
  ALL = 'all',
  TRANSFERS = 'transfers',
  STAKING = 'staking',
  GOVERNANCE = 'governance'
}

interface Props {
  setTab: React.Dispatch<React.SetStateAction<TAB>>;
  tab: TAB | undefined;
  selectedChain: string;
}

function HistoryTabs ({ selectedChain, setTab, tab }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { chainName } = useChainInfo(selectedChain, true);

  const unSupportedTabs = useMemo(() => {
    const unsupportedTabs = [];

    if (!GOVERNANCE_CHAINS.includes(chainName?.toLowerCase() ?? '')) {
      unsupportedTabs.push(TAB.GOVERNANCE);
    }

    if (!STAKING_CHAINS.includes(selectedChain)) {
      unsupportedTabs.push(TAB.STAKING);
    }

    return unsupportedTabs;
  }, [chainName, selectedChain]);

  const isSelected = useCallback((selectedTab: TAB | undefined) => tab === selectedTab, [tab]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent<Element, Event>, value: TAB) => {
    setTab(value);
  }, [setTab]);

  return (
    <Container disableGutters sx={{ display: 'flex', mx: '30px', width: '100%' }}>
      <Tabs
        onChange={handleTabChange}
        sx={{
          '& div.MuiTabs-flexContainer': {
            columnGap: '20px'
          },
          '& span.MuiTabs-indicator': {
            background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
            borderRadius: '999px',
            height: '2px'
          },
          minHeight: 'unset'
        }}
        value={tab}
      >
        {Object.entries(TAB).filter(([_, value]) => !unSupportedTabs.includes(value)).map(([key, value]) => (
          <Tab
            key={key}
            label={
              <Typography color={isSelected(value) ? 'text.primary' : 'secondary.main'} textTransform='capitalize' variant='B-2'>
                {t(value)}
              </Typography>
            }
            sx={{ m: 0, minHeight: 'unset', minWidth: 'unset', p: 0, py: '9px' }}
            value={value}
          />
        ))}
      </Tabs>
    </Container>
  );
}

export default React.memo(HistoryTabs);
