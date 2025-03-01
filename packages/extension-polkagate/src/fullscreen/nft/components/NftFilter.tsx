// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { FilterAction, FilterState, SortAction, SortState } from '../utils/types';

import { FilterAltOutlined as FilterIcon, FilterList as FilterListIcon, ImportExport as ImportExportIcon } from '@mui/icons-material';
import { Divider, FormControl, FormControlLabel, Grid, Popover, Radio, RadioGroup, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import Checkbox2 from '../../../components/Checkbox2';
import { useTranslation } from '../../../hooks';

interface Props {
  dispatchFilter: React.Dispatch<FilterAction>;
  filters: FilterState;
  dispatchSort: React.Dispatch<SortAction>;
  sort: SortState;
}

const Filters = React.memo(function Filters({ dispatchFilter, dispatchSort, filters, sort }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const onFilters = useCallback((filter: keyof FilterState) => () => {
    dispatchFilter({ filter });
  }, [dispatchFilter]);

  const onSort = useCallback((enable: keyof SortState, unable: keyof SortState) => () => {
    dispatchSort({ enable, unable });
  }, [dispatchSort]);

  return (
    <Grid alignItems='flex-start' container display='block' item sx={{ borderRadius: '10px', maxWidth: '300px', p: '10px 20px', width: 'max-content' }}>
      <Grid alignItems='center' container item>
        <FilterListIcon sx={{ color: 'secondary.light', height: '25px', mr: '10px', width: '25px' }} />
        <Typography fontSize='16px' fontWeight={400}>
          {t('Filters')}
        </Typography>
        <Divider sx={{ bgcolor: 'divider', height: '2px', mt: '5px', width: '100%' }} />
        <Checkbox2
          checked={filters.collections}
          iconStyle={{ marginRight: '6px', width: '20px' }}
          label={t('Collections')}
          labelStyle={{ fontSize: '16px', fontWeight: 400 }}
          onChange={onFilters('collections')}
          style={{ mt: '15px', width: '100%' }}
        />
        <Checkbox2
          checked={filters.nft}
          iconStyle={{ marginRight: '6px', width: '20px' }}
          label={t('NFTs')}
          labelStyle={{ fontSize: '16px', fontWeight: 400 }}
          onChange={onFilters('nft')}
          style={{ mt: '15px', width: '100%' }}
        />
        <Checkbox2
          checked={filters.unique}
          iconStyle={{ marginRight: '6px', width: '20px' }}
          label={t('Uniques')}
          labelStyle={{ fontSize: '16px', fontWeight: 400 }}
          onChange={onFilters('unique')}
          style={{ mt: '15px', width: '100%' }}
        />
        <Checkbox2
          checked={filters.kusama}
          iconStyle={{ marginRight: '6px', width: '20px' }}
          label={t('Kusama Asset Hub')}
          labelStyle={{ fontSize: '16px', fontWeight: 400 }}
          onChange={onFilters('kusama')}
          style={{ mt: '15px', width: '100%' }}
        />
        <Checkbox2
          checked={filters.polkadot}
          iconStyle={{ marginRight: '6px', width: '20px' }}
          label={t('Polkadot Asset Hub')}
          labelStyle={{ fontSize: '16px', fontWeight: 400 }}
          onChange={onFilters('polkadot')}
          style={{ mt: '15px', width: '100%' }}
        />
      </Grid>
      <Grid alignItems='center' container item mt='15px'>
        <ImportExportIcon sx={{ color: 'secondary.light', height: '30px', mr: '10px', width: '30px' }} />
        <Typography fontSize='16px' fontWeight={400}>
          {t('Sort')}
        </Typography>
        <Divider sx={{ bgcolor: 'divider', height: '2px', mt: '5px', width: '100%' }} />
        <FormControl fullWidth>
          <RadioGroup
            aria-labelledby='sort-price'
            name='sort-price'
          >
            <FormControlLabel checked={sort.highPrice} control={<Radio style={{ color: theme.palette.secondary.main }} />} label={t('Price: High to Low')} onClick={onSort('highPrice', 'lowPrice')} slotProps={{ typography: { fontWeight: 400 } }} value='highPrice' />
            <FormControlLabel checked={sort.lowPrice} control={<Radio style={{ color: theme.palette.secondary.main }} />} label={t('Price: Low to High')} onClick={onSort('lowPrice', 'highPrice')} slotProps={{ typography: { fontWeight: 400 } }} value='lowPrice' />
          </RadioGroup>
        </FormControl>
      </Grid>
    </Grid>
  );
});

function NftFilters({ dispatchFilter, dispatchSort, filters, sort }: Props): React.ReactElement {
  const theme = useTheme();

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
      <Grid aria-describedby={id} component='button' container item onClick={handleClick} sx={{ bgcolor: 'transparent', border: 'none', height: 'fit-content', p: 0, width: 'fit-content' }}>
        <FilterIcon sx={{ color: 'secondary.light', cursor: 'pointer', height: '30px', width: '30px' }} />
      </Grid>
      <Popover
        PaperProps={{
          sx: { backgroundImage: 'none', bgcolor: 'background.paper', border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'secondary.main' : 'transparent', borderRadius: '7px', boxShadow: theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)' }
        }}
        anchorEl={anchorEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom'
        }}
        id={id}
        onClose={handleClose}
        open={open}
        sx={{ mt: '5px' }}
        transformOrigin={{
          horizontal: 'right',
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
