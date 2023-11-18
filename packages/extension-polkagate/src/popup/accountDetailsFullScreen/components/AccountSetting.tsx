// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faAddressCard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Grid, keyframes, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { ActionContext } from '../../../components';
import { useAccount, useChain, useTranslation } from '../../../hooks';
import { windowOpen } from '../../../messaging';
import { IDENTITY_CHAINS } from '../../../util/constants';
import { popupNumbers } from '..';
import { TaskButton } from './CommonTasks';

interface Props {
  address: string | undefined;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function AccountSetting({ address, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const account = useAccount(address);
  const onAction = useContext(ActionContext);
  const chain = useChain(address);

  const [showAccountSettings, setShowAccountSettings] = useState<boolean>();

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);

  const slideIn = keyframes`
  0% {
    height: 0;
  }
  100%{
    height:  fit-content;
  }
`;

  const slideOut = keyframes`
  0% {
    height: fit-content;
  }
  100%{
    height: 0;
  }
`;

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
    address && onAction(`/manageProxies/${address}`);
  }, [address, onAction]);

  const onManageIdentity = useCallback(() => {
    address && windowOpen(`/manageIdentity/${address}`).catch(console.error);
  }, [address]);

  const toggleAccountSetting = useCallback(() => {
    setShowAccountSettings(!showAccountSettings);
  }, [showAccountSettings]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px' }} width='275px'>
      <Grid alignItems='center' container item onClick={toggleAccountSetting} sx={{ borderBottom: showAccountSettings ? '2px solid' : 'none', borderBottomColor: borderColor, cursor: 'pointer', mb: showAccountSettings ? '10px' : 0, pb: showAccountSettings ? '10px' : 0, width: 'fit-content' }}>
        <Typography fontSize='22px' fontWeight={700} sx={{ mr: '20px' }}>
          {t<string>('Account setting')}
        </Typography>
        <ArrowForwardIosRoundedIcon
          sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1, transform: showAccountSettings ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }}
        />
      </Grid>
      <Grid alignItems='center' container direction='column' display={showAccountSettings !== undefined ? 'inherit' : 'none'} item justifyContent='center' sx={{ animationDuration: '0.3s', animationFillMode: 'both', animationName: `${showAccountSettings ? slideIn : slideOut}`, overflow: 'hidden' }}>
        <TaskButton
          borderColor={borderColor}
          icon={<vaadin-icon icon='vaadin:download-alt' style={{ height: '30px', color: `${theme.palette.text.primary}` }} />}
          onClick={onExportAccount}
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Export account')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={<vaadin-icon icon='vaadin:road-branch' style={{ height: '30px', color: `${theme.palette.text.primary}` }} />}
          onClick={goToDeriveAcc}
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Derive new account')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={<vaadin-icon icon='vaadin:edit' style={{ height: '30px', color: `${theme.palette.text.primary}` }} />}
          onClick={onRenameAccount}
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Rename')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={<vaadin-icon icon='vaadin:file-remove' style={{ height: '30px', color: `${theme.palette.text.primary}` }} />}
          onClick={onForgetAccount}
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Forget account')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={<vaadin-icon icon='vaadin:sitemap' style={{ height: '30px', color: `${theme.palette.text.primary}` }} />}
          onClick={onManageProxies}
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Manage proxies')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <FontAwesomeIcon
              color={(!chain || !(IDENTITY_CHAINS.includes(chain.genesisHash ?? ''))) ? theme.palette.text.disabled : theme.palette.text.primary}
              fontSize={25}
              icon={faAddressCard}
            />
          }
          noBorderButton
          onClick={onManageIdentity}
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Manage Identity')}
        />
      </Grid>
    </Grid>
  );
}
