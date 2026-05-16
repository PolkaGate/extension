// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useExtensionLockContext } from '../context/ExtensionLockContext';
import { useIsFlying, useLocalAccounts } from '../hooks';
import useIsExtensionPopup from '../hooks/useIsExtensionPopup';
import useIsForgotten from '../hooks/useIsForgotten';
import { STEPS } from '../popup/passwordManagement/constants';
import ForgotPassword from '../popup/passwordManagement/ForgotPassword';
import Login from '../popup/passwordManagement/Login';
import MigratePasswords from '../popup/passwordManagement/MigratePasswords';
import { ALLOWED_URL_ON_RESET_PASSWORD, STORAGE_KEY } from '../util/constants';
import FlyingLogo from './FlyingLogo';

interface Props {
  children?: React.ReactNode
}

export default function Loading({ children }: Props): React.ReactElement<Props> {
  const isExtension = useIsExtensionPopup();
  const isFlying = useIsFlying();
  const location = useLocation();
  const { isExtensionLocked } = useExtensionLockContext();
  const localAccounts = useLocalAccounts();
  const isForgotten = useIsForgotten();

  const [step, setStep] = useState<number>();

  useEffect(() => {
    if (isExtensionLocked) {
      setStep(STEPS.SHOW_LOGIN);
    }
  }, [isExtensionLocked]);

  const isForgotPasswordRoute = location.pathname === '/forgot-password';
  const isResetFlowRoute = Boolean(isForgotten?.status && ALLOWED_URL_ON_RESET_PASSWORD.includes(location.pathname));
  const isMigrationRoute = location.pathname === '/migratePasswords';
  const isAuthHandoff = window.sessionStorage.getItem(STORAGE_KEY.AUTH_HANDOFF_SESSION) === 'true';
  const canRenderAuthHandoffRoute = isAuthHandoff && location.pathname === '/account/restore-json';
  const canRenderWithoutAuthentication = isForgotPasswordRoute || isResetFlowRoute || canRenderAuthHandoffRoute;

  const requiresAuthentication = useMemo(() =>
    !canRenderWithoutAuthentication &&
    ((isExtensionLocked && !!localAccounts?.length) || !children || (isFlying && isExtension))
    , [canRenderWithoutAuthentication, isExtensionLocked, localAccounts?.length, children, isFlying, isExtension]);

  if (!requiresAuthentication) {
    return <>{children}</>;
  }

  if (isFlying && isExtension) {
    return <FlyingLogo />;
  }

  if (isMigrationRoute) {
    return <MigratePasswords />;
  }

  return step === STEPS.SHOW_DELETE_ACCOUNT_CONFIRMATION
    ? <ForgotPassword setStep={setStep} />
    : <Login setStep={setStep} />;
}
