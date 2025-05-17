// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { Proxy, ProxyTypes, TxInfo } from '../util/types';
import type { TRANSACTION_FLOW_STEPS } from './TransactionFlow';

import { Grid, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { InfoCircle } from 'iconsax-react';
import React, { useMemo } from 'react';

import { type BN, isBn } from '@polkadot/util';
import { isAddress } from '@polkadot/util-crypto';

import { AssetLogo, FormatBalance2, GradientDivider, Identity2, MyTooltip, SignArea3 } from '../components';
import { useChainInfo, useFormatted3, useSelectedAccount, useTranslation } from '../hooks';
import { PolkaGateIdenticon } from '../style';
import getLogo2 from '../util/getLogo2';
import { toShortAddress } from '../util/utils';

interface AccountBoxProps {
  selectedAccount: AccountJson | undefined;
  genesisHash: string;
}

const AccountBox = ({ genesisHash, selectedAccount }: AccountBoxProps) => {
  const { t } = useTranslation();
  const formatted = useFormatted3(selectedAccount?.address, genesisHash);

  return (
    <Stack direction='column' sx={{ bgcolor: '#110F2A', borderRadius: '14px', p: '12px 8px', rowGap: '12px' }}>
      <Typography color='text.highlight' sx={{ textAlign: 'center', width: '100%' }} variant='B-2'>
        {t('Account')}
      </Typography>
      <GradientDivider />
      <PolkaGateIdenticon address={selectedAccount?.address ?? ''} size={48} style={{ margin: 'auto' }} />
      <Typography color='text.primary' sx={{ textAlign: 'center', width: '100%' }} variant='B-3'>
        {selectedAccount?.name}
      </Typography>
      <Typography color='text.highlight' sx={{ mt: '-10px', textAlign: 'center', width: '100%' }} variant='B-1'>
        {toShortAddress(formatted ?? selectedAccount?.address, 8)}
      </Typography>
    </Stack>
  );
};

const DescriptionTip = ({ description }: { description: string | undefined }) => {
  const theme = useTheme();

  if (!description) {
    return null;
  }

  return (
    <MyTooltip
      content={description}
      placement='top'
    >
      <InfoCircle color={theme.palette.text.highlight} size='18' style={{ cursor: 'help' }} variant='Bold' />
    </MyTooltip>
  );
};

export interface Content {
  title: string;
  description?: string;
  withLogo?: boolean;
  content: string | BN | null | undefined;
}

interface ContentItemProps extends Content {
  decimal?: number;
  token?: string;
  genesisHash: string;
}

const ContentItem = ({ content, decimal, description, genesisHash, title, token, withLogo }: ContentItemProps) => {
  const logoInfo = useMemo(() => withLogo ? getLogo2(genesisHash, token) : undefined, [genesisHash, token, withLogo]);

  return (
    <>
      <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Stack direction='row' sx={{ alignItems: 'center', columnGap: '4px' }}>
          <Typography color='text.highlight' variant='B-1'>
            {title}
          </Typography>
          <DescriptionTip description={description} />
        </Stack>
        <Stack direction='row' sx={{ alignItems: 'center', columnGap: '4px' }}>
          {withLogo && <AssetLogo assetSize='18px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />}
          {content
            ? isBn(content)
              ? (
                <FormatBalance2
                  decimalPoint={4}
                  decimals={[decimal ?? 0]}
                  style={{
                    color: '#ffffff',
                    fontFamily: 'Inter',
                    fontSize: '13px',
                    fontWeight: 500,
                    width: 'max-content'
                  }}
                  tokens={[token ?? '']}
                  value={content}
                />)
              : isAddress(content)
                ? (
                  <Identity2
                    address={content}
                    genesisHash={genesisHash}
                    identiconSize={22}
                    showShortAddress
                    style={{ variant: 'B-1' }}
                    withShortAddress
                  />)
                : <Typography color='text.primary' variant='B-1'>
                  {content}
                </Typography>
            : (
              <Skeleton
                animation='wave'
                height='18px'
                sx={{ borderRadius: '12px', fontWeight: 'bold', transform: 'none', width: '55px' }}
                variant='text'
              />
            )
          }
        </Stack>
      </Stack>
      <GradientDivider />
    </>
  );
};

export interface ReviewProps {
  closeReview: () => void;
  genesisHash: string;
  proxyTypeFilter: ProxyTypes[] | undefined;
  setFlowStep: React.Dispatch<React.SetStateAction<TRANSACTION_FLOW_STEPS>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  selectedProxy: Proxy | undefined;
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  showProxySelection: boolean;
  setShowProxySelection: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
  transactionInformation: Content[];
}

export default function Review ({ closeReview, genesisHash, proxyTypeFilter, selectedProxy, setFlowStep, setSelectedProxy, setShowProxySelection, setTxInfo, showProxySelection, transaction, transactionInformation }: ReviewProps): React.ReactElement {
  const { decimal, token } = useChainInfo(genesisHash, true);
  const selectedAccount = useSelectedAccount();

  return (
    <Stack direction='column' sx={{ height: '500px', p: '15px', pb: 0, position: 'relative', width: '100%' }}>
      <AccountBox
        genesisHash={genesisHash}
        selectedAccount={selectedAccount}
      />
      <Grid container item sx={{ flexDirection: 'column', gap: '6px', maxHeight: '140px', mt: '20px', overflow: 'scroll', width: '100%' }}>
        {transactionInformation.map(({ content, description, title, withLogo }, index) => (
          <ContentItem
            content={content}
            decimal={decimal}
            description={description}
            genesisHash={genesisHash}
            key={index}
            title={title}
            token={token}
            withLogo={withLogo}
          />
        ))}
      </Grid>
      <SignArea3
        address={selectedAccount?.address}
        genesisHash={genesisHash}
        maybeApi={undefined}
        onClose={closeReview}
        proxyTypeFilter={proxyTypeFilter}
        selectedProxy={selectedProxy}
        setFlowStep={setFlowStep}
        setSelectedProxy={setSelectedProxy}
        setShowProxySelection={setShowProxySelection}
        setTxInfo={setTxInfo}
        showProxySelection={showProxySelection}
        transaction={transaction}
      />
    </Stack>
  );
}
