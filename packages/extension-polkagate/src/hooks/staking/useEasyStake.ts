// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { SelectedEasyStakingType } from '../../fullscreen/stake/util/utils';
import type { Content } from '../../partials/Review';

import { People, UserOctagon } from 'iconsax-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BN_MAX_INTEGER, BN_ZERO } from '@polkadot/util';

import { EasyStakeSide } from '../../fullscreen/stake/util/utils';
import { POLKAGATE_POOL_IDS } from '../../util/constants';
import { amountToMachine } from '../../util/utils';
import useAccountAssets from '../useAccountAssets';
import useChainInfo from '../useChainInfo';
import useEstimatedFee2 from '../useEstimatedFee2';
import useFormatted3 from '../useFormatted3';
import usePool2 from '../usePool2';
import usePoolConst from '../usePoolConst';
import useStakingConsts2 from '../useStakingConsts2';

const useEasyStake = (
  address: string | undefined,
  genesisHash: string | undefined
) => {
  const MAX_LETTER_THRESHOLD = 35;

  const { t } = useTranslation();
  const { api, chainName, decimal } = useChainInfo(genesisHash);
  const accountAssets = useAccountAssets(address);
  const poolStakingConsts = usePoolConst(genesisHash);
  const stakingConsts = useStakingConsts2(genesisHash);
  const formatted = useFormatted3(address, genesisHash);

  const bond = api?.tx['staking']['bond'];// (value: Compact<u128>, payee: PalletStakingRewardDestination)
  const batchAll = api?.tx['utility']['batchAll'];
  const nominated = api?.tx['staking']['nominate'];
  const join = api?.tx['nominationPools']['join']; // (amount, poolId)

  const polkagatePool = useMemo(() => chainName ? POLKAGATE_POOL_IDS[chainName] : undefined, [chainName]);

  const initialPool = usePool2(address, polkagatePool ? genesisHash : undefined, polkagatePool);

  const [amount, setAmount] = useState<string | undefined>(undefined);
  const [amountAsBN, setAmountAsBN] = useState<BN | undefined>(undefined);
  const [topStakingLimit, setTopStakingLimit] = useState<BN | undefined>(undefined);
  const [side, setSide] = useState<EasyStakeSide>(EasyStakeSide.INPUT);
  const [selectedStakingType, setSelectedStakingType] = useState<SelectedEasyStakingType | undefined>(undefined);

  useEffect(() => {
    if (selectedStakingType || !initialPool) {
      return;
    }

    setSelectedStakingType({
      pool: initialPool,
      type: 'pool',
      validators: undefined
    });
  }, [initialPool, selectedStakingType, setSelectedStakingType]);

  const tx = useMemo(() => {
    if (!selectedStakingType || !bond || !nominated || !batchAll || !join) {
      return undefined;
    }

    if (selectedStakingType.type === 'solo' && selectedStakingType.validators) {
      return batchAll([
        bond(amountAsBN, 'Staked'),
        nominated(selectedStakingType.validators)
      ]);
    }

    if (selectedStakingType.type === 'pool' && selectedStakingType.pool) {
      return join(amountAsBN, selectedStakingType.pool.poolId);
    }

    return undefined;
  }, [amountAsBN, batchAll, bond, join, nominated, selectedStakingType]);
  // just a tx to estimate fee before users select their staking type
  const fakeTx = join?.(BN_ZERO, BN_ZERO);

  const estimatedFee = useEstimatedFee2(genesisHash, formatted, tx ?? fakeTx);

  const transactionInformation: Content[] = useMemo((): Content[] => {
    return [{
      content: address,
      title: t('Account')
    },
    {
      Icon: selectedStakingType?.type === 'pool' ? People : UserOctagon,
      content: selectedStakingType?.type === 'pool' ? t('Pool Staking') : t('Solo Staking'),
      title: t('Staking type')
    },
    ...(selectedStakingType?.type === 'solo' && selectedStakingType.validators
      ? [{
        content: `${selectedStakingType.validators.length.toString()} / ${stakingConsts?.maxNominations}`,
        title: t('Validators')
      }]
      : []),
    ...(selectedStakingType?.type === 'pool' && selectedStakingType.pool
      ? [{
        content: selectedStakingType.pool.metadata?.slice(0, MAX_LETTER_THRESHOLD),
        title: t('Pool')
      }]
      : []),
    {
      content: estimatedFee,
      itemKey: 'fee',
      title: t('Fee')
    }];
  }, [address, estimatedFee, selectedStakingType?.pool, selectedStakingType?.type, selectedStakingType?.validators, stakingConsts?.maxNominations, t]);

  const token = useMemo(() => {
    if (!accountAssets) {
      return undefined;
    }

    return accountAssets.find(({ assetId, genesisHash: accountGenesisHash }) => accountGenesisHash === genesisHash && String(assetId) === '0') ?? null;
  }, [accountAssets, genesisHash]);
  const availableBalanceToStake = useMemo(() => token?.freeBalance, [token?.freeBalance]);

  const thresholds = useMemo(() => {
    if (!decimal || !availableBalanceToStake || !poolStakingConsts || !stakingConsts || !estimatedFee) {
      return;
    }

    const ED = stakingConsts.existentialDeposit;
    let max = availableBalanceToStake.sub(ED.muln(2)).sub(estimatedFee);

    let min = !selectedStakingType || selectedStakingType.type === 'pool' ? poolStakingConsts.minJoinBond : stakingConsts.minNominatorBond;

    if (min.gt(max)) {
      min = max = BN_ZERO;
    }

    return { max, min };
  }, [availableBalanceToStake, decimal, estimatedFee, poolStakingConsts, selectedStakingType, stakingConsts]);

  useEffect(() => {
    if (!thresholds?.max || topStakingLimit) {
      return;
    }

    setTopStakingLimit(thresholds.max);
  }, [thresholds?.max, topStakingLimit]);

  const onMaxMinAmount = useCallback((val: 'max' | 'min') => thresholds?.[val]?.toString(), [thresholds]);

  const errorMessage = useMemo(() => {
    if (token === null || availableBalanceToStake?.isZero()) {
      return t('Not enough amount to stake more.');
    }

    if (!amountAsBN || !amount) {
      return undefined;
    }

    if (amountAsBN.gt(topStakingLimit || BN_MAX_INTEGER)) {
      return t('It is more than top staking limit.');
    }

    if (amountAsBN.gt(availableBalanceToStake ?? BN_ZERO)) {
      return t('It is more than the available balance to stake.');
    }

    if (selectedStakingType?.type === 'pool' && amountAsBN.lt(poolStakingConsts?.minJoinBond ?? BN_ZERO)) {
      return t('It is less than the minimum amount to join a pool.');
    }

    if (selectedStakingType?.type === 'solo' && amountAsBN.lt(stakingConsts?.minNominatorBond ?? BN_ZERO)) {
      return t('It is less than the minimum amount to be a staker.');
    }

    return undefined;
  }, [amount, amountAsBN, availableBalanceToStake, poolStakingConsts?.minJoinBond, selectedStakingType?.type, stakingConsts?.minNominatorBond, t, token, topStakingLimit]);

  const onChangeAmount = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    // These lines have commented because user can not enter long number!
    // Already prevented in StakeAmountInput - onChange function
    // if (value.length > decimal - 1) {
    //   console.log(`The amount digits is more than decimal:${decimal}`);
    //   return;
    // }

    setAmountAsBN(amountToMachine(value, decimal));
    setAmount(value);
  }, [decimal]);

  const buttonDisable = useMemo(() => {
    return !amount || !amountAsBN || !topStakingLimit || parseFloat(amount) === 0 || amountAsBN.gt(topStakingLimit) || errorMessage;
  }, [amount, amountAsBN, errorMessage, topStakingLimit]);

  return {
    amount,
    amountAsBN,
    availableBalanceToStake,
    buttonDisable,
    errorMessage,
    initialPool,
    onChangeAmount,
    onMaxMinAmount,
    selectedStakingType,
    setAmount,
    setSelectedStakingType,
    setSide,
    side,
    stakingConsts,
    transactionInformation,
    tx
  };
};

export default useEasyStake;
