// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { Icon } from 'iconsax-react';
import type { Pages } from '../popup/home/type';

import { Container, Grid, styled, useTheme } from '@mui/material';
import { BuyCrypto, Clock, Logout, MedalStar, ScanBarcode, Setting } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';

import Tooltip from '../components/Tooltip';
import { useTranslation } from '../components/translate';
import { useSelectedAccount } from '../hooks';
import { windowOpen } from '../messaging';
import Receive from '../popup/receive/Receive';
import { GradientDivider } from '../style';

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

const SelectedItemBackground = styled('div')(({ hovered }: { hovered: boolean }) => ({
  background: '#FF4FB9',
  filter: 'blur(14px)',
  height: '15px',
  opacity: hovered ? 1 : 0,
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translate(-50%, -50%)',
  transition: 'all 250ms ease-out',
  width: '15px'
}));

interface MenuItemProps {
  ButtonIcon: Icon;
  tooltip: string;
  isSelected: boolean;
  onClick: () => void;
  withBorder?: boolean;
  setLeftPosition: React.Dispatch<React.SetStateAction<number | null>>
}

function MenuItem({ ButtonIcon, isSelected = false, onClick, setLeftPosition, tooltip, withBorder = true }: MenuItemProps) {
  const theme = useTheme();

  const [hovered, setHovered] = useState<boolean>(false);
  const refContainer = useRef<HTMLDivElement>(null);

  const toggleHovered = useCallback(() => setHovered((prev) => !prev), []);

  useEffect(() => {
    if (isSelected && refContainer.current) {
      setLeftPosition(refContainer.current.getBoundingClientRect().left);
    }
  }, [isSelected, setLeftPosition]);

  return (
    <>
      <Grid container item onClick={onClick} onMouseEnter={toggleHovered} onMouseLeave={toggleHovered} ref={refContainer} sx={{ cursor: 'pointer', p: '3px', position: 'relative', width: 'fit-content' }}>
        <ButtonIcon color={hovered || isSelected ? theme.palette.menuIcon.hover : theme.palette.menuIcon.active} size='24' variant='Bulk' />
        <SelectedItemBackground hovered={hovered || isSelected} />
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
        positionAdjustment={{ left: -15, top: -540 }}
        targetRef={refContainer}
      />
    </>
  );
}

function HomeMenu(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useSelectedAccount();
  const { assetId } = useParams<{ assetId: string }>();

  const { pathname, state } = useLocation() as { pathname: string; state: { previousUrl: string } };
  const navigate = useNavigate();

  const [leftPosition, setLeftPosition] = useState<number | null>(null);
  const [currentMenu, setCurrentMenu] = useState<string>();
  const [openReceive, setOpenReceive] = useState<boolean>(false);

  const page = useMemo(() => {
    if (!pathname || pathname === '/') {
      return 'home';
    }

    return pathname.slice(1).split('-')[0];
  }, [pathname]);

  useEffect(() => {
    // to imitate GradientDivider movement
    if (state?.previousUrl) {
      setCurrentMenu(state.previousUrl);
    }

    const timeout = setTimeout(() => {
      setCurrentMenu(page);
    }, 100);

    return () => clearTimeout(timeout);
  }, [page, state?.previousUrl]);

  const handleMenuClick = useCallback((input: Pages) => () => {
    if (input === 'send') {
      account && windowOpen(`/send/${account.address}/${assetId ?? 0}`).catch(console.error);

      return;
    }

    if (input === 'receive') {
      setOpenReceive(true);

      return;
    }

    if (input === 'governance') {
      account && windowOpen(`/governance/${account.address}/referenda`).catch(console.error);

      return;
    }

    navigate(`/${input}`, { state: { previousUrl: page } });
  }, [account, assetId, navigate, page]);

  const selectionLineStyle = useMemo(
    () => ({
      position: 'relative',
      top: '2px',
      transform: `translateX(${leftPosition ? leftPosition - 24 : 7}px)`,
      transition: 'transform 0.3s ease-in-out'
    }),
    [leftPosition]
  );

  return (
    <>
      <Container disableGutters sx={{ bottom: '15px', mx: '15px', position: 'fixed', width: 'calc(100% - 30px)', zIndex: 1 }}>
        {leftPosition && <GradientDivider isSelectionLine style={selectionLineStyle} />}
        <Grid alignItems='center' sx={{ display: 'flex', justifyContent: 'space-between', p: '12px 17px', position: 'relative' }}>
          <MenuItem ButtonIcon={Logout} isSelected={currentMenu === 'send'} onClick={handleMenuClick('send')} setLeftPosition={setLeftPosition} tooltip={t('Send')} />
          <MenuItem ButtonIcon={ScanBarcode} isSelected={currentMenu === 'receive'} onClick={handleMenuClick('receive')} setLeftPosition={setLeftPosition} tooltip={t('Receive')} />
          <MenuItem ButtonIcon={BuyCrypto} isSelected={currentMenu === 'stakingIndex'} onClick={handleMenuClick('stakingIndex')} setLeftPosition={setLeftPosition} tooltip={t('Staking')} />
          <MenuItem ButtonIcon={MedalStar} isSelected={currentMenu === 'governance'} onClick={handleMenuClick('governance')} setLeftPosition={setLeftPosition} tooltip={t('Governance')} />
          <MenuItem ButtonIcon={Setting} isSelected={currentMenu === 'settings'} onClick={handleMenuClick('settings')} setLeftPosition={setLeftPosition} tooltip={t('Settings')} />
          <MenuItem ButtonIcon={Clock} isSelected={currentMenu === 'history'} onClick={handleMenuClick('history')} setLeftPosition={setLeftPosition} tooltip={t('History')} withBorder={false} />
          <MenuBackground mode={theme.palette.mode} />
        </Grid>
      </Container>
      <Receive
        openPopup={openReceive}
        setOpenPopup={setOpenReceive}
      />
    </>
  );
}

export default HomeMenu;
