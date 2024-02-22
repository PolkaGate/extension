// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { faCirclePlus, faHistory, faPiggyBank, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon, Boy as BoyIcon, OpenInNewRounded as OpenInNewRoundedIcon, QrCode2 as QrCodeIcon } from '@mui/icons-material';
import { Box, Divider, Grid, Theme, Typography, useTheme } from '@mui/material';
import { BalancesInfo } from 'extension-polkagate/src/util/types';
import React, { useCallback, useContext, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';

import { ActionContext, AccountContext } from '../../../components';
import { useTranslation } from '../../../hooks';
import { windowOpen } from '../../../messaging';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../../util/constants';
import { popupNumbers } from '..';

interface Props {
  setDisplayPopup?: React.Dispatch<React.SetStateAction<number | undefined>>;
}

interface TaskButtonProps {
  icon: JSX.Element;
  text: string;
  onClick: () => void;
  secondaryIconType: 'popup' | 'page';
  noBorderButton?: boolean;
  borderColor: string;
  theme: Theme;
  disabled?: boolean;
}

export const TaskButton = ({ borderColor, disabled, icon, noBorderButton = false, onClick, secondaryIconType, text, theme }: TaskButtonProps) => (
  <>
    <Grid alignItems='center' container item justifyContent='space-between' onClick={disabled ? () => null : onClick} sx={{ '&:hover': { bgcolor: disabled ? 'transparent' : borderColor }, borderRadius: '5px', cursor: disabled ? 'default' : 'pointer', minHeight: '45px', py: '5px' }}>
      <Grid container item xs={2}>
        {icon}
        {/* <Box
          alt='logo'
          component='img'
          src={icon}
          sx={{ '> img': { objectFit: 'scale-down' }, borderRadius: 0, height: '18px', width: '18px' }}
        /> */}
      </Grid>
      <Grid container item justifyContent='left' xs>
        <Typography color={disabled ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='16px' fontWeight={500}>
          {text}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-end' xs={1}>
        {secondaryIconType === 'page'
          ? <ArrowForwardIosRoundedIcon sx={{ color: disabled ? 'text.disabled' : 'secondary.light', fontSize: '26px', stroke: disabled ? theme.palette.text.disabled : theme.palette.secondary.light, strokeWidth: 1 }} />
          : <OpenInNewRoundedIcon sx={{ color: disabled ? 'text.disabled' : 'secondary.light', fontSize: '25px' }} />
        }
      </Grid>
    </Grid>
    <Grid container item justifyContent='flex-end'>
      {!noBorderButton && <Divider sx={{ bgcolor: borderColor, height: '2px', width: '85%' }} />}
    </Grid>
  </>
);

export default function HomeMenu({ setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const history = useHistory();
  const onAction = useContext(ActionContext);
  const { master } = useContext(AccountContext);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);

  const goToSend = useCallback(() => {
    onAction('/account/create');
  }, [onAction]);

  const onDeriveFromAccounts = useCallback(() => {
    master && onAction(`/fullscreenDerive/${master.address}`);
  }, [master, onAction]);

  return (
    <Grid alignItems='center' container direction='column' item justifyContent='center' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '5px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', height: 'fit-content', p: '15px 30px', width: '430px' }}>
      <Grid alignItems='center' container direction='column' display='block' item justifyContent='center'>
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:plus-circle' style={{ height: '30px', color: `${theme.palette.text.primary}`, width: '30px' }} />
          }
          onClick={goToSend}
          secondaryIconType='page'
          text={t<string>('Create new account')}
          theme={theme}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:road-branch' style={{ height: '30px', color: `${theme.palette.text.primary}`, width: '30px' }} />
          }
          onClick={onDeriveFromAccounts}
          secondaryIconType='page'
          text={t<string>('Derive from accounts')}
          theme={theme}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:upload-alt' style={{ height: '30px', color: `${theme.palette.text.primary}`, width: '30px' }} />
          }
          onClick={goToSend}
          secondaryIconType='page'
          text={t<string>('Import account')}
          theme={theme}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:download' style={{ height: '30px', color: `${theme.palette.text.primary}`, width: '30px' }} />
          }
          onClick={goToSend}
          secondaryIconType='page'
          text={t<string>('Export all accounts')}
          theme={theme}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <vaadin-icon icon='vaadin:cog' style={{ height: '30px', color: `${theme.palette.text.primary}`, width: '30px' }} />
          }
          noBorderButton
          onClick={goToSend}
          secondaryIconType='page'
          text={t<string>('Settings')}
          theme={theme}
        />
      </Grid>
    </Grid>
  );
}
