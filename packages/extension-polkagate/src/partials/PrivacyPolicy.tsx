// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import SquareIcon from '@mui/icons-material/Square';
import { Box, Grid, Link, Typography, useTheme } from '@mui/material';
import { ShieldTick } from 'iconsax-react';
import React, { useCallback } from 'react';
import { Translation } from 'react-i18next';

import { ExtensionPopup, GradientButton } from '../components';
import { useTranslation } from '../hooks';
import { ExtensionPopups } from '../util/constants';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<ExtensionPopups>>;
  openMenu: boolean;
}

function PrivacyPolicy ({ openMenu, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const handleClose = useCallback(() => setPopup(ExtensionPopups.NONE), [setPopup]);

  return (
    <ExtensionPopup
      TitleIcon={ShieldTick}
      handleClose={handleClose}
      openMenu={openMenu}
      title={t('Privacy and security')}
    >
      <Grid container item justifyContent='center' sx={{ pb: '5px', position: 'relative', pt: '15px', rowGap: '20px', zIndex: 1 }}>
        <Typography color='text.secondary' px='20px' variant='B-4'>
          {t('PolkaGate is a browser extension that lets you use the Polkadot network and decentralized apps. We respect your privacy and do not collect or store any of your personal data. This is how we protect your privacy:')}
        </Typography>
        <Box>
          <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: '8px' }}>
            <SquareIcon sx={{ color: '#FF4FB9', fontSize: '10px', marginTop: '4px', transform: 'rotate(45deg)' }} />
            <Typography color='text.secondary' textAlign='left' variant='B-1'>
              {t('We do not collect your clicks, browsing history, keys, addresses, transactions, or any other data.')}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: '8px' }}>
            <SquareIcon sx={{ color: '#FF4FB9', fontSize: '10px', marginTop: '4px', transform: 'rotate(45deg)' }} />
            <Typography color='text.secondary' textAlign='left' variant='B-1'>
              {t('We use open-source code, end-to-end encryption, local storage, and secure communication protocols.')}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: '8px' }}>
            <SquareIcon sx={{ color: '#FF4FB9', fontSize: '10px', marginTop: '4px', transform: 'rotate(45deg)' }} />
            <Typography color='text.secondary' textAlign='left' variant='B-1'>
              {t('We may update this privacy policy and notify you on our website and extension.')}
            </Typography>
          </Box>
        </Box>
        <Box>
          <Box sx={{ alignItems: 'flex-start', display: 'flex', gap: '8px' }}>
            <SquareIcon sx={{ color: '#FF4FB9', fontSize: '10px', marginTop: '4px', transform: 'rotate(45deg)' }} />
            <Translation>
              {() => (
                <div style={{ lineHeight: 1.3, textAlign: 'left' }}>
                  <span style={{ color: theme.palette.text.secondary, ...theme.typography['B-1'], textAlign: 'left' }}>
                    {t('If you have any questions, please contact us at ')}
                  </span>
                  <Link href='mailto:support@polkagate.xyz' sx={{ color: 'text.secondary', ...theme.typography['B-1'], textDecoration: 'underline' }}>
                    {'support@polkagate.xyz'}
                  </Link>
                  <span style={{ color: theme.palette.text.secondary, ...theme.typography['B-1'], textAlign: 'left' }}>
                    {t(' or follow us on our social media accounts.')}
                  </span>
                </div>
              )}
            </Translation>
          </Box>
        </Box>
        <GradientButton
          contentPlacement='center'
          onClick={handleClose}
          style={{
            height: '44px',
            marginTop: '20px',
            width: '345px'
          }}
          text={t('Great!')}
        />
      </Grid>
    </ExtensionPopup>
  );
}

export default PrivacyPolicy;
