// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import { Container, Tab, Tabs, Typography } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { useTranslation } from '../../hooks';
import { TAB } from '.';

interface TabProps {
  isSelected?: boolean;
  tab?: TAB;
  text?: string;
  setTab?: React.Dispatch<React.SetStateAction<TAB | undefined>>;
}

function Label({ isSelected = false, text }: TabProps) {
  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '3px', cursor: 'pointer', display: 'flex', width: 'fit-content' }}>
      <Typography color={isSelected ? 'text.primary' : 'secondary.main'} textTransform='capitalize' variant='B-2'>
        {text}
      </Typography>
    </Container>
  );
}

interface Props {
  setTab: React.Dispatch<React.SetStateAction<TAB | undefined>>;
  tab: TAB | undefined;
}

function NftTabs({ setTab, tab }: Props): React.ReactElement {
  const { t } = useTranslation();
  const tabIndex = useMemo(() => !tab ? TAB.DETAILS : tab, [tab]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent<Element, Event>, value: TAB) => {
    setTab(value);
  }, [setTab]);

  return (
    <Container disableGutters sx={{ display: 'flex', m: '10px 15px', width: '100%' }}>
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
        value={tabIndex}
      >
        <Tab
          label={<Label isSelected={tab === undefined || (tab === TAB.DETAILS)} text={t('Details')} />}
          sx={{ m: 0, minHeight: 'unset', minWidth: 'unset', p: 0, py: '9px' }}
          value={TAB.DETAILS}
        />
        <Tab
          label={<Label isSelected={tab === TAB.TRAITS} text={t('Traits')} />}
          sx={{ m: 0, minHeight: 'unset', minWidth: 'unset', p: 0, py: '9px' }}
          value={TAB.TRAITS}
        />
        <Tab
          label={<Label isSelected={tab === TAB.ABOUT} text={t('About')} />}
          sx={{ m: 0, minHeight: 'unset', minWidth: 'unset', p: 0, py: '9px' }}
          value={TAB.ABOUT}
        />
      </Tabs>
    </Container>
  );
}

export default NftTabs;
