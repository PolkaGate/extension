// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { Avatar, Grid, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { Switch } from '../../../components';
import { CHAINS_WITH_BLACK_LOGO } from '../../../util/constants';
import getLogo2 from '../../../util/getLogo2';
import type { DropdownOption } from '../../../util/types';
import { sanitizeChainName } from '../../../util/utils';

interface Props {
  onclick: (item: DropdownOption) => void;
  chain: DropdownOption;
  isSelected?: boolean;
  disabled: boolean | undefined;
}

function ChainItem({ chain, disabled, isSelected, onclick }: Props): React.ReactElement {
  const theme = useTheme();
  const selectedItem = useMemo(() => false, []);

  return (
    <Grid alignItems='center' container justifyContent='space-between' sx={{ ':hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(24, 7, 16, 0.1)' : 'rgba(255, 255, 255, 0.1)' }, bgcolor: selectedItem ? 'rgba(186, 40, 130, 0.2)' : 'transparent', cursor: 'pointer', height: '45px', opacity: disabled ? 0.3 : 1, px: '15px' }}>
      <Grid alignItems='center' container item mr='10px' width='fit-content'>
        <Avatar
          src={getLogo2(chain.text)?.logo}
          sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(sanitizeChainName(chain.text) || '') && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: 25, width: 25, mr: '10px' }}
          variant='square'
        />
        <Typography fontSize='16px' fontWeight={selectedItem ? 500 : 400}>
          {chain.text}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item width='fit-content'>
        <Switch
          changeBackground={!disabled}
          fontSize='17px'
          isChecked={isSelected && !disabled}
          // eslint-disable-next-line react/jsx-no-bind
          onChange={() => onclick(chain)}
          theme={theme}
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(ChainItem);
