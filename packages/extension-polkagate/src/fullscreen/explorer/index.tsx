// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Chip, Grid, Link, Stack, Typography } from '@mui/material';
import { Category, Record } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';

import { SearchField } from '../../components';
import { CATEGORY_ICONS, useDapps, useIsDark, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import HomeLayout from '../components/layout';

function ExplorerFullScreen(): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const { ALL_CATEGORIES, DAPPS, tAll } = useDapps();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(tAll);

  const onSearch = useCallback((val: string) => {
    setSearch(val.trim().toLowerCase());
  }, []);

  const filtered = useMemo(() => {
    return DAPPS.filter((d) => {
      const matchesCategory = activeCategory === tAll || d.category === activeCategory;
      const matchesSearch = !search || d.label.toLowerCase().includes(search) || d.description.toLowerCase().includes(search) || d.category.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [DAPPS, search, activeCategory, tAll]);

  return (
    <HomeLayout childrenStyle={{ paddingLeft: '25px', position: 'relative', zIndex: 1 }}>
      <Stack direction='row' sx={{ justifyContent: 'space-between', mb: '8px', width: '98%' }}>
        <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'uppercase', width: '100%' }} variant='H-2'>
          {t('Explore dApps')}
        </Typography>
      </Stack>

      {/* Search */}
      <SearchField
        onInputChange={onSearch}
        placeholder={t('🔍 Search dApps')}
        style={{ marginRight: '20px', marginTop: '4px' }}
      />

      {/* Category filter chips */}
      <Stack direction='row' sx={{ flexWrap: 'wrap', gap: '8px', mt: '12px' }}>
        {ALL_CATEGORIES.map((cat) => (
          <Chip
            icon={React.cloneElement(CATEGORY_ICONS[cat] ?? <Category size='13' variant='Bulk' />, {
              color: activeCategory === cat ? '#FFF' : isDark ? '#C4ADE8' : '#6D5ACD'
            })}
            key={cat}
            label={cat}
            onClick={() => setActiveCategory(cat)}
            size='small'
            sx={{
              '&:hover': { opacity: 0.9 },
              '& .MuiChip-icon': { color: 'inherit', ml: '6px' },
              bgcolor: activeCategory === cat
                ? isDark ? '#7B3FBE' : '#6D5ACD'
                : isDark ? '#2A1F4A' : '#EEE9FF',
              borderRadius: '8px',
              color: activeCategory === cat ? '#FFF' : isDark ? '#C4ADE8' : '#6D5ACD',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              px: '4px',
              transition: 'all 200ms ease'
            }}
          />
        ))}
      </Stack>

      {/* dApp list */}
      <VelvetBox style={{ margin: '12px 20px 0 0', maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', padding: 0 }}>
        <Grid container item sx={{ bgcolor: isDark ? '#1B133C' : '#FFFFFF', border: isDark ? 'none' : '1px solid #E3E8F7', borderRadius: '15px', boxShadow: isDark ? 'none' : '0 12px 24px rgba(133, 140, 176, 0.12)', width: '100%' }}>
          {filtered.length > 0
            ? filtered.map((dapp, index) => (
              <Link
                href={dapp.url}
                key={dapp.name}
                rel='noreferrer'
                sx={{ color: 'inherit', textDecoration: 'none', width: '100%' }}
                target='_blank'
              >
                <Grid
                  alignItems='center'
                  container
                  item
                  justifyContent='space-between'
                  sx={{
                    ':hover': { background: isDark ? '#1B133C' : '#f4f7ff', px: '12px' },
                    bgcolor: isDark ? '#05091C' : '#FFFFFF',
                    borderBottom: `1px solid ${isDark ? '#1B133C' : '#EEF1FF'}`,
                    borderBottomLeftRadius: index === filtered.length - 1 ? '14px' : 0,
                    borderBottomRightRadius: index === filtered.length - 1 ? '14px' : 0,
                    borderTopLeftRadius: index === 0 ? '14px' : 0,
                    borderTopRightRadius: index === 0 ? '14px' : 0,
                    cursor: 'pointer',
                    p: '14px 16px',
                    transition: 'all 250ms ease-out'
                  }}
                >
                  <Stack alignItems='center' direction='row' gap='14px'>
                    <Avatar
                      src={dapp.logo}
                      sx={{ borderRadius: '10px', height: '42px', width: '42px' }}
                      variant='square'
                    />
                    <Stack alignItems='flex-start' direction='column' gap='3px'>
                      <Typography textAlign='left' variant='B-2'>
                        {dapp.label}
                      </Typography>
                      <Typography color={isDark ? '#BEAAD8' : '#7A68A4'} textAlign='left' variant='B-4'>
                        {dapp.description}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Chip
                    label={dapp.category}
                    size='small'
                    sx={{
                      bgcolor: isDark ? '#2A1F4A' : '#EEE9FF',
                      borderRadius: '6px',
                      color: isDark ? '#C4ADE8' : '#6D5ACD',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  />
                </Grid>
              </Link>
            ))
            : (
              <Grid alignItems='center' container item justifyContent='center' sx={{ p: '60px 0' }}>
                <Stack alignItems='center' direction='column' gap='10px'>
                  <Record color={isDark ? '#4A3870' : '#C4B8E8'} size='36' variant='Bulk' />
                  <Typography color={isDark ? '#5A4880' : '#A090C8'} variant='B-3'>
                    {t('No dApps found')}
                  </Typography>
                </Stack>
              </Grid>
            )
          }
        </Grid>
      </VelvetBox>
    </HomeLayout>
  );
}

export default ExplorerFullScreen;
