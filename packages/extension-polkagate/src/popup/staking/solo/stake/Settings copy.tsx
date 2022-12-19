// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Divider, Grid, IconButton, SxProps, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { AccountInputWithIdentity, PButton, Select, SlidePopUp, Warning } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import { SoloSettings, StakingConsts } from '../../../../util/types';
import { amountToHuman, isValidAddress } from '../../../../util/utils';

interface Props {
  chain: Chain | null;
  showAdvanceSettings: boolean;
  setShowAdvanceSettings: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setSettings: React.Dispatch<React.SetStateAction<SoloSettings>>;
  stakingConsts: StakingConsts | null | undefined;
  decimal: number | undefined;
  token: string | undefined;
}

export default function Settings({ chain, decimal, setSettings, setShowAdvanceSettings, showAdvanceSettings, stakingConsts, token }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const [controllerId, setControllerId] = useState<AccountId | string | undefined>();
  const [rewardDestinationValue, setRewardDestinationValue] = useState<number>(1);
  const [rewardDestinationAccount, setRewardDestinationAccount] = useState<string>();

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
    setShowAdvanceSettings(false);
  }, [controllerId, rewardDestinationAccount, rewardDestinationValue, setSettings, setShowAdvanceSettings]);

  const onClose = useCallback(() =>
    setShowAdvanceSettings(false)
  , [setShowAdvanceSettings]);

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

  const page = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' mb='20px' mt='40px'>
        <Typography fontSize='16px' fontWeight={400} sx={{ width: '100%', textAlign: 'center' }}>
          {t<string>('Solo Staking')}
        </Typography>
        <br />
        <Typography fontSize='22px' fontWeight={400} sx={{ width: '100%', textAlign: 'center' }}>
          {t<string>('Advanced settings')}
        </Typography>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
      </Grid>
      <AccountInputWithIdentity
        address={controllerId}
        chain={chain}
        label={t('Controller account')}
        setAddress={setControllerId}
        style={{ pt: '10px', px: '15px' }}
      />
      <Grid item mx='15px'>
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
        text={t<string>('Set')}
      />
      <IconButton
        onClick={onClose}
        sx={{
          left: '15px',
          p: 0,
          position: 'absolute',
          top: '65px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <SlidePopUp show={showAdvanceSettings}>
      {page}
    </SlidePopUp>
  );
}
