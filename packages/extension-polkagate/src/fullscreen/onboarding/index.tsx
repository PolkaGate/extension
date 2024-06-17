// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */
//@ts-nocheck
import '@vaadin/icons';

import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { AccountContext, ActionContext, PButton } from '../../components';
import { useFullscreen, useTranslation } from '../../hooks';
import { createAccountExternal, windowOpen } from '../../messaging';
import Privacy from '../../popup/welcome/Privacy';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';

const demoAccount = '1ChFWeNRLarAPRCTM3bfJmncJbSAbSS9yqjueWz7jX7iTVZ';

function Onboarding(): React.ReactElement {
  useFullscreen();
  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);

  const { t } = useTranslation();
  const theme = useTheme();

  const [showPrivacyAndSecurity, setShowPrivacyAndSecurity] = useState(false);

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

  const onExploreDemo = useCallback((): void => {
    setIsBusy(true);

    createAccountExternal('Demo Account ☔️', demoAccount, POLKADOT_GENESIS)
      .then(() => onAction('/'))
      .catch((error: Error) => {
        setIsBusy(false);
        console.error(error);
      });
  }, [onAction]);

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

  const onImportRawSeed = useCallback(
    (): void => {
      windowOpen('/account/import-raw-seed').catch(console.error);
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
              <FontAwesomeIcon
                color={theme.palette.primary.main}
                fontSize='30px'
                icon={faHome}
              />

            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t('Welcome to {{extensionName}}!', { replace: { extensionName: 'Polkagate' } })}
              </Typography>
            </Grid>
          </Grid>
          <Typography fontSize='16px' fontWeight={500} pb='15px' pt='30px' width='100%'>
            {t('We appreciate your choice in selecting Polkagate as your gateway to the Polkadot ecosystem! 🌟')}
          </Typography>
          <Typography fontSize='16px' fontWeight={400} width='100%'>
            {t('At present, you do not have any accounts. To begin your journey, you can create your first account, import existing accounts, or explore the demo option to get started.')}
          </Typography>
          <Grid alignItems='center' container item justifyContent='center' pt='80px'>
            <PButton
              _ml={0}
              _mt='20px'
              _onClick={onCreate}
              _variant={'contained'}
              startIcon={<vaadin-icon icon='vaadin:plus-circle' style={{ height: '18px', color: `${theme.palette.text.main}` }} />}
              text={t('Create a new account')}
            />
            <Divider sx={{ fontSize: '20px', fontWeight: 400, my: '25px', width: '88%' }}>
              {t('Or')}
            </Divider>
            <Grid container item justifyContent='center' mb='25px'>
              <PButton
                _ml={0}
                _mt='0'
                _onClick={onRestoreFromJson}
                _variant={'outlined'}
                text={t('Restore from JSON file')}
              />
              <PButton
                _ml={0}
                _mt='15px'
                _onClick={onImport}
                _variant={'outlined'}
                text={t('Import from recovery phrase')}
              />
              <PButton
                _ml={0}
                _mt='15px'
                _onClick={onImportRawSeed}
                _variant={'outlined'}
                text={t('Import from raw seed')}
              />
              <PButton
                _ml={0}
                _mt='15px'
                _onClick={onAddWatchOnly}
                _variant={'outlined'}
                text={t('Add watch-only account')}
              />
              <PButton
                _ml={0}
                _mt='15px'
                _onClick={onAttachQR}
                _variant={'outlined'}
                text={t('Attach QR-signer')}
              />
              <PButton
                _ml={0}
                _mt='15px'
                _onClick={onImportLedger}
                _variant={'outlined'}
                text={t('Attach ledger device')}
              />  <PButton
                _ml={0}
                _mt='15px'
                _isBusy={isBusy}
                _onClick={onExploreDemo}
                _variant={'contained'}
                text={t('Explore a demo')}
              />
            </Grid>
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
