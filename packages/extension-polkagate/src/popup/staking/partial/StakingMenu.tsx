// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { PoolInfo } from '../../../util/types';

import { Container, Grid, styled, useTheme } from '@mui/material';
import { AddSquare, Book, Discover, Menu, Setting2, UserOctagon } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useTranslation } from '../../../hooks';
import PoolDetail from './PoolDetail';

const MenuBackground = styled('div')(({ mode }: { mode: 'light' | 'dark' }) => ({
  backdropFilter: 'blur(20px)',
  background: mode === 'light' ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(243, 245, 253, 0.94))' : 'linear-gradient(180deg, rgba(32, 20, 76, 0.97), rgba(12, 8, 34, 0.99))',
  border: mode === 'light' ? '1px solid rgba(255, 255, 255, 0.95)' : '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '20px 20px 0 0',
  boxShadow: mode === 'light'
    ? '0 12px 24px rgba(133, 140, 176, 0.12), inset 0px 0px 24px 8px rgba(154, 158, 255, 0.18)'
    : '0px 0px 24px 8px #4E2B7280 inset',
  inset: 0,
  position: 'absolute',
  zIndex: -1
}));

const SpotlightCone = styled('div')(({ mode }: { mode: 'light' | 'dark' }) => ({
  background: mode === 'light' ? 'linear-gradient(to top, rgba(79, 125, 240, 0.24), rgba(79, 125, 240, 0))' : 'linear-gradient(to top, rgba(255, 93, 177, 0.2), rgba(255, 93, 177, 0))',
  clipPath: 'polygon(34% 100%, 66% 100%, 100% 0, 0 0)',
  height: '150px',
  pointerEvents: 'none',
  position: 'absolute',
  transition: 'left 450ms cubic-bezier(0.3, 1.35, 0.5, 1), opacity 300ms ease-out',
  width: '150px'
}));

const SpotlightRing = styled('div')(({ mode }: { mode: 'light' | 'dark' }) => ({
  border: mode === 'light' ? '1.5px solid rgba(61, 107, 228, 0.55)' : '1.5px solid rgba(255, 93, 177, 0.6)',
  borderRadius: '50%',
  clipPath: 'inset(50% 0 0 0)',
  height: '68px',
  pointerEvents: 'none',
  position: 'absolute',
  top: '-34px',
  transform: 'translateX(-50%)',
  transition: 'left 450ms cubic-bezier(0.3, 1.35, 0.5, 1), opacity 300ms ease-out',
  width: '68px',
  zIndex: 0
}));

const SpotlightOrb = styled('div')(({ mode }: { mode: 'light' | 'dark' }) => ({
  alignItems: 'center',
  background: mode === 'light' ? 'radial-gradient(circle at 30% 22%, #8DB3FF, #4C7BF0 55%, #3A45D6)' : 'radial-gradient(circle at 30% 22%, #FF80C8, #C02A86 52%, #6A2FD0)',
  borderRadius: '50%',
  boxShadow: mode === 'light' ? '0 12px 26px -4px rgba(61, 107, 228, 0.7)' : '0 12px 28px -4px rgba(255, 93, 177, 0.75)',
  display: 'flex',
  height: '52px',
  justifyContent: 'center',
  pointerEvents: 'none',
  position: 'absolute',
  top: '-24px',
  transform: 'translateX(-50%)',
  transition: 'left 450ms cubic-bezier(0.3, 1.35, 0.5, 1), opacity 300ms ease-out',
  width: '52px',
  zIndex: 3
}));

interface MenuItemProps {
  ButtonIcon: Icon;
  tooltip: string;
  isSelected: boolean;
  isHovered: boolean;
  isDrawerTransitioning: boolean;
  onClick: () => void;
  onHover: (element: HTMLDivElement) => void;
  onClearHover: () => void;
}

