// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faCoins, faHistory, faPaperPlane, faPiggyBank, faVoteYea } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon, QrCode2 as QrCodeIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { useChainName, useTranslation } from '../../../hooks';
import { windowOpen } from '../../../messaging';
import { CROWDLOANS_CHAINS, GOVERNANCE_CHAINS, STAKING_CHAINS } from '../../../util/constants';
import { ApiPromise } from '@polkadot/api';

interface Props {
  address: string | undefined;
  assetId: number | undefined;
  genesisHash: string | null | undefined;
  api: ApiPromise | undefined;
}

interface TaskButtonProps {
  icon: unknown;
  text: string;
  onClick: () => void;
  secondaryIcon: unknown;
  noBorderButton?: boolean;
  disable?: boolean;
  borderColor: string;
}

export const TaskButton = ({ borderColor, icon, noBorderButton = false, onClick, secondaryIcon, text }: TaskButtonProps) => (
  <Grid alignItems='center' container item justifyContent='space-between' onClick={onClick} sx={{ borderBottom: noBorderButton ? 0 : 1, borderBottomColor: borderColor, cursor: 'pointer', m: 'auto', mb: '6px', pb: '6px' }} width='80%'>
    <Grid item xs={3}>
      {icon}
    </Grid>
    <Grid item xs={7}>
      <Typography fontSize='16px' fontWeight={500}>
        {text}
      </Typography>
    </Grid>
    <Grid item justifyContent='flex-end' xs={2}>
      {secondaryIcon}
    </Grid>
  </Grid>
);

export default function CommonTasks({ address, api, assetId, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chainName = useChainName(address);
  const history = useHistory();

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);
  const borderColor = useMemo(() => isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', [isDarkTheme]);
  const stakingIconColor = useMemo(() => `${STAKING_CHAINS.includes(genesisHash ?? '') ? theme.palette.text.primary : theme.palette.action.disabledBackground}`, [genesisHash, theme.palette.action.disabledBackground, theme.palette.text.primary]);

  const goToSend = useCallback(() => {
    address && windowOpen(`/send/${address}/${assetId}`).catch(console.error);
  }, [address, assetId]);

  const goToReceive = useCallback(() => {
    address && windowOpen(`/receive/${address}/`).catch(console.error);
  }, [address]);

  const goToGovernance = useCallback(() => {
    address && genesisHash && GOVERNANCE_CHAINS.includes(genesisHash) && windowOpen(`/governance/${address}/referenda`).catch(console.error);
  }, [address, genesisHash]);

  const goToSoloStaking = useCallback(() => {
    address && genesisHash && STAKING_CHAINS.includes(genesisHash) &&
      history.push({
        pathname: `/solo/${address}/`,
        state: { api, pathname: `account/${address}` }
      });
  }, [address, api, genesisHash, history]);

  const goToPoolStaking = useCallback(() => {
    address && genesisHash && STAKING_CHAINS.includes(genesisHash) && windowOpen(`/pool/${address}/`).catch(console.error);
  }, [address, genesisHash]);

  const goToCrowdLoans = useCallback(() => {
    address && genesisHash && CROWDLOANS_CHAINS.includes(genesisHash) && windowOpen(`/crowdloans/${address}/`).catch(console.error);
  }, [address, genesisHash]);

  const goToHistory = useCallback(() => {
    address && chainName && windowOpen(`/history/${address}/`).catch(console.error);
  }, [address, chainName]);

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
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Send Fund')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <QrCodeIcon sx={{ color: 'text.primary', cursor: 'pointer', fontSize: '35px', mr: '4px', mt: '9px' }} />
          }
          onClick={goToReceive}
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Receive Fund')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <FontAwesomeIcon
              color={`${GOVERNANCE_CHAINS.includes(genesisHash ?? '') ? theme.palette.text.primary : theme.palette.action.disabledBackground}`}
              fontSize='28px'
              icon={faVoteYea}
            />
          }
          onClick={goToGovernance}
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Governance')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <FontAwesomeIcon
              color={stakingIconColor}
              fontSize='28px'
              icon={faCoins}
            />
          }
          onClick={goToSoloStaking}
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Solo Stake')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <FontAwesomeIcon
              color={stakingIconColor}
              fontSize='28px'
              icon={faCoins}
            />
          }
          onClick={goToPoolStaking}
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Pool Stake')}
        />
        <TaskButton
          borderColor={borderColor}
          icon={
            <FontAwesomeIcon
              color={`${CROWDLOANS_CHAINS.includes(genesisHash ?? '') ? theme.palette.text.primary : theme.palette.action.disabledBackground}`}
              flip='horizontal'
              fontSize='28px'
              icon={faPiggyBank}
            />
          }
          onClick={goToCrowdLoans}
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('Crowdloans')}
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
          secondaryIcon={
            <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: theme.palette.secondary.light, strokeWidth: 1 }} />
          }
          text={t<string>('History')}
        />
      </Grid>
    </Grid>
  );
}
