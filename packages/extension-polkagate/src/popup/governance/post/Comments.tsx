// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { Identity, ShowBalance } from '../../../components';
import { useApi, useChain, useDecimal, useToken, useTranslation } from '../../../hooks';
import { LabelValue } from '../TrackStats';
import { ReferendumPolkassambly } from '../utils/types';
import { pascalCaseToTitleCase } from '../utils/util';


export default function Comments({ address, referendum }: { address: string | undefined, referendum: ReferendumPolkassambly | undefined }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange} sx={{ width: 'inherit', px: '16px', mt: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}` }} />} sx={{ borderBottom: expanded && `1px solid ${theme.palette.text.disabled}`, px: 0 }}>
        <Grid container item>
          <Grid container item xs={12}>
            <Typography fontSize={24} fontWeight={500}>
              {t('Comments')}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>
        <Grid container item xs={12}>


        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
