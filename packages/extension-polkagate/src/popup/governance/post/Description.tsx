// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Divider, Grid, Paper, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { BN } from '@polkadot/util';

import { Identity, ShowBalance, ShowValue } from '../../../components';
import { nFormatter } from '../../../components/FormatPrice';
import { useApi, useChain, useDecimal, usePrice, useToken, useTranslation } from '../../../hooks';
import { LabelValue } from '../TrackStats';
import { STATUS_COLOR } from '../utils/consts';
import { Proposal, Referendum } from '../utils/types';
import { formalizedStatus, formatRelativeTime, pascalCaseToTitleCase } from '../utils/util';
import { hexAddressToFormatted } from './Metadata';

interface Props {
  address: string | undefined;
  referendum: Referendum | undefined;
  currentTreasuryApprovalList: Proposal[] | undefined;
}

const DEFAULT_CONTENT = 'This referendum does not have a description provided by the creator. Please research and learn about the proposal before casting your vote.'

export default function ReferendumDescription({ address, currentTreasuryApprovalList, referendum }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const chain = useChain(address);
  const decimal = useDecimal(address);
  const token = useToken(address);
  const price = usePrice(address);

  const requestedInUSD = useMemo(() => referendum?.requested && price?.amount && decimal && (Number(referendum.requested) / 10 ** decimal) * price.amount, [decimal, price, referendum]);

  const [expanded, setExpanded] = useState<boolean>(false);

  const mayBeBeneficiary = hexAddressToFormatted(referendum?.proposed_call?.args?.beneficiary, chain);
  const mayBeTreasuryProposalId = useMemo(() => currentTreasuryApprovalList?.find((p) => p.beneficiary === mayBeBeneficiary)?.id, [currentTreasuryApprovalList, mayBeBeneficiary]);
  const content = useMemo(() =>
    referendum?.content?.includes('login and tell us more about your proposal') ? t(DEFAULT_CONTENT) : referendum?.content
    , [referendum?.content, t]);

  useEffect(() =>
    setExpanded(!!referendum)
    , [referendum]);

  const handleChange = (event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const VDivider = () => (
    <Divider flexItem orientation='vertical' sx={{ mx: '2%', my: '10px', bgcolor: theme.palette.mode === 'light' ? 'inherit' : 'text.disabled' }} />
  );

  return (
    <>
      {mayBeTreasuryProposalId &&
        <Paper elevation={1} sx={{ height: 36, width: 'inherit', mt: '5px', mb: '2px', pt: '5px' }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 500, textAlign: 'center' }}>
            {t('This Referendum is now Treasury Proposal #{{proposalId}}', { replace: { proposalId: mayBeTreasuryProposalId } })}
          </Typography>
        </Paper>
      }
      <Accordion expanded={expanded} onChange={handleChange} sx={{ width: 'inherit', px: '3%', borderRadius: '10px', border: 1, borderColor: theme.palette.mode === 'light' ? 'background.paper' : 'secondary.main' }}>
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon
              sx={{ color: `${theme.palette.primary.main}`, fontSize: '37px' }}
            />
          }
          sx={{
            borderBottom: expanded ? `1px solid ${theme.palette.text.disabled}` : 'none',
            px: 0
          }}
        >
          <Grid container item>
            <Grid container item xs={12}>
              <Typography fontSize={24} fontWeight={500}>
                <ShowValue value={referendum ? referendum.title || 'No Title' : undefined} width='500px' />
              </Typography>
            </Grid>
            <Grid alignItems='center' container item justifyContent='space-between' xs={12}>
              <Grid alignItems='center' container item md={9.5}>
                <Grid item sx={{ fontSize: '14px', fontWeight: 400, mr: '17px' }}>
                  {t('By')}:
                </Grid>
                <Grid item maxWidth='30%'>
                  <Identity api={api} chain={chain} formatted={referendum?.proposer} identiconSize={25} showShortAddress={!!referendum?.proposer} showSocial={false} style={{ fontSize: '14px', fontWeight: 400, lineHeight: '47px', maxWidth: '100%', minWidth: '35%', width: 'fit-content' }} />
                </Grid>
                <VDivider />
                <Grid item sx={{ fontSize: '14px', fontWeight: 400, opacity: 0.6 }}>
                  <ShowValue value={referendum?.method} width='50px' />
                </Grid>
                <VDivider />
                <ClockIcon sx={{ fontSize: 27, ml: '10px' }} />
                <Grid item sx={{ fontSize: '14px', fontWeight: 400, pl: '1%' }}>
                  <ShowValue value={referendum?.created_at && formatRelativeTime(referendum?.created_at)} />
                </Grid>
                {referendum?.requested && Number(referendum.requested) > 0 &&
                  <>
                    <VDivider />
                    <Grid alignItems='center' container item sx={{ maxWidth: 'fit-content' }}>
                      <Grid item sx={{ fontSize: '14px', fontWeight: 400 }}>
                        <LabelValue
                          label={`${t('Requested')}: `}
                          labelStyle={{ fontSize: 14 }}
                          noBorder
                          value={
                            <ShowBalance
                              balance={new BN(referendum?.requested)}
                              decimal={decimal}
                              decimalPoint={2}
                              token={token}
                            />
                          }
                          valueStyle={{ fontSize: 16, fontWeight: 500, pl: '5px' }}
                        />
                      </Grid>
                      <Divider flexItem orientation='vertical' sx={{ mx: '7px', my: '8px', bgcolor: theme.palette.mode === 'light' ? 'inherit' : 'text.disabled' }} />
                      <Grid item sx={{ color: theme.palette.mode === 'light' && 'text.disabled', opacity: theme.palette.mode === 'dark' && 0.6 }}>
                        {`$${requestedInUSD ? nFormatter(requestedInUSD, 2) : '0'}`}
                      </Grid>

                    </Grid>
                  </>
                }
              </Grid>
              <Grid item sx={{ textAlign: 'center', mb: '5px', color: 'white', fontSize: '16px', fontWeight: 400, border: '0.01px solid primary.main', borderRadius: '30px', bgcolor: STATUS_COLOR[referendum?.status], px: '5px', lineHeight: '24px' }} md={1.5}>
                {pascalCaseToTitleCase(formalizedStatus(referendum?.status))}
              </Grid>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          <Grid container item sx={{ display: 'inline-block', overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak: 'break-all' }} xs={12}>
            <ReactMarkdown
              components={{ img: ({ node, ...props }) => <img style={{ maxWidth: '100%' }}{...props} /> }}
            >
              {content?.replace(/<br\s*\/?>/gi, ' ') || ''}
            </ReactMarkdown>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
