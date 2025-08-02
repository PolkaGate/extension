// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExpandedRewards } from '../../solo/pending';

import { Box, Container, Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import React, { Fragment, useCallback, useMemo, useRef, useState } from 'react';

import { Badge } from '../../../../assets/gif';
import { AssetLogo, DecisionButtons, FadeOnScroll, FormatBalance2, GlowCheckbox, Identity2 } from '../../../../components';
import { useChainInfo, usePendingRewardsSolo, useTranslation } from '../../../../hooks';
import getLogo2 from '../../../../util/getLogo2';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

const SKELETON_HEIGHT = 24;
const TABLE_HEIGHT = 300;

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
        <GlowCheckbox
          changeState={handleAllSelect}
          checked={checked}
          iconStyle={{ height: '24px', width: '24px' }}
          style={{ m: 0, width: 'fit-content' }}
        />
        <Typography color='#AA83DC' variant='B-1'>
          {t('Amount')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item xs>
        <Typography color='#AA83DC' variant='B-1'>
          {t('Validator')}
        </Typography>
      </Grid>
      <Grid alignItems='center' container item xs={2}>
        <Typography color='#AA83DC' variant='B-1'>
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
      <Stack direction='column' ref={containerRef} sx={{ gap: '4px', height: TABLE_HEIGHT, maxHeight: TABLE_HEIGHT, mb: '8px', overflow: 'hidden', overflowY: 'auto', pb: '15px', width: '100%' }}>
        {expandedRewards === undefined &&
          Array.from({ length: 5 }).map((_, index) => (
            <StyledSkeleton key={index} />
          ))}
        {expandedRewards && expandedRewards.length === 0 &&
          <Grid container justifyContent='center' sx={{ mt: '70px' }}>
            <Typography color='#AA83DC' variant='B-2'>
              {t('No pending rewards found!')}
            </Typography>
          </Grid>
        }
        {expandedRewards?.map((info, index) => {
          const [eraIndex, validator, _page, value] = info;
          const isChecked = isIncluded(info);

          return (
            <Fragment key={index}>
              <Container disableGutters key={index} sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', p: '5px 8px' }}>
                <Grid container item sx={{ alignItems: 'center', gap: '6px' }} xs={4}>
                  <Grid item>
                    <GlowCheckbox
                      changeState={handleSelect(info, isChecked)}
                      checked={isChecked}
                      iconStyle={{ height: '24px', width: '24px' }}
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
                      tokenColor='#AA83DC'
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
                  <Typography color='#AA83DC' variant='B-2'>
                    {eraToDate(Number(eraIndex))}
                  </Typography>
                </Grid>
              </Container>
            </Fragment>
          );
        })}
      </Stack>
      <FadeOnScroll containerRef={containerRef} height='30px' ratio={0.3} />
    </Grid>
  );
};

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

export default function PendingRewards ({ address, genesisHash, onClose }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);

  const { adaptiveDecimalPoint,
    eraToDate,
    expandedRewards,
    onSelect,
    onSelectAll,
    selectedToPayout,
    totalSelectedPending,
    transactionInformation,
    tx } = usePendingRewardsSolo(address, genesisHash);

  const onNext = useCallback(() => setFlowStep(FULLSCREEN_STAKING_TX_FLOW.REVIEW), []);
  const onBack = useCallback(() => {
    setFlowStep(FULLSCREEN_STAKING_TX_FLOW.NONE);
    onClose();
  }, [onClose]);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={genesisHash}
      maxHeight={680}
      onClose={onClose}
      setFlowStep={setFlowStep}
      showBack={false}
      title={t('Pending Rewards')}
      transaction={tx}
      transactionInformation={transactionInformation}
    >
      <Grid container item sx={{ p: '4px' }}>
        <Stack direction='column' sx={{ gap: '8px', px: '14px', width: '100%' }}>
          <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', mb: '16px', p: '22px', pr: '32px' }}>
            <Box
              component='img'
              src={Badge as string}
              style={{
                height: '64px',
                width: '64px'
              }}
            />
            <Typography color='#AA83DC' textAlign='justify' variant='B-4'>
              {t('Validators usually pay rewards regularly. If not received within the set period, rewards expire. You can manually initiate the payout if desired.')}
            </Typography>
          </Container>
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
        </Stack>
        <Grid container item sx={{ bgcolor: '#05091C', borderRadius: '28px', gap: '16px', p: '16px' }}>
          <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '4px', m: 0, width: '130px' }}>
              <Typography color='#AA83DC' variant='B-4'>
                {t('Selected')}:
              </Typography>
              <Typography color='text.primary' variant='B-4'>
                {selectedToPayout.length ?? 0}
              </Typography>
            </Container>
            <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', m: 0, width: '220px' }}>
              <Typography color='#AA83DC' variant='B-4'>
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
            cancelButton
            direction='horizontal'
            disabled={!selectedToPayout.length || !api}
            divider
            flexibleWidth
            onPrimaryClick={onNext}
            onSecondaryClick={onBack}
            primaryBtnText={t('Next')}
            secondaryBtnText={t('Cancel')}
            secondaryButtonProps={{ style: { width: '130px' } }}
            style={{ height: '44px' }}
          />
        </Grid>
      </Grid>
    </StakingPopup>
  );
}
