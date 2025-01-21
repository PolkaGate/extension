// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Container, Grid } from '@mui/material';
import { Edit2, type Icon, LogoutCurve, People } from 'iconsax-react';
import React, { useCallback, useRef, useState } from 'react';

import { GradientDivider, Tooltip } from '../../../components/index';
import { useTranslation } from '../../../components/translate';

interface ActionButtonProps {
  ButtonIcon: Icon;
  name: string;
  onClick: () => void;
  index: number;
}

interface Props {
  address: string;
  index: number;
}

const ActionButton = ({ ButtonIcon, index, name, onClick }: ActionButtonProps) => {
  const containerRef = useRef(null);

  const [hovered, setHovered] = useState<boolean>(false);

  const toggleHovered = useCallback(() => setHovered((isHovered) => !isHovered), []);

  return (
    <>
      <Grid container item onClick={onClick} onMouseEnter={toggleHovered} onMouseLeave={toggleHovered} ref={containerRef} sx={{ '&:hover': { background: '#FF4FB9' }, background: '#2D1E4A', borderRadius: '999px', cursor: 'pointer', height: 'fit-content', p: '3px', transition: 'all 250ms ease-out', width: 'fit-content' }}>
        <ButtonIcon color={hovered ? '#05091C' : '#AA83DC'} size='22' variant='Bulk' />
      </Grid>
      <Tooltip
        content={name}
        placement='top'
        positionAdjustment={{ left: -15, top: -810 - (index * 80) }}
        targetRef={containerRef}
      />
    </>
  );
};

function AccountActionButtons ({ address, index }: Props): React.ReactElement {
  const { t } = useTranslation();

  const noop = useCallback(() => {
    console.log('address:', address);
  }, [address]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '10px', display: 'flex', width: 'fit-content' }}>
      <ActionButton
        ButtonIcon={Edit2}
        index={index}
        name={t('Rename account')}
        onClick={noop}
      />
      <ActionButton
        ButtonIcon={People}
        index={index}
        name={t('Manage profile')}
        onClick={noop}
      />
      <GradientDivider orientation='vertical' style={{ height: '24px' }} />
      <ActionButton
        ButtonIcon={LogoutCurve}
        index={index}
        name={t('Forget account')}
        onClick={noop}
      />
    </Container>
  );
}

export default AccountActionButtons;
