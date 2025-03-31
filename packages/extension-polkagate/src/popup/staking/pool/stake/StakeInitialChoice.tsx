// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { PoolStakingConsts } from '../../../../util/types';

import { faRightToBracket, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useTranslation } from '../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../partials';
import Option from '../../partial/StakingOption';

interface Props {
  api?: ApiPromise;
  address: string;
  consts?: PoolStakingConsts;
  balances: DeriveBalancesAll | undefined;
}

export default function StakeInitialChoice ({ address, api, balances, consts }: Props): React.ReactElement {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();

  const freeBalance = balances?.freeBalance;
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
      state: { api, availableBalance: freeBalance, consts }
    });
  }, [address, api, freeBalance, history, consts]);

  const createPool = useCallback(() => {
    history.push({
      pathname: `/pool/create/${address}`,
      state: { api, availableBalance: freeBalance, consts }
    });
  }, [address, api, freeBalance, history, consts]);

  useEffect(() => {
    if (!consts || !freeBalance) {
      return;
    }

    if (consts?.minJoinBond.gt(freeBalance)) {
      return setJoinWarningText(t<string>('You don’t have enough fund.'));
    }

    setJoinDisabled(false);
  }, [freeBalance, consts, t]);

  useEffect(() => {
    if (!consts || !freeBalance) {
      return;
    }

    if (consts.maxPools === consts.lastPoolId.toNumber()) {
      return setCreateWarningText(t<string>('Pools are full.'));
    }

    if (consts?.minCreationBond.gt(freeBalance)) {
      return setCreateWarningText(t<string>('You don’t have enough fund.'));
    }

    setCreateDisabled(false);
  }, [freeBalance, consts, t]);

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
