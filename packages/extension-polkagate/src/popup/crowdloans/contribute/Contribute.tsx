// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { LinkOption } from '@polkagate/apps-config/endpoints/types';
import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { Balance } from '@polkadot/types/interfaces';
import type { AccountId } from '@polkadot/types/interfaces/runtime';
import type { Crowdloan } from '../../../util/types';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, From, PButton, Popup, ShowBalance } from '../../../components';
import { useBalances, useDecimal, useToken, useTranslation } from '../../../hooks';
import { HeaderBrand, SubTitle } from '../../../partials';
import Asset from '../../../partials/Asset';
import { MAX_AMOUNT_LENGTH } from '../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../util/utils';
import { getValue } from '../../account/util';
import ParachainInfo from '../partials/ParachainInfo';
import ShowParachain from '../partials/ShowParachain';
import Review from './Review';

interface Props {
  api?: ApiPromise;
  chain?: Chain | null;
  formatted?: AccountId | string;
  crowdloansId?: LinkOption[];
  crowdloan: Crowdloan;
  currentBlockNumber?: number;
  setShowContribute: React.Dispatch<React.SetStateAction<boolean>>;
  showContribute: boolean;
  minContribution?: string;
  myContribution?: string | Balance;
}

export default function Contribute({ api, chain, crowdloan, crowdloansId, currentBlockNumber, formatted, minContribution, myContribution, setShowContribute, showContribute = false }: Props): React.ReactElement {
  const { t } = useTranslation();
  const balances = useBalances(String(formatted));
  const decimal = useDecimal(formatted);
  const token = useToken(formatted);

  const tx = api?.tx['crowdloan']['contribute'];

  const [showCrowdloanInfo, setShowCrowdloanInfo] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance>();
  const [contributionAmount, setContributionAmount] = useState<string>();

  const amountAsBN = useMemo(() => amountToMachine(contributionAmount, decimal), [contributionAmount, decimal]);
  const transferableBalance = useMemo(() => getValue('transferable', balances), [balances]);

  useEffect(() => {
    if (!formatted || !tx || !minContribution) {
      return;
    }

    if (!api?.call?.['transactionPaymentApi']) {
      return setEstimatedFee(api?.createType('Balance', BN_ONE) as Balance);
    }

    const feeDummyParams = ['2000', amountAsBN ?? new BN(minContribution), null];
    const maxFeeDummyParams = ['2000', transferableBalance, null];

    tx(...feeDummyParams).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);

    tx(...maxFeeDummyParams).paymentInfo(formatted).then((i) => setEstimatedMaxFee(i?.partialFee)).catch(console.error);
  }, [amountAsBN, api, transferableBalance, contributionAmount, formatted, minContribution, tx]);

  const nextBtnDisabled = useMemo(() => {
    if (!contributionAmount || !amountAsBN || !minContribution) {
      return true;
    }

    const isAmountInRange = amountAsBN.gt(transferableBalance?.sub(estimatedMaxFee ?? BN_ZERO) ?? BN_ZERO) || !amountAsBN.gte(new BN(minContribution));

    return (!(contributionAmount !== '0' && !isAmountInRange));
  }, [amountAsBN, transferableBalance, contributionAmount, estimatedMaxFee, minContribution]);

  const onMinAmount = useCallback(() => {
    minContribution && decimal && setContributionAmount(amountToHuman(minContribution, decimal));
  }, [decimal, minContribution]);

  const onMaxAmount = useCallback(() => {
    if (!api || !transferableBalance || !estimatedMaxFee || !decimal) {
      return;
    }

    const ED = api.consts['balances']['existentialDeposit'] as unknown as BN;
    const max = new BN(transferableBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedMaxFee));

    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setContributionAmount(maxToHuman);
  }, [api, transferableBalance, decimal, estimatedMaxFee]);

  const backToActives = useCallback(() => {
    setShowContribute(false);
  }, [setShowContribute]);

  const contributionAmountChange = useCallback((value: string) => {
    if (decimal && value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setContributionAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const toReview = useCallback(() => {
    api && amountAsBN && !amountAsBN.isZero() && setShowReview(!showReview);
  }, [api, amountAsBN, showReview]);

  return (
    <>
      <Popup show={showContribute}>
        <HeaderBrand
          onBackClick={backToActives}
          shortBorder
          showBackArrow
          showClose
          text={t('Crowdloan')}
        />
        <SubTitle
          label={t('Contribute')}
          withSteps={{ current: 1, total: 2 }}
        />
        <From
          api={api}
          formatted={String(formatted)}
          style={{ m: '15px auto 0', width: '92%' }}
          title={t('Account')}
        />
        <ShowParachain
          api={api}
          chain={chain}
          crowdloan={crowdloan}
          crowdloansId={crowdloansId}
          setShowCrowdloanInfo={setShowCrowdloanInfo}
          style={{ m: '15px auto 0', width: '92%' }}
        />
        <Asset
          address={String(formatted)}
          api={api}
          balance={transferableBalance}
          balanceLabel={t('Available balance')}
          fee={estimatedFee}
          style={{ m: '15px auto 0', width: '92%' }}
        />
        <AmountWithOptions
          label={t('Amount ({{token}})', { replace: { token } })}
          onChangeAmount={contributionAmountChange}
          onPrimary={onMinAmount}
          onSecondary={onMaxAmount}
          primaryBtnText={t('Min amount')}
          secondaryBtnText={t('Max amount')}
          style={{ m: '15px auto 0', width: '92%' }}
          value={contributionAmount}
        />
        <Grid container m='5px auto 0' width='92%'>
          <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
            {t('Min Contribution')}:
          </Typography>
          <Grid fontSize='14px' fontWeight={400} item lineHeight='22px' pl='5px'>
            <ShowBalance balance={minContribution} decimal={decimal} decimalPoint={3} token={token} />
          </Grid>
        </Grid>
        <PButton
          _onClick={toReview}
          disabled={nextBtnDisabled}
          text={t('Next')}
        />
        {showCrowdloanInfo && chain &&
          <ParachainInfo
            api={api}
            chain={chain}
            crowdloan={crowdloan}
            crowdloansId={crowdloansId}
            currentBlockNumber={currentBlockNumber}
            decimal={decimal}
            myContribution={myContribution}
            setShowParachainInfo={setShowCrowdloanInfo}
            showParachainInfo={showCrowdloanInfo}
            token={token}
          />
        }
      </Popup>
      {showReview && formatted && amountAsBN && !amountAsBN.isZero() && crowdloan &&
        <Review
          api={api}
          contributionAmount={amountAsBN}
          crowdloanToContribute={crowdloan}
          crowdloansId={crowdloansId}
          currentBlockNumber={currentBlockNumber}
          decimal={decimal}
          estimatedFee={estimatedFee}
          formatted={formatted}
          myContribution={myContribution}
          setShowReview={setShowReview}
          showReview={showReview}
          token={token}
        />
      }
    </>
  );
}
