// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Square from '@mui/icons-material/Square';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent, { timelineOppositeContentClasses } from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Link, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { subscan } from '../../../assets/icons';
import { useChainName, useTranslation } from '../../../hooks';
import { STATUS_COLOR } from '../utils/consts';
import { ReferendumHistory } from '../utils/types';
import { pascalCaseToTitleCase } from '../utils/util';

const toFormattedDate = ((dateString: Date | undefined): string | undefined => {
  if (!dateString) {
    return undefined;
  }

  const date = new Date(dateString);

  // Extract the various date components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Format the date string in the desired format
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
});

export default function ReferendumTimeline({ address, history }: { address: string | undefined, history: ReferendumHistory[] | undefined }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chainName = useChainName(address);
  const sortedHistory = useMemo((): ReferendumHistory[] => history?.sort((a, b) => b.block - a.block), [history]);
  const subscanLink = (blockNum: number) => 'https://' + chainName + '.subscan.io/block/' + String(blockNum);

  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange} sx={{ width: 'inherit', px: '2%', mt: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}` }} />} sx={{ borderBottom: expanded && `1px solid ${theme.palette.text.disabled}`, px: 0 }}>
        <Grid container item>
          <Grid container item xs={12}>
            <Typography fontSize={24} fontWeight={500}>
              {t('Timeline')}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Timeline sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.2 } }}>
          {sortedHistory?.map((history, index) => (
            <TimelineItem key={index}>
              <TimelineOppositeContent color='text.primary' sx={{ fontSize: 16, fontWeight: 500 }}>
                {toFormattedDate(history.timestamp)}
              </TimelineOppositeContent>
              <TimelineSeparator>
                {index !== sortedHistory?.length - 1
                  ? <TimelineDot color='primary' sx={{ width: '20px', height: '20px' }} variant='outlined' />
                  : <TimelineDot sx={{ bgcolor: 'white', boxShadow: 'none' }}>
                    <Square sx={{ color: 'primary.main', fontSize: '20px' }} />
                  </TimelineDot>
                }
                {index !== sortedHistory?.length - 1 && <TimelineConnector color='primary' />}
              </TimelineSeparator>
              <TimelineContent>
                <Grid container justifyContent='flex-start' pt='5px'>
                  <Grid item xs={1}>
                    <Link
                      href={`${subscanLink(history.block)}`}
                      rel='noreferrer'
                      target='_blank'
                      underline='none'
                    >
                      <Box alt={'subscan'} component='img' height='25px' mt='5px' src={subscan} width='25px' />
                    </Link>
                  </Grid>
                  <Grid item sx={{ textAlign: 'center', mb: '5px', color: 'white', fontSize: '16px', fontWeight: 400, border: '0.01px solid primary.main', borderRadius: '30px', bgcolor: STATUS_COLOR[history.status], p: '2px 10px', width: 'fit-content' }}>
                    {pascalCaseToTitleCase(history.status)}
                  </Grid>
                </Grid>
              </TimelineContent>
            </TimelineItem>
          ))
          }
        </Timeline>
      </AccordionDetails>
    </Accordion>
  );
}
