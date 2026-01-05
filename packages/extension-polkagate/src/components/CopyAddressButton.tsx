// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IconButton, Tooltip } from '@mui/material';
import { Copy } from 'iconsax-react';
import React, { useCallback, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { useIsDark, useTranslation } from '../hooks';

interface Props {
  address: string | null | undefined;
  showAddress?: boolean;
  size?: number;
  padding?: number;
}

function CopyAddressButton ({ address, padding, showAddress = false, size = 14 }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const shortAddress = `${address?.slice(0, 12) ?? ''}...${address?.slice(-12) ?? ''}`;
  const [copied, setCopy] = useState<boolean>(false);

  const _onCopy = useCallback(() => {
    setCopy(true);
  }, []);

  const handelCloseToolTip = useCallback(() => {
    setTimeout(() => setCopy(false), 200);
  }, []);

  return (
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
              color: isDark ? 'primary.main' : '#FFFFFF',
              height: '10px'
            },
            backgroundColor: isDark ? 'primary.main' : '#FFFFFF',
            color: 'text.primary',
            fontSize: copied ? '16px' : '14px',
            fontWeight: 400
          }
        }
      }}
      leaveDelay={700}
      onClose={handelCloseToolTip}
      placement='top'
      title={copied ? t('Copied') : showAddress && shortAddress}
    >
      <IconButton onClick={_onCopy} sx={{ padding }}>
        <CopyToClipboard text={String(address)}>
          <Copy
            color='#AA83DC'
            size={size}
            variant={'Bulk'}
          />
        </CopyToClipboard>
      </IconButton>
    </Tooltip>
  );
}

export default (CopyAddressButton);
