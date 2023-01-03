// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { LinkOption } from '@polkadot/apps-config/endpoints/types';
import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';
import { BN, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, PButton, Popup, ShowBalance } from '../../../components';
import { useBalances, useDecimal, useToken, useTranslation } from '../../../hooks';
import { HeaderBrand, SubTitle } from '../../../partials';
import { MAX_AMOUNT_LENGTH } from '../../../util/constants';
import { Crowdloan } from '../../../util/types';
import { amountToHuman } from '../../../util/utils';
import Asset from '../../send/partial/Asset';
import From from '../partials/From';
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

  const tx = api && api.tx.crowdloan.contribute;

  const [showCrowdloanInfo, setShowCrowdloanInfo] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [estimatedMaxFee, setEstimatedMaxFee] = useState<Balance>();
  const [contributionAmount, setContributionAmount] = useState<string>();

  const amountAsBN = useMemo(() => decimal && new BN(parseFloat(contributionAmount ?? '0') * 10 ** decimal), [decimal, contributionAmount]);

  useEffect(() => {
    if (!formatted || !tx || !minContribution) {
      return;
    }

    const feeDummyParams = ['2000', amountAsBN ?? new BN(minContribution), null];
    const maxFeeDummyParams = ['2000', balances?.availableBalance, null];

    tx(...feeDummyParams).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);

    tx(...maxFeeDummyParams).paymentInfo(formatted).then((i) => setEstimatedMaxFee(i?.partialFee)).catch(console.error);
  }, [amountAsBN, balances?.availableBalance, contributionAmount, formatted, minContribution, tx]);

  const nextBtnDisabled = useMemo(() => {
    if (!contributionAmount || !amountAsBN || !minContribution) {
      return true;
    }

    const isAmountInRange = amountAsBN.gt(balances?.availableBalance?.sub(estimatedMaxFee ?? BN_ZERO) ?? BN_ZERO) || !amountAsBN.gte(new BN(minContribution));

    return (!(contributionAmount !== '0' && !isAmountInRange));
  }, [amountAsBN, balances?.availableBalance, contributionAmount, estimatedMaxFee, minContribution]);

  const onMinAmount = useCallback(() => {
    minContribution && decimal && setContributionAmount(amountToHuman(minContribution, decimal));
  }, [decimal, minContribution]);

  const onMaxAmount = useCallback(() => {
    if (!api || !balances?.availableBalance || !estimatedMaxFee || !decimal) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(balances.availableBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedMaxFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setContributionAmount(maxToHuman);
  }, [api, balances?.availableBalance, decimal, estimatedMaxFee]);

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
          text={t<string>('Crowdloan')}
        />
        <SubTitle
          label={t<string>('Contribute')}
          withSteps={{ current: 1, total: 2 }}
        />
        <From
          address={String(formatted)}
          api={api}
          style={{ m: '15px auto 0', width: '92%' }}
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
          balance={balances?.availableBalance}
          balanceLabel={t<string>('Available balance')}
          fee={estimatedFee}
          style={{ m: '15px auto 0', width: '92%' }}
        />
        <AmountWithOptions
          label={t<string>('Amount ({{token}})', { replace: { token } })}
          onChangeAmount={contributionAmountChange}
          onPrimary={onMinAmount}
          onSecondary={onMaxAmount}
          primaryBtnText={t<string>('Min amount')}
          secondaryBtnText={t<string>('Max amount')}
          style={{ m: '15px auto 0', width: '92%' }}
          value={contributionAmount}
        />
        <Grid container m='5px auto 0' width='92%'>
          <Typography fontSize='14px' fontWeight={300} lineHeight='23px'>
            {t<string>('Min Contribution')}:
          </Typography>
          <Grid fontSize='14px' fontWeight={400} item lineHeight='22px' pl='5px'>
            <ShowBalance balance={minContribution} decimal={decimal} decimalPoint={3} token={token} />
          </Grid>
        </Grid>
        <PButton
          _onClick={toReview}
          disabled={nextBtnDisabled}
          text={t<string>('Next')}
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
