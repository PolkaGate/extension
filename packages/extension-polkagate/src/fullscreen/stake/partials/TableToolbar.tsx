// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container } from '@mui/material';
import { Firstline } from 'iconsax-react';
import React, { memo } from 'react';

import { SearchField } from '../../../components';
import SortBy from '../../../popup/staking/partial/SortBy';

interface TableToolbarProps {
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  onSearch: (input: string) => void;
  children?: React.ReactNode;
  sortByObject: object;
}

function TableToolbar ({ children, onSearch, setSortBy, sortBy, sortByObject }: TableToolbarProps) {
  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '18px' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '18px', m: 0, width: 'fit-content' }}>
        <SearchField
          onInputChange={onSearch}
          placeholder='🔍 Search'
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
