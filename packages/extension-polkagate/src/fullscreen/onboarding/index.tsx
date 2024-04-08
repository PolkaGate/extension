// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { AccountContext, ActionContext, PButton } from '../../components';
import { useFullscreen, useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import Privacy from '../welcome/Privacy';

function Onboarding (): React.ReactElement {
  useFullscreen();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);

  const { t } = useTranslation();
  const theme = useTheme();

  const [showPrivacyAndSecurity, setShowPrivacyAndSecurity] = useState(false);
  const [showMore, setShowMore] = useState<boolean>(false);

  const toggleMore = useCallback(() => setShowMore(!showMore), [showMore]);

  useEffect(() => {
    if (accounts?.length > 0) {
      onAction('/');
    }
  }, [accounts?.length, onAction]);

  const onRestoreFromJson = useCallback(
    (): void => {
      windowOpen('/account/restore-json').catch(console.error);
    }, []
  );

  const onImportLedger = useCallback(
    (): void => {
      windowOpen('/account/import-ledger').catch(console.error);
    }, []
  );

  const onCreate = useCallback(
    (): void => {
      windowOpen('/account/create').catch(console.error);
    }, []
  );

  const onAddWatchOnly = useCallback(
    (): void => {
      windowOpen('/import/add-watch-only-full-screen').catch(console.error);
    }, []
  );

  const onImport = useCallback(
    (): void => {
      windowOpen('/account/import-seed').catch(console.error);
    }, []
  );

  const onAttachQR = useCallback(
    (): void => {
      windowOpen('/import/attach-qr-full-screen').catch(console.error);
    }, []
  );

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader
        noAccountDropDown
        noChainSwitch
      />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: FULLSCREEN_WIDTH, overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '10%' }}>
          <Grid alignContent='center' alignItems='center' container item>
            <Grid item sx={{ mr: '20px' }}>
              <vaadin-icon icon='vaadin:lightbulb' style={{ height: '40px', color: `${theme.palette.text.primary}`, width: '40px' }} />
            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t<string>('Welcome!')}
              </Typography>
            </Grid>
          </Grid>
          <Typography fontSize='16px' fontWeight={500} pb='15px' pt='30px' width='100%'>
            {t<string>('Thank you for choosing Polkagate, the gateway to the Polkadot ecosystem! 🌟')}
          </Typography>
          <Typography fontSize='16px' fontWeight={400} width='100%'>
            {t('Currently, you do not have any accounts. Begin by creating your first account or importing existing accounts to get started.')}
          </Typography>
          <Grid alignItems='center' container item justifyContent='center' pt='80px'>
            <PButton
              _ml={0}
              _mt='20px'
              _onClick={onCreate}
              _variant={'contained'}
              startIcon={<vaadin-icon icon='vaadin:plus-circle' style={{ height: '18px', color: `${theme.palette.text.main}` }} />}
              text={t<string>('Create a new account')}
            />
            <Divider sx={{ fontSize: '20px', fontWeight: 400, my: '15px', width: '88%' }}>
              {t('Or')}
            </Divider>
            <Collapse in={!showMore}>
              <Grid alignItems='flex-end' container item justifyContent='center' onClick={toggleMore} pb='25px'>
                <Typography sx={{ color: 'secondary.light', cursor: 'pointer', textDecoration: 'underline', userSelect: 'none' }}>
                  {t('I already have account(s) and wish to import my existing account(s)')}
                </Typography>
                <ArrowForwardIosIcon sx={{ color: 'secondary.light', cursor: 'pointer', fontSize: 17, ml: '7px', stroke: '#BA2882', strokeWidth: '2px', transform: showMore ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
              </Grid>
            </Collapse>
            <Collapse in={showMore}>
              <Grid container item justifyContent='center' mb='25px'>
                <PButton
                  _ml={0}
                  _mt='0'
                  _onClick={onRestoreFromJson}
                  _variant={'outlined'}
                  text={t<string>('Restore from JSON file')}
                />
                <PButton
                  _ml={0}
                  _mt='15px'
                  _onClick={onImport}
                  _variant={'outlined'}
                  text={t<string>('Import from recovery phrase')}
                />
                <PButton
                  _ml={0}
                  _mt='15px'
                  _onClick={onAddWatchOnly}
                  _variant={'outlined'}
                  text={t<string>('Add watch-only account')}
                />
                <PButton
                  _ml={0}
                  _mt='15px'
                  _onClick={onAttachQR}
                  _variant={'outlined'}
                  text={t<string>('Attach QR-signer')}
                />
                <PButton
                  _ml={0}
                  _mt='15px'
                  _onClick={onImportLedger}
                  _variant={'outlined'}
                  text={t<string>('Attach ledger device')}
                />

              </Grid>
            </Collapse>
            <Grid container justifyContent='center'>
              {/* eslint-disable-next-line react/jsx-no-bind */}
              <Typography onClick={() => setShowPrivacyAndSecurity(true)} sx={{ bottom: 0, cursor: 'pointer', fontSize: '12px', position: 'absolute', textAlign: 'center', textDecoration: 'underline' }}>
                {t('Privacy and Security')}
              </Typography>
            </Grid>
            {showPrivacyAndSecurity &&
              <Privacy
                asModal
                setShow={setShowPrivacyAndSecurity}
                show={showPrivacyAndSecurity}
              />
            }
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(Onboarding);
