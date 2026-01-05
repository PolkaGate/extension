// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { PoolFilterAction, PoolFilterState } from './PoolFilter';

import { alpha, Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowCircleLeft, Setting4 } from 'iconsax-react';
import React, { useCallback, useRef, useState } from 'react';

import { StepCounter, type StepCounterType } from '../../../components/BackWithLabel';
import { useIsHovered, useTranslation } from '../../../hooks';
import Search from '../components/Search';
import PoolFilter from './PoolFilter';

interface Props {
  style?: SxProps<Theme>;
  stepCounter: StepCounterType;
  onSearch: (query: string) => void;
  onBack: () => void;
  noFilter?: boolean;
  dispatchFilter: React.Dispatch<PoolFilterAction>;
  genesisHash: string | undefined;
  filter: PoolFilterState;
}

export default function JoinPoolBackButton({ dispatchFilter, filter, genesisHash, noFilter, onBack, onSearch, stepCounter, style }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);

  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const onFilter = useCallback(() => setOpenMenu(true), []);

  return (
    <>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', px: '15px', width: '100%', ...style }}>
        <Container disableGutters onClick={onBack} ref={containerRef} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '6px', ml: 0, width: 'max-content' }}>
          <ArrowCircleLeft color='#809ACB' size='24' variant={hovered ? 'Bold' : 'Bulk'} />
          <Typography sx={{ fontFamily: 'OdibeeSans', fontSize: '24px', fontWeight: '400', lineHeight: '26px', textTransform: 'uppercase', width: 'fit-content' }}>
            {t('Join pool')}
          </Typography>
        </Container>
        <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '6px', m: 0, width: 'fit-content' }}>
          {!noFilter &&
            <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px' }}>
              <Search onSearch={onSearch} />
              <Grid container item justifyContent='center' onClick={onFilter} sx={{ ':hover': { bgcolor: alpha(theme.palette.primary.main, 0.25) }, alignItems: 'center', bgcolor: '#809ACB26', borderRadius: '12px', columnGap: '4px', cursor: 'pointer', p: '7px 15px', width: 'fit-content' }}>
                <Setting4 color={theme.palette.text.highlight} size='18' variant='Bold' />
              </Grid>
            </Container>}
          <StepCounter stepCounter={stepCounter} />
        </Container>
      </Container>
      <PoolFilter
        dispatchFilter={dispatchFilter}
        filter={filter}
        genesisHash={genesisHash}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />
    </>
  );
}
