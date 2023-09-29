// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';

import { Input, MakeRecoverableIcon, Select, ShowBalance, TwoButtons } from '../../components';
import { useAccountsInfo, useChain, useFormatted, useTranslation } from '../../hooks';
import SelectTrustedFriend, { AddressWithIdentity } from './components/SelectTrustedFriend';
import SelectTrustedFriendFromExtension from './components/SelectTrustedFriendFromExtension';
import TrustedFriendsList from './partial/TrustedFriendsList';
import { RecoveryConfigType, SocialRecoveryModes } from './util/types';
import { STEPS } from '.';

interface Props {
  address: string | undefined;
  api: ApiPromise | undefined;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  mode: SocialRecoveryModes;
  setMode: React.Dispatch<React.SetStateAction<SocialRecoveryModes>>;
  setRecoveryConfig: React.Dispatch<React.SetStateAction<RecoveryConfigType | null>>;
  recoveryConfig: RecoveryConfigType | null;
  setTotalDeposit: React.Dispatch<React.SetStateAction<BN>>;
}

const CONFIG_STEPS = {
  SELECT_TRUSTED_FRIENDS: 1,
  SET_DETAILS: 2
};

const UNITS = {
  BLOCK: 1,
  HOUR: 2,
  DAY: 3,
  WEEK: 4,
  MONTH: 5
};

const BLOCKS_PER_HOUR = 600;

