// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountRegistration, DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Option, StorageKey } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { AccountsBalanceType, MembersMapEntry, MyPoolInfo, NominatorInfo, PoolInfo, PoolStakingConsts, SavedMetaData, StakingConsts, Validators } from '../../../util/types';

import { faHistory, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Container, Divider, Grid, IconButton, MenuItem, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useLocation, useHistory } from 'react-router-dom';

import { DeriveAccountInfo, DeriveStakingQuery } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_ZERO, bnMax } from '@polkadot/util';

import { ActionContext, FormatBalance, PButton, Popup, ShowBalance, ShowValue } from '../../../../components';
import { useApi, useEndpoint, useMapEntries, useMetadata, useTranslation } from '../../../../hooks';
import { updateMeta } from '../../../../messaging';
import { HeaderBrand } from '../../../../partials';
import { getSubstrateAddress, prepareMetaData } from '../../../../util/utils';
import { getValue } from '../../../account/util';
import SubTitle from '../../../send/partial/SubTitle';

interface Props {
  api: ApiPromise | undefined;
  backPath: string;
  showInfo: boolean;
  info: PoolStakingConsts;
  setShowInfo: React.Dispatch<React.SetStateAction<boolean>>

}

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const { state } = useLocation();
  const history = useHistory();
  const onAction = useContext(ActionContext);

  const onBackClick = useCallback(() => {
    const backPath = state?.pathname ?? '/';

    history.push({
      pathname: backPath,
      state: { ...state }
    });
  }, [history, state]);

  return (
    < >
      <HeaderBrand
        onBackClick={onBackClick}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle label={t('Unstake')} />
    </>
  );
}
