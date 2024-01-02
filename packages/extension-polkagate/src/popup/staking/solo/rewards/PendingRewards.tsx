// Copyright 2019-2024 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description to show pending rewards and let user to call payout
 * */

import type { DeriveSessionProgress } from '@polkadot/api-derive/types';
import type { Forcing } from '@polkadot/types/interfaces';

import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { ActionContext, Checkbox2, Identity, Motion, PButton, ShowBalance } from '../../../../components';
import { useApi, useChain, useCurrentBlockNumber, usePendingRewards, useToken, useTranslation } from '../../../../hooks';
import { HeaderBrand } from '../../../../partials';
import blockToDate from '../../../crowdloans/partials/blockToDate';
import Review from './Review';

export type ValidatorEra = [string, number, BN]

const LabelBalance = ({ api, balance, label }: { api: ApiPromise | undefined, label: string, balance: BN }) => (
  <Grid container item sx={{ fontSize: '13px' }}>
    <Grid item>
      <Typography fontSize='14px'>
        {label}:
      </Typography>
    </Grid>
    <Grid item sx={{ fontSize: '14px', fontWeight: 500, pl: '5px' }}>
      <ShowBalance
        api={api}
        balance={balance}
      />
    </Grid>
  </Grid>
);

export default function PendingRewards(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const { address } = useParams<{ address: string }>();

  const api = useApi(address);
  const token = useToken(address);
  const chain = useChain(address);
  const rewards = usePendingRewards(address);
  const currentBlock = useCurrentBlockNumber(address);

  const [selectedToPayout, setSelectedToPayout] = useState<ValidatorEra[]>([]);
  const [erasHistoric, setErasHistoric] = useState<number>();
  const [showReview, setShowReview] = useState<boolean>(false);
  const [progress, setProgress] = useState<DeriveSessionProgress>();
  const [forcing, setForcing] = useState<Forcing>();
  const [historyDepth, setHistoryDepth] = useState<BN>();

  useEffect(() => {
    if (!api?.derive?.staking) {
      return;
    }

    api.derive.staking.erasHistoric().then((res) => setErasHistoric(res.length)).catch(console.error);
    api.derive.session.progress().then(setProgress).catch(console.error);
    api.query.staking.forceEra().then(setForcing).catch(console.error);

    api.query.staking?.historyDepth
      ? api.query.staking.historyDepth().then(setHistoryDepth).catch(console.error)
      : setHistoryDepth(api.consts.staking.historyDepth);
  }, [api]);

  const totalPending = useMemo(() => {
    if (!rewards) {
      return BN_ZERO;
    }

    return rewards.reduce((sum, { validators }) => {
      Object.values(validators).forEach(({ value }) => {
        sum = sum.add(value);
      });

      return sum;
    }, BN_ZERO);
  }, [rewards]);

  const totalSelectedPending = useMemo(() => {
    if (!selectedToPayout) {
      return BN_ZERO;
    }

    return selectedToPayout.reduce((sum, sel) => {
      sum = sum.add(sel[2]);

      return sum;
    }, BN_ZERO);
  }, [selectedToPayout]);

  const isIncluded = useCallback((v: ValidatorEra): boolean => {
    const _isIncluded = !!selectedToPayout.find((s) => s.every((value, index) => value === v[index]));

    return _isIncluded;
  }, [selectedToPayout]);

  const eraToDate = useCallback((era: number): string | undefined => {
    if (!(currentBlock && historyDepth && era && forcing && progress && progress.sessionLength.gt(BN_ONE))) {
      return undefined;
    }

    const EndEraInBlock =
      (forcing.isForceAlways
        ? progress.sessionLength
        : progress.eraLength
      ).mul(
        historyDepth
          .sub(progress.activeEra)
          .addn(era)
          .add(BN_ONE)
      ).sub(
        forcing.isForceAlways
          ? progress.sessionProgress
          : progress.eraProgress);

    return EndEraInBlock ? blockToDate(EndEraInBlock.addn(currentBlock).toNumber(), currentBlock, { day: 'numeric', month: 'short' }) : undefined;
  }, [currentBlock, forcing, historyDepth, progress]);

  const onSelectAll = useCallback((_, checked: boolean) => {
    if (checked) {
      const _selected: ValidatorEra[] = [];

      rewards?.forEach((r) => {
        Object.keys(r.validators).forEach((v) => {
          _selected.push([v, r.era.toNumber(), r.validators[v].value]);
        });
      });
      setSelectedToPayout(_selected);
    } else {
      setSelectedToPayout([]);
    }
  }, [rewards]);

  const onSelect = useCallback((validatorEra: ValidatorEra, checked: boolean) => {
    if (checked) {
      setSelectedToPayout((prev) => prev.concat([validatorEra]));
    } else {
      const index = selectedToPayout.findIndex((s) => s.every((value, index) => value === validatorEra[index]));

      setSelectedToPayout((prev) => {
        const newArray = [...prev];

        newArray.splice(index, 1);

        return newArray;
      });
    }
  }, [selectedToPayout]);

  const backToStakingHome = useCallback(() => {
    onAction(`/solo/${address}`);
  }, [address, onAction]);

  const goToReview = useCallback(() => {
    setShowReview(true);
  }, []);

  const TABLE_HEIGHT = window.innerHeight - 300;
  const SKELETON_HEIGHT = 25;

  return (
    <Motion>
      <HeaderBrand
        onBackClick={backToStakingHome}
        shortBorder
        showBackArrow
        showClose
        text={t<string>('Pending Rewards')}
        withSteps={{
          current: 1,
          total: 2
        }}
      />
      <Grid container item sx={{ fontSize: '13px', p: '0 5px 10px', textAlign: 'center' }}>
        <Typography sx={{ fontSize: '14px' }}>
          {t('Validators usually pay rewards regularly. If not received within the set period, rewards expire. You can manually initiate the payout if desired.')}
        </Typography>
      </Grid>
      <Grid alignContent='flex-start' alignItems='center' container item sx={{ border: `1px solid ${theme.palette.primary.main}`,borderBottom: 0, borderTopLeftRadius: '5px', borderTopRightRadius: '5px', p: '10px 5px 10px', mx: '2%', width: '96%' }}>
        <Grid item sx={{ fontSize: '13px' }} xs={4.75}>
          <Checkbox2
            checked={!!rewards?.length && selectedToPayout?.length === rewards?.length}
            iconStyle={{ transform: 'scale(0.9)' }}
            onChange={onSelectAll}
            style={{ paddingRight: '5px' }}
          />
          {t('Amount ({{token}})', { replace: { token } })}
        </Grid>
        <Grid item xs sx={{ fontSize: '13px', textAlign: 'justify' }}>
          {t('Validator')}
        </Grid>
        <Grid item sx={{ fontSize: '13px', textAlign: 'center' }} xs={2}>
          {t('Expires')}
        </Grid>
      </Grid>
      <Grid alignContent='flex-start' container height={TABLE_HEIGHT} sx={{ border: 1, borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px', borderColor: 'primary.main', mx: '2%', overflow: 'scroll', width: '96%' }}>
        {!rewards
          ? <Grid container justifyContent='center'>
            {Array.from({ length: TABLE_HEIGHT / SKELETON_HEIGHT }).map((_, index) => (
              <Skeleton animation='wave' height={SKELETON_HEIGHT} key={index} sx={{ display: 'inline-block', transform: 'none', width: '96%', my: '5px' }} />
            ))}
          </Grid>
          : !rewards.length
            ? <Grid container justifyContent='center' sx={{ mt: '70px' }}>
              <Typography>
                {t('No pending rewards found!')}
              </Typography>
            </Grid>
            : <> {rewards?.map((info, index) => (
              <Grid container item key={index}>
                {
                  Object.keys(info.validators).map((v, index) => (
                    <Grid alignContent='flex-start' alignItems='center' container item key={index} sx={{ borderColor: 'primary.main', borderTop: 1, px: '5px' }}>
                      <Grid container item sx={{ fontSize: '13px' }} xs={4}>
                        <Grid item>
                          <Checkbox2
                            checked={isIncluded([v, info.era.toNumber(), info.validators[v].value])}
                            iconStyle={{ transform: 'scale(0.8)' }}
                            // eslint-disable-next-line react/jsx-no-bind
                            onChange={(_event, checked) => onSelect([v, info.era.toNumber(), info.validators[v].value], checked)}
                            style={{ paddingRight: '10px' }}
                          />
                        </Grid>
                        <Grid item>
                          <ShowBalance
                            api={api}
                            balance={info.validators[v].value}
                            withCurrency={false}
                          />
                        </Grid>
                      </Grid>
                      <Grid item xs={6}>
                        <Identity
                          api={api}
                          chain={chain}
                          formatted={v}
                          identiconSize={20}
                          showSocial={false}
                          style={{
                            fontSize: '13px',
                            height: '38px',
                            maxWidth: '100%',
                            minWidth: '35%',
                            width: 'fit-content'
                          }}
                        />
                      </Grid>
                      <Grid item sx={{ fontSize: '13px', textAlign: 'right' }} xs={2}>
                        {eraToDate(info.era.toNumber())}
                      </Grid>
                    </Grid>
                  ))
                }
              </Grid>
            ))}
            </>
        }
      </Grid>
      <Grid container item justifyContent='space-between' sx={{ fontSize: '13px', p: '10px' }}>
        {
          !rewards
            ? <Typography fontSize='13px' sx={{ m: 'auto' }}>
              {t('Getting pending rewards, please wait ...')}
            </Typography>
            : <>
              <Grid item>
                <LabelBalance
                  api={api}
                  balance={totalPending}
                  label={t('Total')}
                />
              </Grid>
              <Grid item>
                <LabelBalance
                  api={api}
                  balance={totalSelectedPending}
                  label={t('Selected')}
                />
              </Grid>
            </>
        }
      </Grid>
      <PButton
        _onClick={goToReview}
        disabled={!selectedToPayout?.length}
        text={t<string>('Next')}
      />
      {
        showReview && totalSelectedPending &&
        <Review
          address={address}
          amount={totalSelectedPending}
          selectedToPayout={selectedToPayout}
          setShow={setShowReview}
          show={showReview}
        />
      }
    </Motion>
  );
}
