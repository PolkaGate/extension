// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { alpha, Box, InputBase, styled, type SxProps, type Theme, useTheme } from '@mui/material';
import { SearchNormal1 } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { useIsExtensionPopup, useTranslation } from '../../../hooks';

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

const StyledInputBase = styled(InputBase, {
  shouldForwardProp: (prop) => prop !== 'noSearchIcon' && prop !== 'theme' && prop !== 'inputColor'
})(({ inputColor, noSearchIcon, theme }: { noSearchIcon: boolean; theme: Theme; inputColor: string | undefined; }) => ({
  '& .MuiInputBase-input': {
    '&::placeholder': {
      color: inputColor ?? theme.palette.text.highlight,
      opacity: 1,
      ...theme.typography['B-2'],
      textAlign: 'left'
    },
    padding: '4px',
    paddingRight: 0,
    width: '100%'
  },
  color: inputColor ?? theme.palette.text.primary,
  width: noSearchIcon ? '100%' : 'calc(100% - 16px)'
}));

interface LimitsConfig {
  number?: boolean;
  alphabet?: boolean;
  alphanumeric?: boolean;
}

interface SearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  style?: SxProps<Theme>;
  noSearchIcon?: boolean;
  limits?: LimitsConfig;
  inputColor?: string;
  defaultValue?: string;
}

export default function Search({ defaultValue, inputColor, limits, noSearchIcon = false, onSearch, placeholder, style }: SearchProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  const [searchQuery, setSearchQuery] = useState(defaultValue ?? '');

  const validateInput = useCallback((value: string): boolean => {
    if (!limits) {
      return true;
    }

    // Check which validation is required
    // If only one validation type is enabled, apply that validation
    const activeValidations = Object.values(limits).filter(Boolean).length;

    if (activeValidations === 1) {
      // Number validation
      if (limits.number === true) {
        return /^[0-9]*$/.test(value) || value === '';
      }

      // Alphabet validation
      if (limits.alphabet === true) {
        return /^[a-zA-Z]*$/.test(value) || value === '';
      }

      // Alphanumeric validation
      if (limits.alphanumeric === true) {
        return /^[a-zA-Z0-9]*$/.test(value) || value === '';
      }
    }

    return true;
  }, [limits]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;

    const isValid = validateInput(query);

    if (isValid) {
      setSearchQuery(query);

      if (onSearch) {
        onSearch(query);
      }
    }
    // If invalid, don't update the search query
  }, [onSearch, validateInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(searchQuery);
    }
  }, [onSearch, searchQuery]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '118px', ...style }}>
      <SearchContainer>
        {!noSearchIcon && <SearchNormal1 color={isExtension ? theme.palette.text.highlight : '#AA83DC'} size={16} />}
        <StyledInputBase
          inputColor={inputColor}
          inputProps={{ 'aria-label': 'search' }}
          noSearchIcon={noSearchIcon}
          onChange={handleSearch}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? t('Search')}
          theme={theme}
          value={searchQuery}
        />
      </SearchContainer>
    </Box>
  );
}
