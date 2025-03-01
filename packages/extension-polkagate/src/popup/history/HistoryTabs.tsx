// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Divider, Tab, Tabs } from '@mui/material';
import React, { useCallback } from 'react';

import { useInfo, useIsExtensionPopup, useTranslation } from '../../hooks';
import { GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../util/constants';

export enum TAB_MAP {
  ALL,
  TRANSFERS,
  STAKING,
  GOVERNANCE
}

interface HistoryTabsProps {
  address: string | undefined;
  tabIndex: TAB_MAP;
  setTabIndex: React.Dispatch<React.SetStateAction<TAB_MAP>>;
}

export default function HistoryTabs({ address, setTabIndex, tabIndex }: HistoryTabsProps): React.ReactElement {
  const { t } = useTranslation();
  const { chain } = useInfo(address);
  const isExtensionMode = useIsExtensionPopup();

  const handleTabChange = useCallback((_event: React.SyntheticEvent<Element, Event>, value: number) => {
    setTabIndex(value);
  }, [setTabIndex]);

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'secondary.light' }}>
      <Tabs centered onChange={handleTabChange} sx={{ 'span.MuiTabs-indicator': { bgcolor: 'secondary.light', height: '4px' } }} value={tabIndex}>
        <Tab
          label={t('All')}
          sx={{
            ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
              color: 'secondary.light',
              fontWeight: 500
            },
            color: 'text.primary',
            fontSize: isExtensionMode ? '16px' : '18px',
            fontWeight: 400,
            minWidth: isExtensionMode ? '70px' : '108px',
            p: isExtensionMode ? '12px' : undefined,
            textTransform: 'capitalize'
          }}
          value={TAB_MAP.ALL}
        />
        <Tab disabled icon={<Divider orientation='vertical' sx={{ backgroundColor: 'divider', height: '19px', mx: '5px', my: 'auto' }} />} label='' sx={{ minWidth: '1px', p: '0', width: '1px' }} value={4} />
        <Tab
          label={t('Transfers')}
          sx={{
            ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
              color: 'secondary.light',
              fontWeight: 500
            },
            color: 'text.primary',
            fontSize: isExtensionMode ? '16px' : '18px',
            fontWeight: 400,
            minWidth: isExtensionMode ? '70px' : '108px',
            p: isExtensionMode ? '12px' : undefined,
            textTransform: 'capitalize'
          }}
          value={TAB_MAP.TRANSFERS}
        />
        {STAKING_CHAINS.includes(chain?.genesisHash ?? '') &&
          <Tab disabled icon={<Divider orientation='vertical' sx={{ backgroundColor: 'divider', height: '19px', mx: '5px', my: 'auto' }} />} label='' sx={{ minWidth: '1px', p: '0', width: '1px' }} value={5} />
        }
        {STAKING_CHAINS.includes(chain?.genesisHash ?? '') &&
          <Tab
            label={t('Staking')}
            sx={{
              ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
                color: 'secondary.light',
                fontWeight: 500
              },
              color: 'text.primary',
              fontSize: isExtensionMode ? '16px' : '18px',
              fontWeight: 400,
              minWidth: isExtensionMode ? '70px' : '108px',
              p: isExtensionMode ? '12px' : undefined,
              textTransform: 'capitalize'
            }}
            value={TAB_MAP.STAKING}
          />
        }
        {GOVERNANCE_CHAINS.includes(chain?.genesisHash ?? '') &&
          <Tab disabled icon={<Divider orientation='vertical' sx={{ backgroundColor: 'divider', height: '19px', mx: '5px', my: 'auto' }} />} label='' sx={{ minWidth: '1px', p: '0', width: '1px' }} value={6} />
        }
        {GOVERNANCE_CHAINS.includes(chain?.genesisHash ?? '') &&
          <Tab
            label={t('Governance')}
            sx={{
              ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
                color: 'secondary.light',
                fontWeight: 500
              },
              color: 'text.primary',
              fontSize: isExtensionMode ? '16px' : '18px',
              fontWeight: 400,
              minWidth: isExtensionMode ? '70px' : '108px',
              p: isExtensionMode ? '12px' : undefined,
              textTransform: 'capitalize'
            }}
            value={TAB_MAP.GOVERNANCE}
          />
        }
      </Tabs>
    </Box>
  );
}
