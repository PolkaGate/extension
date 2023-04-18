// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Divider, Grid, Typography, useTheme } from '@mui/material';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { BN } from '@polkadot/util';

import { Identity, ShowBalance, ShowValue } from '../../../components';
import { useApi, useChain, useDecimal, useToken, useTranslation } from '../../../hooks';
import { LabelValue } from '../TrackStats';
import { STATUS_COLOR } from '../utils/consts';
import { ReferendumPolkassambly } from '../utils/types';
import { toPascalCase, toTitleCase } from '../utils/util';

export default function ReferendumDescription({ address, referendum }: { address: string | undefined, referendum: ReferendumPolkassambly | undefined }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address)
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);

  return (
    <Accordion defaultExpanded sx={{ width: 'inherit', px: '2%' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}` }} />} sx={{ borderBottom: `1px solid ${theme.palette.action.disabledBackground}`, px: 0 }}>
        <Grid container item>
          <Grid container item xs={12}>
            <Typography fontSize={24} fontWeight={500}>
              <ShowValue value={referendum ? referendum.title || 'No Title' : undefined} width='500px' />
            </Typography>
          </Grid>
          <Grid alignItems='center' container item justifyContent='space-between' xs={12}>
            <Grid alignItems='center' container item xs={9.5}>
              <Grid item sx={{ fontSize: '14px', fontWeight: 400, mr: '17px' }}>
                {t('By')}:
              </Grid>
              <Grid item>
                <Identity api={api} chain={chain} formatted={referendum?.proposer} identiconSize={25} showSocial={false} style={{ fontSize: '14px', fontWeight: 400, lineHeight: '47px', maxWidth: '100%', minWidth: '35%', width: 'fit-content', }} />
              </Grid>
              <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
              <Grid item sx={{ fontSize: '14px', fontWeight: 400, opacity: 0.6 }}>
                <ShowValue value={referendum?.method} width='50px' />
              </Grid>
              <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
              <ClockIcon sx={{ fontSize: 27, ml: '10px' }} />
              <Grid item sx={{ fontSize: '14px', fontWeight: 400, pl: '1%' }}>
                <ShowValue value={referendum?.created_at && new Date(referendum?.created_at).toDateString()} />
              </Grid>
              <Divider flexItem orientation='vertical' sx={{ mx: '2%' }} />
              <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
                {referendum?.requested &&
                  <LabelValue
                    label={`${t('Requested')}: `}
                    noBorder
                    value={<ShowBalance
                      balance={new BN(referendum?.requested)}
                      decimal={decimal}
                      decimalPoint={2}
                      token={token}
                    />}
                    valueStyle={{ fontSize: 16, fontWeight: 500, pl: '5px' }}
                    labelStyle={{ fontSize: 14 }}
                  />}
              </Grid>
            </Grid>
            <Grid item sx={{ textAlign: 'center', mb: '5px', color: 'white', fontSize: '16px', fontWeight: 400, border: '0.01px solid primary.main', borderRadius: '30px', bgcolor: STATUS_COLOR[toPascalCase(referendum?.status)], p: '5px 10px' }} xs={1.5}>
              {toTitleCase(referendum?.status)}
            </Grid>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container item xs={12}>
          {referendum?.content &&
            <ReactMarkdown
              components={{ img: ({ node, ...props }) => <img style={{ maxWidth: '100%' }}{...props} /> }}
              children={referendum?.content}
            />
          }
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
