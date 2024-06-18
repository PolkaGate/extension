// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { } from 'react';

interface Props {
  text: string;
  onClose: () => void;
  icon?: any
}

export const SimpleModalTitle = ({ icon, onClose, text }: Props): React.ReactElement<Props> => {
  const theme = useTheme();
  const isIconVaadin = icon?.startsWith('vaadin')
  const isIconFontAwesome = icon?.startsWith('fa')

  return (
    <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
      <Grid alignItems='center' container justifyContent='flex-start' sx={{ width: 'fit-content' }}>
        <Grid item>
          {isIconVaadin
            // @ts-ignore
            ? <vaadin-icon icon={icon} style={{ height: '20px', color: `${theme.palette.text.primary}` }} />
            : isIconFontAwesome
              ? <FontAwesomeIcon
                color={`${theme.palette.text.primary}`}
                fontSize='25px'
                icon={icon}
              />
              : <></>
          }
        </Grid>
        <Grid item sx={{ pl: '10px' }}>
          <Typography fontSize='18px' fontWeight={700}>
            {text}
          </Typography>
        </Grid>
      </Grid>
      <Grid item>
        <CloseIcon
          onClick={onClose}
          sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }}
        />
      </Grid>
    </Grid>
  );
};

