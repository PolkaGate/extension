// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import { useParams } from 'react-router';

import { ActionContext, Header, Warning } from '../components';
import useTranslation from '../hooks/useTranslation';

interface WebsiteState {
  website: string;
}

export default function PhishingDetected(): React.ReactElement {
  const { t } = useTranslation();
  const { website } = useParams<WebsiteState>();
  const decodedWebsite = decodeURIComponent(website);
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const goHome = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <>
      <Header onClose={goHome} text={t<string>('Phishing detected')} />
      <Grid
        height='120px'
        m='auto'
        pt='30px'
        width='90%'
      >
        <Warning
          fontWeight={400}
          isBelowInput
          isDanger
          theme={theme}
        >
          {t<string>('You have been redirected because we believe that this website could compromise the security of your accounts and your tokens.')}
        </Warning>
      </Grid>
      <Grid container justifyContent='center' sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', m: '25px auto', overflow: 'hidden', py: '20px', textOverflow: 'ellipsis', width: '92%' }}>
        {decodedWebsite}
      </Grid>
      <Grid
        height='80px'
        m='auto'
        sx={{ '> div .warning-message': { display: 'block' } }}
        width='90%'
      >
        <Warning
          fontWeight={400}
          isBelowInput
          theme={theme}
        >
          {t<string>('Note that this  website was reported on a community-driven, curated list. It might be incomplete or inaccurate. If you think that this website was flagged incorrectly')}, {<a href='https://github.com/polkadot-js/phishing/issues/new' rel='noreferrer' style={{ color: theme.palette.text.primary }} target='_blank'>{t<string>('please open an issue by clicking here')}.</a>}
        </Warning>
      </Grid>
    </>
  );
}
