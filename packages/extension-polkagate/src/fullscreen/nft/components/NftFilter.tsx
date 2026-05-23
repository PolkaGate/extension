// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FilterAction, FilterState, SortAction, SortState } from '../utils/types';

import { Grid, Popover, Typography, useTheme } from '@mui/material';
import { ArrowDown2, DocumentFilter, Filter, Sort } from 'iconsax-react';
import React, { useCallback } from 'react';

import { GlowCheckbox, GradientDivider } from '@polkadot/extension-polkagate/src/components/index';
import PRadio from '@polkadot/extension-polkagate/src/popup/staking/components/Radio';

import { useIsDark, useTranslation } from '../../../hooks';

interface Props {
  dispatchFilter: React.Dispatch<FilterAction>;
  filters: FilterState;
  dispatchSort: React.Dispatch<SortAction>;
  sort: SortState;
}

const Filters = React.memo(function Filters({ dispatchFilter, dispatchSort, filters, sort }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();

  const onFilters = useCallback((filter: keyof FilterState) => () => {
    dispatchFilter({ filter });
  }, [dispatchFilter]);

  const onSort = useCallback((enable: keyof SortState, unable: keyof SortState) => () => {
    dispatchSort({ enable, unable });
  }, [dispatchSort]);

  return (
    <Grid alignItems='flex-start' container display='block' item sx={{ borderRadius: '10px', maxWidth: '300px', p: '10px 20px', width: 'max-content' }}>
      <Grid alignItems='center' container item>
        <Filter color={isDark ? '#674394' : '#745D8B'} size='20px' style={{ marginRight: '10px' }} />
        <Typography color={isDark ? 'text.secondary' : '#745D8B'} variant='B-4'>
          {t('Filters')}
        </Typography>
        <GradientDivider style={{ my: '3px' }} />
        <GlowCheckbox
          changeState={onFilters('collections')}
          checked={filters.collections}
          label={t('Collections')}
          labelStyle={{ ...theme.typography['B-2'] }}
          style={{ marginTop: '15px' }}
        />
        <GlowCheckbox
          changeState={onFilters('nft')}
          checked={filters.nft}
          label={t('NFTs')}
          labelStyle={{ ...theme.typography['B-2'] }}
          style={{ marginTop: '15px' }}
        />
        <GlowCheckbox
          changeState={onFilters('unique')}
          checked={filters.unique}
          label={t('Uniques')}
          labelStyle={{ ...theme.typography['B-2'] }}
          style={{ marginTop: '15px' }}
        />
        <GlowCheckbox
          changeState={onFilters('kusama')}
          checked={filters.kusama}
          label={t('Kusama Asset Hub')}
          labelStyle={{ ...theme.typography['B-2'] }}
          style={{ marginTop: '15px' }}
        />
        <GlowCheckbox
          changeState={onFilters('polkadot')}
          checked={filters.polkadot}
          label={t('Polkadot Asset Hub')}
          labelStyle={{ ...theme.typography['B-2'] }}
          style={{ marginTop: '15px' }}
        />
      </Grid>
      <Grid alignItems='center' container item mt='15px'>
        <Sort color={isDark ? '#674394' : '#745D8B'} size='20px' style={{ marginRight: '10px' }} />
        <Typography color={isDark ? 'text.secondary' : '#745D8B'} variant='B-4'>
          {t('Sort')}
        </Typography>
        <GradientDivider style={{ my: '3px' }} />
        <PRadio
          boxStyle={{ marginTop: '15px' }}
          checked={sort.highPrice}
          label={t('Price: high to low')}
          onChange={onSort('highPrice', 'lowPrice')}
          value='highPrice'
        />
        <PRadio
          boxStyle={{ marginTop: '15px' }}
          checked={sort.lowPrice}
          label={t('Price: low to high')}
          onChange={onSort('lowPrice', 'highPrice')}
          value='lowPrice'
        />
      </Grid>
    </Grid>
  );
});

function NftFilters({ dispatchFilter, dispatchSort, filters, sort }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <>
      <Grid alignItems='center' aria-describedby={id} columnGap='5px' component='button' container item onClick={handleClick} sx={{ bgcolor: 'transparent', border: 'none', cursor: 'pointer', height: 'fit-content', p: 0, width: 'fit-content' }}>
        <DocumentFilter color={theme.palette.accent.icon} size='18px' variant='Bulk' />
        <Typography color={theme.palette.accent.icon} variant='B-4'>
          {t('Filter/Sort')}
        </Typography>
        <ArrowDown2 color={open ? (isDark ? '#FFF' : '#2D1E4A') : (theme.palette.accent.icon)} size='17' style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'all 250ms ease-out ' }} variant='Linear' />
      </Grid>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom'
        }}
        id={id}
        onClose={handleClose}
        open={open}
        slotProps={{
          paper: {
            sx: {
              background: isDark ? '#05091C' : '#FFFFFF',
              border: '4px solid',
              borderColor: isDark ? '#1B133C' : '#DDE3F4',
              borderRadius: '12px',
              boxShadow: isDark ? undefined : '0 12px 28px rgba(133, 140, 176, 0.18)',
              transition: 'all 250ms ease-out'
            }
          }
        }}
        sx={{ mt: '5px' }}
        transformOrigin={{
          horizontal: 'left',
          vertical: 'top'
        }}
      >
        <Filters
          dispatchFilter={dispatchFilter}
          dispatchSort={dispatchSort}
          filters={filters}
          sort={sort}
        />
      </Popover>
    </>
  );
}

export default React.memo(NftFilters);
