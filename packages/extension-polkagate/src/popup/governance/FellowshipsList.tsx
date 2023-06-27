// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import { CubeGrid } from 'better-react-spinkit';
import React from 'react';

import { Identity } from '../../components';
import { useApi, useChain, useTranslation } from '../../hooks';
import { Fellowship } from '.';

interface Props {
  address: string | undefined;
  fellowships: Fellowship[] | null | undefined
}

export default function FellowshipsList({ address, fellowships }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);

  return (
    <Grid container sx={{ px: '35px', py: '25px', bgcolor: 'background.paper' }}>
      <Grid container item justifyContent='space-between' sx={{ borderBottom: 2, borderColor: '#CCCCCC', fontSize: '18px', fontWeight: 500, lineHeight: '36px' }}>
        <Grid item>
          {t('Member')}
        </Grid>
        <Grid item>
          {t('Rank')}
        </Grid>
      </Grid>
      {fellowships
        ? fellowships.map(([fellow, rank]) => (
          <Grid alignItems='center' container item justifyContent='space-between' key={fellow} sx={{ borderBottom: 1, borderColor: '#CCCCCC', lineHeight: '36px' }}>
            <Grid item>
              <Identity
                api={api}
                chain={chain}
                direction='row'
                formatted={fellow}
                identiconSize={31}
                showSocial
                style={{ fontSize: '16px', fontWeight: 400 }}
                withShortAddress
              />
            </Grid>
            <Grid item sx={{ border: 1, borderRadius: '5px', borderColor: 'text.disabled', px: '12px', my: '5px', bgcolor: getRankedColor(rank) }}>
              {rank}
            </Grid>
          </Grid>
        ))
        : <Grid container justifyContent='center' pt='10%'>
          <CubeGrid col={3} color={theme.palette.secondary.main} row={3} size={200} style={{ opacity: '0.4' }} />
        </Grid>
      }
    </Grid>
  );
}

const getRankedColor = (rank: number): string => {
  switch (rank) {
    case 6:
      return '#FFD700';
    case 5:
      return '#FFA500';
    case 4:
      return '#93D243';
    case 3:
      return '#7AB8F4';
    case 2:
      return '#E198E1';
    case 1:
      return '#DEBFBF';
    default:
      return '#000000';
  }
};
