// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { DisplayAmount } from '@polkadot/extension-polkagate/src/partials';

import { SignArea3 } from '../../../../../components';
import { useChainInfo, useIsDark, useIsExtensionPopup, useSelectedAccount, useTranslation } from '../../../../../hooks';
import { ContentItem, type ReviewProps } from '../../../../../partials/Review';
import RestakeRewardToggler, { type RestakeRewardTogglerProps } from './RestakeRewardToggler';

interface RewardHeaderAmountProps {
  amount: string | undefined;
  genesisHash: string;
  token: string | undefined;
  title?: string;
  style?: SxProps<Theme>;
}

export const RewardHeaderAmount = ({ amount, genesisHash, style = {}, title, token }: RewardHeaderAmountProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();
  const isDark = useIsDark();
  const accentColor = isExtension ? (isDark ? theme.palette.text.highlight : '#745E9F') : '#AA83DC';

  return (
    <Stack sx={{ alignItems: 'center', ...style }}>
      <Typography color={accentColor} variant='B-2'>
        {title || t('Claim Rewards')}
      </Typography>
      <DisplayAmount
        amount={amount}
        differentValueColor={accentColor}
        genesisHash={genesisHash}
        isExtension={isExtension}
        token={token}
      />
    </Stack>
  );
};

interface Props extends ReviewProps, RestakeRewardTogglerProps {
  amount: string | undefined;
}

export default function Review({ amount, closeReview, genesisHash, proxyTypeFilter, restake, selectedProxy, setFlowStep, setRestake, setSelectedProxy, setShowProxySelection, setTxInfo, showProxySelection, transaction, transactionInformation }: Props): React.ReactElement {
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const selectedAccount = useSelectedAccount();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Stack direction='column' sx={{ height: '515px', p: '15px', position: 'relative', py: 0, width: '100%', zIndex: 1 }}>
      <RewardHeaderAmount
        amount={amount}
        genesisHash={genesisHash}
        token={token}
      />
      <Grid
        container
        item
        sx={{
          bgcolor: isDark ? '#05091C' : '#FFFFFF',
          border: isDark ? 'none' : '1px solid #DDE3F4',
          borderRadius: '14px',
          boxShadow: isDark ? 'none' : '0 14px 28px rgba(133, 140, 176, 0.12)',
          flexDirection: 'column',
          gap: '7px',
          maxHeight: '190px',
          mt: '20px',
          overflow: 'hidden',
          overflowY: 'auto',
          padding: '15px',
          width: '100%'
        }}
      >
        {transactionInformation.map(({ Icon, content, description, itemKey, title, warningText, withLogo }, index) => (
          <ContentItem
            Icon={Icon}
            content={content}
            decimal={decimal}
            description={description}
            genesisHash={genesisHash}
            itemKey={itemKey}
            key={index}
            title={title}
            token={token}
            warningText={warningText}
            withLogo={withLogo}
          />
        ))}
      </Grid>
      <RestakeRewardToggler
        restake={restake}
        setRestake={setRestake}
      />
      <SignArea3
        address={selectedAccount?.address}
        genesisHash={genesisHash}
        ledgerStyle={{ position: 'unset' }}
        onClose={closeReview}
        proxyTypeFilter={proxyTypeFilter}
        selectedProxy={selectedProxy}
        setFlowStep={setFlowStep}
        setSelectedProxy={setSelectedProxy}
        setShowProxySelection={setShowProxySelection}
        setTxInfo={setTxInfo}
        showProxySelection={showProxySelection}
        style={{ bottom: 0 }}
        transaction={transaction}
        withCancel
      />
    </Stack>
  );
}
