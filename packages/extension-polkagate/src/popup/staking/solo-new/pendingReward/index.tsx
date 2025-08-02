// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import React, { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import { type BN } from '@polkadot/util';

import { Badge } from '../../../../assets/gif';
import { AssetLogo, BackWithLabel, DecisionButtons, FadeOnScroll, FormatBalance2, GradientDivider, Identity2, Motion } from '../../../../components';
import { useBackground, useChainInfo, usePendingRewardsSolo, useSelectedAccount, useTransactionFlow, useTranslation } from '../../../../hooks';
import { UserDashboardHeader } from '../../../../partials';
import getLogo2 from '../../../../util/getLogo2';
import CheckBox from '../../components/CheckBox';

const TABLE_HEIGHT = 290;
const SKELETON_HEIGHT = 24;

interface TableHeaderProp {
  checked: boolean;
  onSelectAll: (checked: boolean) => void;
}

const TableHeader = ({ checked, onSelectAll }: TableHeaderProp) => {
  const { t } = useTranslation();

  const handleAllSelect = useCallback(() => onSelectAll(checked), [checked, onSelectAll]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', width: '100%' }}>
      <Grid alignItems='center' container item sx={{ gap: '6px' }} xs={4}>
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
  adaptiveDecimalPoint: number | undefined;
  expandedRewards: ExpandedRewards[] | undefined;
  selectedToPayout: ExpandedRewards[];
  onSelect: (info: ExpandedRewards, checked: boolean) => void;
  genesisHash: string | undefined;
  eraToDate: (era: number) => string | undefined;
}

const StyledSkeleton = () => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', my: '4px' }}>
      <Skeleton animation='wave' height={SKELETON_HEIGHT} sx={{ borderRadius: '6px', display: 'inline-block', transform: 'none', width: SKELETON_HEIGHT }} />
      <Skeleton animation='wave' height={SKELETON_HEIGHT} sx={{ borderRadius: '50px', display: 'inline-block', transform: 'none', width: '65px' }} />
      <Skeleton animation='wave' height={SKELETON_HEIGHT} sx={{ borderRadius: '50px', display: 'inline-block', transform: 'none', width: '170px' }} />
      <Skeleton animation='wave' height={SKELETON_HEIGHT} sx={{ borderRadius: '50px', display: 'inline-block', transform: 'none', width: '50px' }} />
    </Container>
  );
};

export const RewardsTable = ({ adaptiveDecimalPoint, eraToDate, expandedRewards, genesisHash, onSelect, selectedToPayout }: RewardsTableProp) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef(null);
  const { decimal, token } = useChainInfo(genesisHash, true);

  const logoInfo = useMemo(() => getLogo2(genesisHash, token), [genesisHash, token]);

  const isIncluded = useCallback((info: ExpandedRewards): boolean => !!selectedToPayout.find((s) => s === info), [selectedToPayout]);

  const handleSelect = useCallback((info: ExpandedRewards, checked: boolean) => () => onSelect(info, checked), [onSelect]);

  return (
    <Grid container item sx={{ position: 'relative' }}>
      <Stack direction='column' ref={containerRef} sx={{ gap: '2px', height: TABLE_HEIGHT, maxHeight: TABLE_HEIGHT, overflow: 'hidden', overflowY: 'auto', width: '100%' }}>
        {expandedRewards === undefined &&
          Array.from({ length: 5 }).map((_, index) => (
            <StyledSkeleton key={index} />
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
            <Fragment key={index}>
              <Container disableGutters key={index} sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row' }}>
                <Grid container item sx={{ alignItems: 'center', gap: '6px' }} xs={4}>
                  <Grid item>
                    <CheckBox
                      checked={isChecked}
                      onChange={handleSelect(info, isChecked)}
                    />
                  </Grid>
                  <Grid item sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px' }}>
                    <FormatBalance2
                      decimalPoint={adaptiveDecimalPoint}
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
                      withCurrency={false}
                    />
                    <AssetLogo assetSize='16px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
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
            </Fragment>
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

  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const selectedAccount = useSelectedAccount();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const { adaptiveDecimalPoint,
    eraToDate,
    expandedRewards,
    onSelect,
    onSelectAll,
    selectedToPayout,
    totalSelectedPending,
    transactionInformation,
    tx } = usePendingRewardsSolo(selectedAccount?.address, genesisHash);

  const [review, setReview] = useState<boolean>(false);

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);
  const openReview = useCallback(() => setReview(true), []);
  const closeReview = useCallback(() => setReview(false), []);

  const transactionFlow = useTransactionFlow({
    address: selectedAccount?.address,
    backPathTitle: t('Payout rewards'),
    closeReview,
    genesisHash: genesisHash ?? '',
    review,
    stepCounter: { currentStep: 2, totalSteps: 2 },
    transactionInformation,
    tx
  });

  return transactionFlow || (
    <>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader fullscreenURL={'/fullscreen-stake/solo/' + genesisHash} homeType='default' />
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
              adaptiveDecimalPoint={adaptiveDecimalPoint}
              eraToDate={eraToDate}
              expandedRewards={expandedRewards}
              genesisHash={genesisHash}
              onSelect={onSelect}
              selectedToPayout={selectedToPayout}
            />
            <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '4px', m: 0, width: '100px' }}>
                <Typography color='text.highlight' variant='B-4'>
                  {t('Selected')}:
                </Typography>
                <Typography color='text.primary' variant='B-4'>
                  {selectedToPayout.length ?? 0}
                </Typography>
              </Container>
              <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, maxWidth: '225px', width: '100%' }}>
                <Typography color='text.highlight' variant='B-4'>
                  {t('Total')}:
                </Typography>
                <FormatBalance2
                  decimalPoint={adaptiveDecimalPoint}
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
              direction='horizontal'
              disabled={!selectedToPayout.length || !api}
              divider
              flexibleWidth
              onPrimaryClick={openReview}
              onSecondaryClick={onBack}
              primaryBtnText={t('Next')}
              secondaryBtnText={t('Cancel')}
              secondaryButtonProps={{ style: { width: '94px' } }}
              style={{ height: '44px' }}
            />
          </Stack>
        </Motion>
      </Grid>
    </>
  );
}
