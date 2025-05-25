// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */

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
  marginTop: '4px',
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
    <Typography color={isSelected ? 'text.primary' : 'text.highlight'} onClick={onClick} ref={refContainer} sx={{ bgcolor: hovered ? '#6743944D' : 'transparent', borderRadius: '10px', cursor: 'pointer', p: '10px', textAlign: 'left', width: '100%' }}>
      {t(label)}
    </Typography>
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
            backgroundImage: 'none'
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