export default function RecoveryConfig({ address, api, mode, recoveryConfig, setMode, setRecoveryConfig, setStep, setTotalDeposit }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const accountsInfo = useAccountsInfo(api, chain);
  const formatted = useFormatted(address);

  const recoveryDelayLengthOptions = useMemo(() => ([
    { text: 'Blocks', value: UNITS.BLOCK },
    { text: 'Hours', value: UNITS.HOUR },
    { text: 'Days', value: UNITS.DAY },
    { text: 'Weeks', value: UNITS.WEEK },
    { text: 'Months', value: UNITS.MONTH }
  ]), []);

  const [configStep, setConfigStep] = useState<number>((!mode || mode === 'ModifyRecovery') ? CONFIG_STEPS.SELECT_TRUSTED_FRIENDS : CONFIG_STEPS.SET_DETAILS);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedFriendsToShow, setSelectedFriendsToShow] = useState<AddressWithIdentity[]>([]);
  const [recoveryThreshold, setRecoveryThreshold] = useState<number>();
  const [delayNumber, setDelayNumber] = useState<number>();
  const [delayUnit, setDelayUnit] = useState<number>(recoveryDelayLengthOptions[2].value);
  const [totalDelay, setTotalDelay] = useState<number>();
  const [focusInputs, setFocus] = useState<number>(1);

  const stepTitle = useMemo(() => configStep === CONFIG_STEPS.SELECT_TRUSTED_FRIENDS ? 'Step 1 of 3: Choose trusted friends' : 'Step 2 of 3: Set details', [configStep]);
  const configDepositBase = useMemo(() => api ? api.consts.recovery.configDepositBase as unknown as BN : BN_ZERO, [api]);
  const friendDepositFactor = useMemo(() => api ? api.consts.recovery.friendDepositFactor as unknown as BN : BN_ZERO, [api]);
  const totalDeposit = useMemo(() => configDepositBase.add(friendDepositFactor.muln(selectedFriends.length)), [configDepositBase, friendDepositFactor, selectedFriends.length]);
  const maxFriends = useMemo(() => api ? Number(api.consts.recovery.maxFriends.toString()) : 0, [api]);

  const nextBtnDisable = useMemo(() => (configStep === 1
    ? selectedFriends.length === 0
    : (delayNumber === undefined || totalDelay === undefined || recoveryThreshold === undefined || !recoveryConfig)
  ), [configStep, recoveryConfig, delayNumber, totalDelay, recoveryThreshold, selectedFriends.length]);

  useEffect(() => {
    if (recoveryConfig && selectedFriends.length === 0 && selectedFriendsToShow.length === 0 && totalDelay === undefined && recoveryThreshold === undefined) {
      setSelectedFriends(recoveryConfig.friends.addresses);
      setSelectedFriendsToShow(recoveryConfig.friends.addresses.map((friend, index) => ({
        accountIdentity: recoveryConfig.friends.infos ? recoveryConfig.friends.infos[index] : undefined,
        address: friend
      })));
      setRecoveryThreshold(recoveryConfig.threshold);
    }
  }, [recoveryConfig, totalDelay, recoveryThreshold, selectedFriends, selectedFriendsToShow]);

  useEffect(() => {
    if (!selectedFriends || selectedFriends.length === 0 || recoveryThreshold === undefined || totalDelay === undefined || totalDeposit.isZero()) {
      return;
    }

    setTotalDeposit(totalDeposit);

    setRecoveryConfig({
      delayPeriod: totalDelay,
      friends: {
        addresses: selectedFriendsToShow.map((friend) => friend.address),
        infos: selectedFriendsToShow.map((friend) => friend.accountIdentity)
      },
      threshold: recoveryThreshold
    });
  }, [totalDelay, recoveryThreshold, selectedFriends, selectedFriendsToShow, setRecoveryConfig, setTotalDeposit, totalDeposit]);

  useEffect(() => {
    if (delayUnit === undefined || delayNumber === undefined) {
      return;
    }

    switch (delayUnit) {
      case UNITS.BLOCK:
        setTotalDelay(delayNumber);
        break;
      case UNITS.HOUR:
        setTotalDelay(delayNumber * BLOCKS_PER_HOUR);
        break;
      case UNITS.DAY:
        setTotalDelay(delayNumber * BLOCKS_PER_HOUR * 24);
        break;
      case UNITS.WEEK:
        setTotalDelay(delayNumber * BLOCKS_PER_HOUR * 24 * 7);
        break;
      case UNITS.MONTH:
        setTotalDelay(delayNumber * BLOCKS_PER_HOUR * 24 * 30);
        break;

      default:
        setTotalDelay(0);
        break;
    }
  }, [delayUnit, delayNumber]);

  const addNewFriend = useCallback((addr: AddressWithIdentity | undefined) => {
    if (!addr || !formatted) {
      return;
    }

    const alreadyAdded = selectedFriends.find((selectedFriend) => selectedFriend === addr.address);
    const lostAsFriend = addr.address === formatted;

    if (alreadyAdded || lostAsFriend || selectedFriends.length === maxFriends) {
      return;
    }

    setSelectedFriends((pervFriends) => [...pervFriends, addr.address]);
    setSelectedFriendsToShow((pervFriendsToShow) => [...pervFriendsToShow, addr]);
  }, [formatted, maxFriends, selectedFriends]);

  const removeNewFriend = useCallback((addr: AddressWithIdentity) => {
    setSelectedFriends((prevFriends) => {
      const updatedFriends = prevFriends.filter((pervFriend) => pervFriend !== addr.address);

      return updatedFriends;
    });

    setSelectedFriendsToShow((prevFriendsToShow) => {
      const updatedFriendsToShow = prevFriendsToShow.filter((pervFriendToShow) => pervFriendToShow.address !== addr.address);

      return updatedFriendsToShow;
    });
  }, []);

  const onChangeThreshold = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const enteredValue = event.target.value;
    const integerValue = parseInt(enteredValue, 10);

    if (!isNaN(integerValue)) {
      setRecoveryThreshold(integerValue > selectedFriends.length ? selectedFriends.length : integerValue);
    } else {
      setRecoveryThreshold(undefined);
    }
  }, [selectedFriends.length]);

  const onChangeDelayNumber = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const enteredValue = event.target.value;
    const integerValue = parseInt(enteredValue, 10);

    if (!isNaN(integerValue)) {
      setDelayNumber(integerValue);
    } else {
      setDelayNumber(undefined);
    }
  }, []);

  const onChangeDelayLength = useCallback((type: string | number): void => {
    setDelayUnit(type as number);
  }, []);

  const goBack = useCallback(() => {
    if (configStep === CONFIG_STEPS.SELECT_TRUSTED_FRIENDS && mode === 'ModifyRecovery') {
      setStep(STEPS.RECOVERY_DETAIL);
    } else if (configStep === CONFIG_STEPS.SELECT_TRUSTED_FRIENDS) {
      setStep(STEPS.INDEX);
      setMode(undefined);
    } else if (configStep === CONFIG_STEPS.SET_DETAILS) {
      setConfigStep(CONFIG_STEPS.SELECT_TRUSTED_FRIENDS);
      // setMode(undefined);
    }
  }, [configStep, mode, setMode, setStep]);

  const goNext = useCallback(() => {
    if (configStep === CONFIG_STEPS.SELECT_TRUSTED_FRIENDS && !mode) {
      setConfigStep(CONFIG_STEPS.SET_DETAILS);
      setMode('SetRecovery');
    } else if (configStep === CONFIG_STEPS.SELECT_TRUSTED_FRIENDS && mode === 'ModifyRecovery') {
      setConfigStep(CONFIG_STEPS.SET_DETAILS);
    } else if (configStep === CONFIG_STEPS.SET_DETAILS) {
      setStep(STEPS.REVIEW);
    }
  }, [configStep, mode, setMode, setStep]);

  const thresholdFocus = useCallback(() => setFocus(1), []);
  const delayFocus = useCallback(() => setFocus(2), []);

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      <Grid alignContent='center' alignItems='center' container item>
        <Grid item sx={{ mr: '20px' }}>
          <MakeRecoverableIcon
            fillColor={theme.palette.text.primary}
            height={43}
            width={43}
          />
        </Grid>
        <Grid item>
          <Typography fontSize='30px' fontWeight={700} py='20px' width='100%'>
            {mode === 'ModifyRecovery'
              ? t<string>('Modify your account recoverability')
              : t<string>('Make your account recoverable')
            }
          </Typography>
        </Grid>
      </Grid>
      <Typography fontSize='22px' fontWeight={700} pt='10px' width='100%'>
        {t<string>(stepTitle)}
      </Typography>
      {configStep === CONFIG_STEPS.SELECT_TRUSTED_FRIENDS &&
        <>
          <Typography fontSize='14px' fontWeight={400} width='100%'>
            {t<string>('You can find trusted friends accounts to add to the list or/and add from those ones that are available on your extension.')}
          </Typography>
          <Grid container item justifyContent='space-between' py='15px'>
            <SelectTrustedFriend
              accountsInfo={accountsInfo}
              api={api}
              chain={chain}
              disabled={false}
              helperText={t<string>('Find your trusted friend\'s account by entering their address or any associated identity details, such as their name, email, Twitter, etc.')}
              label={t<string>('Find trusted friends accounts')}
              onSelectFriend={addNewFriend}
              placeHolder={t<string>('Enter account ID or address')}
              style={{ width: '48%' }}
            />
            <SelectTrustedFriendFromExtension
              accountsInfo={accountsInfo}
              address={address}
              api={api}
              chain={chain}
              onSelectFriend={addNewFriend}
              style={{ width: '48%' }}
            />
          </Grid>
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
      }
      {configStep === CONFIG_STEPS.SET_DETAILS &&
        <>
          <Typography fontSize='14px' fontWeight={400} width='100%'>
            {t<string>('Define the vouching amount needed for account recovery and set a safety delay. This delay adds a waiting period after acquiring the required vouches, allowing time for monitoring and alert response, particularly useful in countering potential malicious recovery attempts.')}
          </Typography>
          <Grid container item pt='20px'>
            <Typography fontSize='16px' fontWeight={400} width='100%'>
              {t<string>('Recovery Threshold')}
            </Typography>
            <Grid alignItems='center' container item>
              <Grid container item width='55px'>
                <Input
                  autoCapitalize='off'
                  autoCorrect='off'
                  autoFocus={focusInputs === 1}
                  onChange={onChangeThreshold}
                  onFocus={thresholdFocus}
                  spellCheck={false}
                  style={{
                    fontSize: '18px',
                    fontWeight: 300,
                    padding: 0,
                    paddingLeft: '10px'
                  }}
                  theme={theme}
                  type='number'
                  value={recoveryThreshold}
                />
              </Grid>
              <Typography fontSize='14px' fontWeight={400} px='8px'>
                {t<string>('of')}
              </Typography>
              <Typography fontSize='16px' fontWeight={400} lineHeight='30px' sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', height: '31px', width: '55px' }} textAlign='center'>
                {selectedFriends.length}
              </Typography>
            </Grid>
          </Grid>
          <Grid container item pt='20px'>
            <Typography fontSize='16px' fontWeight={400} width='100%'>
              {t<string>('Recovery Delay')}
            </Typography>
            <Grid alignItems='center' container item>
              <Grid container item width='55px'>
                <Input
                  autoCapitalize='off'
                  autoCorrect='off'
                  autoFocus={focusInputs === 2}
                  onChange={onChangeDelayNumber}
                  onFocus={delayFocus}
                  spellCheck={false}
                  style={{
                    fontSize: '18px',
                    fontWeight: 300,
                    padding: 0,
                    paddingLeft: '10px'
                  }}
                  theme={theme}
                  type='number'
                  value={delayNumber}
                />
              </Grid>
              <Grid container item ml='10px' width='125px'>
                <Select
                  defaultValue={recoveryDelayLengthOptions[2].value}
                  label=''
                  onChange={onChangeDelayLength}
                  options={recoveryDelayLengthOptions}
                  value={delayUnit || recoveryDelayLengthOptions[2].value}
                />
              </Grid>
            </Grid>
          </Grid>
        </>
      }
      <Grid container item justifyContent='flex-end'>
        <Grid container item sx={{ '> div': { m: 0, width: '100%' } }} xs={7}>
          <TwoButtons
            disabled={nextBtnDisable}
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
