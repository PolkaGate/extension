// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Container, Grid, styled, useTheme } from '@mui/material';
import { AddSquare, Book, Discover, Menu, Setting2, UserOctagon } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import Tooltip from '../../../components/Tooltip';
import { useTranslation } from '../../../components/translate';
import { useIsHovered } from '../../../hooks';
import { GradientDivider } from '../../../style';

const MenuBackground = styled('div')(({ mode }: { mode: 'light' | 'dark' }) => ({
  backdropFilter: 'blur(20px)',
  background: mode === 'light' ? '#FFFFFF' : 'transparent',
  borderRadius: '16px',
  boxShadow: mode === 'light'
    ? '0px 0px 24px 8px #9A9EFF59 inset'
    : '0px 0px 24px 8px #4E2B7280 inset',
  inset: 0,
  position: 'absolute',
  zIndex: -1
}));

// const SelectedItemBackground = styled('div')(({ hovered }: { hovered: boolean }) => ({
//   background: '#FF4FB9',
//   filter: 'blur(14px)',
//   height: '15px',
//   opacity: hovered ? 1 : 0,
//   position: 'absolute',
//   right: 0,
//   top: '50%',
//   transform: 'translate(-50%, -50%)',
//   transition: 'all 250ms ease-out',
//   width: '15px'
// }));

interface MenuItemProps {
  ButtonIcon: Icon;
  tooltip: string;
  isSelected: boolean;
  onClick: () => void;
  withBorder?: boolean;
  setLeftPosition: React.Dispatch<React.SetStateAction<number | null>>
}

function MenuItem ({ ButtonIcon, isSelected = false, onClick, setLeftPosition, tooltip, withBorder = true }: MenuItemProps) {
  const theme = useTheme();
  const refContainer = useRef<HTMLDivElement>(null);
  const hovered = useIsHovered(refContainer);

  useEffect(() => {
    if (isSelected && refContainer.current) {
      setLeftPosition(refContainer.current.getBoundingClientRect().left);
    }
  }, [isSelected, setLeftPosition]);

  return (
    <>
      <Grid container item onClick={onClick} ref={refContainer} sx={{ cursor: 'pointer', p: '3px', position: 'relative', width: 'fit-content' }}>
        <ButtonIcon color={hovered || isSelected ? '#3F76FF' : theme.palette.text.highlight} size='24' variant={isSelected ? 'Bold' : 'Bulk'} />
        {/* <SelectedItemBackground hovered={hovered || isSelected} /> */}
      </Grid>
      {withBorder &&
        <GradientDivider
          orientation='vertical'
          style={{
            height: '24px',
            opacity: 0.35
          }}
        />
      }
      <Tooltip
        content={tooltip}
        placement='top'
        positionAdjustment={{ left: -45, top: -540 }}
        targetRef={refContainer}
      />
    </>
  );
}

// import { STAKING_ROUTES } from '@polkadot/extension-ui/src/Popup/routes/stakingRoutes';
// export type StakingPages = '/pool/genesisHash/stakingIndex' | '/pool/genesisHash/bondExtra' | '/pool/genesisHash/poolInfo' | '/pool/genesisHash/info' | '/solo/genesisHash/stakingIndex' | '/solo/genesisHash/validator' | '/solo/genesisHash/bondExtra' | '/solo/genesisHash/settings' | '/solo/genesisHash/info';

interface MenuItemConfig {
  icon: Icon;
  tooltip: string;
  url: string; // StakingPages
}

const PAGES_CONFIG = {
  pool: [
    { icon: UserOctagon, tooltip: 'Staking Home', url: '/pool/genesisHash' },
    { icon: AddSquare, tooltip: 'Stake More', url: '/pool/genesisHash/bondExtra' },
    { icon: Menu, tooltip: 'Pool Info', url: '/pool/genesisHash/poolInfo' },
    { icon: Book, tooltip: 'Info', url: '/pool/genesisHash/info' }
  ] as MenuItemConfig[],
  solo: [
    { icon: UserOctagon, tooltip: 'Staking Home', url: '/solo/genesisHash' },
    { icon: Discover, tooltip: 'Validators Settings', url: '/solo/genesisHash/nominations' },
    { icon: AddSquare, tooltip: 'Stake More', url: '/solo/genesisHash/bondExtra' },
    { icon: Setting2, tooltip: 'Staking Settings', url: '/solo/genesisHash/settings' },
    { icon: Book, tooltip: 'Info', url: '/solo/genesisHash/info' }
  ] as MenuItemConfig[]
};

interface Props {
  type: 'solo' | 'pool';
  genesisHash: string;
}

function StakingMenu ({ genesisHash, type }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { pathname, state } = useLocation() as { pathname: string; state: { previousUrl: string } };
  const navigate = useNavigate();

  const [leftPosition, setLeftPosition] = useState<number | null>(null);
  const [currentMenu, setCurrentMenu] = useState<string>();

  const pageConfig = PAGES_CONFIG[type] || [];

  useEffect(() => {
    // to imitate GradientDivider movement
    if (state?.previousUrl) {
      setCurrentMenu(state.previousUrl);
    }

    const timeout = setTimeout(() => {
      setCurrentMenu(pathname);
    }, 100);

    return () => clearTimeout(timeout);
  }, [pathname, state?.previousUrl]);

  const handleMenuClick = useCallback((input: string) => () => {
    navigate(input) as void;
    setCurrentMenu(input);
  }, [navigate]);

  const selectionLineStyle = useMemo(() => ({
    background: 'linear-gradient(90deg, transparent 9.75%, #596AFF 52.71%, transparent 95.13%)',
    border: 'none',
    height: '2px',
    position: 'relative',
    top: '2px',
    transform: `translateX(${leftPosition ? leftPosition - 56 : 7}px)`,
    transition: 'transform 0.3s ease-in-out',
    width: '48px'
  }), [leftPosition]);

  return (
    <Container disableGutters sx={{ bottom: '15px', mx: type === 'solo' ? '45px' : '70px', position: 'fixed', width: `calc(100% - ${type === 'solo' ? '90px' : '140px'})`, zIndex: 1 }}>
      {leftPosition && <GradientDivider style={selectionLineStyle} />}
      <Grid alignItems='center' sx={{ display: 'flex', justifyContent: 'space-between', p: '12px 17px', position: 'relative' }}>
        {pageConfig.map(({ icon: ButtonIcon, tooltip, url }, index) => {
          const path = url.replace('genesisHash', genesisHash);

          return (
            <MenuItem
              ButtonIcon={ButtonIcon}
              isSelected={currentMenu === path}
              key={index}
              onClick={handleMenuClick(path)}
              setLeftPosition={setLeftPosition}
              tooltip={t(tooltip)}
              withBorder={pageConfig.length - 1 !== index}
            />
          );
        })}
        <MenuBackground mode={theme.palette.mode} />
      </Grid>
    </Container>
  );
}

export default StakingMenu;
