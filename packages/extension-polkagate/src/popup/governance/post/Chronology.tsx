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
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Grid, Link, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { BN } from '@polkadot/util';

import { subscan } from '../../../assets/icons';
import { useApi, useChain, useChainName, useCurrentBlockNumber, useTranslation } from '../../../hooks';
import { STATUS_COLOR, TREASURY_TRACKS } from '../utils/consts';
import { Proposal, ReferendumHistory, ReferendumPolkassembly } from '../utils/types';
import { pascalCaseToTitleCase, toSnakeCase } from '../utils/util';
import { hexAddressToFormatted } from './MetaData';

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

interface Props {
  address: string | undefined;
  referendum: ReferendumPolkassembly | undefined;
  currentTreasuryApprovalList: Proposal[] | undefined
}

function getAwardedDate(currentBlockNumber: number, executionBlockNumber: number, spendPeriod: number): Date {
  const startBlock = Math.floor((executionBlockNumber - 1) / spendPeriod) * spendPeriod + 1;
  const endBlock = startBlock + spendPeriod - 1;
  const diff = currentBlockNumber - endBlock;
  const endBlockDate = new Date(Date.now() - diff * 6 * 1000);

  return endBlockDate;
}

export default function Chronology({ address, currentTreasuryApprovalList, referendum }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chain = useChain(address);
  const api = useApi(address);
  const currentBlockNumber = useCurrentBlockNumber(address);
  const theme = useTheme();
  const chainName = useChainName(address);

  const spendPeriod = api && new BN(api.consts.treasury.spendPeriod).toNumber();

  const sortedHistory = useMemo((): ReferendumHistory[] => referendum?.statusHistory?.sort((a, b) => b.block - a.block), [referendum]);
  const subscanLink = (blockNum: number) => 'https://' + chainName + '.subscan.io/block/' + String(blockNum);
  /** not a totally correct way to find but will work in most times */
  const [expanded, setExpanded] = React.useState(false);
  const [treasuryAwardedBlock, setTreasuryAwardedBlock] = React.useState<number>();
  const isTreasury = TREASURY_TRACKS.includes(toSnakeCase(referendum?.origin));
  const isExecuted = referendum?.status === 'Executed';
  const mayBeExecutionBlock = sortedHistory?.find((h) => h.status === 'Executed')?.block;
  const mayBeBeneficiary = hexAddressToFormatted(referendum?.proposed_call?.args?.beneficiary, chain);
  const mayBeAwardedDate = useMemo(() =>
    currentBlockNumber && spendPeriod && mayBeExecutionBlock && getAwardedDate(currentBlockNumber, mayBeExecutionBlock, spendPeriod) ||
    referendum?.timeline?.[1]?.statuses?.[1]?.timestamp
    , [currentBlockNumber, mayBeExecutionBlock, spendPeriod, referendum]);

  /** in rare case as ref 160 the proposers are not the same! needs more research */
  // const isInTreasuryQueue = isExecuted && !!currentTreasuryApprovalList?.find((item) => item.proposer === referendum.proposer && String(item.value) === referendum.requested && item.beneficiary === mayBeBeneficiary);
  const isInTreasuryQueue = useMemo(() => isExecuted && currentTreasuryApprovalList && !!currentTreasuryApprovalList?.find((item) => String(item.value) === referendum.requested && item.beneficiary === mayBeBeneficiary), [currentTreasuryApprovalList, isExecuted, mayBeBeneficiary, referendum]);
  const isAwardedBasedOnPA = useMemo(() => referendum?.timeline?.[1]?.type === 'TreasuryProposal' && referendum?.timeline?.[1]?.statuses?.[1]?.status === 'Awarded', [referendum]);
  const isApprovedBasedOnPA = useMemo(() => referendum?.timeline?.[1]?.type === 'TreasuryProposal' && referendum?.timeline?.[1]?.statuses?.[0]?.status === 'Approved', [referendum]);
  const isTreasuryProposalBasedOnPA = useMemo(() => referendum?.timeline?.[1]?.type === 'TreasuryProposal', [referendum]);

  const treasuryLabel = useMemo(() => {
    if (isTreasuryProposalBasedOnPA) {
      setTreasuryAwardedBlock(referendum?.timeline?.[1]?.statuses?.[1]?.block);

      return isAwardedBasedOnPA ? 'Awarded' : 'To be Awarded';
    }

    if (currentTreasuryApprovalList) {
      return isInTreasuryQueue ? 'Awarded' : 'To be Awarded';
    }
  }, [currentTreasuryApprovalList, isAwardedBasedOnPA, isInTreasuryQueue, isTreasuryProposalBasedOnPA, referendum]);

  const handleChange = (event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange} sx={{ width: 'inherit', px: '3%', mt: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}`, fontSize: '37px' }} />} sx={{ borderBottom: expanded && `1px solid ${theme.palette.text.disabled}`, px: 0 }}>
        <Grid container item>
          <Grid container item xs={12}>
            <Typography fontSize={24} fontWeight={500}>
              {t('Timeline')}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        {isTreasury && isExecuted &&
          <>
            <Grid container item justifyContent='space-between' sx={{ mb: '-28px' }} xs={12}>
              <Grid item xs={8}>
                <Timeline sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.3 }, p: 0 }}>
                  <TimelineItem>
                    <TimelineOppositeContent color='text.primary' sx={{ fontSize: 16, fontWeight: 500 }}>
                      {toFormattedDate(mayBeAwardedDate)}
                    </TimelineOppositeContent>
                    <TimelineSeparator sx={{ color: 'primary.main' }}>
                      <TimelineDot color='primary' sx={{ width: '20px', height: '20px', borderWidth: '4px' }} variant='outlined' />
                      <TimelineConnector color='primary' />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Grid container justifyContent='flex-start' pt='5px'>
                        <Grid item xs={2}>
                          <Link
                            href={`${subscanLink(treasuryAwardedBlock)}`}
                            rel='noreferrer'
                            target='_blank'
                            underline='none'
                          >
                            <Box alt={'subscan'} component='img' height='26px' src={subscan} width='26px' />
                          </Link>
                        </Grid>
                        {treasuryLabel &&
                          <Grid item sx={{ textAlign: 'center', mb: '5px', fontSize: '16px', fontWeight: 400, border: `0.01px solid ${theme.palette.primary.main}`, borderRadius: '30px', p: '2px 10px', width: '190px' }}>
                            {treasuryLabel}
                          </Grid>
                        }
                      </Grid>
                    </TimelineContent>
                  </TimelineItem>
                </Timeline>
              </Grid>
              <Grid item sx={{ color: 'text.disabled', mt: 3, mb: 5, borderLeft: `4px solid ${theme.palette.text.disabled}`, textAlign: 'center', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }} xs>
                {t('Treasury')}
              </Grid>
            </Grid>
            <Divider sx={{ bgcolor: 'text.disabled', height: '1px', borderStyle: 'dotted dotted dotted', borderWidth: '0.2px', borderColor: `${theme.palette.text.disabled}`, mt: '-30px', width: '100%' }} variant='middle' />
          </>
        }
        {/* ---------------------------------------------------------------------- */}
        <Grid container item justifyContent='space-between' xs={12}>
          <Grid item xs={8}>
            <Timeline sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.3 }, p: 0 }}>
              {sortedHistory?.map((history, index) => (
                <TimelineItem key={index}>
                  <TimelineOppositeContent color='text.primary' sx={{ fontSize: 16, fontWeight: 500 }}>
                    {toFormattedDate(history.timestamp)}
                  </TimelineOppositeContent>
                  <TimelineSeparator sx={{ color: 'primary.main' }}>
                    {index !== sortedHistory?.length - 1
                      ? <TimelineDot color='primary' sx={{ width: '20px', height: '20px', borderWidth: '4px' }} variant='outlined' />
                      : <TimelineDot sx={{ bgcolor: 'white', boxShadow: 'none' }}>
                        <Square sx={{ color: 'primary.main', fontSize: '27px', ml: '-9px' }} />
                      </TimelineDot>
                    }
                    {index !== sortedHistory?.length - 1 && <TimelineConnector color='primary' />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Grid container justifyContent='flex-start' pt='5px'>
                      <Grid item xs={2}>
                        <Link
                          href={`${subscanLink(history.block)}`}
                          rel='noreferrer'
                          target='_blank'
                          underline='none'
                        >
                          <Box alt={'subscan'} component='img' height='26px' src={subscan} width='26px' />
                        </Link>
                      </Grid>
                      <Grid item sx={{ textAlign: 'center', mb: '5px', color: 'white', fontSize: '16px', fontWeight: 400, border: '0.01px solid primary.main', borderRadius: '30px', bgcolor: STATUS_COLOR[history.status], p: '2px 10px', width: '190px' }}>
                        {pascalCaseToTitleCase(history.status)}
                      </Grid>
                    </Grid>
                  </TimelineContent>
                </TimelineItem>
              ))
              }
            </Timeline>
          </Grid>
          {isTreasury && isExecuted &&
            <Grid item sx={{ color: 'text.disabled', my: 3, borderLeft: `4px solid ${theme.palette.text.disabled}`, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }} xs>
              {t('Referendum')}
            </Grid>
          }
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
