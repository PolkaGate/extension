// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TypographyProps } from '@mui/material';
import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';

import { GlowCheck, GradientDivider, Logo, SearchField } from '../../components';
import { NothingFound } from '../../partials';

interface ChainPickerListProps {
  getLabel?: (option: DropdownOption) => string;
  itemTextColor?: string;
  itemTextVariant?: TypographyProps['variant'];
  logoSize?: number;
  maxHeight?: number | string;
  maybeSelectedText?: string | undefined;
  minHeight?: number | string;
  nothingFoundStyle?: React.CSSProperties;
  onDoubleClick?: () => void;
  onSelect: (chain: DropdownOption) => void;
  options: DropdownOption[];
  searchPlaceholder: string;
  selectedValue?: string;
  showSelectedCheck?: boolean;
  showTopPadding?: boolean;
}

export default function ChainPickerList({ getLabel,
  itemTextColor = 'text.primary',
  itemTextVariant = 'B-2',
  logoSize = 30,
  maxHeight = '395px',
  maybeSelectedText,
  minHeight = '395px',
  nothingFoundStyle,
  onDoubleClick,
  onSelect,
  options,
  searchPlaceholder,
  selectedValue,
  showSelectedCheck = false,
  showTopPadding = false }: ChainPickerListProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const [keyword, setKeyword] = useState<string>();
  const isDark = theme.palette.mode === 'dark';
  const hoverBg = isDark ? '#6743944D' : '#EEF2FB';
  const dividerColor = isDark ? undefined : '#E7ECF7';

  const onSearch = useCallback((value: string) => {
    setKeyword(value);
  }, []);

  const chainsToShow = useMemo(() => {
    if (!keyword) {
      return options;
    }

    const normalizedKeyword = keyword.trim().toLowerCase();

    return options.filter(({ text }) => text.toLowerCase().includes(normalizedKeyword));
  }, [keyword, options]);

  const handleSelect = useCallback((chain: DropdownOption) => () => {
    onSelect(chain);
  }, [onSelect]);

  return (
    <Grid container item justifyContent='center'>
      <Grid container item>
        <SearchField
          focused
          onInputChange={onSearch}
          placeholder={searchPlaceholder}
        />
      </Grid>
      <Stack direction='column' sx={{ display: 'block', maxHeight, minHeight, my: '10px', overflowY: 'auto', pt: showTopPadding ? '4px' : undefined, width: '100%' }}>
        {chainsToShow.map((chain, index) => {
          const label = getLabel?.(chain) ?? chain.text;

          const isSelected = maybeSelectedText
          ? maybeSelectedText === chain.text
          : selectedValue === chain.value;

          return (
            <React.Fragment key={index}>
              <Grid
                alignItems='center'
                container
                item
                justifyContent='space-between'
                onClick={handleSelect(chain)}
                onDoubleClick={onDoubleClick}
                sx={{ '&:hover': { bgcolor: hoverBg }, borderRadius: '12px', cursor: 'pointer', minHeight: '40px', p: '8px 7px', transition: 'all 250ms ease-out' }}
              >
                <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
                  <Logo chainName={chain.text} size={logoSize} />
                  <Typography color={itemTextColor} variant={itemTextVariant}>
                    {label}
                  </Typography>
                </Grid>
                {showSelectedCheck &&
                  <GlowCheck
                    show={isSelected}
                    size='24px'
                    timeout={100}
                  />
                }
              </Grid>
              {index !== chainsToShow.length - 1 &&
                <GradientDivider style={{ background: dividerColor, my: '3px' }} />
              }
            </React.Fragment>
          );
        })}
        <NothingFound
          show={chainsToShow.length === 0}
          style={nothingFoundStyle}
          text={t('Network Not Found')}
        />
      </Stack>
    </Grid>
  );
}
