// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faHistory, faPaperPlane, faPiggyBank, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon, Boy as BoyIcon, OpenInNewRounded as OpenInNewRoundedIcon, QrCode2 as QrCodeIcon } from '@mui/icons-material';
import { Grid, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';

import { ActionContext, PoolStakingIcon } from '../../../components';
import { useTranslation } from '../../../hooks';
import { windowOpen } from '../../../messaging';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../../util/constants';
import { popupNumbers } from '..';

interface Props {
  address: string | undefined;
  assetId: number | undefined;
  genesisHash: string | null | undefined;
  api: ApiPromise | undefined;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
  terminateWorker: () => void | undefined;
}

interface TaskButtonProps {
  icon: unknown;
  text: string;
  onClick: () => void;
  secondaryIconType: 'popup' | 'page';
  noBorderButton?: boolean;
  borderColor: string;
  theme: Theme;
  disabled?: boolean;
}

export const TaskButton = ({ borderColor, disabled, icon, noBorderButton = false, onClick, secondaryIconType, text, theme }: TaskButtonProps) => (
  <Grid alignItems='center' container item justifyContent='space-between' onClick={onClick} sx={{ borderBottom: noBorderButton ? 0 : 1, borderBottomColor: borderColor, cursor: disabled ? 'default' : 'pointer', m: 'auto', mb: '8px', pb: '8px' }} width='80%'>
    <Grid container item xs={3}>
      {icon}
    </Grid>
    <Grid container item xs={7}>
      <Typography color={disabled ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='16px' fontWeight={500}>
        {text}
      </Typography>
    </Grid>
    <Grid alignItems='center' container item justifyContent='flex-end' xs={2}>
      {secondaryIconType === 'page'
        ? <ArrowForwardIosRoundedIcon sx={{ color: disabled ? 'text.disabled' : 'secondary.light', fontSize: '26px', stroke: disabled ? theme.palette.action.disabledBackground : theme.palette.secondary.light, strokeWidth: 1 }} />
        : <OpenInNewRoundedIcon sx={{ color: disabled ? 'text.disabled' : 'secondary.light', fontSize: '25px' }} />
      }
    </Grid>
  </Grid>
);

export default function CommonTasks ({ address, api, assetId, genesisHash, setDisplayPopup, terminateWorker }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const history = useHistory();
  const onAction = useContext(ActionContext);

  const governanceDisabled = useMemo(() => !GOVERNANCE_CHAINS.includes(genesisHash ?? ''), [genesisHash]);
  const stakingDisabled = useMemo(() => !STAKING_CHAINS.includes(genesisHash ?? ''), [genesisHash]);
  const crowdloanDisabled = useMemo(() => !CROWDLOANS_CHAINS.includes(genesisHash ?? ''), [genesisHash]);
  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);
  const stakingIconColor = useMemo(() => stakingDisabled ? theme.palette.action.disabledBackground : theme.palette.text.primary, [stakingDisabled, theme.palette.action.disabledBackground, theme.palette.text.primary]);

  const goToSend = useCallback(() => {
    terminateWorker();
    address && onAction(`/send/${address}/${assetId}`);
  }, [address, assetId, onAction, terminateWorker]);

  const goToReceive = useCallback(() => {
    address && setDisplayPopup(popupNumbers.RECEIVE);
  }, [address, setDisplayPopup]);

  const goToGovernance = useCallback(() => {
    terminateWorker();
    address && genesisHash && !governanceDisabled && windowOpen(`/governance/${address}/referenda`).catch(console.error);
  }, [address, genesisHash, governanceDisabled, terminateWorker]);

  const goToSoloStaking = useCallback(() => {
    terminateWorker();
    address && genesisHash && !stakingDisabled &&
      history.push({
        pathname: `/solo/${address}/`,
        state: { api, pathname: `account/${address}` }
      });
  }, [address, api, genesisHash, history, stakingDisabled, terminateWorker]);

  const goToPoolStaking = useCallback(() => {
    terminateWorker();
    address && genesisHash && !stakingDisabled && history.push({
      pathname: `/pool/${address}/`,
      state: { api, pathname: `account/${address}` }
    });
  }, [address, api, genesisHash, history, stakingDisabled, terminateWorker]);

  const goToCrowdLoans = useCallback(() => {
    terminateWorker();
    address && genesisHash && !crowdloanDisabled && onAction(`/crowdloans/${address}/`);
  }, [address, crowdloanDisabled, genesisHash, onAction, terminateWorker]);

  const goToHistory = useCallback(() => {
    address && setDisplayPopup(popupNumbers.HISTORY);
  }, [address, setDisplayPopup]);

  return (
    <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px' }} width='275px'>
      <Typography fontSize='22px' fontWeight={700} sx={{ borderBottom: '2px solid', borderBottomColor: borderColor, mb: '10px', pb: '10px' }}>
        {t<string>('Most common tasks')}
      </Typography>
      <Grid alignItems='center' container direction='column' display='block' item justifyContent='center'>
        <TaskButton
          borderColor={borderColor}
          icon={
            <FontAwesomeIcon
              color={theme.palette.text.primary}
              fontSize='28px'
              icon={faPaperPlane}
            />
          }
          onClick={goToSend}
          secondaryIconType='page'
          text={t<string>('Send Fund')}
          theme={theme}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <QrCodeIcon sx={{ color: 'text.primary', cursor: 'pointer', fontSize: '35px' }} />
          }
          onClick={goToReceive}
          secondaryIconType='popup'
          text={t<string>('Receive Fund')}
          theme={theme}
        />
        <TaskButton
          borderColor={borderColor}
          disabled={governanceDisabled}
          icon={
            <FontAwesomeIcon
              color={governanceDisabled ? theme.palette.action.disabledBackground : theme.palette.text.primary}
              fontSize='28px'
              icon={faVoteYea}
            />
          }
          onClick={goToGovernance}
          secondaryIconType='page'
          text={t<string>('Governance')}
          theme={theme}
        />
        <TaskButton
          borderColor={borderColor}
          disabled={stakingDisabled}
          icon={
            <BoyIcon
              sx={{
                color: stakingIconColor,
                fontSize: '35px'
              }}
            />
          }
          onClick={goToSoloStaking}
          secondaryIconType='page'
          text={t<string>('Solo Stake')}
          theme={theme}
        />
        <TaskButton
          borderColor={borderColor}
          disabled={stakingDisabled}
          icon={
            <PoolStakingIcon color={stakingIconColor} height={35} width={35} />
          }
          onClick={goToPoolStaking}
          secondaryIconType='page'
          text={t<string>('Pool Stake')}
          theme={theme}
        />
        <TaskButton
          borderColor={borderColor}
          disabled={crowdloanDisabled}
          icon={
            <FontAwesomeIcon
              color={crowdloanDisabled ? theme.palette.action.disabledBackground : theme.palette.text.primary}
              flip='horizontal'
              fontSize='28px'
              icon={faPiggyBank}
            />
          }
          onClick={goToCrowdLoans}
          secondaryIconType='page'
          text={t<string>('Crowdloans')}
          theme={theme}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <FontAwesomeIcon
              color={`${theme.palette.text.primary}`}
              fontSize='28px'
              icon={faHistory}
            />
          }
          noBorderButton
          onClick={goToHistory}
          secondaryIconType='popup'
          text={t<string>('History')}
          theme={theme}
        />
      </Grid>
    </Grid>
  );
}
