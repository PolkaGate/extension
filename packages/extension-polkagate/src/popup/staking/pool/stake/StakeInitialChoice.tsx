// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';

import { faRightToBracket, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';
import { Balance } from '@polkadot/types/interfaces';

import { useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import { PoolStakingConsts } from '../../../../util/types';
import Option from '../../partial/StakingOption';

interface Props {
  api?: ApiPromise;
  address: string;
  consts?: PoolStakingConsts;
  balances: DeriveBalancesAll | undefined;
}

export default function StakeInitialChoice({ address, api, balances, consts }: Props): React.ReactElement {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();

  const [availableBalance, setAvailableBalance] = useState<Balance | undefined>();
  const [joinDisabled, setJoinDisabled] = useState<boolean>(true);
  const [createDisabled, setCreateDisabled] = useState<boolean>(true);
  const [createWarningText, setCreateWarningText] = useState<string | undefined>();
  const [joinWarningText, setJoinWarningText] = useState<string | undefined>();

  const backToIndex = useCallback(() => {
    history.push({
      pathname: `/pool/${address}`
    });
  }, [address, history]);

  const joinPool = useCallback(() => {
    history.push({
      pathname: `/pool/join/${address}`,
      state: { api, availableBalance, consts }
    });
  }, [address, api, availableBalance, history, consts]);

  const createPool = useCallback(() => {
    history.push({
      pathname: `/pool/create/${address}`,
      state: { api, availableBalance, consts }
    });
  }, [address, api, availableBalance, history, consts]);

  useEffect(() => {
    if (!balances) {
      return;
    }

    setAvailableBalance(balances.availableBalance);
  }, [balances]);

  useEffect(() => {
    if (!consts || !availableBalance) {
      return;
    }

    if (consts?.minJoinBond.gt(availableBalance)) {
      return setJoinWarningText(t<string>('You don’t have enough fund.'));
    }

    setJoinDisabled(false);
  }, [availableBalance, consts, t]);

  useEffect(() => {
    if (!consts || !availableBalance) {
      return;
    }

    if (consts.maxPools === consts.lastPoolId.toNumber()) {
      return setCreateWarningText(t<string>('Pools are full.'));
    }

    if (consts?.minCreationBond.gt(availableBalance)) {
      return setCreateWarningText(t<string>('You don’t have enough fund.'));
    }

    setCreateDisabled(false);
  }, [availableBalance, consts, t]);

  return (
    <>
      <HeaderBrand
        onBackClick={backToIndex}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle label={t('Stake')} />
      <Option
        api={api}
        balance={consts?.minJoinBond}
        balanceText={t<string>('Minimum to join')}
        buttonText={t<string>('Join')}
        isDisabled={joinDisabled}
        logo={
          <FontAwesomeIcon
            color={`${theme.palette.text.primary}`}
            fontSize='18px'
            icon={faRightToBracket}
          />
        }
        noToolTip
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
        balance={consts?.minCreationBond}
        balanceText={t<string>('Minimum to create')}
        buttonText={t<string>('Create')}
        isDisabled={createDisabled}
        logo={
          <FontAwesomeIcon
            color={`${theme.palette.text.primary}`}
            fontSize='18px'
            icon={faSquarePlus}
          />
        }
        noToolTip
        onClick={createPool}
        style={{
          m: 'auto',
          width: '92%'
        }}
        title={t<string>('Create Pool')}
        warningText={createWarningText}
      />
    </>
  );
}
