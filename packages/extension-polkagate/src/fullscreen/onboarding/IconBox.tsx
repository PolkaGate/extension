// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { IconProp } from '@fortawesome/fontawesome-svg-core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { pgBoxShadow } from '../../util/utils';
import { ICON_BOX_WIDTH } from '.';

interface Props {
  icon: IconProp;
  label: string;
  onClick: () => void;
}

function IconBox({ icon, label, onClick }: Props): React.ReactElement<Props> {
  const theme = useTheme();

  const [hovered, setHovered] = useState<boolean>(false);

  const onMouseEnter = useCallback((): void => {
    setHovered(true);
  }, []);

  const onMouseLeave = useCallback((): void => {
    setHovered(false);
  }, []);

  return (
    <Grid
      alignItems='center'
      container
      item
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{ bgcolor: hovered ? theme.palette.primary.main : theme.palette.background.paper, borderRadius: '10px', boxShadow: theme.palette.mode === 'light' ? pgBoxShadow(theme) : undefined, cursor: 'pointer', height: '90px', mb: '10px', position: 'relative', px: '15px', width: ICON_BOX_WIDTH }}
    >
      <FontAwesomeIcon
        fontSize='40px'
        icon={icon}
        pulse={hovered}
        style={{ color: hovered && theme.palette.mode === 'light' ? theme.palette.text.secondary : theme.palette.text.primary }}
      />
      <Typography fontSize='14px' fontWeight={400} sx={{ color: hovered && theme.palette.mode === 'light' ? theme.palette.text.secondary : theme.palette.text.primary, left: '100px', position: 'absolute', width: '100%' }}>
        {label}
      </Typography>
    </Grid>
  );
}

export default React.memo(IconBox);
