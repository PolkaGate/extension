// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, SxProps, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { useTranslation } from '../../../hooks';

interface Props {
  value: string;
  copyText?: string | null | undefined;
  iconSize?: number;
  style?: SxProps<Theme>;
}

function CopySeedButton({ copyText, iconSize = 20, style, value }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();

  const [copied, setCopy] = useState<boolean>(false);

  const _onCopy = useCallback(() => {
    setCopy(true);
  }, []);

  const handelCloseToolTip = useCallback(() => {
    const timer = setTimeout(() => setCopy(false), 200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Grid container item sx={style}>
      <Tooltip
        arrow={!copied}
        componentsProps={{
          popper: {
            sx: {
              '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-18kejt8': {
                mb: '3px',
                p: '3px 15px'
              },
              '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-1yuxi3g': {
                mb: '3px',
                p: '3px 15px'
              },
              visibility: copied ? 'visible' : 'hidden'
            }
          },
          tooltip: {
            sx: {
              '& .MuiTooltip-arrow': {
                color: 'text.primary',
                height: '10px'
              },
              backgroundColor: 'text.primary',
              color: 'text.secondary',
              fontSize: copied ? '16px' : '14px',
              fontWeight: 400
            }
          }
        }}
        leaveDelay={700}
        onClose={handelCloseToolTip}
        placement='top'
        title={t<string>('Copied')}
      >
        <IconButton
          onClick={_onCopy}
          sx={{ borderRadius: '5px', m: '5px', p: '2px' }}
        >
          <CopyToClipboard text={value}>
            <Grid alignItems='center' container item width='fit-content'>
              <FontAwesomeIcon
                color={theme.palette.secondary.light}
                fontSize={iconSize}
                icon={faCopy}
              />
              <Typography fontSize='16px' fontWeight={400} sx={{ pl: '8px', textDecoration: 'underline' }}>
                {copyText ?? t('Copy to clipboard')}
              </Typography>
            </Grid>
          </CopyToClipboard>
        </IconButton>
      </Tooltip>
    </Grid>
  );
}

export default React.memo(CopySeedButton);
