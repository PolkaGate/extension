// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Grid, IconButton, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { Label } from '../../components';

interface Props {
  item?: string;
}

export default function HistoryItem({ item }: Props): React.ReactElement {
  const _goToDetail = useCallback(() => {
    return 'ccsdasd';
  }, []);

  return (
    <>
      <div style={{ marginTop: '20px' }}>
        <Label
          label={'date'}
          style={{ fontWeight: 400 }}
        >
          <Grid
            alignItems='center'
            container
            direction='column'
            justifyContent='space-between'
            sx={{
              '> .historyItems:last-child': {
                border: 'none'
              },
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'secondary.light',
              borderRadius: '5px'
            }}
          >
            <Grid
              className='historyItems'
              container
              item
              py='5px'
              sx={{
                borderBottom: '1px solid',
                borderBottomColor: 'secondary.light'
              }}
            >
              <Grid
                container
                direction='column'
                item
                pl='10px'
                textAlign='left'
                xs={5.5}
              >
                <Typography
                  fontSize='22px'
                  fontWeight={400}
                >
                  action
                </Typography>
                <Typography
                  fontSize='16px'
                  fontWeight={300}
                >
                  To / from
                </Typography>
              </Grid>
              <Grid
                container
                direction='column'
                item
                pr='10px'
                textAlign='right'
                xs={5.5}
              >
                <Typography
                  fontSize='20px'
                  fontWeight={300}
                >
                  amount
                </Typography>
                <Typography
                  fontSize='16px'
                  fontWeight={400}
                >
                  status
                </Typography>
              </Grid>
              <Grid
                alignItems='center'
                container
                item
                sx={{
                  borderLeft: '1px solid',
                  borderLeftColor: 'secondary.light'
                }}
                xs={1}
              >
                <IconButton
                  onClick={_goToDetail}
                  sx={{ p: 0 }}
                >
                  <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '24px', stroke: '#BA2882', strokeWidth: 2 }} />
                </IconButton>
              </Grid>
            </Grid>
          </Grid>
        </Label>
      </div>
    </>
  );
};
