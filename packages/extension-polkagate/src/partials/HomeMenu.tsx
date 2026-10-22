// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { Pages } from '../popup/home/type';

import { Container, Grid, styled, useTheme } from '@mui/material';
import { ArrowCircleDown2, ArrowCircleRight2, BuyCrypto, Clock, Record, Setting } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useTranslation } from '../components/translate';
import { useSelectedAccount } from '../hooks';
import useAccountSelectedChain from '../hooks/useAccountSelectedChain';
import { windowOpen } from '../messaging';
import Receive from '../popup/receive/Receive';
import { ExtensionPopups } from '../util/constants';
import { useExtensionPopups } from '../util/handleExtensionPopup';

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

const SpotlightOrb = styled('div')(({ mode }: { mode: 'light' | 'dark' }) => ({
  alignItems: 'center',
  background: mode === 'light' ? 'radial-gradient(circle at 30% 22%, #8DB3FF, #4C7BF0 55%, #3A45D6)' : 'radial-gradient(circle at 30% 22%, #FF80C8, #C02A86 52%, #6A2FD0)',
  borderRadius: '50%',
  boxShadow: mode === 'light' ? '0 8px 18px -4px rgba(61, 107, 228, 0.65)' : '0 8px 18px -4px rgba(255, 93, 177, 0.65)',
  display: 'flex',
  height: '40px',
  justifyContent: 'center',
  pointerEvents: 'none',
  position: 'absolute',
  top: '-20px',
  transform: 'translateX(-50%)',
  transition: 'left 450ms cubic-bezier(0.3, 1.35, 0.5, 1), opacity 300ms ease-out',
  width: '40px',
  zIndex: 3
}));

const SpotlightCone = styled('div')(({ mode }: { mode: 'light' | 'dark' }) => ({
  background: mode === 'light' ? 'linear-gradient(to top, rgba(79, 125, 240, 0.13), rgba(79, 125, 240, 0))' : 'linear-gradient(to top, rgba(255, 93, 177, 0.13), rgba(255, 93, 177, 0))',
  clipPath: 'polygon(30% 100%, 70% 100%, 100% 0, 0 0)',
  height: '80px',
  pointerEvents: 'none',
  position: 'absolute',
  transition: 'left 450ms cubic-bezier(0.3, 1.35, 0.5, 1), opacity 300ms ease-out',
  width: '100px'
}));

const SpotlightRing = styled('div')(({ mode }: { mode: 'light' | 'dark' }) => ({
  border: mode === 'light' ? '1.5px solid rgba(61, 107, 228, 0.55)' : '1.5px solid rgba(255, 93, 177, 0.6)',
  borderRadius: '50%',
  clipPath: 'inset(50% 0 0 0)',
  height: '56px',
  pointerEvents: 'none',
  position: 'absolute',
  top: '-28px',
  transform: 'translateX(-50%)',
  transition: 'left 450ms cubic-bezier(0.3, 1.35, 0.5, 1), opacity 300ms ease-out',
  width: '56px',
  zIndex: 0
}));

interface MenuItemProps {
  ButtonIcon: Icon;
  tooltip: string;
  isSelected: boolean;
  isHovered: boolean;
  isDrawerTransitioning: boolean;
  iconVariant?: 'Bulk' | 'Linear' | 'Outline' | 'Broken' | 'Bold' | 'TwoTone' | undefined;
  onClick: () => void;
  onHover: (element: HTMLDivElement) => void;
  onClearHover: () => void;
}

