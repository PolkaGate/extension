// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Tab, Tabs } from '@mui/material';
import React, { useCallback, useMemo, useRef } from 'react';

import { useIsExtensionPopup } from '../../../hooks';
import { TAB } from './AssetsBox';
import ChainTokensTab from './ChainTokensTab';
import NFTTab from './NFTTab';

export interface TabProps extends Partial<Props> {
  isSelected?: boolean;
}

interface Props {
  setTab: React.Dispatch<React.SetStateAction<TAB | undefined>>;
  tab: TAB | undefined;
}

const TAB_SX = { m: 0, minHeight: 'unset', minWidth: 'unset', p: 0, py: '9px' };

function AssetTabs ({ setTab, tab }: Props): React.ReactElement {
  const isExtension = useIsExtensionPopup();
  const firstTabValue = useRef<TAB.TOKENS | TAB.CHAINS>(TAB.TOKENS);

  const tabValue = useMemo(() => {
    if (tab && [TAB.TOKENS, TAB.CHAINS].includes(tab)) {
      firstTabValue.current = tab as TAB.CHAINS | TAB.TOKENS;
    }

    return !tab ? TAB.TOKENS : tab;
  }, [tab]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent<Element, Event>, value: TAB) => {
    setTab(value === TAB.NFTS ? TAB.NFTS : firstTabValue.current);
  }, [setTab]);

  return (
    <Container disableGutters sx={{ display: 'flex', mx: isExtension ? '30px' : '15px', width: '100%' }}>
      <Tabs
        aria-label='Asset tabs'
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
        value={tabValue}
      >
        <Tab
          label={
            <ChainTokensTab
              setTab={setTab}
              tab={tab}
            />
          }
          sx={TAB_SX}
          value={firstTabValue.current ?? TAB.TOKENS}
        />
        <Tab
          label={
            <NFTTab
              isSelected={tab === TAB.NFTS}
            />
          }
          sx={TAB_SX}
          value={TAB.NFTS}
        />
      </Tabs>
    </Container>
  );
}

export default AssetTabs;
