// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Collapse, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { ActionContext, SocialRecoveryIcon, VaadinIcon } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import { IDENTITY_CHAINS, PROXY_CHAINS, SOCIAL_RECOVERY_CHAINS } from '../../../util/constants';
import { popupNumbers } from '..';
import { TaskButton } from './CommonTasks';

interface Props {
  address: string | undefined;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function AccountSetting({ address, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { account, chain } = useInfo(address);
  const onAction = useContext(ActionContext);

  const [showAccountSettings, setShowAccountSettings] = useState<boolean>();

  const identityDisable = useMemo(() => !IDENTITY_CHAINS.includes(account?.genesisHash ?? ''), [account?.genesisHash]);
  const proxyDisable = useMemo(() => !PROXY_CHAINS.includes(account?.genesisHash ?? ''), [account?.genesisHash]);
  const socialRecoveryDisable = useMemo(() => !SOCIAL_RECOVERY_CHAINS.includes(account?.genesisHash ?? ''), [account?.genesisHash]);
  const hardwareOrExternalAccount = useMemo(() => account?.isExternal ?? account?.isHardware, [account]);

  const onExportAccount = useCallback(() => {
    address && setDisplayPopup(popupNumbers.EXPORT_ACCOUNT);
  }, [address, setDisplayPopup]);

  const goToDeriveAcc = useCallback(() => {
    address && setDisplayPopup(popupNumbers.DERIVE_ACCOUNT);
  }, [address, setDisplayPopup]);

  const onRenameAccount = useCallback(() => {
    address && setDisplayPopup(popupNumbers.RENAME);
  }, [address, setDisplayPopup]);

  const onForgetAccount = useCallback(() => {
    address && account && setDisplayPopup(popupNumbers.FORGET_ACCOUNT);
  }, [address, account, setDisplayPopup]);

  const onManageProxies = useCallback(() => {
    address && !proxyDisable && onAction(`/fullscreenProxyManagement/${address}`);
  }, [address, onAction, proxyDisable]);

  const onManageIdentity = useCallback(() => {
    address && !identityDisable && onAction(`/manageIdentity/${address}`);
  }, [address, identityDisable, onAction]);

  const onSocialRecovery = useCallback(() => {
    address && !socialRecoveryDisable && onAction(`/socialRecovery/${address}/false`);
  }, [address, socialRecoveryDisable, onAction]);

  const toggleAccountSetting = useCallback(() => {
    setShowAccountSettings(!showAccountSettings);
  }, [showAccountSettings]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px' }} width='inherit'>
      <Grid alignItems='center' container item onClick={toggleAccountSetting} sx={{ cursor: 'pointer', width: 'fit-content' }}>
        <Typography fontSize='20px' fontWeight={700} sx={{ mr: '20px' }}>
          {t('Account settings')}
        </Typography>
        <ArrowForwardIosRoundedIcon
          sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1, transform: showAccountSettings ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }}
        />
      </Grid>
      <Collapse in={showAccountSettings} sx={{ width: '100%' }}>
        <Grid alignItems='flex-end' container direction='column' item justifyContent='center'>
          <Divider sx={{ bgcolor: 'divider', height: '2px', m: '5px auto 15px', width: '90%' }} />
          <TaskButton
            disabled={identityDisable}
            icon={
              <FontAwesomeIcon
                color={!chain || identityDisable ? theme.palette.text.disabled : theme.palette.text.primary}
                fontSize={25}
                icon={faAddressCard}
              />
            }
            onClick={onManageIdentity}
            secondaryIconType='page'
            text={t('Manage identity')}
          />
          <TaskButton
            disabled={proxyDisable}
            icon={<VaadinIcon icon='vaadin:sitemap' style={{ color: `${proxyDisable ? theme.palette.text.disabled : theme.palette.text.primary}`, height: '30px' }} />}
            onClick={onManageProxies}
            secondaryIconType='page'
            text={t('Manage proxies')}
          />
          <TaskButton
            disabled={socialRecoveryDisable}
            icon={
              <SocialRecoveryIcon
                color={
                  socialRecoveryDisable
                    ? theme.palette.text.disabled
                    : theme.palette.text.primary}
                height={30}
                width={30}
              />
            }
            onClick={onSocialRecovery}
            secondaryIconType='page'
            text={t('Social recovery')}
          />
          <TaskButton
            disabled={hardwareOrExternalAccount}
            icon={<VaadinIcon icon='vaadin:download-alt' style={{ color: `${hardwareOrExternalAccount ? theme.palette.text.disabled : theme.palette.text.primary}`, height: '30px' }} />}
            onClick={onExportAccount}
            secondaryIconType='popup'
            text={t('Export account')}
          />
          <TaskButton
            disabled={hardwareOrExternalAccount}
            icon={<VaadinIcon icon='vaadin:road-branch' style={{ color: `${hardwareOrExternalAccount ? theme.palette.text.disabled : theme.palette.text.primary}`, height: '30px' }} />}
            onClick={goToDeriveAcc}
            secondaryIconType='popup'
            text={t('Derive new account')}
          />
          <TaskButton
            icon={<VaadinIcon icon='vaadin:edit' style={{ color: `${theme.palette.text.primary}`, height: '30px' }} />}
            onClick={onRenameAccount}
            secondaryIconType='popup'
            text={t('Rename')}
          />
          <TaskButton
            icon={<VaadinIcon icon='vaadin:file-remove' style={{ color: `${theme.palette.text.primary}`, height: '30px' }} />}
            noBorderButton
            onClick={onForgetAccount}
            secondaryIconType='popup'
            text={t('Forget account')}
          />
        </Grid>
      </Collapse>
    </Grid>
  );
}
