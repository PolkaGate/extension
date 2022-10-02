// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/** 
 * @description
 *  this component lists crowdloans, which could be actives, winners or ended
 * */

import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';

import { LinkOption } from '@polkadot/apps-config/endpoints/types';
import { Balance } from '@polkadot/types/interfaces';

import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import { ChainInfo, Crowdloan } from '../../util/plusTypes';
import Fund from './Fund';

interface Props {
  chainInfo: ChainInfo; crowdloans: Crowdloan[];
  description: string;
  endpoints: LinkOption[];
  expanded: string;
  handleAccordionChange: (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
  handleContribute: (arg0: Crowdloan) => void;
  height: number;
  title: string;
  myContributions: Map<string, Balance> | undefined;
}

export default function CrowdloanList({ chainInfo, crowdloans, description, endpoints, expanded, handleAccordionChange, handleContribute, height, myContributions, title }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  return (
    <Accordion disableGutters expanded={expanded === title} onChange={handleAccordionChange(title)} sx={{ backgroundColor: grey[300], flexGrow: 1 }}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Grid container justifyContent='space-between'>
          <Grid item>
            <Typography sx={{ flexShrink: 0, width: '33%' }} variant='body2'>
              {title}({crowdloans?.length})
            </Typography>
          </Grid>
          <Grid item>
            <Typography sx={{ color: 'text.secondary' }} variant='caption'>{description}</Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails sx={{ height: height, overflowY: 'auto', p: 0 }}>
        {crowdloans?.length
          ? crowdloans.map((c) => (
            <Grid container item key={c.fund.paraId}>
              {c.fund.paraId &&
                <Fund coin={chainInfo.coin} crowdloan={c} decimals={chainInfo.decimals} endpoints={endpoints} handleContribute={handleContribute} isActive={title === 'Actives'} myContributions={myContributions} />
              }
            </Grid>
          ))
          : <Grid item sx={{ fontSize: 12, textAlign: 'center' }} xs={12}> {t('There is no item to show')}</Grid>
        }
      </AccordionDetails>
    </Accordion>
  );
}
