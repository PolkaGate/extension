// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Badge } from '../../../../assets/gif';
import { DecisionButtons, FormatBalance2 } from '../../../../components';
import { useChainInfo, usePendingRewardsSolo, useTranslation } from '../../../../hooks';
import { PROXY_TYPE } from '../../../../util/constants';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';
import { RewardsTable, TableHeader } from './RewardsTable';

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
      maxHeight={649}
      onClose={onClose}
      proxyTypeFilter={PROXY_TYPE.STAKING}
      setFlowStep={setFlowStep}
      showBack
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
            <Typography color='#AA83DC' textAlign='left' variant='B-4'>
              {t('Validators usually pay rewards regularly. If not received within the set period, rewards expire. You can manually initiate the payout if desired.')}
            </Typography>
          </Container>
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
        </Stack>
        <Grid container item sx={{ bgcolor: '#05091C', borderRadius: '28px', gap: '16px', mt: '10px', p: '16px' }}>
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
