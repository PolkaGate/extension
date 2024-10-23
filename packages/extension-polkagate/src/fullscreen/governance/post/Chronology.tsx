// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck
/* eslint-disable react/jsx-max-props-per-line */

import type { Proposal, Referendum, ReferendumHistory } from '../utils/types';

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
import React, { useCallback, useEffect, useMemo } from 'react';

import { BN } from '@polkadot/util';

import { subscan } from '../../../assets/icons';
import { useApi, useChain, useChainName, useCurrentBlockNumber, useTranslation } from '../../../hooks';
import useStyles from '../styles/styles';
import { STATUS_COLOR, TREASURY_TRACKS } from '../utils/consts';
import { pascalCaseToTitleCase, toSnakeCase } from '../utils/util';
import { getBeneficiary } from './Metadata';

const toFormattedDate = (dateString: number | Date | undefined): string | undefined => {
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
};

interface Props {
  address: string | undefined;
  referendum: Referendum | undefined;
  currentTreasuryApprovalList: Proposal[] | undefined
}

function getAwardedDate (currentBlockNumber: number, executionBlockNumber: number, spendPeriod: number): Date {
  const startBlock = Math.floor((executionBlockNumber - 1) / spendPeriod) * spendPeriod + 1;
  const endBlock = startBlock + spendPeriod - 1;
  const diff = currentBlockNumber - endBlock;
  const endBlockDate = new Date(Date.now() - diff * 6 * 1000);

  return endBlockDate;
}

