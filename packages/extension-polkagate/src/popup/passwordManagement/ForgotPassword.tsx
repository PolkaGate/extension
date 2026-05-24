// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { forgetAccountsAll } from '@polkadot/extension-polkagate/src/messaging';
import { updateStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { switchToOrOpenTab } from '@polkadot/extension-polkagate/src/util/switchToOrOpenTab';

import { BackWithLabel, DecisionButtons, GlowCheckbox, GradientBox } from '../../components';
import { useExtensionLockContext } from '../../context/ExtensionLockContext';
import { useBackground, useIsExtensionPopup } from '../../hooks';
import useTranslation from '../../hooks/useTranslation';
import { Version } from '../../partials';
import { RedGradient } from '../../style';
import { STEPS } from './constants';
import Header from './Header';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export function ForgotPasswordContent({ onClose }: { onClose: () => void }): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { setExtensionLock } = useExtensionLockContext();
  const isExtension = useIsExtensionPopup();

  const [acknowledged, setAcknowledge] = useState<boolean>(false);
  const [isBusy, setBusy] = useState<boolean>(false);

  const onConfirmForgotPassword = useCallback(async () => {
    setBusy(true);
    await updateStorage(STORAGE_KEY.IS_FORGOTTEN, { status: true });
    await forgetAccountsAll();
    setExtensionLock(false);
    setBusy(false);

    !isExtension && switchToOrOpenTab('/reset-wallet', true);
  }, [isExtension, setExtensionLock]);

  const toggleAcknowledge = useCallback((state: boolean) => {
    setAcknowledge(state);
  }, []);

  return (
    <Grid container item justifyContent='center' sx={{ p: '18px 22px 22px' }}>
      <Warning2 color='#FFCE4F' size={isExtension ? 50 : 72} variant='Bold' />
      <Typography sx={{ lineHeight: isExtension ? '32px' : '45px', mb: '15px', mt: isExtension ? '10px' : '30px', width: '100%' }} textTransform='uppercase' variant={isExtension ? 'H-2' : 'H-1'}>
        {t('Are you sure you want to proceed?')}
      </Typography>
      <Typography sx={{ color: 'text.secondary', width: '100%' }} variant='B-4'>
        {t('This will permanently delete your accounts, and you won’t be able to recover your password. To restore access, import a backup (JSON file or recovery phrase).')}
      </Typography>
      <GlowCheckbox
        changeState={toggleAcknowledge}
        checked={acknowledged}
        label={t('I understand the accounts will be deleted.')}
        style={{ justifyContent: isExtension ? 'start' : 'center', m: isExtension ? '130px 0 15px' : '64px auto 40px' }}
      />
      <DecisionButtons
        cancelButton
        direction={isExtension ? 'horizontal' : 'vertical'}
        disabled={!acknowledged}
        divider={isExtension}
        isBusy={isBusy}
        onPrimaryClick={onConfirmForgotPassword}
        onSecondaryClick={onClose}
        primaryBtnText={t('Next')}
        secondaryBtnText={t('Cancel')}
      />
    </Grid>
  );
}

export default function ForgotPassword({ setStep }: Props): React.ReactElement<Props> {
  useBackground('drops') as void;

  const { t } = useTranslation();

  const onClose = useCallback(() => {
    setStep(STEPS.SHOW_LOGIN);
  }, [setStep]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <Header />
      <BackWithLabel
        onClick={onClose}
        text={t('Forgot password')}
      />
      <GradientBox noGradient style={{ m: 'auto', mt: '8px', width: '359px' }}>
        <RedGradient style={{ right: '-8%', top: '20px', zIndex: -1 }} />
        <ForgotPasswordContent onClose={onClose} />
      </GradientBox>
      <Version />
    </Container>
  );
}
