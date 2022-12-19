// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { AccountStakingInfo, Payee, SoloSettings, StakingConsts } from '../../../../util/types';

import { Grid } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { Motion, Popup } from '../../../../components';
import { useFormatted, useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { upperCaseFirstChar } from '../../../../util/utils';
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
  const [settings, setSettings] = useState<SoloSettings>();
  const [newSettings, setNewSettings] = useState<SoloSettings>({ controllerId: undefined, payee: undefined, stashId: undefined });
  const [showReview, setShowReview] = useState<boolean>(false);

  useEffect(() => {
    //initialize settings
    const parsedStakingAccount = JSON.parse(JSON.stringify(stakingAccount)) as AccountStakingInfo;
    const destinationType = Object.keys(parsedStakingAccount.rewardDestination)[0];
    let payee: Payee;

    if (destinationType === 'account') {
      payee = {
        Account: parsedStakingAccount.rewardDestination.account
      };
    } else {
      payee = upperCaseFirstChar(destinationType) as Payee;
    }

    setSettings({ controllerId: parsedStakingAccount?.controllerId || formatted, payee, stashId: parsedStakingAccount.stashId });
  }, [formatted, stakingAccount]);

  const onBackClick = useCallback(() => {
    setShowSettings(false);
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
          {settings &&
            <SetPayeeController
              address={address}
              buttonLabel={t('Next')}
              newSettings={newSettings}
              set={setNewSettings}
              setShow={setShowSettings}
              setShowReview={setShowReview}
              settings={settings}
              stakingConsts={stakingConsts}
            />}
        </Grid>
        {showReview && address && settings &&
          <Review
            address={address}
            api={api}
            newSettings={newSettings}
            setShow={setShowReview}
            settings={settings}
            show={showReview}
          />
        }
      </Popup>
    </Motion>
  );
}