export default function Chronology ({ address, currentTreasuryApprovalList, referendum }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chain = useChain(address);
  const api = useApi(address);
  const currentBlockNumber = useCurrentBlockNumber(address);
  const theme = useTheme();
  const chainName = useChainName(address);
  const style = useStyles();

  const spendPeriod = api && new BN(api.consts['treasury']['spendPeriod'] as unknown as BN).toNumber();

  const sortedHistory = useMemo((): ReferendumHistory[] | undefined => referendum?.statusHistory?.sort((a, b) => b.block - a.block), [referendum]);
  const subscanLink = (blockNum: number) => 'https://' + chainName + '.subscan.io/block/' + String(blockNum);
  /** not a totally correct way to find but will work in most times */
  const [expanded, setExpanded] = React.useState(false);
  const [treasuryAwardedBlock, setTreasuryAwardedBlock] = React.useState<number>();
  const isTreasury = TREASURY_TRACKS.includes(toSnakeCase(referendum?.trackName) || '');
  const isExecuted = referendum?.status === 'Executed';
  const maybeExecutionBlock = sortedHistory?.find((h) => h.status === 'Executed')?.block;
  const maybeBeneficiary = useMemo(() => {
    if (referendum?.call && chain) {
      return getBeneficiary(referendum, chain);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, referendum?.call]);

  const maybeAwardedDate = useMemo(() =>
    (currentBlockNumber && spendPeriod && maybeExecutionBlock && getAwardedDate(currentBlockNumber, maybeExecutionBlock, spendPeriod)) ||
    referendum?.timelinePA?.[1]?.statuses?.[1]?.timestamp
  , [currentBlockNumber, maybeExecutionBlock, spendPeriod, referendum]);

  /** in rare case as ref 160 the proposers are not the same! needs more research */
  const isInTreasuryQueue = useMemo(() => isExecuted && currentTreasuryApprovalList && !!currentTreasuryApprovalList?.find((item) => String(item.value) === referendum.requested && item.beneficiary === maybeBeneficiary), [currentTreasuryApprovalList, isExecuted, maybeBeneficiary, referendum]);
  const isAwardedBasedOnPA = useMemo(() => referendum?.timelinePA?.[1]?.type === 'TreasuryProposal' && referendum?.timelinePA?.[1]?.statuses?.[1]?.status === 'Awarded', [referendum]);
  const isTreasuryProposalBasedOnPA = useMemo(() => referendum?.timelinePA?.[1]?.type === 'TreasuryProposal', [referendum]);

  const treasuryLabel = useMemo(() => {
    if (isTreasuryProposalBasedOnPA) {
      setTreasuryAwardedBlock(referendum?.timelinePA?.[1]?.statuses?.[1]?.block);

      return isAwardedBasedOnPA ? 'Awarded' : 'To be Awarded';
    }

    if (currentTreasuryApprovalList) {
      return isInTreasuryQueue ? 'To be Awarded' : 'Awarded';
    }

    return undefined;
  }, [currentTreasuryApprovalList, isAwardedBasedOnPA, isInTreasuryQueue, isTreasuryProposalBasedOnPA, referendum]);

  useEffect(() => {
    referendum?.statusHistory?.length && !expanded && setExpanded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referendum?.statusHistory?.length]);

  const handleChange = useCallback((_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  }, []);

  return (
    <Accordion expanded={expanded} onChange={handleChange} style={style.accordionStyle}>
      <AccordionSummary
        expandIcon={
          <ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}`, fontSize: '37px' }} />
        }
        sx={{ borderBottom: expanded ? `1px solid ${theme.palette.text.disabled}` : 'none', px: 0 }}
      >
        <Grid container item>
          <Grid alignItems='baseline' container item>
            <Typography fontSize={24} fontWeight={500}>
              {t('Timeline')}
            </Typography>
            {!expanded &&
              <Typography fontSize={16} fontWeight={300} sx={{ color: 'text.disabled', ml: '10px' }}>
                {`(${sortedHistory?.length ? treasuryLabel || pascalCaseToTitleCase(sortedHistory[0].status)?.trim() : 'Unknown'})`}
              </Typography>
            }
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        {isTreasury && isExecuted &&
          <>
            <Grid container item justifyContent='space-between' pt='10px' xs={12}>
              <Grid item xs={8}>
                <Timeline sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.3 }, m: 0, p: 0 }}>
                  <TimelineItem>
                    <TimelineOppositeContent color='text.primary' sx={{ fontSize: 16, fontWeight: 500, mt: '-7px' }}>
                      {toFormattedDate(maybeAwardedDate)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot sx={{ borderColor: isAwardedBasedOnPA ? 'primary.main' : 'action.focus', borderWidth: '4px', height: '20px', width: '20px' }} variant='outlined' />
                      <TimelineConnector sx={{ bgcolor: isAwardedBasedOnPA ? 'primary.main' : 'action.focus', height: '36px', width: '4px' }} />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Grid container justifyContent='flex-start' pt='3px'>
                        <Grid item xs={2}>
                          <Link
                            href={treasuryAwardedBlock ? `${subscanLink(treasuryAwardedBlock)}` : undefined}
                            rel='noreferrer'
                            target='_blank'
                            underline='none'
                          >
                            <Box alt={'subscan'} component='img' height='26px' src={subscan as string} width='26px' />
                          </Link>
                        </Grid>
                        {treasuryLabel &&
                          <Grid item sx={{ border: `0.01px solid ${theme.palette.primary.main}`, borderRadius: '30px', fontSize: '16px', fontWeight: 400, mb: '5px', p: '2px 10px', textAlign: 'center', width: '190px' }}>
                            {treasuryLabel}
                          </Grid>
                        }
                      </Grid>
                    </TimelineContent>
                  </TimelineItem>
                </Timeline>
              </Grid>
              <Grid item xs>
                <Typography sx={{ borderLeft: `4px solid ${theme.palette.mode === 'light' ? '#E8E0E5' : theme.palette.secondary.contrastText}`, color: 'secondary.contrastText', height: '55%', lineHeight: '45px', textAlign: 'center' }}>
                  {t('Treasury')}
                </Typography>
              </Grid>
            </Grid>
            <Divider sx={{ border: 'none', borderTopColor: 'secondary.contrastText', borderTopStyle: 'dashed', borderTopWidth: '2px', height: '1px', mt: '-18px', opacity: '0.2', width: '100%' }} variant='middle' />
          </>
        }
        {/* ---------------------------------------------------------------------- */}
        <Grid container item justifyContent='space-between' pt='15px' xs={12}>
          <Grid item xs={8}>
            <Timeline sx={{ [`& .${timelineOppositeContentClasses.root}`]: { flex: 0.3 }, m: 0, p: 0 }}>
              {sortedHistory?.map((history, index) => (
                <TimelineItem key={index}>
                  <TimelineOppositeContent color='text.primary' sx={{ fontSize: 16, fontWeight: 500, mt: '-7px' }}>
                    {toFormattedDate(history.timestamp)}
                  </TimelineOppositeContent>
                  <TimelineSeparator sx={{ color: 'primary.main' }}>
                    {index !== sortedHistory?.length - 1
                      ? <TimelineDot color='primary' sx={{ borderWidth: '4px', height: '20px', width: '20px' }} variant='outlined' />
                      : <TimelineDot sx={{ bgcolor: 'background.paper', boxShadow: 'none' }}>
                        <Square sx={{ border: 'none', color: 'primary.main', fontSize: '27px', mt: '-8px', mx: '-10px' }} />
                      </TimelineDot>
                    }
                    {index !== sortedHistory?.length - 1 && <TimelineConnector sx={{ bgcolor: 'primary.main', height: '36px', width: '4px' }} />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Grid container justifyContent='flex-start' pt='3px'>
                      <Grid item xs={2}>
                        <Link
                          href={`${subscanLink(history.block)}`}
                          rel='noreferrer'
                          target='_blank'
                          underline='none'
                        >
                          <Box alt={'subscan'} component='img' height='26px' src={subscan as string} width='26px' />
                        </Link>
                      </Grid>
                      <Grid item sx={{ bgcolor: STATUS_COLOR[history.status], borderRadius: '30px', color: 'white', fontSize: '16px', fontWeight: 400, mb: '5px', p: '2px 10px', textAlign: 'center', width: '190px' }}>
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
            <Grid item xs>
              <Typography sx={{ alignItems: 'center', borderLeft: `4px solid ${theme.palette.mode === 'light' ? '#E8E0E5' : theme.palette.secondary.contrastText}`, color: 'secondary.contrastText', display: 'flex', height: '90%', justifyContent: 'center' }}>
                {t('Referendum')}
              </Typography>
            </Grid>
          }
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