function MenuItem({ ButtonIcon, iconVariant = 'Bulk', isDrawerTransitioning, isHovered, isSelected = false, onClick, onClearHover, onHover, tooltip }: MenuItemProps) {
  const theme = useTheme();
  const refContainer = useRef<HTMLDivElement>(null);

  return (
    <>
      <Grid aria-label={tooltip} container item onClick={() => { onClearHover(); onClick(); }} onMouseEnter={() => refContainer.current && onHover(refContainer.current)} ref={refContainer} sx={{ '&::before': { content: '""', cursor: 'pointer', height: '28px', left: 0, position: 'absolute', right: 0, top: '-28px' }, alignItems: 'flex-start', cursor: 'pointer', flex: 1, height: '100%', justifyContent: 'center', pt: '8px', position: 'relative', zIndex: 1 }}>
        <ButtonIcon color={isHovered ? 'transparent' : isSelected ? theme.palette.mode === 'light' ? '#4C7BF0' : '#FF80C8' : theme.palette.mode === 'light' ? '#7F7AAE' : theme.palette.menuIcon.active} size='24' style={{ position: 'relative', zIndex: 1 }} variant={isSelected ? 'Bold' : iconVariant} />
        <div style={{ bottom: '4px', color: theme.palette.mode === 'light' ? '#2B2552' : '#FFFFFF', fontSize: '12.5px', fontWeight: 800, left: 0, lineHeight: '20px', opacity: isHovered || (isSelected && isDrawerTransitioning) ? 1 : 0, pointerEvents: 'none', position: 'absolute', textAlign: 'center', transform: isHovered || (isSelected && isDrawerTransitioning) ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 300ms ease, transform 360ms ease', whiteSpace: 'nowrap', width: '100%' }}>{tooltip}</div>
      </Grid>
    </>
  );
}

function HomeMenu(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useSelectedAccount();
  const lastSelectedAccountGenesisHash = useAccountSelectedChain(account?.address);
  const { assetId } = useParams<{ assetId: string }>();
  const { pathname, state } = useLocation() as { pathname: string; state: { menuDrawerTransition?: boolean; previousUrl: string } };
  const navigate = useNavigate();
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

  const [leftPosition, setLeftPosition] = useState<number | null>(null);
  const [currentMenu, setCurrentMenu] = useState<string>();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isDrawerTransitioning, setIsDrawerTransitioning] = useState(Boolean(state?.menuDrawerTransition));

  useEffect(() => {
    if (!isDrawerTransitioning) {
      return;
    }

    const timeout = setTimeout(() => setIsDrawerTransitioning(false), 100);

    return () => clearTimeout(timeout);
  }, [isDrawerTransitioning]);

  const page = useMemo(() => {
    if (!pathname || pathname === '/') {
      return 'home';
    }

    return pathname.slice(1).split('-')[0];
  }, [pathname]);

  useEffect(() => {
    // to imitate GradientDivider movement
    if (state?.menuDrawerTransition) {
      setCurrentMenu(page);

      return;
    }

    if (state?.previousUrl) {
      setCurrentMenu(state.previousUrl);
    }

    const timeout = setTimeout(() => {
      setCurrentMenu(page);
    }, 100);

    return () => clearTimeout(timeout);
  }, [page, state?.menuDrawerTransition, state?.previousUrl]);

  const handleMenuClick = useCallback((input: Pages) => (): void => {
    switch (input) {
      case 'send':
        return (account && windowOpen(`/send/${account.address}/${lastSelectedAccountGenesisHash}/${assetId ?? 0}`)) as unknown as void;
      case 'receive':
        return extensionPopupOpener(ExtensionPopups.RECEIVE)();
      default:
        navigate(`/${input}`, { state: { menuDrawerTransition: true, previousUrl: page } }) as void;
    }
  }, [account, assetId, extensionPopupOpener, lastSelectedAccountGenesisHash, navigate, page]);

  const menuWidth = window.innerWidth;
  const spotlightPosition = leftPosition === null ? null : leftPosition - (window.innerWidth - menuWidth) / 2;
  const hoveredIcon = {
    send: ArrowCircleRight2,
    receive: ArrowCircleDown2,
    stakingIndex: BuyCrypto,
    explorer: Record,
    settings: Setting,
    history: Clock
  }[hoveredMenu ?? ''];
  const handleHover = (key: string) => (element: HTMLDivElement): void => {
    const bounds = element.getBoundingClientRect();
    setHoveredMenu(key);
    setLeftPosition(bounds.left + bounds.width / 2);
  };
  const clearHover = (): void => setHoveredMenu(null);

  return (
    <>
      <Container disableGutters onMouseLeave={clearHover} sx={{ bottom: 0, height: hoveredMenu || isDrawerTransitioning ? '100px' : '48px', left: 0, maxWidth: 'none', position: 'fixed', width: '100%', zIndex: 10 }}>
        <Grid alignItems='center' sx={{ bottom: 0, display: 'flex', height: hoveredMenu || isDrawerTransitioning ? '72px' : '48px', isolation: 'isolate', justifyContent: 'space-between', left: 0, overflow: 'visible', px: '16px', position: 'absolute', transition: 'height 420ms cubic-bezier(0.2, 0.8, 0.2, 1)', width: '100%' }}>
          {spotlightPosition !== null && <>
            <SpotlightCone mode={theme.palette.mode} sx={{ bottom: '88px', left: `${spotlightPosition - 50}px`, opacity: hoveredMenu ? 1 : 0 }} />
            <SpotlightRing mode={theme.palette.mode} sx={{ left: `${spotlightPosition}px`, opacity: hoveredMenu ? 1 : 0 }} />
            <SpotlightOrb mode={theme.palette.mode} sx={{ left: `${spotlightPosition}px`, opacity: hoveredMenu ? 1 : 0 }}>{hoveredIcon && React.createElement(hoveredIcon, { color: '#FFFFFF', size: '20', variant: 'Bold' })}</SpotlightOrb>
          </>}
          <MenuItem ButtonIcon={ArrowCircleRight2} iconVariant={theme.palette.mode === 'light' ? 'Bold' : undefined} isDrawerTransitioning={isDrawerTransitioning} isHovered={hoveredMenu === 'send'} isSelected={currentMenu === 'send'} onClick={handleMenuClick('send')} onClearHover={clearHover} onHover={handleHover('send')} tooltip={t('Send')} />
          <MenuItem ButtonIcon={ArrowCircleDown2} iconVariant={theme.palette.mode === 'light' ? 'Bold' : undefined} isDrawerTransitioning={isDrawerTransitioning} isHovered={hoveredMenu === 'receive'} isSelected={currentMenu === 'receive'} onClick={handleMenuClick('receive')} onClearHover={clearHover} onHover={handleHover('receive')} tooltip={t('Receive')} />
          <MenuItem ButtonIcon={BuyCrypto} isDrawerTransitioning={isDrawerTransitioning} isHovered={hoveredMenu === 'stakingIndex'} isSelected={currentMenu === 'stakingIndex'} onClick={handleMenuClick('stakingIndex')} onClearHover={clearHover} onHover={handleHover('stakingIndex')} tooltip={t('Staking')} />
          <MenuItem ButtonIcon={Record} isDrawerTransitioning={isDrawerTransitioning} isHovered={hoveredMenu === 'explorer'} isSelected={currentMenu === 'explorer'} onClick={handleMenuClick('explorer')} onClearHover={clearHover} onHover={handleHover('explorer')} tooltip={t('Explore')} />
          <MenuItem ButtonIcon={Setting} iconVariant={theme.palette.mode === 'light' ? 'Bold' : undefined} isDrawerTransitioning={isDrawerTransitioning} isHovered={hoveredMenu === 'settings'} isSelected={currentMenu === 'settings'} onClick={handleMenuClick('settings')} onClearHover={clearHover} onHover={handleHover('settings')} tooltip={t('Settings')} />
          <MenuItem ButtonIcon={Clock} iconVariant={theme.palette.mode === 'light' ? 'Bold' : undefined} isDrawerTransitioning={isDrawerTransitioning} isHovered={hoveredMenu === 'history'} isSelected={currentMenu === 'history'} onClick={handleMenuClick('history')} onClearHover={clearHover} onHover={handleHover('history')} tooltip={t('History')} />
          <MenuBackground mode={theme.palette.mode} style={spotlightPosition === null || !hoveredMenu ? undefined : { maskImage: `radial-gradient(circle at ${spotlightPosition}px 0, transparent 27px, #000 28px)`, WebkitMaskImage: `radial-gradient(circle at ${spotlightPosition}px 0, transparent 27px, #000 28px)` } as React.CSSProperties} />
        </Grid>
      </Container>
      <Receive
        openPopup={extensionPopup === ExtensionPopups.RECEIVE}
        setOpenPopup={extensionPopupCloser}
      />
    </>
  );
}

export default HomeMenu;
