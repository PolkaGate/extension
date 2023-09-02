// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';

import { socialRecoveryDark, socialRecoveryLight } from '../../assets/icons';
import { PButton, TwoButtons } from '../../components';
import { useAccountsInfo, useChain, useDecimal, useToken, useTranslation } from '../../hooks';
import { ActiveRecoveryFor } from '../../hooks/useActiveRecoveries';
import SelectTrustedFriend, { FriendWithId } from './components/SelectTrustedFriend';
import InitiatedRecoveryStatus from './partial/InitiatedRecoveryStatus';
import LostAccountRecoveryInfo from './partial/LostAccountRecoveryInfo';
import { SocialRecoveryModes, STEPS } from '.';

interface Props {
  address: string | undefined;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  mode: SocialRecoveryModes;
  setMode: React.Dispatch<React.SetStateAction<SocialRecoveryModes>>;
  setTotalDeposit: React.Dispatch<React.SetStateAction<BN>>;
  setLostAccountAddress: React.Dispatch<React.SetStateAction<FriendWithId | undefined>>;
  initiatedRecovery: ActiveRecoveryFor | null;
}

export default function InitiateRecovery ({ address, api, initiatedRecovery, mode, setLostAccountAddress, setMode, setStep, setTotalDeposit }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const accountsInfo = useAccountsInfo(api, chain);
  const decimal = useDecimal(address);
  const token = useToken(address);

  const [lostAccount, setLostAccount] = useState<FriendWithId>();
  const [lostAccountRecoveryInfo, setLostAccountRecoveryInfo] = useState<PalletRecoveryRecoveryConfig | null | undefined | false>(false);

  const recoveryDeposit = useMemo(() => api ? new BN(api.consts.recovery.recoveryDeposit.toString()) : BN_ZERO, [api]);

  const checkAccountRecoverability = useCallback(() => {
    if (api && lostAccount) {
      setLostAccountRecoveryInfo(undefined);

      api.query.recovery.recoverable(lostAccount.address).then((r) => {
        setLostAccountRecoveryInfo(r.isSome ? r.unwrap() as unknown as PalletRecoveryRecoveryConfig : null);
        console.log('is recoverable:', r.isSome ? JSON.parse(JSON.stringify(r.unwrap())) : 'nope');
      }).catch(console.error);
    }
  }, [api, lostAccount]);

  useEffect(() => {
    if (initiatedRecovery && !lostAccount) {
      setLostAccount({ accountIdentity: undefined, address: initiatedRecovery.lost });
    }
  }, [checkAccountRecoverability, initiatedRecovery, lostAccount]);

  useEffect(() => {
    if (initiatedRecovery && lostAccount && lostAccountRecoveryInfo === false) {
      checkAccountRecoverability();
    }
  }, [checkAccountRecoverability, initiatedRecovery, lostAccount, lostAccountRecoveryInfo]);

  useEffect(() => {
    if (!lostAccount && lostAccountRecoveryInfo !== false) {
      setLostAccountRecoveryInfo(false);
    }
  }, [lostAccount, lostAccount?.address, lostAccountRecoveryInfo]);

  const selectLostAccount = useCallback((addr: FriendWithId | undefined) => {
    setLostAccount(addr);
  }, []);

  const goBack = useCallback(() => {
    setStep(STEPS.INDEX);
    setMode(undefined);
  }, [setMode, setStep]);

  const rescueLostAccount = useCallback(() => {
    setLostAccountAddress(lostAccount);
    setTotalDeposit(recoveryDeposit);
    setMode('InitiateRecovery');
    setStep(STEPS.REVIEW);
  }, [lostAccount, recoveryDeposit, setLostAccountAddress, setMode, setStep, setTotalDeposit]);

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      {initiatedRecovery
        ? <>
          <Grid alignItems='center' container item pt='20px' width='fit-content'>
            <Box
              component='img'
              src={theme.palette.mode === 'dark'
                ? socialRecoveryDark as string
                : socialRecoveryLight as string}
              sx={{ height: '66px', width: '66px' }}
            />
            <Typography fontSize='30px' fontWeight={700} pl='15px'>
              {t<string>('Social Recovery')}
            </Typography>
          </Grid>
          <InitiatedRecoveryStatus
            api={api}
            chain={chain}
            initiatedRecovery={initiatedRecovery}
            lostAccountRecoveryInfo={lostAccountRecoveryInfo}
          />
          <Grid container item justifyContent='flex-end' pt='15px' sx={{ '> button': { width: '190px' }, '> div': { width: '190px' } }}>
            <PButton
              _ml={0}
              _mt='0'
              _onClick={goBack}
              text={t<string>('Back')}
            />
          </Grid>
        </>
        : <>
          <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
            {t<string>('Initiate Recovery')}
          </Typography>
          <Typography fontSize='14px' fontWeight={400} width='100%'>
            {t<string>('Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus.')}
          </Typography>
          <Typography fontSize='22px' fontWeight={700} pt='10px' width='100%'>
            {t<string>('Step 1/2: Confirm lost account ')}
          </Typography>
          <SelectTrustedFriend
            accountsInfo={accountsInfo}
            api={api}
            chain={chain}
            disabled={false}
            helperText='ToDo'
            iconType='none'
            label={t<string>('Lost accounts')}
            onSelectFriend={selectLostAccount}
            placeHolder={t<string>('Enter account ID or address')}
            style={{ py: '15px', width: '100%' }}
          />
          {lostAccountRecoveryInfo !== false &&
            <Grid container item justifyContent='flex-end' pt='15px' sx={{ '> button': { width: '190px' }, '> div': { width: '190px' } }}>
              <PButton
                _isBusy={lostAccountRecoveryInfo === undefined}
                _ml={0}
                _mt='0'
                _onClick={checkAccountRecoverability}
                disabled={!lostAccount}
                text={t<string>('Verify status')}
              />
            </Grid>
          }
          {lostAccountRecoveryInfo !== false &&
            <LostAccountRecoveryInfo
              accountsInfo={accountsInfo}
              decimal={decimal}
              lostAccountRecoveryInfo={lostAccountRecoveryInfo}
              token={token}
            />
          }
          <Grid container item justifyContent='flex-end' pt='15px'>
            <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
              <TwoButtons
                disabled={lostAccountRecoveryInfo === undefined || lostAccountRecoveryInfo === null || !lostAccount?.address}
                isBusy={false}
                mt={'1px'}
                onPrimaryClick={lostAccountRecoveryInfo === false
                  ? checkAccountRecoverability
                  : rescueLostAccount}
                onSecondaryClick={goBack}
                primaryBtnText={lostAccountRecoveryInfo === false
                  ? t<string>('Verify status')
                  : t<string>('Proceed')}
                secondaryBtnText={t<string>('Back')}
              />
            </Grid>
          </Grid>
        </>
      }
    </Grid>
  );
}
