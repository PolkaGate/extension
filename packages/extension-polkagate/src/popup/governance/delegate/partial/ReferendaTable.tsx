// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { BN } from '@polkadot/util';

import { ShowBalance } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { Track } from '../../utils/types';
import { toTitleCase } from '../../utils/util';

interface Props {
  tracks: Track[] | undefined;
  delegatedInfo: {
    delegatedBalance: BN,
    conviction: number,
    track: BN
  }[];
  token: string | undefined;
  decimal: number | undefined;
}

export default function ReferendaTable({ decimal, delegatedInfo, token, tracks }: Props): React.ReactElement {
  const { t } = useTranslation();

  const trackName = useCallback((track: BN) => {
    const founded = tracks?.find((value) => value[0].eq(track));

    return founded && toTitleCase(founded[1].name as unknown as string);
  }, [tracks]);

  return (
    <Grid container>
      <Grid container item justifyContent='center'>
        <Typography fontSize='16px' fontWeight={400}>
          {t<string>('Number of Referenda Categories')}
        </Typography>
      </Grid>
      <Grid container sx={{ '>:last-child': { border: 'none' }, border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', bgcolor: 'background.paper', maxHeight: '270px', scrollbarWidth: 'none', overflowY: 'scroll' }}>
        <Grid alignItems='center' container sx={{ borderBottom: '2px solid', borderBottomColor: 'rgba(0,0,0,0.2)', height: '38px', justifyContent: 'space-between', px: '25px' }}>
          <Typography fontSize={20} fontWeight={400} width='fit-content'>{t<string>('Track name')}</Typography>
          <Typography fontSize={20} fontWeight={400} width='fit-content'>{t<string>('Value')}</Typography>
          <Typography fontSize={20} fontWeight={400} width='fit-content'>{t<string>('Multiplier')}</Typography>
        </Grid>
        {delegatedInfo.map((info, index) =>
          <Grid alignItems='center' container key={index} sx={{ borderBottom: '1px solid', borderBottomColor: 'rgba(0,0,0,0.2)', height: '45px', justifyContent: 'space-between', px: '25px' }}>
            <Typography fontSize={16} fontWeight={400} textAlign='left' width='40%'>{t<string>(trackName(info.track) as string)}</Typography>
            <Grid container item textAlign='center' width='35%'>
              <ShowBalance balance={info.delegatedBalance} decimal={decimal} decimalPoint={2} token={token} />
            </Grid>
            <Typography fontSize={16} fontWeight={400} textAlign='right' width='20%'>{`${info.conviction === 0 ? 0.1 : info.conviction}x`}</Typography>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}
