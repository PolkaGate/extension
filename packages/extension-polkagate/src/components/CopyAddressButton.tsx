// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import { Grid, IconButton, Tooltip, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { useTranslation } from '../hooks';

interface Props {
  address: string | null | undefined;
  showAddress?: boolean;
  size?: number;
}

function CopyAddressButton({ address, showAddress = false, size = 16 }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();

  const shortAddress = `${address?.slice(0, 12) ?? ''}...${address?.slice(-12) ?? ''}`;
  const [copied, setCopy] = useState<boolean>(false);

  const _onCopy = useCallback(() => {
    setCopy(true);
  }, []);

  const handelCloseToolTip = useCallback(() => {
    setTimeout(() => setCopy(false), 200);
  }, []);

  return (
    <Grid item>
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
              visibility: (showAddress || copied) ? 'visible' : 'hidden'
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
        title={copied ? t<string>('Copied') : showAddress && shortAddress}
      >
        <IconButton
          onClick={_onCopy}
          sx={{
            height: '23px',
            width: '36px'
          }}
          title={String(address)}
        >
          <CopyToClipboard text={String(address)}>
            <vaadin-icon
              icon='vaadin:copy-o'
              style={{ color: `${theme.palette.secondary.light}`, width: `${size}px` }}
            />
          </CopyToClipboard>
        </IconButton>
      </Tooltip>
    </Grid>
  );
}

export default (CopyAddressButton);
