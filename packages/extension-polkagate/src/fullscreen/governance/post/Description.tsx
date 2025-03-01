// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Proposal, Referendum } from '../utils/types';

import { ScheduleRounded as ClockIcon } from '@mui/icons-material/';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Divider, Grid, Paper, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

import { BN } from '@polkadot/util';

import { FormatPrice, Identity, ShowBalance, ShowValue } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import useStyles from '../styles/styles';
import { LabelValue } from '../TrackStats';
import { STATUS_COLOR } from '../utils/consts';
import { formalizedStatus, formatRelativeTime, pascalCaseToTitleCase } from '../utils/util';
import { getBeneficiary } from './Metadata';
import useReferendaRequested from './useReferendaRequested';

interface Props {
  address: string | undefined;
  referendum: Referendum | undefined;
  currentTreasuryApprovalList: Proposal[] | undefined;
}

const DEFAULT_CONTENT = 'This referendum does not have a description provided by the creator. Please research and learn about the proposal before casting your vote.';

export default function ReferendumDescription({ address, currentTreasuryApprovalList, referendum }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const style = useStyles();

  const { api, chain } = useInfo(address);

  const { rAssetInCurrency, rCurrencySign, rDecimal, rToken } = useReferendaRequested(address, referendum);

  const [expanded, setExpanded] = useState<boolean>(false);

  const maybeBeneficiary = useMemo(() => {
    if (referendum?.call && chain) {
      return getBeneficiary(referendum, chain);
    }

    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, referendum?.call]);

  const maybeTreasuryProposalId = useMemo(() => currentTreasuryApprovalList?.find((p) => p.beneficiary === maybeBeneficiary)?.id, [currentTreasuryApprovalList, maybeBeneficiary]);
  const content = useMemo(() => {
    const res = referendum?.content?.includes('login and tell us more about your proposal') ? t(DEFAULT_CONTENT) : referendum?.content;

    return res || '';// ?.replace(/<br\s*\/?>/gi, ' ') || '';
  }, [referendum?.content, t]);

  useEffect(() => {
    referendum?.content && !expanded && setExpanded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referendum?.content]);

  const handleChange = useCallback((_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  }, []);

  const VDivider = () => (
    <Divider flexItem orientation='vertical' sx={{ bgcolor: theme.palette.mode === 'light' ? 'inherit' : 'text.disabled', mx: '2%', my: '10px' }} />
  );

  return (
    <>
      {maybeTreasuryProposalId &&
        <Paper elevation={1} sx={{ height: 36, mb: '2px', mt: '5px', pt: '5px', width: 'inherit' }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 500, textAlign: 'center' }}>
            {t('This Referendum is now Treasury Proposal #{{proposalId}}', { replace: { proposalId: maybeTreasuryProposalId } })}
          </Typography>
        </Paper>
      }
      <Accordion expanded={expanded} onChange={handleChange} style={{ ...style.accordionStyle, marginTop: 0 }}>
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
                <ShowValue value={referendum?.title ? referendum?.title : referendum?.title === null ? 'No Title' : undefined} width='500px' />
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
                              balance={new BN(referendum.requested)}
                              decimal={rDecimal}
                              decimalPoint={2}
                              token={rToken}
                            />
                          }
                          valueStyle={{ fontSize: 16, fontWeight: 500, pl: '5px' }}
                        />
                      </Grid>
                      <Divider flexItem orientation='vertical' sx={{ bgcolor: theme.palette.mode === 'light' ? 'inherit' : 'text.disabled', mx: '7px', my: '8px' }} />
                      <Grid item sx={{ opacity: theme.palette.mode === 'dark' ? 0.6 : 1 }}>
                        <FormatPrice
                          decimalPoint={2}
                          num={rAssetInCurrency || 0}
                          sign={rCurrencySign}
                          textColor={theme.palette.mode === 'light' ? 'text.disabled' : undefined}
                        />
                      </Grid>
                    </Grid>
                  </>
                }
              </Grid>
              <Grid item sx={{ bgcolor: referendum?.status ? STATUS_COLOR[referendum.status] : undefined, border: '0.01px solid primary.main', borderRadius: '30px', color: 'white', fontSize: '16px', fontWeight: 400, lineHeight: '24px', mb: '5px', px: '10px', textAlign: 'center', width: 'fit-content' }}>
                {pascalCaseToTitleCase(formalizedStatus(referendum?.status))}
              </Grid>
            </Grid>
          </Grid>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          <Grid container item sx={{ '&, & *': { color: `${theme.palette.text.primary} !important`, maxWidth: '100%' }, display: 'inline-block', overflowWrap: 'break-word', wordBreak: 'break-all', wordWrap: 'break-word' }} xs={12}>
            <ReactMarkdown
              components={{ img: ({ node, ...props }) => <img style={{ maxWidth: '100%' }} {...props} /> }}
              rehypePlugins={[rehypeRaw]}
            >
              {content}
            </ReactMarkdown>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </>
  );
}
