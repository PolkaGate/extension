// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { AccountBox, Boy, Home } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';

import { PoolStakingIcon } from '../components';
import { openOrFocusTab } from '../fullscreen/accountDetails/components/CommonTasks';
import { useTranslation } from '../hooks';

interface NavigationPath {
  icon: JSX.Element;
  link: string;
  title: string;
}

interface NavigationLink extends NavigationPath {
  currentPath: boolean;
}

function NavigationPaths ({ address }: { address: string }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { pathname: currentPath } = useLocation();

  const [navigationStack, setNavigationStack] = useState<NavigationPath[]>([]);

  const navigationPaths = useMemo(() => ([
    {
      icon: <Home />,
      link: '/',
      title: t('Home')
    },
    {
      icon: <AccountBox sx={{ fontSize: currentPath.includes('accountfs') ? '34px' : '24px' }} />,
      link: `/accountfs/${address}/0`,
      title: t('Account Details')
    },
    {
      icon: <PoolStakingIcon color={theme.palette.text.primary} height={40} width={40} />,
      link: `/poolfs/${address}/`,
      title: t('Staked in Pool')
    },
    {
      icon: <Boy sx={{ color: 'text.primary', fontSize: '40px' }} />,
      link: `/solofs/${address}/`,
      title: t('Solo Staked')
    }
  ]), [address, currentPath, t, theme.palette.text.primary]);

  useEffect(() => {
    if (currentPath.includes(navigationPaths[1].link)) {
      setNavigationStack([navigationPaths[0], navigationPaths[1]]);
    } else if (currentPath.includes(navigationPaths[2].link)) {
      setNavigationStack([navigationPaths[0], navigationPaths[1], navigationPaths[2]]);
    } else if (currentPath.includes(navigationPaths[3].link)) {
      setNavigationStack([navigationPaths[0], navigationPaths[1], navigationPaths[3]]);
    }
  }, [currentPath, navigationPaths]);

  const onClick = useCallback((link: string, currentPath: boolean) => () => {
    !currentPath && openOrFocusTab(link, true);
  }, []);

  const NavigationLink = ({ currentPath, icon, link, title }: NavigationLink) => {
    return (
      <Grid alignItems='center' container item onClick={onClick(link, currentPath)} width='fit-content'>
        <Grid alignItems='center' container item sx={{ '&:hover': { bgcolor: currentPath ? 'none' : 'divider', textDecoration: currentPath ? 'none' : 'underline' }, borderRadius: '5px', cursor: currentPath ? 'auto' : 'pointer', p: '5px' }} width='fit-content'>
          {icon}
          <Typography fontSize={currentPath ? '20px' : '16px'} fontWeight={currentPath ? 600 : 500}>
            {title}
          </Typography>
        </Grid>
        <Typography display={currentPath ? 'none' : 'inherit'} fontSize='20px' fontWeight={400} px='5px'>
          {'/'}
        </Typography>
      </Grid>
    );
  };

  return (
    <Grid container height='50px' item my='10px' width='fit-content'>
      {navigationStack.map((path, index) => (
        <NavigationLink
          currentPath={path.link === currentPath}
          icon={path.icon}
          key={index}
          link={path.link}
          title={path.title}
        />
      ))}
    </Grid>
  );
}

export default React.memo(NavigationPaths);
