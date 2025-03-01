// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from 'extension-polkagate/src/util/types';
import type { DeriveSessionProgress } from '@polkadot/api-derive/types';
import type { Forcing } from '@polkadot/types/interfaces';
import type { BN } from '@polkadot/util';
import type { StakingInputs } from '../../type';

import { faClockFour } from '@fortawesome/free-solid-svg-icons';
import { Grid, LinearProgress, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import blockToDate from '@polkadot/extension-polkagate/src/popup/crowdloans/partials/blockToDate';
import { LabelBalance } from '@polkadot/extension-polkagate/src/popup/staking/solo/rewards/PendingRewards';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util/utils';
import { BN_ONE, BN_ZERO } from '@polkadot/util';

import { Checkbox2, Identity, ShowBalance, TwoButtons } from '../../../../components';
import { useCurrentBlockNumber, useInfo, usePendingRewards2, useTranslation } from '../../../../hooks';
import Confirmation from '../../partials/Confirmation';
import Review from '../../partials/Review';
import { STEPS } from '../../pool/stake';
import { ModalTitle } from '../commonTasks/configurePayee';
import { MODAL_IDS } from '..';

interface Props {
  address: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<number>>;
  show: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export type ExpandedRewards = [
  eraIndex: string,
  validator: string,
  page: number,
  value: BN
]

export default function Pending({ address, setRefresh, setShow, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const { api, chain, decimal, token } = useInfo(address);
  const currentBlock = useCurrentBlockNumber(address);
  const rewards = usePendingRewards2(address as string);

  const [expandedRewards, setExpandedRewards] = useState<ExpandedRewards[] | undefined>(undefined);
  const [selectedToPayout, setSelectedToPayout] = useState<ExpandedRewards[]>([]);
  const [progress, setProgress] = useState<DeriveSessionProgress>();
  const [forcing, setForcing] = useState<Forcing>();
  const [historyDepth, setHistoryDepth] = useState<BN>();
  const [step, setStep] = useState(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<StakingInputs>();
  const [percentOfEraFetched, setPercentOfEraFetched] = useState<number>();

  useEffect(() => {
    window.addEventListener('percentOfErasCheckedForPendingRewards', (res) => setPercentOfEraFetched((res as any).detail as number));
  }, []);

  useEffect(() => {
    if (!api?.derive?.staking) {
      return;
    }

    api.derive.session.progress().then(setProgress).catch(console.error);
    api.query['staking']['forceEra']().then((f) => setForcing(f as Forcing)).catch(console.error);

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
            eraAcc.push([era, validator, page, amount]);

            return eraAcc;
          },
          []
        );

        return acc.concat(eraRewardsArray);
      },
      []
    );

    setExpandedRewards(rewardsArray);
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

  useEffect(() => {
    if (!api || !totalSelectedPending || totalSelectedPending?.isZero() || !decimal || !selectedToPayout) {
      return;
    }

    const payoutStakers = api.tx['staking']['payoutStakersByPage'];
    const batch = api.tx['utility']['batchAll'];

    const call = selectedToPayout.length === 1
      ? payoutStakers
      : batch;

    const params =
      selectedToPayout.length === 1
        ? [selectedToPayout[0][1], Number(selectedToPayout[0][0]), selectedToPayout[0][2]]
        : [selectedToPayout.map((p) => payoutStakers(p[1], Number(p[0]), p[2]))];

    const amount = amountToHuman(totalSelectedPending, decimal);

    const extraInfo = {
      action: 'Solo Staking',
      amount,
      subAction: 'Payout Rewards'
    };

    setInputs({
      call,
      extraInfo,
      params
    });
  }, [api, decimal, selectedToPayout, totalSelectedPending]);

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

  const TABLE_HEIGHT = 375;
  const SKELETON_HEIGHT = 25;

  const onNext = useCallback(() => {
    setStep(STEPS.REVIEW);
  }, []);

  const onCancel = useCallback(() => {
    setStep(STEPS.INDEX);
    setShow(MODAL_IDS.NONE);
  }, [setShow]);

  return (
    <DraggableModal minHeight={615} onClose={onCancel} open={show}>
      <Grid container>
        {step !== STEPS.WAIT_SCREEN &&
          <ModalTitle
            icon={faClockFour}
            onCancel={onCancel}
            setStep={setStep}
            step={step}
            text={t('Pending Rewards')}
          />
        }
        {step === STEPS.INDEX &&
          <>
            <Grid container item>
              <Typography fontSize='16px' py='20px' textAlign='left'>
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
              <Grid alignContent='flex-start' container height={TABLE_HEIGHT} sx={{ border: 1, borderBottomLeftRadius: '5px', borderBottomRightRadius: '5px', borderColor: 'primary.main', display: 'block', overflow: 'scroll', width: '100%' }}>
                {!!percentOfEraFetched && percentOfEraFetched !== 1 &&
                  <LinearProgress color='success' sx={{ position: 'sticky', top: 0 }} value={percentOfEraFetched ? percentOfEraFetched * 100 : 0} variant='determinate' />
                }
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
                      const [eraIndex, validator, , value] = info;

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
                                  chain={chain}
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
            <Grid container item sx={{ '> div': { m: 0, width: '100%' }, justifyContent: 'flex-end', mt: '5px' }}>
              <TwoButtons
                disabled={!inputs || !selectedToPayout.length}
                mt='1px'
                onPrimaryClick={onNext}
                onSecondaryClick={onCancel}
                primaryBtnText={t('Next')}
                secondaryBtnText={t('Cancel')}
              />
            </Grid>
          </>
        }
        {[STEPS.REVIEW, STEPS.PROXY, STEPS.SIGN_QR].includes(step) &&
          <Review
            address={address}
            inputs={inputs}
            setRefresh={setRefresh}
            setStep={setStep}
            setTxInfo={setTxInfo}
            step={step}
          />
        }
        {step === STEPS.WAIT_SCREEN &&
          <WaitScreen />
        }
        {step === STEPS.CONFIRM && txInfo &&
          <Confirmation
            handleDone={onCancel}
            txInfo={txInfo}
          />
        }
      </Grid>
    </DraggableModal>
  );
}
