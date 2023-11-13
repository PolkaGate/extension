// Copyright 2019-2023 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description to show pending rewards and let user to call payout
 * */

import { Grid, Skeleton, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { BN, BN_ZERO } from '@polkadot/util';

import { ActionContext, Checkbox2, Identity, Motion, PButton, Progress, ShowBalance } from '../../../../components';
import { useApi, useChain, usePendingRewards, useToken, useTranslation } from '../../../../hooks';
import { HeaderBrand } from '../../../../partials';
import Review from './Review';

export type ValidatorEra = [string, number, BN]

export default function PendingRewards(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const { address } = useParams<{ address: string }>();

  const api = useApi(address);
  const token = useToken(address);
  const chain = useChain(address);
  const rewards = usePendingRewards(address);

  const [isSelectAll, setSelectAll] = useState<boolean>(false);
  const [selectedToPayout, setSelectedToPayout] = useState<ValidatorEra[]>([]);
  const [erasHistoric, setErasHistoric] = useState<number>();
  const [showReview, setShowReview] = useState<boolean>(false);

  useEffect(() => {
    api?.derive?.staking?.erasHistoric().then((res) => setErasHistoric(res.length)).catch(console.error);
  }, [api?.derive?.staking]);

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

  const onSelectAll = useCallback((_, checked: boolean) => {
    setSelectAll(!isSelectAll);

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
  }, [isSelectAll, rewards]);

  const onSelect = useCallback((validatorEra: ValidatorEra, checked: boolean) => {
    if (checked) {
      setSelectedToPayout((prev) => prev.concat([validatorEra]));
    } else {
      const index = selectedToPayout.findIndex((s) => s.every((value, index) => value === validatorEra[index]));

      selectedToPayout.splice(index, 1);

      setSelectedToPayout([...selectedToPayout]);
    }
  }, [selectedToPayout]);

  const backToStakingHome = useCallback(() => {
    onAction(`/solo/${address}`);
  }, [address, onAction]);

  const goToReview = useCallback(() => {
    setShowReview(true);
  }, []);

  const TABLE_HEIGHT = window.innerHeight - 210;
  const SKELETON_HEIGHT = 25;

  const LabelBalance = ({ balance, label }: { label: string, balance: BN }) => (
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
      <Grid alignContent='flex-start' alignItems='center' container item sx={{ borderBottom: 1, borderColor: 'primary.main', px: '10px' }}>
        <Grid item sx={{ fontSize: '13px' }} xs={4}>
          <Checkbox2
            checked={!!rewards?.length && selectedToPayout?.length === rewards?.length}
            iconStyle={{ transform: 'scale(0.9)' }}
            onChange={onSelectAll}
            style={{ paddingRight: '10px' }}
          />
          {t('Amount ({{token}})', { replace: { token } })}
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'center' }}>
          {t('Validator')}
        </Grid>
        <Grid item sx={{ fontSize: '13px', textAlign: 'right' }} xs={2}>
          {t('Era')}
        </Grid>
      </Grid>
      <Grid container height={TABLE_HEIGHT} sx={{ overflow: 'scroll' }}>
        {!rewards
          ? <Grid container justifyContent='center'>
            {Array.from({ length: TABLE_HEIGHT / SKELETON_HEIGHT }).map((_, index) => (
              <Skeleton height={SKELETON_HEIGHT}
                key={index}
                sx={{ display: 'inline-block', transform: 'none', width: '95%', my: '5px' }}
              />
            ))}
          </Grid>
          : !rewards.length
            ? <Grid container justifyContent='center' sx={{ mt: '70px' }}>
              <Typography>
                {t('No pending rewards found!')}
              </Typography>
            </Grid>
            : <> {rewards?.map((info, index) => (
              <Grid container item key={index} px='10px'>
                {
                  Object.keys(info.validators).map((v, index) => (
                    <Grid alignContent='flex-start' alignItems='center' container item key={index}>
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
                          identiconSize={25}
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
                        {info.era.toNumber()}
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
              {t('Checking pending rewards in the last {{erasHistoric}} eras ...', { replace: { erasHistoric: erasHistoric || 84 } })}
            </Typography>
            : <>
              <Grid item>
                <LabelBalance
                  balance={totalPending}
                  label={t('Total')}
                />
              </Grid>
              <Grid item>
                <LabelBalance
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
        text={t<string>('Payout')}
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
