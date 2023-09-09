// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { useTranslation } from '../../../components/translate';
import DisplaySubId from './DisplaySubId';

interface Props {
  judgements: RegExpMatchArray | null;
  parentNameID: string;
  subIdAccounts: { address: string; name: string; }[];
}

export default function SubIdsAccordion({ judgements, parentNameID, subIdAccounts }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid container item sx={{ display: 'block', pt: '15px' }}>
      <Accordion disableGutters sx={{ backgroundImage: 'none', bgcolor: 'transparent', boxShadow: 'none' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'secondary.light', fontSize: '40px' }} />} sx={{ '> .MuiAccordionSummary-content': { m: 0 }, borderBottom: '2px solid', borderBottomColor: '#D5CCD0', m: 0, p: 0 }}>
          <Typography fontSize='22px' fontWeight={700}>
            {t<string>('Sub Identities')}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ bgcolor: 'background.paper', boxShadow: theme.palette.mode === 'dark' ? '0px 4px 4px rgba(255, 255, 255, 0.25)' : '0px 4px 4px 0px rgba(0, 0, 0, 0.25)', py: '15px' }}>
          <Grid container item rowGap='18px'>
            {subIdAccounts.map((id, index) => (
              <DisplaySubId
                judgements={judgements}
                key={index}
                noButtons
                parentName={parentNameID}
                subIdInfo={id}
              />
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Grid>
  );
}
