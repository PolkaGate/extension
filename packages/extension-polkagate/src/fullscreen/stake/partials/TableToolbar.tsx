// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, type SxProps, type Theme } from '@mui/material';
import { Firstline } from 'iconsax-react';
import React, { memo } from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';

import { SearchField } from '../../../components';
import SortBy from '../../../popup/staking/partial/SortBy';

interface TableToolbarProps {
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  onSearch: (input: string) => void;
  children?: React.ReactNode;
  sortByObject: object;
  style?: SxProps<Theme>;
}

function TableToolbar ({ children, onSearch, setSortBy, sortBy, sortByObject, style }: TableToolbarProps) {
  const { t } = useTranslation();

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '18px', ...style }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '18px', m: 0, width: 'fit-content' }}>
        <SearchField
          onInputChange={onSearch}
          placeholder={t('🔍 Search')}
          style={{
            height: '44px',
            minWidth: '380px',
            width: '380px'
          }}
        />
        <SortBy
          SortIcon={<Firstline color='#AA83DC' size='18' variant='Bold' />}
          setSortBy={setSortBy}
          sortBy={sortBy}
          sortOptions={Object.values(sortByObject)}
        />
      </Container>
      {children}
    </Container>
  );
}

export default memo(TableToolbar);
