// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Button, Grid, Typography, useTheme } from '@mui/material';
import React, { useEffect, useMemo } from 'react';

import { useChainName, useTranslation } from '../../../hooks';
import { Referendum } from '../utils/types';
import CommentView from './Comment';
import Replies from './Replies';

export default function Comments({ address, referendum }: { address: string | undefined, referendum: Referendum | undefined }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const ChainName = useChainName(address);
  const [expanded, setExpanded] = React.useState(false);

  const type = referendum?.type === 'FellowshipReferendum' ? 'fellowship' : 'referenda';

  const handleChange = (event, isExpanded: boolean) => {
    setExpanded(isExpanded);
  };

  const sortedComments = useMemo(() => referendum?.comments?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)), [referendum]);

  const openPolkassembly = () => {
    window.open(`https://${ChainName}.polkassembly.io/referenda/${referendum?.index}`, '_blank');
  };

  function openSubsquare() {
    window.open(`https://${ChainName}.subsquare.io/${type}/referendum/${referendum?.index}`, '_blank');
  }

  return (
    <Accordion expanded={expanded} onChange={handleChange} sx={{ border: 1, borderColor: theme.palette.mode === 'light' ? 'background.paper' : 'secondary.main', borderRadius: '10px', my: 1, px: '3%', width: 'inherit' }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}`, fontSize: '37px' }} />} sx={{ borderBottom: expanded ? `1px solid ${theme.palette.text.disabled}` : 'none', px: 0 }}>
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
          {sortedComments?.map((comment, index) => (
            <Grid container key={index} sx={{ borderBottom: index !== sortedComments.length - 1 ? `0.01px solid ${theme.palette.text.disabled}` : undefined }}>
              <CommentView address={address} comment={comment} />
              {!!comment?.replies?.length &&
                <Replies address={address} replies={comment?.replies} />
              }
            </Grid>
          ))}
          <Grid container item justifyContent='flex-end' spacing={5} sx={{ mt: '30px' }}>
            <Grid item>
              {type !== 'fellowship' &&
                <Button onClick={openPolkassembly} sx={{ borderColor: 'primary.main', color: 'text.primary', textTransform: 'none' }} variant='outlined'>
                  {t('Comment on {{site}}', { replace: { site: 'Polkassembly' } })}

                </Button>
              }
            </Grid>
            <Grid item>
              <Button onClick={openSubsquare} sx={{ borderColor: 'primary.main', color: 'text.primary', textTransform: 'none' }} variant='outlined'>
                {t('Comment on {{site}}', { replace: { site: 'Subsquare' } })}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
