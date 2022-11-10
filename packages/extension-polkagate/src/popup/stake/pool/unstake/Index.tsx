// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveAccountRegistration, DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Option, StorageKey } from '@polkadot/types';
import type { AccountId32 } from '@polkadot/types/interfaces';
import type { AccountsBalanceType, MembersMapEntry, MyPoolInfo, NominatorInfo, PoolInfo, PoolStakingConsts, SavedMetaData, StakingConsts, Validators } from '../../../../util/types';

import { faHistory, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Container, Divider, Grid, IconButton, MenuItem, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { DeriveAccountInfo, DeriveStakingQuery } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { ActionContext, AmountWithOptions, FormatBalance, PButton, Popup, ShowBalance, ShowValue, Warning } from '../../../../components';
import { useApi, useApi2, useChain, useEndpoint, useFormatted, useMapEntries, useMetadata, usePool, usePoolConsts, useTranslation } from '../../../../hooks';
import { updateMeta } from '../../../../messaging';
import { HeaderBrand } from '../../../../partials';
import { DEFAULT_TOKEN_DECIMALS, FLOATING_POINT_DIGIT, MAX_AMOUNT_LENGTH } from '../../../../util/constants';
import { amountToHuman, amountToMachine, getSubstrateAddress, prepareMetaData } from '../../../../util/utils';
import { getValue } from '../../../account/util';
import Asset from '../../../send/partial/Asset';
import SubTitle from '../../../send/partial/SubTitle';

interface State {
  api: ApiPromise | undefined;
  backPath: string;
  showInfo: boolean;
  info: PoolStakingConsts;
  setShowInfo: React.Dispatch<React.SetStateAction<boolean>>
  myPool: MyPoolInfo | null | undefined
}

export default function Index(): React.ReactElement {
  const { t } = useTranslation();
  const { state } = useLocation<State>();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const history = useHistory();
  const api = useApi2(address, state?.api);
  const chain = useChain(address);
  const pool = usePool(address);
  const formatted = useFormatted(address);
  const consts = usePoolConsts(address, state?.consts);
  const [estimatedFee, setEstimatedFee] = useState<BN>();
  const [amount, setAmount] = useState<string>();
  const [alert, setAlert] = useState<string | undefined>();

  const myPool = (state?.myPool || pool);
  const staked = useMemo(() => myPool === undefined ? undefined : new BN(myPool?.member?.points ?? 0), [myPool]);
  const decimals = api?.registry?.chainDecimals[0] ?? DEFAULT_TOKEN_DECIMALS;
  const token = api?.registry?.chainTokens[0] ?? '...';

  const unlockingLen = myPool?.ledger?.unlocking?.length ?? 0;
  const maxUnlockingChunks = api && api.consts.staking.maxUnlockingChunks?.toNumber() as unknown as number;

  const unbonded = api && api.tx.nominationPools.unbond;
  const poolWithdrawUnbonded = api && api.tx.nominationPools.poolWithdrawUnbonded;

  useEffect(() => {
    if (!amount) {
      return;
    }

    const amountAsBN = new BN(parseFloat(parseFloat(amount).toFixed(FLOATING_POINT_DIGIT)) * 10 ** FLOATING_POINT_DIGIT).mul(new BN(10 ** (decimals - FLOATING_POINT_DIGIT)));

    if (amountAsBN.gt(staked ?? BN_ZERO)) {
      return setAlert(t('It is more than already staked.'));
    }

    if (api && staked && consts && staked.sub(amountAsBN).lt(consts.minJoinBond)) {
      const remained = api.createType('Balance', staked.sub(amountAsBN)).toHuman();
      const min = api.createType('Balance', consts.minJoinBond).toHuman();

      return setAlert(t('Remaining stake amount {{remained}} should not be less than {{min}} WND.', { replace: { min, remained } }));
    }

    setAlert(undefined);
  }, [amount, api, consts, decimals, staked, t]);

  useEffect(() => {
    const params = [formatted, amountToMachine(amount, decimals)];

    console.log('unlockingLen', unlockingLen); console.log('maxUnlockingChunks', maxUnlockingChunks);

    // eslint-disable-next-line no-void
    poolWithdrawUnbonded && maxUnlockingChunks && unlockingLen && unbonded && formatted && void unbonded(...params).paymentInfo(formatted).then((i) => {
      const fee = i?.partialFee;

      if (unlockingLen < maxUnlockingChunks) {
        setEstimatedFee(fee);
      } else {
        const dummyParams = [1, 1];

        // eslint-disable-next-line no-void
        void poolWithdrawUnbonded(...dummyParams).paymentInfo(formatted).then((j) => setEstimatedFee(api.createType('Balance', fee.add(j?.partialFee))));
      }
    });
  }, [amount, api, decimals, formatted, maxUnlockingChunks, poolWithdrawUnbonded, unbonded, unlockingLen]);

  const onBackClick = useCallback(() => {
    const backPath = state?.pathname ?? '/';

    history.push({
      pathname: backPath,
      state: { ...state }
    });
  }, [history, state]);

  const onChangeAmount = useCallback((value: string) => {
    if (value.length > decimals - 1) {
      console.log(`The amount digits is more than decimal:${decimals}`);

      return;
    }

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimals]);

  const setAllAmount = useCallback(() => {
    if (!staked) {
      return;
    }

    const allMaxAmount = amountToHuman(staked.toString(), decimals);

    setAmount(allMaxAmount);
  }, [decimals, staked]);

  const Warn = ({ text }: { text: string }) => (
    <Grid
      color='red'
      container
      justifyContent='center'
      py='15px'
    >
      <Warning
        fontWeight={400}
        isBelowInput
        isDanger
        theme={theme}
      >
        {text}
      </Warning>
    </Grid>
  );

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
      {staked?.isZero() &&
        <Warn text={t<string>('Nothing to unstake.')} />
      }
      <Grid item xs={12} sx={{ mx: '15px' }} >
        <Asset api={api} balance={staked} balanceLabel={t('Staked')} fee={estimatedFee} genesisHash={chain?.genesisHash} style={{ pt: '20px' }} />
        <div style={{ paddingTop: '30px' }}>
          <AmountWithOptions
            label={t<string>('Amount ({{token}})', { replace: { token } })}
            onChangeAmount={onChangeAmount}
            onPrimary={setAllAmount}
            primaryBtnText={t<string>('All amount')}
            value={amount}
          />
          {alert &&
            <Warn text={alert} />
          }
        </div>

      </Grid>
      <PButton
        // _onClick={_onSave}
        disabled={!amount || amount === '0'}
        text={t<string>('Next')}
      />
    </>
  );
}
