// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography, useTheme } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { ActionContext } from '../components';
import useTranslation from '../hooks/useTranslation';
import { SharePopup } from '../partials';

export default function PhishingDetected(): React.ReactElement {
  const { t } = useTranslation();
  const { website } = useParams();
  const decodedWebsite = decodeURIComponent(website ?? '');
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const goHome = useCallback(() => {
    onAction('/');
  }, [onAction]);

  return (
    <SharePopup
      modalProps={{
        dividerStyle: { margin: '5px 0 5px' },
        showBackIconAsClose: true
      }}
      modalStyle={{ minHeight: '500px' }}
      onClose={goHome}
      open
      popupProps={{
        TitleIcon: Warning2,
        iconColor: theme.palette.primary.main,
        iconSize: 25,
        maxHeight: '650px',
        withoutTopBorder: true
      }}
      title={t('Phishing detected')}
    >
      <>
        <Warning2 color={theme.palette.warning.main} size='80' style={{ margin: '15px 0' }} variant='Bold' />
        <Typography color={theme.palette.warning.main} sx={{ display: 'flex', p: ' 30px 10px 10px', textAlign: 'center', width: '100%' }} variant='B-2'>
          {t('You have been redirected because we believe that this website could compromise the security of your accounts and your tokens.')}
        </Typography>
        <Grid container justifyContent='center' sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', m: '25px auto', overflow: 'hidden', py: '20px', textOverflow: 'ellipsis', width: '92%' }}>
          {decodedWebsite}
        </Grid>
        <Typography color='#BEAAD8' sx={{ display: 'flex', p: ' 30px 10px 10px', textAlign: 'center', width: '100%' }} variant='B-4'>
          {
            t('Note that this website was reported on a community-driven, curated list. It might be incomplete or inaccurate. If you think that this website was flagged incorrectly')
          }
        </Typography>
        <Typography color='#BEAAD8' sx={{ display: 'content', p: '10px', textAlign: 'center', width: '100%' }} variant='B-4'>
          {
            <a
              href='https://github.com/polkadot-js/phishing/issues/new'
              rel='noreferrer'
              style={{ color: theme.palette.text.primary }}
              target='_blank'
            >
              {t('please open an issue by clicking here')}.
            </a>
          }
        </Typography>
      </>
    </SharePopup>
  );
}
