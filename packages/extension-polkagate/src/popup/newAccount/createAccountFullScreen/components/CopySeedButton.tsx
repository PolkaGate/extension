// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme, Tooltip } from '@mui/material';
import { Copy } from 'iconsax-react';
import React, { useCallback, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import ActionButton from '../../../../components/ActionButton';
import { useTranslation } from '../../../../hooks';

interface Props {
  value: string;
  style?: SxProps<Theme>;
}

function CopySeedButton ({ style, value }: Props): React.ReactElement<Props> {
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
        <>
          <CopyToClipboard text={value}>
            <ActionButton
              StartIcon={Copy}
              contentPlacement='start'
              iconSize={14}
              onClick={_onCopy}
              style={{
                '& .MuiButton-startIcon': {
                  marginRight: '5px'
                },
                borderRadius: '8px',
                height: '32px',
                padding: '5px 10px'
              }}
              text={t('Copy')}
              variant='contained'
            />
          </CopyToClipboard>
        </>
      </Tooltip>
    </Grid>
  );
}

export default React.memo(CopySeedButton);
