// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React from 'react';

import { SignArea3 } from '../../../../../components';
import { useChainInfo, useIsExtensionPopup, useSelectedAccount, useTranslation } from '../../../../../hooks';
import { ContentItem, type ReviewProps } from '../../../../../partials/Review';
import { Amount } from '../../../partials/StakingConfirmation';
import RestakeRewardToggler, { type RestakeRewardTogglerProps } from './RestakeRewardToggler';

interface RewardHeaderAmountProps {
  amount: string | undefined;
  genesisHash: string;
  token: string | undefined;
  style?: SxProps<Theme>;
}

export const RewardHeaderAmount = ({ amount, genesisHash, style, token }: RewardHeaderAmountProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  return (
    <Stack sx={{ alignItems: 'center', ...style }}>
      <Typography color={isExtension ? theme.palette.text.highlight : '#AA83DC'} variant='B-2'>
        {t('Claim Rewards')}
      </Typography>
      <Amount
        amount={amount}
        differentValueColor={isExtension ? theme.palette.text.highlight : '#AA83DC'}
        genesisHash={genesisHash}
        isExtension ={isExtension}
        token={token}
      />
    </Stack>
  );
};

interface Props extends ReviewProps, RestakeRewardTogglerProps {
  amount: string | undefined;
}

export default function Review ({ amount, closeReview, genesisHash, proxyTypeFilter, restake, selectedProxy, setFlowStep, setRestake, setSelectedProxy, setShowProxySelection, setTxInfo, showProxySelection, transaction, transactionInformation }: Props): React.ReactElement {
  const { decimal, token } = useChainInfo(genesisHash, true);
  const selectedAccount = useSelectedAccount();

  return (
    <Stack direction='column' sx={{ height: '515px', p: '15px', position: 'relative', py: 0, width: '100%', zIndex: 1 }}>
      <RewardHeaderAmount
        amount={amount}
        genesisHash={genesisHash}
        token={token}
      />
      <Grid container item sx={{ bgcolor: '#05091C', borderRadius: '14px', flexDirection: 'column', gap: '7px', maxHeight: '190px', mt: '20px', overflow: 'hidden', overflowY: 'auto', padding: '15px', width: '100%' }}>
        {transactionInformation.map(({ Icon, content, description, title, warningText, withLogo }, index) => (
          <ContentItem
            Icon={Icon}
            content={content}
            decimal={decimal}
            description={description}
            genesisHash={genesisHash}
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
