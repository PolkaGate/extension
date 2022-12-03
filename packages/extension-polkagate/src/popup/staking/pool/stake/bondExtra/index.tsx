// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, PButton } from '../../../../../components';
import { useAccount, useChain, useTranslation } from '../../../../../hooks';
import { HeaderBrand, SubTitle } from '../../../../../partials';
import { DEFAULT_TOKEN_DECIMALS, MAX_AMOUNT_LENGTH } from '../../../../../util/constants';
import { MyPoolInfo } from '../../../../../util/types';
import { amountToHuman } from '../../../../../util/utils';
import Asset from '../../../../send/partial/Asset';
import ShowPool from '../../../partial/ShowPool';
import Review from './Review';

interface Props {
  api?: ApiPromise;
  address: string;
  balances?: DeriveBalancesAll | undefined;
  formatted?: string;
  pool: MyPoolInfo;
}

export default function BondExtra({ address, api, balances, formatted, pool }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useAccount(address);
  const chain = useChain(address);
  const history = useHistory();

  const [availableBalance, setAvailableBalance] = useState<Balance | undefined>();
  const [bondAmount, setBondAmount] = useState<string | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance | undefined>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance | undefined>();
  const [nextBtnDisabled, setNextBtnDisabled] = useState<boolean>(true);
  const [showReview, setShowReview] = useState<boolean>(false);

  const decimals = api?.registry?.chainDecimals[0] ?? DEFAULT_TOKEN_DECIMALS;
  const token = api?.registry?.chainTokens[0] ?? '...';
  const amountAsBN = useMemo(() => new BN(parseFloat(bondAmount ?? '0') * 10 ** decimals), [decimals, bondAmount]);

  const onBackClick = useCallback(() => {
    history.push({
      pathname: `/pool/${address}`,
      state: { api, pool }
    });
  }, [address, api, history, pool]);

  const onMaxAmount = useCallback(() => {
    if (!api || !availableBalance || !estimatedMaxFee) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(availableBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedMaxFee));
    const maxToHuman = amountToHuman(max.toString(), decimals);

    maxToHuman && setBondAmount(maxToHuman);
  }, [api, availableBalance, decimals, estimatedMaxFee]);

  const toReview = useCallback(() => {
    setShowReview(!showReview);
  }, [showReview]);

  const bondAmountChange = useCallback((value: string) => {
    if (value.length > decimals - 1) {
      console.log(`The amount digits is more than decimal:${decimals}`);

      return;
    }

    setBondAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimals]);

  useEffect(() => {
    if (!balances) {
      return;
    }

    setAvailableBalance(balances.availableBalance);
  }, [balances]);

  useEffect(() => {
    if (!api || !availableBalance || !formatted) { return; }

    if (!api?.call?.transactionPaymentApi) {
      return setEstimatedFee(api.createType('Balance', BN_ONE));
    }

    amountAsBN && api.tx.nominationPools.bondExtra({ FreeBalance: amountAsBN.toString() }).paymentInfo(formatted).then((i) => {
      setEstimatedFee(api.createType('Balance', i?.partialFee));
    });

    amountAsBN && api.tx.nominationPools.bondExtra({ FreeBalance: availableBalance.toString() }).paymentInfo(formatted).then((i) => {
      setEstimatedMaxFee(api.createType('Balance', i?.partialFee));
    });
  }, [formatted, api, availableBalance, bondAmount, decimals, amountAsBN]);

  useEffect(() => {
    if (!bondAmount || !amountAsBN || !api) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const isAmountInRange = amountAsBN.gt(availableBalance?.sub(ED.muln(2)).sub(estimatedMaxFee ?? BN_ZERO) ?? BN_ZERO);

    setNextBtnDisabled(!(bondAmount && bondAmount !== '0' && !isAmountInRange) && !pool);
  }, [amountAsBN, availableBalance, decimals, estimatedMaxFee, bondAmount, api, pool]);

  return (
    <>
      <HeaderBrand
        onBackClick={onBackClick}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pool Staking')}
      />
      <SubTitle label={t<string>('Stake')} />
      <Asset
        api={api}
        balance={availableBalance}
        balanceLabel={t<string>('Available balance')}
        fee={estimatedFee}
        genesisHash={account?.genesisHash}
        style={{
          m: '20px auto',
          width: '92%'
        }}
      />
      <AmountWithOptions
        label={t<string>(`Amount (${token ?? '...'})`)}
        onChangeAmount={bondAmountChange}
        onPrimary={onMaxAmount}
        primaryBtnText={t<string>('Max amount')}
        style={{
          m: 'auto',
          width: '92%'
        }}
        value={bondAmount}
      />
      <ShowPool
        api={api}
        chain={chain}
        label={t<string>('Pool')}
        mode='Default'
        pool={pool}
        showInfo
        style={{
          m: '20px auto 0',
          width: '92%'
        }}
      />
      <PButton _onClick={toReview} disabled={nextBtnDisabled} text={t<string>('Next')} />
      {showReview &&
        <Review
          address={address}
          api={api}
          bondAmount={amountAsBN}
          estimatedFee={estimatedFee}
          pool={pool}
          setShowReview={setShowReview}
          showReview={showReview}
        />
      }
    </>
  );
}
