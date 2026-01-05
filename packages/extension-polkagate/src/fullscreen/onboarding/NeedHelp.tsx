// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { MessageQuestion } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { useTranslation } from '../../hooks';

/**
 * NeedHelp component renders a clickable message icon with a help text.
 * When clicked, it opens the PolkaGate documentation in a new tab.
 *
 * @param {Object} props - The component props.
 * @param {React.CSSProperties} [props.style] - Optional custom styles for the component.
 * @returns {React.ReactElement} The rendered NeedHelp component.
 */
function NeedHelp({ style = {} }: { style?: React.CSSProperties }): React.ReactElement {
  const { t } = useTranslation();

  const [hovered, setHovered] = useState(false);

  const onClick = useCallback(() => {
    window.open('https://docs.polkagate.xyz', '_blank');
  }, []);

  return (
    <Grid
      alignItems='center'
      container
      item onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} sx={{ color: hovered ? '#AA83DC' : '#674394', columnGap: '10px', cursor: 'pointer', ...style }} width='fit-content'
    >
      <MessageQuestion size='16' variant='Bulk' />
      <Typography variant='B-5'>
        {t('Need Help')}
      </Typography>
    </Grid>
  );
}

export default React.memo(NeedHelp);
