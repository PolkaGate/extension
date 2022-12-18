// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { AccountStakingInfo, SoloSettings, StakingConsts } from '../../../../util/types';

import { Grid } from '@mui/material';
import React, { useCallback, useState, useEffect } from 'react';

import { Motion, Popup } from '../../../../components';
import { useFormatted, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import SetPayeeController from '../stake/partials/SetPayeeController';
import Review from './Review';

interface Props {
  api: ApiPromise | undefined;
  address: string;
  showSettings: boolean
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>
  stakingConsts: StakingConsts | null | undefined;
  stakingAccount: AccountStakingInfo;
}

export default function Settings({ address, api, setShowSettings, showSettings, stakingAccount, stakingConsts }: Props): React.ReactElement {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const [settings, setSettings] = useState<SoloSettings>({ controllerId: formatted, payee: 'Staked', stashId: formatted });
  const [showReview, setShowReview] = useState<boolean>(false);

  // useEffect(() => {
  //   const destinationType = Object.keys(stakingAccount.rewardDestination)[0];
  //   let rewardDestinationAccountAddress;
  //   if(destinationType==='account'){
  //   rewardDestinationAccountAddress=stakingAccount.rewardDestination.account;
  // }else if(destinationType==='stash'){
  //   rewardDestinationAccountAddress=stakingAccount.stashId;
  // }else if(destinationType==='controller'){
  //   rewardDestinationAccountAddress=stakingAccount.controllerId;
  // }else{

  // }


  //   console.log('destinationType', destinationType)
  //   setSettings((pre) => {
  //     pre.controllerId = stakingAccount?.controllerId;
  //     pre.payee = destinationType==='account'?stakingAccount.rewardDestination.account

  //     return pre;
  //   })
  // }, [stakingAccount]);

  const onBackClick = useCallback(() => {
    setShowSettings(false)
  }, [setShowSettings]);

  return (
    <Motion>
      <Popup show={showSettings}>
        <HeaderBrand
          onBackClick={onBackClick}
          paddingBottom={0}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Solo Staking')}
        />
        <SubTitle label={t('Settings')} lineHeight='32px' />
        <Grid container sx={{ mt: '10px' }}>
          <SetPayeeController
            address={address}
            buttonLabel={t('Next')}
            setSettings={setSettings}
            setShow={setShowSettings}
            setShowReview={setShowReview}
            stakingConsts={stakingConsts}
            settings={settings}
          />
        </Grid>
        {showReview && address &&
          <Review
            address={address}
            api={api}
            setShow={setShowReview}
            settings={settings}
            show={showReview}
          />
        }
      </Popup>
    </Motion>
  );
}
