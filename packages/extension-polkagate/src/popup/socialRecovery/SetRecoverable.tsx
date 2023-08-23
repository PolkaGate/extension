// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';

import { ShowBalance, TwoButtons } from '../../components';
import { useAccountsInfo, useChain, useTranslation } from '../../hooks';
import SelectTrustedFriend, { FriendWithId } from './components/SelectTrustedFriend';
import TrustedFriendsList from './partial/TrustedFriendsList';
import { SocialRecoveryModes, STEPS } from '.';

interface Props {
  address: string | undefined;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  mode: SocialRecoveryModes;
  setMode: React.Dispatch<React.SetStateAction<SocialRecoveryModes>>;
}

const CONFIGSTEPS = {
  SELECT_TRUSTED_FRIENDS: 1,
  SET_DETAILS: 2
};

export default function RecoveryConfig({ address, api, mode, setMode, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const chain = useChain(address);
  const accountsInfo = useAccountsInfo(api, chain);

  const [configStep, setConfigStep] = useState<number>(!mode ? CONFIGSTEPS.SELECT_TRUSTED_FRIENDS : CONFIGSTEPS.SET_DETAILS);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedFriendsToShow, setSelectedFriendsToShow] = useState<FriendWithId[]>([]);

  const stepTitle = useMemo(() => configStep === CONFIGSTEPS.SELECT_TRUSTED_FRIENDS ? 'Step 1/3: Choose trusted friends' : 'Step 2/3: Set details', [configStep]);
  const configDepositBase = useMemo(() => api ? api.consts.recovery.configDepositBase as unknown as BN : BN_ZERO, [api]);
  const friendDepositFactor = useMemo(() => api ? api.consts.recovery.friendDepositFactor as unknown as BN : BN_ZERO, [api]);
  const totalDeposit = useMemo(() => configDepositBase.add(friendDepositFactor.muln(selectedFriends.length)), [configDepositBase, friendDepositFactor, selectedFriends.length]);
  const maxFriends = useMemo(() => api ? Number(api.consts.recovery.maxFriends.toString()) : 0, [api]);

  const addNewFriend = useCallback((addr: FriendWithId) => {
    const alreadyAdded = selectedFriends.find((selectedFriend) => selectedFriend === addr.address);

    if (alreadyAdded || selectedFriends.length === maxFriends) {
      return;
    }

    setSelectedFriends((pervFriends) => [...pervFriends, addr.address]);
    setSelectedFriendsToShow((pervFriendsToShow) => [...pervFriendsToShow, addr]);
  }, [maxFriends, selectedFriends]);

  const removeNewFriend = useCallback((addr: FriendWithId) => {
    setSelectedFriends((prevFriends) => {
      const updatedFriends = prevFriends.filter((pervFriend) => pervFriend !== addr.address);

      return updatedFriends;
    });

    setSelectedFriendsToShow((prevFriendsToShow) => {
      const updatedFriendsToShow = prevFriendsToShow.filter((pervFriendToShow) => pervFriendToShow.address !== addr.address);

      return updatedFriendsToShow;
    });
  }, []);

  const goBack = useCallback(() => {
    if (configStep === CONFIGSTEPS.SELECT_TRUSTED_FRIENDS) {
      setStep(STEPS.INDEX);
      setMode(undefined);
    } else if (configStep === CONFIGSTEPS.SET_DETAILS) {
      setConfigStep(CONFIGSTEPS.SELECT_TRUSTED_FRIENDS);
    }
  }, [configStep, setMode, setStep]);

  const goNext = useCallback(() => {
    if (configStep === CONFIGSTEPS.SELECT_TRUSTED_FRIENDS) {
      setStep(STEPS.INDEX);
      setMode(undefined);
    } else if (configStep === CONFIGSTEPS.SET_DETAILS) {
      setConfigStep(CONFIGSTEPS.SELECT_TRUSTED_FRIENDS);
    }
  }, [configStep, setMode, setStep]);

  const TrustedFriendsConfiguration = () => (
    <>
      <Typography fontSize='14px' fontWeight={400} width='100%'>
        {t<string>('You can find trusted friends accounts to add to the list or/and add from those ones that are available on your extension.')}
      </Typography>
      <SelectTrustedFriend
        accountsInfo={accountsInfo}
        api={api}
        chain={chain}
        disabled={false}
        helperText='To-Do'
        label={t<string>('Find trusted friends accounts')}
        onSelectFriend={addNewFriend}
        placeHolder={t<string>('Enter account ID or address')}
        style={{ py: '15px', width: '50%' }}
      />
      <Typography fontSize='16px' fontWeight={400} width='100%'>
        {t<string>('Trusted friends accounts')}
      </Typography>
      <TrustedFriendsList
        api={api}
        chain={chain}
        friendsList={selectedFriendsToShow}
        onRemoveFriend={removeNewFriend}
        style={{ '> div': { px: '10px' }, m: '5px', minHeight: '230px', p: 0 }}
      />
      <Grid container item pb='15px' pt='10px'>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t<string>('Total deposit:')}
        </Typography>
        <Grid fontSize='20px' fontWeight={500} item lineHeight='22px' pl='5px'>
          <ShowBalance
            api={api}
            balance={totalDeposit}
            decimalPoint={4}
            height={22}
          />
        </Grid>
      </Grid>
    </>
  );

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
        {t<string>('Make your account recoverable')}
      </Typography>
      <Typography fontSize='14px' fontWeight={400} width='100%'>
        {t<string>('Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus.')}
      </Typography>
      <Typography fontSize='22px' fontWeight={700} pt='10px' width='100%'>
        {t<string>(stepTitle)}
      </Typography>
      {configStep === CONFIGSTEPS.SELECT_TRUSTED_FRIENDS &&
        <TrustedFriendsConfiguration />
      }
      {/* {configStep === CONFIGSTEPS.SET_DETAILS &&
        <RecoveryDetailsConfiguration />
      } */}
      <Grid container item justifyContent='flex-end'>
        <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
          <TwoButtons
            disabled={selectedFriends.length === 0}
            mt={'1px'}
            onPrimaryClick={goNext}
            onSecondaryClick={goBack}
            primaryBtnText={t<string>('Next')}
            secondaryBtnText={t<string>('Back')}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
