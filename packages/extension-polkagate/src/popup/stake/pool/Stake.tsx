// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { Popup, Warning } from '../../../components';
import { useTranslation } from '../../../hooks';
import { HeaderBrand } from '../../../partials';
import { PoolStakingConsts } from '../../../util/types';
import Option from '../partial/Option';
import JoinPool from './joinPool/JoinPool'
import { Grid, useTheme } from '@mui/material';

interface Props {
  api?: ApiPromise;
  showStake: boolean;
  setShowStake: React.Dispatch<React.SetStateAction<boolean>>;
  info?: PoolStakingConsts;
}

export default function Stake({ api, showStake, info }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [showJoinPool, setShowJoinPool] = useState<boolean>(false);

  const [notEnoughFund, setNotEnoughFund] = useState<boolean>(false);
  const [joinDisabled, setJoinDisabled] = useState<boolean>(false);
  const [createDisabled, setCreateDisabled] = useState<boolean>(false);
  const [warningText, setWarningText] = useState<string | undefined>();
  const [joinWarningText, setJoinWarningText] = useState<string | undefined>();

  // const backToIndex = useCallback(() => {
  //   history.push({
  //     pathname: `/pool/${genesisHash}/${formatted}/`,
  //     state: { api: apiToUse, pathname }
  //   });
  // }, []);

  const joinPool = useCallback(() => {
    setShowJoinPool(true)
  }, []);

  const createPool = useCallback(() => {
    console.log('create pool');
  }, []);

  return (
    <Popup show={showStake}>
      <HeaderBrand
        // onBackClick={backToIndex}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      {notEnoughFund &&
        <Grid
          color='red'
          container
          height='30px'
          item
          justifyContent='center'
          mb='5px'
          mt='10px'
        >
          <Warning
            fontWeight={400}
            isBelowInput
            isDanger
            theme={theme}
          >
            {t<string>('You don’t have enough fund.')}
          </Warning>
        </Grid>
      }
      <Option
        api={api}
        balance={info?.minJoinBond}
        balanceText={t<string>('Minimum to join')}
        buttonText={t<string>('Join')}
        isDisabled={joinDisabled}
        onClick={joinPool}
        style={{
          m: '20px auto',
          width: '92%'
        }}
        title={t<string>('Join Pool')}
        warningText={joinWarningText}
      />
      <Option
        api={api}
        balance={info?.minCreateBond}
        balanceText={t<string>('Minimum to create')}
        buttonText={t<string>('Create')}
        isDisabled={createDisabled}
        onClick={createPool}
        style={{
          m: 'auto',
          width: '92%'
        }}
        title={t<string>('Create Pool')}
        warningText={warningText}
      />
      <JoinPool setShowJoinPool={setShowJoinPool} showJoinPool={showJoinPool} />
    </Popup>
  );
}
