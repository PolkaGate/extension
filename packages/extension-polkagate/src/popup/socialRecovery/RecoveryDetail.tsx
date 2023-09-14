// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Box, Divider, Grid, Typography, useTheme } from '@mui/material';
import { CubeGrid } from 'better-react-spinkit';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { ApiPromise } from '@polkadot/api';
import { AccountsStore } from '@polkadot/extension-base/stores';
import { Chain } from '@polkadot/extension-chains/types';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { ChainLogo, PButton, ShowBalance2, TwoButtons, Warning } from '../../components';
import { useApi, useChain, useChainName, useFormatted, useFullscreen, useTranslation } from '../../hooks';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import TrustedFriendAccount from './components/TrustedFriendAccount';
import TrustedFriendsList from './partial/TrustedFriendsList';
import { RecoveryConfigType, SocialRecoveryModes, STEPS } from '.';
import recoveryDelayPeriod from './util/recoveryDelayPeriod';


interface Props {
  api: ApiPromise | undefined;
  recoveryInformation: PalletRecoveryRecoveryConfig;
  chain: Chain | null | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setMode: React.Dispatch<React.SetStateAction<SocialRecoveryModes>>;
  setRecoveryConfig: React.Dispatch<React.SetStateAction<RecoveryConfigType>>;
}

export default function RecoveryDetail({ api, chain, recoveryInformation, setMode, setStep, setRecoveryConfig }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const goBack = useCallback(() => {
    setStep(STEPS.INDEX);
  }, [setStep]);

  const goRemoveRecovery = useCallback(() => {
    setMode('RemoveRecovery');
    setStep(STEPS.REVIEW);
  }, [setMode, setStep]);

  const goModify = useCallback(() => {
    setRecoveryConfig({
      delayPeriod: recoveryInformation.delayPeriod.toNumber(),
      friends: { addresses: recoveryInformation.friends.map((friend) => String(friend)) },
      threshold: recoveryInformation.threshold.toNumber()
    });
    setMode('ModifyRecovery');
    setStep(STEPS.MAKERECOVERABLE);
  }, [recoveryInformation.delayPeriod, recoveryInformation.friends, recoveryInformation.threshold, setMode, setRecoveryConfig, setStep]);

  const RecoveryInformationDisplay = () => (
    <Grid container direction='column' gap='10px' item sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', maxHeight: '230px', mt: '20px', overflow: 'hidden', overflowY: 'scroll', p: '20px' }}>
      <Grid container item justifyContent='space-between'>
        <Typography fontSize='20px' fontWeight={400}>
          {t<string>('Recovery Threshold')}
        </Typography>
        <Typography fontSize='20px' fontWeight={700}>
          {`${recoveryInformation.threshold.toNumber()} of ${recoveryInformation.friends.length}`}
        </Typography>
      </Grid>
      <Divider sx={{ bgcolor: '#D5CCD0', height: '2px', width: '100% ' }} />
      <Grid container item justifyContent='space-between'>
        <Typography fontSize='20px' fontWeight={400}>
          {t<string>('Recovery Delay')}
        </Typography>
        <Typography fontSize='20px' fontWeight={700}>
          {recoveryDelayPeriod(recoveryInformation.delayPeriod.toNumber())}
        </Typography>
      </Grid>
      <Divider sx={{ bgcolor: '#D5CCD0', height: '2px', width: '100% ' }} />
      <Grid container item justifyContent='space-between'>
        <Typography fontSize='20px' fontWeight={400}>
          {t<string>('Deposit')}
        </Typography>
        <Grid alignItems='center' container fontSize='20px' fontWeight={700} gap='10px' item width='fit-content'>
          <ChainLogo genesisHash={api?.genesisHash.toHex()} />
          <ShowBalance2
            api={api}
            balance={recoveryInformation.deposit}
            decimalPoint={4}
          />
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      <Grid alignItems='center' container item pt='25px'>
        <FontAwesomeIcon
          color={theme.palette.success.main}
          fontSize='45px'
          icon={faShieldHalved}
        />
        <Typography fontSize='30px' fontWeight={700} pl='8px'>
          {t<string>('Your account is recoverable')}
        </Typography>
      </Grid>
      <TrustedFriendsList
        api={api}
        chain={chain}
        friendsList={recoveryInformation.friends.map((friend) => String(friend))}
        style={{ maxHeight: '255px' }}
        title={t<string>('Trusted friends')}
      />
      <RecoveryInformationDisplay />
      <Grid container item sx={{ '> div.belowInput': { m: 0 }, '> div.belowInput .warningImage': { fontSize: '25px' }, height: '55px', pt: '15px' }}>
        <Warning
          fontWeight={600}
          isBelowInput
          theme={theme}
        >
          {t<string>('If you\'ve lost access to this account, start the recovery process with a new account and contact trusted friends for account recovery.')}
        </Warning>
      </Grid>
      <Grid container item justifyContent='space-between' pt='60px'>
        <Grid container item xs={3}>
          <PButton
            _mt='1px'
            _onClick={goBack}
            _variant='text'
            disabled={false}
            text={t<string>('Back')}
          />
        </Grid>
        <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={8}>
          <TwoButtons
            disabled={false}
            mt={'1px'}
            onPrimaryClick={goModify}
            onSecondaryClick={goRemoveRecovery}
            primaryBtnText={t<string>('Modify')}
            secondaryBtnText={t<string>('Unrecoverable account')}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
