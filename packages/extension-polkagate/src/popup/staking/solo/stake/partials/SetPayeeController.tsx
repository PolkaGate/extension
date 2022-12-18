// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, SxProps, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { AccountId } from '@polkadot/types/interfaces/runtime';

import { AccountInputWithIdentity, PButton, Select, Warning } from '../../../../../components';
import { useChain, useDecimal, useToken, useTranslation } from '../../../../../hooks';
import { SoloSettings, StakingConsts } from '../../../../../util/types';
import { amountToHuman, isValidAddress } from '../../../../../util/utils';

interface Props {
  address: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setSettings: React.Dispatch<React.SetStateAction<SoloSettings>>;
  stakingConsts: StakingConsts | null | undefined;
  buttonLabel?: string;
  setShowReview?: React.Dispatch<React.SetStateAction<boolean>>;
  settings: SoloSettings;
}

export default function SetPayeeController({ address, buttonLabel, setSettings, setShow, setShowReview, settings, stakingConsts }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const chain = useChain(address);
  const token = useToken(address);
  const decimal = useDecimal(address);

  const [controllerId, setControllerId] = useState<AccountId | string | undefined>(settings.controllerId);
  const [rewardDestinationValue, setRewardDestinationValue] = useState<number>(settings.payee === 'Staked' ? 1 : 2);
  const [rewardDestinationAccount, setRewardDestinationAccount] = useState<string>(settings.payee?.Account);

  const REWARD_DESTINATIONS = [
    { text: t('Add to staked'), value: 1 },
    { text: t('Transfer to a specific account'), value: 2 }
  ];

  const ED = useMemo(() => stakingConsts?.existentialDeposit && decimal && amountToHuman(stakingConsts.existentialDeposit, decimal), [decimal, stakingConsts?.existentialDeposit]);
  const onSelectionMethodChange = useCallback((value: number): void => {
    setRewardDestinationValue(value);
  }, []);

  const onSet = useCallback(() => {
    setSettings((settings) => {
      settings.controllerId = controllerId;
      settings.payee = rewardDestinationValue === 1 ? 'Staked' : { Account: rewardDestinationAccount }; // TODO: change types accordingly

      return settings;
    });
    setShowReview && setShowReview(true);
    !setShowReview && setShow(false); // can be left open when settings accessed from home
  }, [controllerId, rewardDestinationAccount, rewardDestinationValue, setSettings, setShow, setShowReview]);

  const Warn = ({ text, style = {} }: { text: string, style?: SxProps }) => (
    <Grid container justifyContent='center' sx={style}>
      <Warning
        fontWeight={400}
        theme={theme}
      >
        {text}
      </Warning>
    </Grid>
  );

  return (
    <Grid container item>
      <AccountInputWithIdentity
        address={controllerId}
        chain={chain}
        label={t('Controller account')}
        setAddress={setControllerId}
        style={{ pt: '10px', px: '15px' }}
      />
      <Grid item mx='15px' width='100%'>
        <Select
          _mt='23px'
          defaultValue={REWARD_DESTINATIONS[0].value}
          label={'Reward destination'}
          onChange={onSelectionMethodChange}
          options={REWARD_DESTINATIONS}
        />
      </Grid>
      {rewardDestinationValue === 2 &&
        <>
          <AccountInputWithIdentity
            address={rewardDestinationAccount}
            chain={chain}
            label={t('Specific account')}
            setAddress={setRewardDestinationAccount}
            style={{ pt: '25px', px: '15px' }}
          />
          <Warn style={{ mt: '-20px' }} text={t<string>('The balance for the recipient must be at least {{ED}} in order to keep the amount.', { replace: { ED: `${ED} ${token}` } })} />
        </>
      }
      <PButton
        _onClick={onSet}
        disabled={!controllerId || (rewardDestinationValue === 2 && (!rewardDestinationAccount || !isValidAddress(rewardDestinationAccount)))}
        text={buttonLabel || t<string>('Set')}
      />
    </Grid>
  );
}
