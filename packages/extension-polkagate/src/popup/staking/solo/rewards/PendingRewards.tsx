// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


/**
 * @description to show pending rewards and let user to call payout
 * */

import type { ApiPromise } from '@polkadot/api';
import type { DeriveSessionProgress } from '@polkadot/api-derive/types';
import type { ExpandedRewards } from '@polkadot/extension-polkagate/src/fullscreen/stake/solo/pending';
import type { Forcing } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';

import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { ActionContext, Checkbox2, Identity, Motion, ShowBalance, TwoButtons } from '../../../../components';
import { useCurrentBlockNumber, useInfo, usePendingRewards2, useTranslation } from '../../../../hooks';
import { HeaderBrand } from '../../../../partials';
import blockToDate from '../../../crowdloans/partials/blockToDate';
import Review from './Review';

export type ValidatorEra = [string, number, BN]

export const LabelBalance = ({ api, balance, label }: { api: ApiPromise | undefined, label: string, balance: BN }) => (
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

  const { api, chain, token } = useInfo(address);
  const currentBlock = useCurrentBlockNumber(address);
  const rewards = usePendingRewards2(address);

  const [expandedRewards, setExpandedRewards] = useState<ExpandedRewards[] | undefined>(undefined);
  const [selectedToPayout, setSelectedToPayout] = useState<ExpandedRewards[]>([]);
  const [progress, setProgress] = useState<DeriveSessionProgress>();
  const [forcing, setForcing] = useState<Forcing>();
  const [historyDepth, setHistoryDepth] = useState<BN>();
  const [showReview, setShowReview] = useState<boolean>(false);

  useEffect(() => {
    if (!api?.derive?.staking) {
      return;
    }

    api.derive.session.progress().then(setProgress).catch(console.error);
    api.query['staking']['forceEra']().then((f) => setForcing(f as unknown as Forcing)).catch(console.error);

    api.query['staking']?.['historyDepth']
      ? api.query['staking']['historyDepth']().then((depth) => setHistoryDepth(depth as unknown as BN)).catch(console.error)
      : setHistoryDepth(api.consts['staking']['historyDepth'] as unknown as BN);
  }, [api]);

  useEffect(() => {
    if (!rewards) {
      return;
    }

    const rewardsArray: [string, string, number, BN][] = Object.entries(rewards || {}).reduce<[string, string, number, BN][]>(
      (acc, [era, eraRewards]) => {
        const eraRewardsArray = Object.entries(eraRewards || {}).reduce<[string, string, number, BN][]>(
          (eraAcc, [validator, [page, amount]]) => {
            eraAcc.push([era, validator, page, amount] as [string, string, number, BN]);

            return eraAcc;
          },
          []
        );

        return acc.concat(eraRewardsArray);
      },
      []
    );

    setExpandedRewards(rewardsArray as any);
  }, [rewards]);

  const totalPending = useMemo(() => {
    if (!rewards) {
      return BN_ZERO;
    }

    const validatorRewards = Object.values(rewards || {});
    const pageRewards = validatorRewards.map((item) => Object.values(item || {})).flat();

    const total = pageRewards.reduce((sum: BN, [_, value]: [number, BN]) => {
      sum = sum.add(value);

      return sum;
    }, BN_ZERO);

    return total;
  }, [rewards]);

  const totalSelectedPending = useMemo(() => {
    if (!selectedToPayout?.length) {
      return BN_ZERO;
    }

    return selectedToPayout.reduce((sum: BN, value: ExpandedRewards) => {
      sum = sum.add((value as any)[3] as BN);

      return sum;
    }, BN_ZERO);
  }, [selectedToPayout]);

  const isIncluded = useCallback((info: ExpandedRewards): boolean => {
    const _isIncluded = !!selectedToPayout.find((s) => s === info);

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

  const onSelectAll = useCallback((_: any, checked: boolean) => {
    if (checked && expandedRewards?.length) {
      setSelectedToPayout([...expandedRewards]);
    } else {
      setSelectedToPayout([]);
    }
  }, [expandedRewards]);

  const onSelect = useCallback((info: ExpandedRewards, checked: boolean) => {
    if (checked) {
      setSelectedToPayout((prev) => prev.concat([info]));
    } else {
      const index = selectedToPayout.findIndex((s: ExpandedRewards) => s === info);

      setSelectedToPayout((prev) => {
        const newArray = [...prev];

        newArray.splice(index, 1);

        return newArray;
      });
    }
  }, [selectedToPayout]);

  const TABLE_HEIGHT = 305;
  const SKELETON_HEIGHT = 25;

  const backToStakingHome = useCallback(() => {
    onAction(`/solo/${address}`);
  }, [address, onAction]);

  const onNext = useCallback(() => {
    setShowReview(true);
  }, []);

  return (
    <Motion>
      <HeaderBrand
        onBackClick={backToStakingHome}
        shortBorder
        showBackArrow
        showClose
        text={t('Pending Rewards')}
        withSteps={{
          current: 1,
          total: 2
        }}
      />
      <Grid container item sx={{ fontSize: '13px', p: '0 5px 10px', textAlign: 'center' }}>
        <Typography fontSize='14px' pb='20px'>
          {t('Validators usually pay rewards regularly. If not received within the set period, rewards expire. You can manually initiate the payout if desired.')}
        </Typography>
        <Grid alignContent='flex-start' alignItems='center' container item sx={{ border: `1px solid ${theme.palette.primary.main}`, borderBottom: 0, borderTopLeftRadius: '5px', borderTopRightRadius: '5px', p: '5px', width: '100%' }}>
          <Grid item sx={{ fontSize: '13px' }} textAlign='left' xs={4.75}>
            <Checkbox2
              checked={!!expandedRewards?.length && selectedToPayout?.length === expandedRewards?.length}
              // disabled={!expandedRewards?.length}
              iconStyle={{ transform: 'scale(0.9)' }}
              onChange={onSelectAll}
              style={{ paddingRight: '5px' }}
            />
            {t('Amount ({{token}})', { replace: { token } })}
          </Grid>
          <Grid item sx={{ fontSize: '13px', textAlign: 'justify' }} xs>
            {t('Validator')}
          </Grid>
          <Grid item sx={{ fontSize: '13px', textAlign: 'center' }} xs={2}>
            {t('Expires')}
          </Grid>
        </Grid>
        <Grid alignContent='flex-start' container height={TABLE_HEIGHT} sx={{ border: 1, borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px', borderColor: 'primary.main', overflow: 'scroll', width: '100%' }}>
          {!expandedRewards
            ? <Grid container justifyContent='center'>
              {Array.from({ length: TABLE_HEIGHT / SKELETON_HEIGHT }).map((_, index) => (
                <Skeleton animation='wave' height={SKELETON_HEIGHT} key={index} sx={{ display: 'inline-block', transform: 'none', width: '96%', my: '5px' }} />
              ))}
            </Grid>
            : !expandedRewards.length
              ? <Grid container justifyContent='center' sx={{ mt: '70px' }}>
                <Typography>
                  {t('No pending rewards found!')}
                </Typography>
              </Grid>
              : <> {expandedRewards?.map((info, index) => {
                //@ts-ignore
                const [eraIndex, validator, page, value] = info;

                return (
                  <Grid container item key={index}>
                    {
                      <Grid alignContent='flex-start' alignItems='center' container item sx={{ borderColor: 'primary.main', borderTop: 1, px: '5px' }}>
                        <Grid container item sx={{ fontSize: '13px' }} xs={4}>
                          <Grid item>
                            <Checkbox2
                              checked={isIncluded(info)}
                              iconStyle={{ transform: 'scale(0.8)' }}
                              // eslint-disable-next-line react/jsx-no-bind
                              onChange={(_event, checked) => onSelect(info, checked)}
                              style={{ paddingRight: '10px' }}
                            />
                          </Grid>
                          <Grid item>
                            <ShowBalance
                              api={api}
                              balance={value}
                              withCurrency={false}
                            />
                          </Grid>
                        </Grid>
                        <Grid item xs={6}>
                          <Identity
                            api={api}
                            chain={chain as any}
                            formatted={validator}
                            identiconSize={20}
                            showShortAddress
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
                          {eraToDate(Number(eraIndex))}
                        </Grid>
                      </Grid>
                    }
                  </Grid>
                );
              })}
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
      </Grid>
      <TwoButtons
        disabled={!selectedToPayout.length}
        ml='2%'
        onPrimaryClick={onNext}
        onSecondaryClick={backToStakingHome}
        primaryBtnText={t('Next')}
        secondaryBtnText={t('Cancel')}
        width='96%'
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
