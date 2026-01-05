// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme } from '@mui/material';
import { Import } from 'iconsax-react';
import React, { useCallback } from 'react';

import ActionButton from '../../../../components/ActionButton';
import { useTranslation } from '../../../../hooks';

interface Props {
  value: string;
  text?: string | null | undefined;
  iconSize?: number;
  style?: SxProps<Theme>;
}

function DownloadSeedButton ({ iconSize = 18, style = {}, text, value }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const onDownload = useCallback(() => {
    const element = document.createElement('a');
    const file = new Blob([value], { type: 'text/plain' });

    element.href = URL.createObjectURL(file);
    element.download = 'your-recovery-phrase.txt';
    document.body.appendChild(element);
    element.click();
  }, [value]);

  return (
    <Grid container item sx={style}>
      <ActionButton
        StartIcon={Import}
        contentPlacement='start'
        iconSize={iconSize}
        onClick={onDownload}
        style={{
          '& .MuiButton-startIcon': {
            marginRight: '5px'
          },
          borderRadius: '8px',
          height: '32px',
          padding: '5px 10px'
        }}
        text={text ?? t('Download') }
        variant='contained'
      />
    </Grid>
  );
}

export default React.memo(DownloadSeedButton);
