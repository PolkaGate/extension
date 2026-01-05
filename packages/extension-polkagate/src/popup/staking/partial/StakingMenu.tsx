// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { PoolInfo } from '../../../util/types';

import { Container, Grid, styled, useTheme } from '@mui/material';
import { AddSquare, Book, Discover, Menu, Setting2, UserOctagon } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { MyTooltip } from '../../../components';
import { useIsHovered, useTranslation } from '../../../hooks';
import { GradientDivider } from '../../../style';
import PoolDetail from './PoolDetail';

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
      <MyTooltip
        content={tooltip}
        notShow={!tooltip}
        placement='top'
      >
        <Grid container item onClick={onClick} ref={refContainer} sx={{ cursor: 'pointer', p: '3px', position: 'relative', width: 'fit-content' }}>
          <ButtonIcon color={hovered || isSelected ? '#3F76FF' : theme.palette.text.highlight} size='24' variant={isSelected ? 'Bold' : 'Bulk'} />
        </Grid>
      </MyTooltip>
      {withBorder &&
        <GradientDivider
          orientation='vertical'
          style={{
            height: '24px',
            opacity: 0.35
          }}
        />
      }
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

function StakingMenu ({ genesisHash, pool, type }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const { pathname, state } = useLocation() as { pathname: string; state: { previousUrl: string } };
  const navigate = useNavigate();

  const [leftPosition, setLeftPosition] = useState<number | null>(null);
  const [currentMenu, setCurrentMenu] = useState<string>();
  const [openPopup, setOpenPopup] = useState<boolean>(false);

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

  const togglePoolDetail = useCallback(() => setOpenPopup((isOpen) => !isOpen), []);

  const handleMenuClick = useCallback((input: string) => () => {
    if (input === currentMenu) {
      return;
    }

    if (input === '/pool/detail') {
      togglePoolDetail();

      return;
    }

    navigate(input) as void;
    setCurrentMenu(input);
  }, [currentMenu, navigate, togglePoolDetail]);

  const selectionLineStyle = useMemo(() => ({
    background: 'linear-gradient(90deg, transparent 9.75%, #596AFF 52.71%, transparent 95.13%)',
    border: 'none',
    height: '2px',
    position: 'relative',
    top: '2px',
    transform: `translateX(${leftPosition ? leftPosition - (type === 'solo' ? 56 : 80) : 7}px)`,
    transition: 'transform 0.3s ease-in-out',
    width: '48px'
  }), [leftPosition, type]);

  return (
    <>
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
