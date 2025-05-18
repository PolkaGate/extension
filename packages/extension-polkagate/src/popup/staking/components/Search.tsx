// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { alpha, Box, InputBase, styled, useTheme } from '@mui/material';
import { SearchNormal1 } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { useTranslation } from '../../../hooks';

const SearchContainer = styled('div')(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.25),
    transition: 'all 150ms ease-out'
  },
  alignItems: 'center',
  backgroundColor: '#809ACB26',
  borderRadius: '12px',
  display: 'flex',
  flexDirection: 'row',
  height: '32px',
  paddingInline: '4px',
  position: 'relative',
  transition: 'all 150ms ease-out',
  width: '100%'
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  '& .MuiInputBase-input': {
    '&::placeholder': {
      color: theme.palette.text.highlight,
      opacity: 1,
      ...theme.typography['B-2'],
      textAlign: 'left'
    },
    padding: '4px',
    paddingRight: 0,
    width: '100%'
  },
  color: theme.palette.text.primary,
  width: 'calc(100% - 16px)'
}));

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  style?: React.CSSProperties;
}

export default function Search ({ onSearch, placeholder, style }: SearchProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;

    setSearchQuery(query);

    if (onSearch) {
      onSearch(query);
    }
  }, [onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchQuery);
    }
  }, [onSearch, searchQuery]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '118px', ...style }}>
      <SearchContainer>
        <SearchNormal1 color={theme.palette.text.highlight} size={16} />
        <StyledInputBase
          inputProps={{ 'aria-label': 'search' }}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t('Search')}
          value={searchQuery}
        />
      </SearchContainer>
    </Box>
  );
}
