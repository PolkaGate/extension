// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { IconDefinition, IconProp } from '@fortawesome/fontawesome-svg-core';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close as CloseIcon, DragIndicator as DragIndicatorIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, Typography, useTheme } from '@mui/material';
import React from 'react';

import { Infotip2, VaadinIcon } from '../../components';
import { useTranslation } from '../../hooks';

interface Props {
  onClose: () => void;
  title: string;
  icon?: string | IconDefinition;
  onMouseDown: (e: { clientX: number; clientY: number; }) => void;
  onMouseMove?: (e: { clientX: number; clientY: number; }) => void;
  onMouseUp?: () => void;
  isDragging: boolean;
}

export default function ModalTitleWithDrag({ icon, isDragging, onClose, onMouseDown, onMouseMove, onMouseUp, title }: Props): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();

  const isIconVaadin = typeof icon === 'string' && icon?.startsWith('vaadin');
  const isIconFontAwesome = !!icon;

  return (
    <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
      <Grid alignItems='center' container item justifyContent='flex-start' width='fit-content'>
        {icon &&
          <>
            {isIconVaadin
              ? <VaadinIcon icon={icon} style={{ color: `${theme.palette.text.primary}`, height: '22px', marginRight: '10px' }} />
              : isIconFontAwesome
                ? <FontAwesomeIcon
                  color={`${theme.palette.text.primary}`}
                  fontSize='22px'
                  icon={icon as IconProp}
                  style={{ marginRight: '10px' }}
                />
                : <></>
            }
          </>}
        <Typography display='contents' fontSize='22px' fontWeight={700} pl='10px'>
          {title}
        </Typography>
      </Grid>
      <Grid item>
        <IconButton
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
        >
          <Infotip2 text={t('Drag to move the window.')}>
            <DragIndicatorIcon sx={{ color: 'primary.light', cursor: isDragging ? 'grabbing' : 'grab', stroke: theme.palette.primary.light, strokeWidth: 1.5 }} />
          </Infotip2>
        </IconButton>
        <IconButton onClick={onClose}>
          <CloseIcon sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
        </IconButton>
      </Grid>
      <Divider sx={{ mt: '5px', width: '100%' }} />
    </Grid>
  );
}
