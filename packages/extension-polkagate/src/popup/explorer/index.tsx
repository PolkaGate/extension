// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Avatar, Chip, Container, Grid, Link, Stack, Typography } from '@mui/material';
import { Category, Record } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BackWithLabel, Motion, SearchField } from '../../components';
import { CATEGORY_ICONS, useBackground, useDapps, useIsDark, useIsSidePanel, useTranslation } from '../../hooks';
import { HomeMenu, UserDashboardHeader } from '../../partials';
import { VelvetBox } from '../../style';

function ExplorerPage(): React.ReactElement {
  useBackground('default');

  const { t } = useTranslation();
  const isDark = useIsDark();
  const isSidePanel = useIsSidePanel();
  const navigate = useNavigate();
  const { ALL_CATEGORIES, DAPPS, tAll } = useDapps();

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(tAll);

  const onSearch = useCallback((val: string) => {
    setSearch(val.trim().toLowerCase());
  }, []);

  const onBack = useCallback(() => navigate('/') as void, [navigate]);

  const filtered = useMemo(() => {
    return DAPPS.filter((d) => {
      const matchesCategory = activeCategory === tAll || d.category === activeCategory;
      const matchesSearch = !search || d.label.toLowerCase().includes(search) || d.description.toLowerCase().includes(search) || d.category.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [DAPPS, search, activeCategory, tAll]);

  return (
    <>
      <Grid alignContent='flex-start' container sx={{ flexDirection: 'column', flexWrap: 'nowrap', height: isSidePanel ? '100vh' : '600px', overflow: 'hidden', position: 'relative' }}>
        <UserDashboardHeader homeType='default' />
        <BackWithLabel
          onClick={onBack}
          style={{ pb: 0 }}
          text={t('Explore dApps')}
        />
        <Motion style={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }} variant='slide'>
          <SearchField
            onInputChange={onSearch}
            placeholder={t('🔍 Search dApps')}
            style={{ padding: '8px 4% 4px' }}
          />
          {/* Category filter chips */}
          <Container disableGutters sx={{ display: 'flex', flexShrink: 0, flexWrap: 'nowrap', gap: '6px', overflowX: 'auto', px: '4%', py: '8px' }}>
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
                  flexShrink: 0,
                  fontSize: '11px',
                  fontWeight: 600,
                  transition: 'all 200ms ease'
                }}
              />
            ))}
          </Container>
          <Container disableGutters sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: '56px', px: '4%' }}>
            <VelvetBox>
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
                        sx={{
                          ':hover': { background: isDark ? '#1B133C' : '#f4f7ff', px: '8px' },
                          bgcolor: isDark ? '#05091C' : '#FFFFFF',
                          borderBottom: `1px solid ${isDark ? '#1B133C' : '#EEF1FF'}`,
                          borderBottomLeftRadius: index === filtered.length - 1 ? '14px' : 0,
                          borderBottomRightRadius: index === filtered.length - 1 ? '14px' : 0,
                          borderTopLeftRadius: index === 0 ? '14px' : 0,
                          borderTopRightRadius: index === 0 ? '14px' : 0,
                          cursor: 'pointer',
                          minWidth: 0,
                          overflow: 'hidden',
                          p: '10px 12px',
                          transition: 'all 250ms ease-out'
                        }}
                      >
                        <Stack alignItems='center' direction='row' gap='12px' sx={{ minWidth: 0, overflow: 'hidden' }}>
                          <Avatar
                            src={dapp.logo}
                            sx={{ borderRadius: '10px', flexShrink: 0, height: '38px', width: '38px' }}
                            variant='square'
                          />
                          <Stack alignItems='flex-start' direction='column' gap='2px' sx={{ minWidth: 0 }}>
                            <Typography noWrap textAlign='left' variant='B-2'>
                              {dapp.label}
                            </Typography>
                            <Typography
                              color={isDark ? '#BEAAD8' : '#7A68A4'}
                              sx={{ WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, display: '-webkit-box', overflow: 'hidden', wordBreak: 'break-word' }}
                              textAlign='left'
                              variant='B-4'
                            >
                              {dapp.description}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Link>
                  ))
                  : (
                    <Grid alignItems='center' container item justifyContent='center' sx={{ p: '40px 0' }}>
                      <Stack alignItems='center' direction='column' gap='8px'>
                        <Record color={isDark ? '#4A3870' : '#C4B8E8'} size='32' variant='Bulk' />
                        <Typography color={isDark ? '#5A4880' : '#A090C8'} variant='B-3'>
                          {t('No dApps found')}
                        </Typography>
                      </Stack>
                    </Grid>
                  )
                }
              </Grid>
            </VelvetBox>
          </Container>
        </Motion>
      </Grid>
      <HomeMenu />
    </>
  );
}

export default ExplorerPage;
