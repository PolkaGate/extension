// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * show a member info including its identity, backed amount ,etc.
 */
import type { DeriveAccountInfo } from '@polkadot/api-derive/types';

import { Grid, Paper, Switch } from '@mui/material';
import React, { } from 'react';

import { Chain } from '../../../../../../extension-chains/src/types';
import useTranslation from '../../../../../../extension-ui/src/hooks/useTranslation';
import Identity from '../../../../components/Identity';
import { ChainInfo } from '../../../../util/plusTypes';
import { amountToHuman } from '../../../../util/plusUtils';

interface Props {
  info: DeriveAccountInfo;
  backed: string | undefined;
  selected?: boolean;
  chain: Chain;
  chainInfo: ChainInfo;
  hasSwitch?: boolean;
  handleSelect?: (event: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  index?: number;
}

export default function Member({ backed, chain, chainInfo, handleSelect, hasSwitch = false, index, info, selected }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  return (
    <Paper elevation={2} sx={{ borderRadius: '10px', margin: '5px 10px 1px', p: '1px' }}>
      <Grid container alignItems='center' sx={{ fontSize: 12 }}>

        <Grid container item xs={hasSwitch ? 7 : 8}>
          <Identity accountInfo={info} chain={chain} />
        </Grid>

        {backed &&
          <Grid item sx={{ fontSize: 11, textAlign: 'left' }} xs={4}>
            {t('Backed')}{': '} {amountToHuman(backed, chainInfo.decimals, 2, true)} {chainInfo.coin}
          </Grid>
        }

        {hasSwitch &&
          <Grid alignItems='center' item xs={1}>
            <Switch checked={selected} color='warning' onChange={(e) => handleSelect(e, index)} size='small' />
          </Grid>
        }
      </Grid>
    </Paper>
  );
}
