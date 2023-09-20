// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { PButton, Progress, TwoButtons, Warning } from '../../components';
import { useAccountsInfo, useChain, useTranslation } from '../../hooks';
import { ActiveRecoveryFor } from '../../hooks/useActiveRecoveries';
import SelectTrustedFriend, { FriendWithId } from './components/SelectTrustedFriend';
import { SocialRecoveryModes, STEPS } from '.';

interface Props {
  address: string | undefined;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setMode: React.Dispatch<React.SetStateAction<SocialRecoveryModes>>;
  setVouchRecoveryInfo: React.Dispatch<React.SetStateAction<{ lost: FriendWithId, rescuer: FriendWithId } | undefined>>;
  activeRecoveries: ActiveRecoveryFor[] | null | undefined;
}

type WhyNotStatus = 'noActive' | 'NotAFriend' | 'AlreadyVouched' | 'notRecoverable';

export default function Vouch({ activeRecoveries, address, api, setMode, setStep, setVouchRecoveryInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const accountsInfo = useAccountsInfo(api, chain);

  const [lostAccount, setLostAccount] = useState<FriendWithId>();
  const [rescuerAccount, setRescuerAccount] = useState<FriendWithId>();
  const [activeRecoveryInfo, setActiveRecoveryInfo] = useState<ActiveRecoveryFor | null | undefined | false>(false);
  const [whyNotStatus, setWhyNotStatus] = useState<WhyNotStatus>();
  const [checkActive, setCheckActive] = useState<boolean>(false);

  const whyNotMessage = useMemo(() => {
    if (!whyNotStatus) {
      return '';
    } else if (whyNotStatus === 'AlreadyVouched') {
      return 'You have already vouched for this recovery.';
    } else if (whyNotStatus === 'NotAFriend') {
      return 'You are not a friend of the lost account.';
    } else if (whyNotStatus === 'noActive') {
      return 'There is no active recovery process for the lost account by this rescuer account.';
    } else {
      return 'The lost account is not recoverable.';
    }
  }, [whyNotStatus]);

  const checkActiveRecoveries = useCallback(() => {
    if (!lostAccount?.address || !rescuerAccount?.address) {
      return;
    }

    setCheckActive(false);
    setActiveRecoveryInfo(undefined);
    setCheckActive(true);
  }, [lostAccount?.address, rescuerAccount?.address]);

  useEffect(() => {
    if (activeRecoveries === undefined || !checkActive || !lostAccount?.address || !rescuerAccount?.address || !address) {
      return;
    }

    if (activeRecoveries) {
      const activeRecoveriesForLostAddr = activeRecoveries.filter((active) => active.lost === lostAccount.address);

      if (activeRecoveriesForLostAddr.length > 0) {
        const initiatedRecovery = activeRecoveriesForLostAddr.find((activeRec) => activeRec.rescuer === rescuerAccount.address);

        if (!initiatedRecovery) {
          setWhyNotStatus('noActive');
          setActiveRecoveryInfo(null);

          return;
        }

        if (initiatedRecovery.vouchedFriends.includes(address)) {
          setWhyNotStatus('AlreadyVouched');
          setActiveRecoveryInfo(null);

          return;
        }

        api && api.query.recovery.recoverable(lostAccount.address).then((r) => {
          if (r.isEmpty) {
            setWhyNotStatus('notRecoverable');
            setActiveRecoveryInfo(null);
          }

          const lostAccountDetail = r.unwrap() as unknown as PalletRecoveryRecoveryConfig;

          if (!lostAccountDetail.friends.some((friend) => String(friend) === address)) {
            setWhyNotStatus('NotAFriend');
            setActiveRecoveryInfo(null);

            return;
          }

          const isFriend = lostAccountDetail.friends.find((friend) => address === String(friend));

          isFriend && setActiveRecoveryInfo(initiatedRecovery);
        }).catch(console.error);
      } else {
        setWhyNotStatus('noActive');
        setActiveRecoveryInfo(null);
      }
    } else {
      setWhyNotStatus('noActive');
      setActiveRecoveryInfo(null);
    }
  }, [activeRecoveries, address, api, checkActive, lostAccount?.address, rescuerAccount?.address]);

  useEffect(() => {
    if (!lostAccount || !rescuerAccount) {
      setActiveRecoveryInfo(false);
    }
  }, [lostAccount, rescuerAccount]);

  const selectLostAccount = useCallback((addr: FriendWithId | undefined) => {
    setLostAccount(addr);
  }, []);

  const selectRescuerAccount = useCallback((addr: FriendWithId | undefined) => {
    setRescuerAccount(addr);
  }, []);

  const goBack = useCallback(() => {
    setStep(STEPS.INDEX);
    setMode(undefined);
  }, [setMode, setStep]);

  const vouch = useCallback(() => {
    if (!lostAccount || !rescuerAccount) {
      return;
    }

    setVouchRecoveryInfo({
      lost: lostAccount,
      rescuer: rescuerAccount
    });
    setMode('VouchRecovery');
    setStep(STEPS.REVIEW);
  }, [lostAccount, rescuerAccount, setMode, setStep, setVouchRecoveryInfo]);

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
        {t<string>('Vouch Recovery')}
      </Typography>
      <Typography fontSize='14px' fontWeight={400} width='100%'>
        {t<string>('Enter both the lost account and the rescuer account, which initiated the recovery process for the lost account. This will allow you to proceed with vouching for them.')}
      </Typography>
      <Typography fontSize='22px' fontWeight={700} pt='10px' width='100%'>
        {t<string>('Step 1/2: Verify accounts')}
      </Typography>
      <SelectTrustedFriend
        accountsInfo={accountsInfo}
        api={api}
        chain={chain}
        disabled={false}
        helperText={t<string>('Find the lost account by entering their address or any associated identity details, such as their name, email, Twitter, etc.')}
        iconType='none'
        label={t<string>('Lost accounts')}
        onSelectFriend={selectLostAccount}
        placeHolder={t<string>('Enter account ID or address')}
        style={{ py: '15px', width: '100%' }}
      />
      <SelectTrustedFriend
        accountsInfo={accountsInfo}
        api={api}
        chain={chain}
        disabled={false}
        helperText={t<string>('Find the rescuer account by entering their address or any associated identity details, such as their name, email, Twitter, etc.')}
        iconType='none'
        label={t<string>('Rescuer accounts')}
        onSelectFriend={selectRescuerAccount}
        placeHolder={t<string>('Enter account ID or address')}
        style={{ py: '15px', width: '100%' }}
      />
      {activeRecoveryInfo !== false &&
        <Grid container item justifyContent='flex-end' pt='15px' sx={{ '> button': { width: '190px' }, '> div': { width: '190px' } }}>
          <PButton
            _isBusy={checkActive === undefined}
            _ml={0}
            _mt='0'
            _onClick={checkActiveRecoveries}
            disabled={!lostAccount || !rescuerAccount}
            text={t<string>('Verify accounts')}
          />
        </Grid>
      }
      {activeRecoveryInfo !== false &&
        <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', boxShadow: '0px 4px 4px 0px #00000040', mt: '20px', p: '20px' }}>
          {activeRecoveryInfo === undefined
            ? <Progress pt='10px' size={60} title={t('Checking the recovery status...')} />
            : activeRecoveryInfo === null
              ? <Grid container item justifyContent='center' sx={{ '> div.belowInput': { m: 0 }, '> div.belowInput .warningImage': { fontSize: '25px' }, height: '45px', pb: '15px' }}>
                <Warning
                  fontSize={'18px'}
                  fontWeight={500}
                  isBelowInput
                  theme={theme}
                >
                  {t<string>(whyNotMessage)}
                </Warning>
              </Grid>
              : <>
                <Typography fontSize='18px' fontWeight={500}>
                  {'The lost account is recoverable and the recovery process has been initiated.'}
                </Typography>
                <Typography fontSize='18px' fontWeight={500}>
                  {'You can proceed to the next step.'}
                </Typography>
              </>
          }
        </Grid>
      }
      <Grid container item justifyContent='flex-end' pt='15px'>
        <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
          <TwoButtons
            disabled={activeRecoveryInfo === null || activeRecoveryInfo === undefined || !lostAccount?.address || !rescuerAccount?.address}
            isBusy={false}
            mt={'1px'}
            onPrimaryClick={activeRecoveryInfo === false
              ? checkActiveRecoveries
              : vouch}
            onSecondaryClick={goBack}
            primaryBtnText={activeRecoveryInfo === false
              ? t<string>('Verify accounts')
              : t<string>('Proceed')}
            secondaryBtnText={t<string>('Back')}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
