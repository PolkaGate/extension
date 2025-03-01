// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Referendum } from '../utils/types';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Button, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { useChainName, useTranslation } from '../../../hooks';
import useStyles from '../styles/styles';
import CommentView from './Comment';
import Replies from './Replies';

interface CommentsProps {
  address: string | undefined;
  referendum: Referendum | undefined;
}

export default function Comments({ address, referendum }: CommentsProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const ChainName = useChainName(address);
  const style = useStyles();

  const [expanded, setExpanded] = React.useState(false);

  const type = referendum?.type === 'FellowshipReferendum' ? 'fellowship' : 'referenda';

  const handleChange = useCallback((_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
  }, []);

  const sortedComments = useMemo(() => referendum?.comments?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [referendum]);

  const openPolkassembly = useCallback(() => {
    window.open(`https://${ChainName}.polkassembly.io/referenda/${referendum?.index}`, '_blank');
  }, [ChainName, referendum?.index]);

  const openSubsquare = useCallback(() => {
    window.open(`https://${ChainName}.subsquare.io/${type}/referendum/${referendum?.index}`, '_blank');
  }, [ChainName, referendum?.index, type]);

  return (
    <Accordion expanded={expanded} onChange={handleChange} style={style.accordionStyle}>
      <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}`, fontSize: '37px' }} />} sx={{ borderBottom: expanded ? `1px solid ${theme.palette.text.disabled}` : 'none', px: 0 }}>
        <Grid container item>
          <Grid container item xs={12}>
            <Typography fontSize={24} fontWeight={500}>
              {t('Comments ({{count}})', { replace: { count: sortedComments?.length || 0 } })}
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0 }}>
        <Grid container item xs={12}>
          {sortedComments?.map((comment, index) => (
            <Grid container key={index} sx={{ borderBottom: index !== sortedComments.length - 1 ? `0.01px solid ${theme.palette.text.disabled}` : undefined }}>
              <CommentView address={address ?? ''} comment={comment} noSource={comment?.commentSource !== 'SS'} />
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
