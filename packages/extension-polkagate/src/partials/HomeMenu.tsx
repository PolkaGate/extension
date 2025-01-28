// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Icon } from 'iconsax-react';

import { Container, Grid } from '@mui/material';
import { BuyCrypto, Clock, Logout, MedalStar, ScanBarcode, Setting } from 'iconsax-react';
import React, { useCallback, useRef, useState } from 'react';

import Tooltip from '../components/Tooltip';
import { useTranslation } from '../components/translate';
import { GradientDivider } from '../style';

const backgroundStyle: React.CSSProperties = {
  backdropFilter: 'blur(20px)',
  borderRadius: '16px',
  boxShadow: '0px 0px 25px 20px #4E2B7280 inset',
  inset: 0,
  position: 'absolute',
  zIndex: -1
};

interface MenuItemProps {
  ButtonIcon: Icon;
  buttonName: string;
  withBorder?: boolean;
}

function MenuItem ({ ButtonIcon, buttonName, withBorder = true }: MenuItemProps) {
  const [hovered, setHovered] = useState<boolean>(false);

  const selectedItemBackgroundStyle: React.CSSProperties = {
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
  };

  const refContainer = useRef(null);

  const toggleHovered = useCallback(() => setHovered((isHovered) => !isHovered), []);

  return (
    <>
      <Grid container item onMouseEnter={toggleHovered} onMouseLeave={toggleHovered} ref={refContainer} sx={{ cursor: 'pointer', p: '3px', position: 'relative', width: 'fit-content' }}>
        <ButtonIcon color={hovered ? '#FF4FB9' : '#AA83DC'} size='24' variant='Bulk' />
        <div style={selectedItemBackgroundStyle} />
      </Grid>
      {withBorder && <GradientDivider orientation='vertical' style={{ height: '24px' }} />}
      <Tooltip
        content={buttonName}
        placement='top'
        positionAdjustment={{ left: -15, top: -540 }}
        targetRef={refContainer}
      />
    </>
  );
}

function HomeMenu (): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Container disableGutters sx={{ bottom: '15px', mx: '15px', position: 'fixed', width: 'calc(100% - 30px)' }}>
      <Grid sx={{ display: 'flex', justifyContent: 'space-between', p: '12px 17px', position: 'relative' }}>
        <MenuItem ButtonIcon={Logout} buttonName={t('Send')} />
        <MenuItem ButtonIcon={ScanBarcode} buttonName={t('Receive')} />
        <MenuItem ButtonIcon={BuyCrypto} buttonName={t('Staking')} />
        <MenuItem ButtonIcon={MedalStar} buttonName={t('Governance')} />
        <MenuItem ButtonIcon={Setting} buttonName={t('Settings')} />
        <MenuItem ButtonIcon={Clock} buttonName={t('History')} withBorder={false} />
        <div style={backgroundStyle} />
      </Grid>
    </Container>
  );
}

export default HomeMenu;
