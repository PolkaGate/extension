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
import { AllValidators, MyPoolInfo, Proxy, ProxyItem, StakingConsts, TransactionDetail, TxInfo, ValidatorInfo } from '../../../../../util/types';
import { getSubstrateAddress, getTransactionHistoryFromLocalStorage, prepareMetaData } from '../../../../../util/utils';
import TxDetail from '../partials/TxDetail';
import ValidatorsTable from '../partials/ValidatorsTable';

interface Props {
  address: string;
  api: ApiPromise;
  chain: Chain | null;
  formatted: string;
  title: string;
  poolId: BN | undefined;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  show: boolean;
  validatorsToList: ValidatorInfo[] | null | undefined
  selectedValidatorsId: AccountId[] | null | undefined
  stakingConsts: StakingConsts | undefined
  pool: MyPoolInfo | undefined;
}

export default function SelectValidators({ address, validatorsToList, api, chain, formatted, pool, poolId, selectedValidatorsId, setShow, show, stakingConsts, title }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [filteredValidatorList, setFilteredValidatorList] = useState<ValidatorInfo[] | null | undefined>();
  const [idOnly, setIdOnly] = useState<boolean>();
  const [noMoreThan20Comm, setNoMoreThan20Comm] = useState<boolean>();
  const [noOversubscribed, setNoOversubscribed] = useState<boolean>();
  const [noWaiting, setNoWaiting] = useState<boolean>();

  useEffect(() => {
    let list = validatorsToList;

    if (idOnly) {
      list = list?.filter((v) => v.accountInfo?.identity.display);
    }

    setFilteredValidatorList(list);
  }, [idOnly, validatorsToList]);

  const _onBackClick = useCallback(() => {
    setShow(false);
  }, [setShow]);

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
          <Grid container item fontSize='14px' fontWeight='400' pb='15px'>
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
                validatorsToList={filteredValidatorList}
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