function MenuItem({ ButtonIcon, isDrawerTransitioning, isHovered, isSelected = false, onClick, onClearHover, onHover, tooltip }: MenuItemProps) {
  const theme = useTheme();

  const isDark = theme.palette.mode === 'dark';
  const iconColor = isHovered
    ? 'transparent'
    : isDark
      ? theme.palette.text.highlight
      : '#7F7AAE';

  return (
    <>
      <Grid aria-label={tooltip} container item onClick={() => { onClearHover(); onClick(); }} onMouseEnter={(event) => onHover(event.currentTarget)} sx={{ alignItems: 'flex-start', cursor: 'pointer', flex: 1, height: '100%', justifyContent: 'center', pt: '8px', position: 'relative', zIndex: 1 }}>
        <ButtonIcon color={isHovered ? 'transparent' : isSelected ? isDark ? '#FF80C8' : '#4C7BF0' : iconColor} size='24' variant={isSelected ? 'Bold' : 'Bulk'} />
        <div style={{ bottom: '4px', color: isDark ? '#FFFFFF' : '#2B2552', fontSize: '12.5px', fontWeight: 800, left: 0, lineHeight: '20px', opacity: isHovered || (isSelected && isDrawerTransitioning) ? 1 : 0, pointerEvents: 'none', position: 'absolute', textAlign: 'center', transform: isHovered || (isSelected && isDrawerTransitioning) ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 300ms ease, transform 360ms ease', whiteSpace: 'nowrap', width: '100%' }}>{tooltip}</div>
      </Grid>
    </>
  );
}

interface MenuItemConfig {
  icon: Icon;
  tooltip: string;
  url: string; // StakingPages
}

const PAGES_CONFIG = {
  pool: [
    { icon: UserOctagon, tooltip: 'Staking Home', url: '/pool/genesisHash' },
    { icon: AddSquare, tooltip: 'Stake More', url: '/pool/genesisHash/bondExtra' },
    { icon: Menu, tooltip: 'Pool Info', url: '/pool/detail' },
    { icon: Book, tooltip: 'Info', url: '/pool/genesisHash/info' }
  ] as MenuItemConfig[],
  solo: [
    { icon: UserOctagon, tooltip: 'Staking Home', url: '/solo/genesisHash' },
    { icon: Discover, tooltip: 'Nominations', url: '/solo/genesisHash/nominations' },
    { icon: AddSquare, tooltip: 'Stake More', url: '/solo/genesisHash/bondExtra' },
    { icon: Setting2, tooltip: 'Reward Settings', url: '/solo/genesisHash/settings' },
    { icon: Book, tooltip: 'Info', url: '/solo/genesisHash/info' }
  ] as MenuItemConfig[]
};

interface Props {
  type: 'solo' | 'pool';
  genesisHash: string;
  pool?: PoolInfo | null;
}

function StakingMenu({ genesisHash, pool, type }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { pathname, state } = useLocation() as { pathname: string; state: { menuDrawerTransition?: boolean; previousUrl: string } };
  const navigate = useNavigate();

  const [leftPosition, setLeftPosition] = useState<number | null>(null);
  const [currentMenu, setCurrentMenu] = useState<string>();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isDrawerTransitioning, setIsDrawerTransitioning] = useState(Boolean(state?.menuDrawerTransition));
  const [openPopup, setOpenPopup] = useState<boolean>(false);

  useEffect(() => {
    if (!isDrawerTransitioning) {
      return;
    }

    const timeout = setTimeout(() => setIsDrawerTransitioning(false), 100);

    return () => clearTimeout(timeout);
  }, [isDrawerTransitioning]);

  const pageConfig = PAGES_CONFIG[type] || [];

  useEffect(() => {
    // to imitate GradientDivider movement
    if (state?.menuDrawerTransition) {
      setCurrentMenu(pathname);

      return;
    }

    if (state?.previousUrl) {
      setCurrentMenu(state.previousUrl);
    }

    const timeout = setTimeout(() => {
      setCurrentMenu(pathname);
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname, state?.menuDrawerTransition, state?.previousUrl]);

  const togglePoolDetail = useCallback(() => setOpenPopup((isOpen) => !isOpen), []);

  const handleMenuClick = useCallback((input: string) => () => {
    if (input === currentMenu) {
      return;
    }

    if (input === '/pool/detail') {
      togglePoolDetail();

      return;
    }

    navigate(input, { state: { menuDrawerTransition: true, previousUrl: pathname } }) as void;
    setCurrentMenu(input);
  }, [currentMenu, navigate, pathname, togglePoolDetail]);

  const menuWidth = window.innerWidth;
  const spotlightPosition = leftPosition === null ? null : leftPosition - (window.innerWidth - menuWidth) / 2;
  const hoveredPath = pageConfig.find(({ url }) => url.replace('genesisHash', genesisHash) === hoveredMenu);
  const hoveredIcon = hoveredPath?.icon;
  const handleHover = (key: string) => (element: HTMLDivElement): void => {
    const bounds = element.getBoundingClientRect();
    setHoveredMenu(key);
    setLeftPosition(bounds.left + bounds.width / 2);
  };
  const clearHover = (): void => setHoveredMenu(null);

  return (
    <>
      <Container disableGutters sx={{ bottom: 0, left: 0, maxWidth: 'none', position: 'fixed', width: '100%', zIndex: 10 }}>
        <Grid alignItems='center' onMouseLeave={clearHover} sx={{ display: 'flex', height: hoveredMenu || isDrawerTransitioning ? '72px' : '48px', isolation: 'isolate', justifyContent: 'space-between', overflow: 'visible', px: '16px', position: 'relative', transition: 'height 420ms cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
          {spotlightPosition !== null && <>
            <SpotlightCone mode={theme.palette.mode} sx={{ bottom: '72px', left: `${spotlightPosition - 75}px`, opacity: hoveredMenu ? 1 : 0 }} />
            <SpotlightRing mode={theme.palette.mode} sx={{ left: `${spotlightPosition}px`, opacity: hoveredMenu ? 1 : 0 }} />
            <SpotlightOrb mode={theme.palette.mode} sx={{ left: `${spotlightPosition}px`, opacity: hoveredMenu ? 1 : 0 }}>{hoveredIcon && React.createElement(hoveredIcon, { color: '#FFFFFF', size: '26', variant: 'Bold' })}</SpotlightOrb>
          </>}
          {pageConfig.map(({ icon: ButtonIcon, tooltip, url }, index) => {
            const path = url.replace('genesisHash', genesisHash);

            return (
              <MenuItem
                ButtonIcon={ButtonIcon}
                isDrawerTransitioning={isDrawerTransitioning}
                isHovered={hoveredMenu === path}
                isSelected={currentMenu === path}
                key={index}
                onClick={handleMenuClick(path)}
                onClearHover={clearHover}
                onHover={handleHover(path)}
                tooltip={t(tooltip)}
              />
            );
          })}
          <MenuBackground mode={theme.palette.mode} style={spotlightPosition === null || !hoveredMenu ? undefined : { maskImage: `radial-gradient(circle at ${spotlightPosition}px 0, transparent 34px, #000 35px)`, WebkitMaskImage: `radial-gradient(circle at ${spotlightPosition}px 0, transparent 34px, #000 35px)` } as React.CSSProperties} />
        </Grid>
      </Container>
      <PoolDetail
        comprehensive
        genesisHash={genesisHash}
        handleClose={togglePoolDetail}
        openMenu={openPopup}
        poolDetail={pool ?? undefined}
      />
    </>
  );
}

export default StakingMenu;
