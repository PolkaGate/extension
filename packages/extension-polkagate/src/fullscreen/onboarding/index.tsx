// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faBook, faBookJournalWhills, faCirclePlus, faFileCode, faHome, faMagnifyingGlassArrowRight, faQrcode, faTag, faWallet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { DEMO_ACCOUNT, FULLSCREEN_WIDTH } from '@polkadot/extension-polkagate/src/util/constants';

import { AccountContext, ActionContext } from '../../components';
import { useFullscreen, useTranslation } from '../../hooks';
import { createAccountExternal, windowOpen } from '../../messaging';
import FollowUs from '../../popup/welcome/FollowUs';
import NeedHelp from '../../popup/welcome/NeedHelp';
import Privacy from '../../popup/welcome/Privacy';
import FullScreenHeader from '../governance/FullScreenHeader';
import IconBox from './IconBox';

export const ICON_BOX_WIDTH = '300px';

function Onboarding(): React.ReactElement {
  const { t } = useTranslation();

  useFullscreen();

  const { accounts } = useContext(AccountContext);
  const onAction = useContext(ActionContext);

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
    createAccountExternal('Demo Account ☔️', DEMO_ACCOUNT, POLKADOT_GENESIS)
      .then(() => onAction('/'))
      .catch((error: Error) => {
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
        <Grid container item sx={{ display: 'block', position: 'relative', px: '10%' }}>
          <Grid alignContent='center' alignItems='center' container item>
            <Grid item sx={{ mr: '20px' }}>
              <FontAwesomeIcon
                fontSize='30px'
                icon={faHome}
              />
            </Grid>
            <Grid item>
              <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
                {t('Welcome!')}
              </Typography>
            </Grid>
          </Grid>
          <Typography fontSize='16px' fontWeight={500} pb='15px' pt='30px' width='100%'>
            {t('We appreciate your choice in selecting PolkaGate as your gateway to the Polkadot ecosystem! 🌟')}
          </Typography>
          <Typography fontSize='16px' fontWeight={400} width='100%'>
            {t('At present, you do not have any accounts. To begin your journey, you can create your first account, import existing accounts, or explore the demo option to get started.')}
          </Typography>
          <Grid alignItems='center' container item justifyContent='space-between' pt='60px' rowGap='5px' width='700px'>
            <IconBox
              icon={faCirclePlus}
              label={t('Create a New Account')}
              onClick={onCreate}
            />
            <IconBox
              icon={faFileCode}
              label={t('Restore from JSON File')}
              onClick={onRestoreFromJson}
            />
            <IconBox
              icon={faBook}
              label={t('Import from Recovery Phrase')}
              onClick={onImport}
            />
            <IconBox
              icon={faBookJournalWhills}
              label={t('Import from Raw Seed')}
              onClick={onImportRawSeed}
            />
            <IconBox
              icon={faWallet}
              label={t('Attach Ledger Device')}
              onClick={onImportLedger}
            />
            <IconBox
              icon={faQrcode}
              label={t('Attach QR-Signer')}
              onClick={onAttachQR}
            />
            <IconBox
              icon={faTag}
              label={t('Add Watch-only Account')}
              onClick={onAddWatchOnly}
            />
            <IconBox
              icon={faMagnifyingGlassArrowRight}
              label={t('Explore a Demo')}
              onClick={onExploreDemo}
            />
            <Grid alignItems='center' container justifyContent='space-between' sx={{ bottom: 10, position: 'absolute', width: 'inherit' }}>
              <FollowUs width={ICON_BOX_WIDTH} />
              <NeedHelp />
              {/* eslint-disable-next-line react/jsx-no-bind */}
              <Typography onClick={() => setShowPrivacyAndSecurity(true)} sx={{ cursor: 'pointer', fontSize: '14px', textAlign: 'right', textDecoration: 'underline', width: ICON_BOX_WIDTH }}>
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
