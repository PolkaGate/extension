// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';

import { BN } from '@polkadot/util';

import { Identity, ShowBalance, ShowValue } from '../../../components';
import { useApi, useChain, useChainName, useDecimal, useToken, useTranslation } from '../../../hooks';
import { LabelValue } from '../TrackStats';
import { STATUS_COLOR } from '../utils/consts';
import { ReferendumPolkassambly } from '../utils/types';
import { toPascalCase, toTitleCase } from '../utils/util';

export default function Metadata({ address, referendum }: { address: string | undefined, referendum: ReferendumPolkassambly | undefined }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address)
  const chain = useChain(address);
  const { state } = useLocation();
  const decimal = useDecimal(address);
  const token = useToken(address);

  return (
    <Accordion defaultExpanded sx={{ width: 'inherit', px: '2%' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}` }} />} sx={{ borderBottom: `1px solid ${theme.palette.action.disabledBackground}`, px: 0 }}>
        <Grid container item>
          <Grid container item xs={12}>
            <Typography fontSize={24} fontWeight={500}>
              {t('Metadata')}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container item xs={12}>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
