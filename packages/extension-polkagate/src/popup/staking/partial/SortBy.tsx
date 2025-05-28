// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */

import CheckIcon from '@mui/icons-material/Check';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ClickAwayListener, Container, Grid, Popover, styled, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useRef } from 'react';

import { useIsHovered, useTranslation } from '../../../hooks/index';
import { SORTED_BY } from './PoolFilter';

const DropContentContainer = styled(Grid)(() => ({
  background: '#05091C',
  border: '4px solid',
  borderColor: '#1B133C',
  borderRadius: '12px',
  columnGap: '5px',
  flexWrap: 'nowrap',
  margin: 'auto',
  maxHeight: '400px',
  minWidth: '197px',
  overflow: 'hidden',
  padding: '6px',
  rowGap: '4px',
  transition: 'all 250ms ease-out',
  width: '220px'
}));

interface TabProps {
  label: string;
  sortBy: SORTED_BY;
  setSortBy: React.Dispatch<React.SetStateAction<SORTED_BY>>;
}

function Tab ({ label, setSortBy, sortBy }: TabProps): React.ReactElement {
  const { t } = useTranslation();
  const refContainer = useRef(null);
  const hovered = useIsHovered(refContainer);

  const isSelected = sortBy.toLowerCase() === label.toLowerCase();

  const onClick = useCallback(() => {
    setSortBy(label as SORTED_BY);
  }, [label, setSortBy]);

  return (
    <Container disableGutters onClick={onClick} ref={refContainer} sx={{ bgcolor: hovered ? '#222540A6' : 'transparent', borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '10px', width: '100%' }}>
      <Typography color={isSelected ? '#3988FF' : hovered ? 'text.primary' : 'text.highlight'} variant='B-2'>
        {t(label)}
      </Typography>
      <CheckIcon sx={{ bgcolor: '#3988FF', borderRadius: '999px', color: '#fff', fontSize: '16px', fontWeight: 900, height: '20px', transition: 'all 100ms ease-out', visibility: isSelected ? 'visible' : 'hidden', width: '20px' }} />
    </Container>
  );
}

interface DropContentProps {
  containerRef: React.RefObject<HTMLDivElement>;
  open: boolean;
  sortBy: SORTED_BY;
  setSortBy: React.Dispatch<React.SetStateAction<SORTED_BY>>;
}

function DropContent ({ containerRef, open, setSortBy, sortBy }: DropContentProps) {
  const id = open ? 'dropContent-popover' : undefined;
  const anchorEl = open ? containerRef.current : null;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom'
      }}
      id={id}
      open={open}
      slotProps={{
        paper: {
          sx: {
            background: 'none',
            backgroundImage: 'none',
            borderRadius: '12px'
          }
        }
      }}
      transformOrigin={{
        horizontal: 'right',
        vertical: 'top'
      }}
    >
      <DropContentContainer container direction='column' item>
        {Object.values(SORTED_BY).map((value, index) => (
          <Tab
            key={index}
            label={value}
            setSortBy={setSortBy}
            sortBy={sortBy}
          />
        ))}
      </DropContentContainer>
    </Popover>
  );
}

interface Props {
  sortBy: SORTED_BY;
  setSortBy: React.Dispatch<React.SetStateAction<SORTED_BY>>;
  style?: SxProps<Theme>;
}

export default function SortBy ({ setSortBy, sortBy, style }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const [openMenu, setOpenMenu] = React.useState<boolean>(false);

  const toggleOpen = useCallback(() => setOpenMenu((isOpen) => !isOpen), []);
  const handleClickAway = useCallback(() => setOpenMenu(false), []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Container disableGutters ref={containerRef} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '6px', ...style }}>
          <FilterListIcon sx={{ color: 'text.highlight', fontSize: '26px' }} />
          <Container disableGutters onClick={toggleOpen} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '6px' }}>
            <Typography color='text.highlight' fontSize='13px' fontWeight={700}>
              {t('Sort by')}
            </Typography>
            <Typography color='text.primary' variant='B-2'>
              {sortBy}
            </Typography>
            <ArrowDown2 color={theme.palette.text.primary} size='12' variant='Bold' />
          </Container>
        </Container>
      </ClickAwayListener>
      <DropContent
        containerRef={containerRef}
        open={openMenu}
        setSortBy={setSortBy}
        sortBy={sortBy}
      />
    </>
  );
}
