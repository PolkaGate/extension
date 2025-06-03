// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveSessionProgress } from '@polkadot/api-derive/types';
import type { Forcing } from '@polkadot/types/interfaces';

import { Box, Container, Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { type BN, BN_ONE, BN_ZERO } from '@polkadot/util';

import { Badge } from '../../../../assets/gif';
import { BackWithLabel, DecisionButtons, FadeOnScroll, FormatBalance2, GradientDivider, Identity2, Motion } from '../../../../components';
import { useBackground, useChainInfo, useCurrentBlockNumber2, useEstimatedFee2, useFormatted3, usePendingRewards3, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import { blockToDate } from '../../../../util/utils';
import CheckBox from '../../components/CheckBox';

const TABLE_HEIGHT = 290;
const SKELETON_HEIGHT = 25;

interface TableHeaderProp {
  checked: boolean;
  onSelectAll: (checked: boolean) => void;
}

const TableHeader = ({ checked, onSelectAll }: TableHeaderProp) => {
  const { t } = useTranslation();

  const handleAllSelect = useCallback(() => onSelectAll(checked), [checked, onSelectAll]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', width: '100%' }}>
      <Grid alignItems='center' container item sx={{ gap: '6px' }} xs={4.75}>
        <CheckBox
          checked={checked}
          onChange={handleAllSelect}
        />
        <Typography color='text.highlight' textTransform='uppercase' variant='S-1'>
          {t('Amount')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item xs>
        <Typography color='text.highlight' textTransform='uppercase' variant='S-1'>
          {t('Validator')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item xs={2}>
        <Typography color='text.highlight' textTransform='uppercase' variant='S-1'>
          {t('Expires')}
        </Typography>
      </Grid>
    </Container>
  );
};

interface RewardsTableProp {
  expandedRewards: ExpandedRewards[] | undefined;
  selectedToPayout: ExpandedRewards[];
  onSelect: (info: ExpandedRewards, checked: boolean) => void;
  genesisHash: string | undefined;
  eraToDate: (era: number) => string | undefined;
}

const RewardsTable = ({ eraToDate, expandedRewards, genesisHash, onSelect, selectedToPayout }: RewardsTableProp) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef(null);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const isIncluded = useCallback((info: ExpandedRewards): boolean => !!selectedToPayout.find((s) => s === info), [selectedToPayout]);

  const handleSelect = useCallback((info: ExpandedRewards, checked: boolean) => () => onSelect(info, checked), [onSelect]);

  return (
    <Grid container item sx={{ position: 'relative' }}>
      <Stack direction='column' ref={containerRef} sx={{ gap: '2px', height: TABLE_HEIGHT, maxHeight: TABLE_HEIGHT, overflow: 'hidden', overflowY: 'auto', width: '100%' }}>
        {expandedRewards === undefined &&
          Array.from({ length: TABLE_HEIGHT / SKELETON_HEIGHT }).map((_, index) => (
            <Skeleton animation='wave' height={SKELETON_HEIGHT} key={index} sx={{ display: 'inline-block', my: '5px', transform: 'none', width: '100%' }} />
          ))}
        {expandedRewards && expandedRewards.length === 0 &&
          <Grid container justifyContent='center' sx={{ mt: '70px' }}>
            <Typography color='text.highlight' variant='B-2'>
              {t('No pending rewards found!')}
            </Typography>
          </Grid>
        }
        {expandedRewards?.map((info, index) => {
          const [eraIndex, validator, _page, value] = info;
          const isChecked = isIncluded(info);

          return (
            <>
              <Container disableGutters key={index} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
                <Grid container item sx={{ alignItems: 'center', gap: '6px' }} xs={4}>
                  <Grid item>
                    <CheckBox
                      checked={isChecked}
                      onChange={handleSelect(info, isChecked)}
                    />
                  </Grid>
                  <Grid item>
                    <FormatBalance2
                      decimalPoint={2}
                      decimals={[decimal ?? 0]}
                      style={{
                        color: theme.palette.text.primary,
                        ...theme.typography['B-2'],
                        textAlign: 'left',
                        width: 'max-content'
                      }}
                      tokenColor={theme.palette.text.highlight}
                      tokens={[token ?? '']}
                      value={value}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Identity2
                    address={validator}
                    genesisHash={genesisHash ?? ''}
                    identiconSize={18}
                    showShortAddress
                    showSocial={false}
                    style={{
                      height: '38px',
                      maxWidth: '100%',
                      minWidth: '35%',
                      variant: 'B-2',
                      width: 'fit-content'
                    }}
                  />
                </Grid>
                <Grid container item sx={{ alignItems: 'center', justifyContent: 'flex-end', pr: '4px', textAlign: 'right' }} xs={2}>
                  <Typography color='text.highlight' variant='B-2'>
                    {eraToDate(Number(eraIndex))}
                  </Typography>
                </Grid>
              </Container>
              <GradientDivider isBlueish />
            </>
          );
        })}
      </Stack>
      <FadeOnScroll containerRef={containerRef} height='30px' ratio={0.3} />
    </Grid>
  );
};

type ExpandedRewards = [
  eraIndex: string,
  validator: string,
  page: number,
  value: BN
]

export default function SoloPendingReward () {
  useBackground('staking');

  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const selectedAccount = useSelectedAccount();
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);
  const { api, decimal, token } = useChainInfo(genesisHash);
  const currentBlock = useCurrentBlockNumber2(genesisHash);
  const pendingRewards = usePendingRewards3(selectedAccount?.address, genesisHash);

  const payoutStakers = api?.tx['staking']['payoutStakersByPage'];
  const batch = api?.tx['utility']['batchAll'];

  const [progress, setProgress] = useState<DeriveSessionProgress>();
  const [forcing, setForcing] = useState<Forcing>();
  const [historyDepth, setHistoryDepth] = useState<BN>();
  const [review, setReview] = useState<boolean>(false);
  const [selectedToPayout, setSelectedToPayout] = useState<ExpandedRewards[]>([]);
  const [expandedRewards, setExpandedRewards] = useState<ExpandedRewards[] | undefined>(undefined);

  useEffect(() => {
    if (!api?.derive?.staking) {
      return;
    }

    api.derive.session.progress().then(setProgress).catch(console.error);
    api.query['staking']['forceEra']().then((f) => setForcing(f as Forcing)).catch(console.error);

    api.query['staking']?.['historyDepth']
      ? api.query['staking']['historyDepth']().then((depth) => setHistoryDepth(depth as unknown as BN)).catch(console.error)
      : setHistoryDepth(api.consts['staking']['historyDepth'] as unknown as BN);
  }, [api?.consts, api?.derive.session, api?.derive?.staking, api?.query]);

  useEffect(() => {
    if (!pendingRewards) {
      return;
    }

    const rewardsArray: [string, string, number, BN][] = Object.entries(pendingRewards || {}).reduce<[string, string, number, BN][]>(
      (acc, [era, eraRewards]) => {
        const eraRewardsArray = Object.entries(eraRewards || {}).reduce<[string, string, number, BN][]>(
          (eraAcc, [validator, [page, amount]]) => {
            eraAcc.push([era, validator, page, amount]);

            return eraAcc;
          }, []);

        return acc.concat(eraRewardsArray);
      }, []);

    setExpandedRewards(rewardsArray);
  }, [pendingRewards]);

  // const totalPending = useMemo(() => {
  //   if (!pendingRewards) {
  //     return BN_ZERO;
  //   }

  //   const validatorRewards = Object.values(pendingRewards || {});
  //   const pageRewards = validatorRewards.map((item) => Object.values(item || {})).flat();

  //   const total = pageRewards.reduce((sum: BN, [_, value]: [number, BN]) => sum.add(value), BN_ZERO);

  //   return total;
  // }, [pendingRewards]);

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

  const totalSelectedPending = useMemo(() => {
    if (!selectedToPayout?.length) {
      return BN_ZERO;
    }

    return selectedToPayout.reduce((sum: BN, value: ExpandedRewards) => sum.add((value)[3]), BN_ZERO);
  }, [selectedToPayout]);

  const tx = useMemo(() => {
    if (!selectedToPayout || !payoutStakers || !batch) {
      return undefined;
    }

    const call = selectedToPayout.length === 1
      ? payoutStakers
      : batch;

    const params = selectedToPayout.length === 1
      ? [selectedToPayout[0][1], Number(selectedToPayout[0][0]), selectedToPayout[0][2]]
      : [selectedToPayout.map((p) => payoutStakers(p[1], Number(p[0]), p[2]))];

    return call(...params);
  }, [batch, payoutStakers, selectedToPayout]);

  const estimatedFee2 = useEstimatedFee2(genesisHash ?? '', formatted, tx ?? payoutStakers, tx ? undefined : [selectedAccount?.address, BN_ZERO]);

  const transactionInformation = useMemo(() => {
    return [{
      content: totalSelectedPending,
      title: t('Amount'),
      withLogo: true
    },
    {
      content: estimatedFee2,
      title: t('Fee')
    }];
  }, [estimatedFee2, totalSelectedPending, t]);

  const onSelectAll = useCallback((checked: boolean) => {
    if (!checked && expandedRewards?.length) {
      setSelectedToPayout([...expandedRewards]);
    } else {
      setSelectedToPayout([]);
    }
  }, [expandedRewards]);

  const onSelect = useCallback((info: ExpandedRewards, checked: boolean) => {
    if (!checked) {
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

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const openReview = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

  const transactionFlow = useTransactionFlow({
    backPathTitle: t('Payout rewards'),
    closeReview,
    formatted,
    genesisHash: genesisHash ?? '',
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader homeType='default' />
        <Motion variant='slide'>
          <BackWithLabel
            onClick={onBack}
            stepCounter={{ currentStep: 1, totalSteps: 2 }}
            style={{ pb: 0 }}
            text={t('Pending Rewards')}
          />
          <Stack direction='column' sx={{ gap: '8px', height: 'fit-content', maxHeight: '515px', overflow: 'hidden', overflowY: 'auto', p: '15px', width: '100%' }}>
            <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', pr: '10px' }}>
              <Box
                component='img'
                src={Badge as string}
                style={{
                  height: '64px',
                  width: '64px'
                }}
              />
              <Typography color='text.highlight' textAlign='justify' variant='B-4'>
                {t('Validators usually pay rewards regularly. If not received within the set period, rewards expire. You can manually initiate the payout if desired.')}
              </Typography>
            </Container>
            <GradientDivider isBlueish />
            <TableHeader
              checked={!!expandedRewards?.length && selectedToPayout?.length === expandedRewards?.length}
              onSelectAll={onSelectAll}
            />
            <RewardsTable
              eraToDate={eraToDate}
              expandedRewards={expandedRewards}
              genesisHash={genesisHash}
              onSelect={onSelect}
              selectedToPayout={selectedToPayout}
            />
            <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
                <Typography color='text.highlight' variant='B-4'>
                  {t('Selected')}:
                </Typography>
                <Typography color='text.primary' variant='B-4'>
                  {selectedToPayout.length ?? 0}
                </Typography>
              </Container>
              <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '200px' }}>
                <Typography color='text.highlight' variant='B-4'>
                  {t('Total')}:
                </Typography>
                <FormatBalance2
                  decimalPoint={2}
                  decimals={[decimal ?? 0]}
                  style={{
                    color: theme.palette.text.primary,
                    ...theme.typography['B-2'],
                    textAlign: 'right',
                    width: 'max-content'
                  }}
                  tokens={[token ?? '']}
                  value={totalSelectedPending}
                />
              </Container>
            </Container>
            <DecisionButtons
              cancelButton
              direction='horizontal'
              disabled={!selectedToPayout.length || !api}
              divider
              onPrimaryClick={openReview}
              onSecondaryClick={onBack}
              primaryBtnText={t('Next')}
              secondaryBtnText={t('Cancel')}
              style={{ height: '44px', width: '100%' }}
            />
          </Stack>
        </Motion>
      </Grid>
    </>
  );
}
