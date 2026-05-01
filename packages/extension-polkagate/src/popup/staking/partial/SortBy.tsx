// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import CheckIcon from '@mui/icons-material/Check';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ClickAwayListener, Container, Grid, Popover, styled, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useRef } from 'react';

import { useIsBlueish, useIsExtensionPopup, useIsHovered, useTranslation } from '../../../hooks';

// This code is used in both extension and fullscreen modes, so the UI design varies between the two.

const DropContentContainer = styled(Grid)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? '#05091C' : '#FFFFFF',
  border: '4px solid',
  borderColor: theme.palette.mode === 'dark' ? '#1B133C' : '#EEF1FF',
  borderRadius: '12px',
  boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 12px 32px rgba(133, 140, 176, 0.18)',
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
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
}

function Tab({ label, setSortBy, sortBy }: TabProps): React.ReactElement {
  const { t } = useTranslation();
  const isBlueish = useIsBlueish();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const refContainer = useRef(null);
  const hovered = useIsHovered(refContainer);

  const isSelected = sortBy.toLowerCase() === label.toLowerCase();

  const onClick = useCallback(() => {
    setSortBy(label);
  }, [label, setSortBy]);

  const selectedColor = isDark ? (isBlueish ? '#3988FF' : '#FF4FB9') : '#FF4FB9';
  const textColor = isDark
    ? (isBlueish ? 'text.highlight' : 'text.primary')
    : 'text.primary';
  const hoveredTextColor = isDark
    ? (isBlueish ? 'text.primary' : 'text.secondary')
    : 'text.primary';
  const backgroundColor = hovered
    ? (isDark ? '#222540A6' : '#F3F6FD')
    : isSelected
      ? (isDark ? 'transparent' : '#EEF2FB')
      : 'transparent';

  return (
    <Container disableGutters onClick={onClick} ref={refContainer} sx={{ alignItems: 'center', bgcolor: backgroundColor, borderRadius: '10px', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '10px', width: '100%' }}>
      <Typography color={isSelected ? selectedColor : hovered ? hoveredTextColor : textColor} variant='B-2'>
        {t(label)}
      </Typography>
      <CheckIcon sx={{ background: isDark ? (isBlueish ? '#3988FF' : 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)') : 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '999px', color: '#fff', fontSize: '16px', fontWeight: 900, height: '18px', transition: 'all 100ms ease-out', visibility: isSelected ? 'visible' : 'hidden', width: '18px' }} />
    </Container>
  );
}

interface DropContentProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  open: boolean;
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  sortOptions: string[];
}

function DropContent({ containerRef, open, setSortBy, sortBy, sortOptions }: DropContentProps) {
  const id = open ? 'dropContent-popover' : undefined;
  const anchorEl = open ? containerRef.current : null;
  const isExtension = useIsExtensionPopup();

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
            borderRadius: '12px',
            marginTop: isExtension ? 0 : '8px'
          }
        }
      }}
      transformOrigin={{
        horizontal: isExtension ? 'right' : 'left',
        vertical: 'top'
      }}
    >
      <DropContentContainer container direction='column' item>
        {sortOptions.map((value, index) => (
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
  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;
  style?: SxProps<Theme>;
  sortOptions: string[];
  SortIcon?: React.ReactNode;
}

export default function SortBy({ SortIcon, setSortBy, sortBy, sortOptions, style }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const isExtension = useIsExtensionPopup();

  const [openMenu, setOpenMenu] = React.useState<boolean>(false);

  const toggleOpen = useCallback(() => setOpenMenu((isOpen) => !isOpen), []);
  const handleClickAway = useCallback(() => setOpenMenu(false), []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Container disableGutters ref={containerRef} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '6px', ...style }}>
          {SortIcon || <FilterListIcon sx={{ color: 'text.highlight', fontSize: '26px' }} />}
          <Container disableGutters onClick={toggleOpen} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '6px' }}>
            <Typography color={isExtension ? 'text.highlight' : '#AA83DC'} fontSize={isExtension ? '13px' : '12px'} fontWeight={isExtension ? 700 : 500}>
              {t('Sort by')}
            </Typography>
            <Typography color='text.primary' fontSize={isExtension ? undefined : '12px'} fontWeight={isExtension ? undefined : 500} variant='B-2'>
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
        sortOptions={sortOptions}
      />
    </>
  );
}
