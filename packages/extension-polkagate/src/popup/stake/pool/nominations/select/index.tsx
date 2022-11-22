// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component opens unstake review page
 * */

import type { AccountId } from '@polkadot/types/interfaces';

import SearchIcon from '@mui/icons-material/Search';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';
import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { Chain } from '@polkadot/extension-chains/types';
import { Balance } from '@polkadot/types/interfaces';
import keyring from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import { AccountContext, ActionContext, Checkbox, Motion, PasswordWithUseProxy, PButton, Popup, ShowValue, Warning } from '../../../../../components';
import { useAccountName, useProxies, useTranslation } from '../../../../../hooks';
import { updateMeta } from '../../../../../messaging';
import { HeaderBrand, SubTitle, WaitScreen } from '../../../../../partials';
import Confirmation from '../../../../../partials/Confirmation';
import broadcast from '../../../../../util/api/broadcast';
import { DEFAULT_VALIDATOR_COMMISSION_FILTER } from '../../../../../util/constants';
import { AllValidators, MyPoolInfo, Proxy, ProxyItem, StakingConsts, TransactionDetail, TxInfo, ValidatorInfo } from '../../../../../util/types';
import { getSubstrateAddress, getTransactionHistoryFromLocalStorage, prepareMetaData } from '../../../../../util/utils';
import TxDetail from '../partials/TxDetail';
import ValidatorsTable from '../partials/ValidatorsTable';

interface Props {
  address: string;
  allValidatorsIdentities: DeriveAccountInfo[] | null | undefined
  api: ApiPromise;
  chain: Chain | null;
  formatted: string;
  title: string;
  poolId: BN | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  allValidatorsInfo: AllValidators | null | undefined
  selectedValidatorsId: AccountId[] | null | undefined
  stakingConsts: StakingConsts | undefined
  pool: MyPoolInfo | undefined;
}

interface Data {
  name: string;
  commission: number;
  nominator: number;
  staked: string;
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: ValidatorInfo, b: ValidatorInfo, orderBy: keyof T) {
  let A, B;

  switch (orderBy) {
    case ('commission'):
      A = a.validatorPrefs.commission;
      B = b.validatorPrefs.commission;
      break;
    case ('nominator'):
      A = a.exposure.others.length;
      B = b.exposure.others.length;
      break;
    default:
      A = a.accountId;
      B = b.accountId;
  }

  if (B < A) {
    return -1;
  }

  if (B > A) {
    return 1;
  }

  return 0;
}


function getComparator<T>(order: Order, orderBy: keyof T): (a: ValidatorInfo, b: ValidatorInfo) => number {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function SelectValidators({ address, allValidatorsIdentities, allValidatorsInfo, api, chain, formatted, pool, poolId, selectedValidatorsId, setShow, show, stakingConsts, title }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [idOnly, setIdOnly] = useState<boolean>();
  const [noMoreThan20Comm, setNoMoreThan20Comm] = useState<boolean>();
  const [noOversubscribed, setNoOversubscribed] = useState<boolean>();
  const [noWaiting, setNoWaiting] = useState<boolean>();
  const [validatorsToList, setValidatorsToList] = useState<ValidatorInfo[]>();
  const [selectedValidators, setSelectedValidators] = useState<ValidatorInfo[]>([]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Data>('name');

  useEffect(() => {
    if (!allValidatorsInfo || !allValidatorsIdentities) {
      return;
    }

    let filteredValidators = allValidatorsInfo.current.concat(allValidatorsInfo.waiting);

    // at first filtered blocked allValidatorsInfo
    filteredValidators = filteredValidators?.filter((v) => !v.validatorPrefs.blocked);

    filteredValidators = noWaiting ? filteredValidators?.filter((v) => v.exposure.others.length !== 0) : filteredValidators;
    filteredValidators = noOversubscribed ? filteredValidators?.filter((v) => v.exposure.others.length < stakingConsts?.maxNominatorRewardedPerValidator) : filteredValidators;
    filteredValidators = noMoreThan20Comm ? filteredValidators?.filter((v) => Number(v.validatorPrefs.commission) / (10 ** 7) <= DEFAULT_VALIDATOR_COMMISSION_FILTER) : filteredValidators;

    if (idOnly && allValidatorsIdentities) {
      filteredValidators = filteredValidators?.filter((v) =>
        allValidatorsIdentities.find((i) => i.accountId === v.accountId && (i.identity.display || i.identity.displayParent)));
    }

    // remove filtered validators from the selected list
    const selectedTemp = [...selectedValidators];

    selectedValidators?.forEach((s, index) => {
      if (!filteredValidators.find((f) => f.accountId === s.accountId)) {
        selectedTemp.splice(index, 1);
      }
    });
    setSelectedValidators([...selectedTemp]);

    selectedTemp.sort(getComparator(order, orderBy));
    filteredValidators.sort(getComparator(order, orderBy));

    setValidatorsToList(selectedTemp.concat(filteredValidators));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stakingConsts, allValidatorsInfo, allValidatorsIdentities, noWaiting, noOversubscribed, noMoreThan20Comm, idOnly, order, orderBy]);

  const _onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const handleRequestSort = (_event: React.MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === 'asc';

    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          onBackClick={_onBackClick}
          shortBorder
          showBackArrow
          showClose
          text={title}
          withSteps={{
            current: 1,
            total: 2
          }}
        />
        <Grid container sx={{ justifyContent: 'center', p: '10px 15px' }}>
          <Grid container fontSize='14px' fontWeight='400' item pb='15px'>
            <Checkbox
              label={t<string>('ID only')}
              onChange={() => setIdOnly(!idOnly)}
              style={{ pb: '5px', width: '30%' }}
              theme={theme}
            />
            <Checkbox
              label={t<string>('No more than 20 Commission')}
              onChange={() => setNoMoreThan20Comm(!noMoreThan20Comm)}
              style={{ width: '70%' }}
              theme={theme}
            />
            <Checkbox
              label={t<string>('No oversubscribed')}
              onChange={() => setNoOversubscribed(!noOversubscribed)}
              style={{ width: '50%' }}
              theme={theme}
            />
            <Checkbox
              label={t<string>('No waiting')}
              onChange={() => setNoWaiting(!noWaiting)}
              style={{ width: '40%' }}
              theme={theme}
            />
            <SearchIcon sx={{ color: 'secondary.light', width: '10%' }} />
          </Grid>
          <Grid item xs={12}>
            {validatorsToList &&
              <ValidatorsTable
                api={api}
                chain={chain}
                selectedValidatorsId={selectedValidatorsId}
                showCheckbox
                staked={new BN(pool?.ledger?.active ?? 0)}
                stakingConsts={stakingConsts}
                validatorsToList={validatorsToList}
              />
            }
          </Grid>


        </Grid>
        <PButton
          // _onClick={remove}
          // disabled={!password}
          text={t<string>('Confirm')}
        />
      </Popup>
    </Motion>
  );
}
