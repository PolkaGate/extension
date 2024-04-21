// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveSessionProgress } from '@polkadot/api-derive/types';
import type { Forcing } from '@polkadot/types/interfaces';

import { faClockFour } from '@fortawesome/free-solid-svg-icons';
import { Grid, Skeleton, Typography, useTheme } from '@mui/material';
import { TxInfo } from 'extension-polkagate/src/util/types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';
import blockToDate from '@polkadot/extension-polkagate/src/popup/crowdloans/partials/blockToDate';
import { LabelBalance, ValidatorEra } from '@polkadot/extension-polkagate/src/popup/staking/solo/rewards/PendingRewards';
import { amountToHuman } from '@polkadot/extension-polkagate/src/util/utils';
import { BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { Checkbox2, Identity, ShowBalance, TwoButtons } from '../../../../components';
import { useCurrentBlockNumber, useInfo, usePendingRewards, useTranslation } from '../../../../hooks';
import { Inputs } from '../../Entry';
import Confirmation from '../../partials/Confirmation';
import Review from '../../partials/Review';
import { ModalTitle } from '../commonTasks/configurePayee';
import { MODAL_IDS } from '..';

interface Props {
  address: string | undefined;
  setShow: React.Dispatch<React.SetStateAction<number>>;
  show: boolean;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}

export const STEPS = {
  INDEX: 1,
  REVIEW: 2,
  WAIT_SCREEN: 3,
  CONFIRM: 4,
  PROXY: 100
};

export default function Pending({ address, setRefresh, setShow, show }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const { api, chain, decimal, token } = useInfo(address);
  const rewards = usePendingRewards(address);
  const currentBlock = useCurrentBlockNumber(address);

  const [selectedToPayout, setSelectedToPayout] = useState<ValidatorEra[]>([]);
  const [erasHistoric, setErasHistoric] = useState<number>();
  const [progress, setProgress] = useState<DeriveSessionProgress>();
  const [forcing, setForcing] = useState<Forcing>();
  const [historyDepth, setHistoryDepth] = useState<BN>();
  const [step, setStep] = useState(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [inputs, setInputs] = useState<Inputs>();

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

  useEffect(() => {
    if (!api || !totalSelectedPending || totalSelectedPending?.isZero() || !decimal || !selectedToPayout) {
      return;
    }

    const payoutStakers = api.tx.staking.payoutStakers;
    const batch = api.tx.utility.batchAll;

    const call = selectedToPayout.length === 1
      ? payoutStakers
      : batch;

    const params =
      selectedToPayout.length === 1
        ? [selectedToPayout[0][0], selectedToPayout[0][1]]
        : selectedToPayout.map((p) => payoutStakers(p[0], p[1]));

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

  const TABLE_HEIGHT = window.innerHeight - 600;
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
                <Grid item sx={{ fontSize: '13px' }} xs={4.75}>
                  <Checkbox2
                    checked={!!rewards?.length && selectedToPayout?.length === rewards?.length}
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

            </Grid>
            <Grid container item sx={{ '> div': { m: 0, width: '64%' }, justifyContent: 'flex-end', mt: '5px' }}>
              <TwoButtons
                disabled={!inputs}
                mt='1px'
                onPrimaryClick={onNext}
                onSecondaryClick={onCancel}
                primaryBtnText={t('Next')}
                secondaryBtnText={t('Cancel')}
              />
            </Grid>
          </>
        }
        {[STEPS.REVIEW, STEPS.PROXY].includes(step) &&
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
