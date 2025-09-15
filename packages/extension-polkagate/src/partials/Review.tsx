// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { AccountJson } from '@polkadot/extension-base/background/types';
import type { ISubmittableResult } from '@polkadot/types/types';
import type { TransactionFlowStep } from '../util/constants';
import type { PoolInfo, Proxy, ProxyTypes, TxInfo } from '../util/types';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { type Icon as IconType, InfoCircle } from 'iconsax-react';
import React, { memo, useMemo } from 'react';

import { type BN, isBn, noop } from '@polkadot/util';
import { isAddress } from '@polkadot/util-crypto';

import { AssetLogo, FormatBalance2, GradientDivider, Identity2, MySkeleton, MyTooltip, SignArea3 } from '../components';
import RestakeRewardToggler from '../fullscreen/stake/new-pool/claimReward/partials/RestakeRewardToggler';
import { RewardHeaderAmount } from '../fullscreen/stake/new-pool/claimReward/partials/Review';
import { useChainInfo, useFormatted, useIsExtensionPopup, useSelectedAccount, useTranslation } from '../hooks';
import { PoolItem } from '../popup/staking/partial/PoolsTable';
import { PolkaGateIdenticon } from '../style';
import getLogo2 from '../util/getLogo2';
import { toShortAddress } from '../util/utils';
import UnableToPayFee from './UnableToPayFee';

interface AccountBoxProps {
  selectedAccount: AccountJson | null | undefined;
  genesisHash: string;
}

const AccountBox = ({ genesisHash, selectedAccount }: AccountBoxProps) => {
  const { t } = useTranslation();
  const formatted = useFormatted(selectedAccount?.address, genesisHash);
  const isExtension = useIsExtensionPopup();

  const color = useMemo(() => isExtension ? 'text.highlight' : '#AA83DC', [isExtension]);

  return (
    <Stack direction='column' sx={{ alignItems: 'center', bgcolor: isExtension ? '#05091C' : 'transparent', borderRadius: '14px', p: isExtension ? '12px 8px' : '4px 8px', rowGap: '12px' }}>
      <Typography color={color} sx={{ textAlign: 'center', width: '100%' }} variant='B-2'>
        {t('Account')}
      </Typography>
      {isExtension && <GradientDivider />}
      <PolkaGateIdenticon address={selectedAccount?.address ?? ''} size={48} style={{ margin: 'auto' }} />
      <Typography color='text.primary' sx={{ maxWidth: '220px', overflow: 'hidden', textAlign: 'center', textOverflow: 'ellipsis', width: '100%' }} variant='B-3'>
        {selectedAccount?.name}
      </Typography>
      <Typography color={color} sx={{ mt: '-10px', textAlign: 'center', width: '100%' }} variant='B-1'>
        {toShortAddress(formatted ?? selectedAccount?.address, 8)}
      </Typography>
    </Stack>
  );
};

const RowAccountBox = ({ genesisHash, selectedAccount }: AccountBoxProps) => {
  const isExtension = useIsExtensionPopup();

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: isExtension ? '#110F2A' : '#05091C', borderRadius: '14px', display: 'flex', gap: '12px', mb: '8px', p: '12px 8px' }}>
      <Identity2
        address={selectedAccount?.address}
        addressStyle={{ color: isExtension ? 'text.highlight' : '#AA83DC' }}
        charsCount={12}
        columnGap='5px'
        genesisHash={genesisHash ?? ''}
        identiconSize={36}
        showShortAddress
        style={{ addressVariant: 'B-4', variant: 'B-3' }}
        withShortAddress
      />
    </Container>
  );
};

export const DescriptionTip = ({ description }: { description: string | undefined }) => {
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  if (!description) {
    return null;
  }

  return (
    <MyTooltip
      content={description}
      placement='top'
    >
      <InfoCircle color={isExtension ? theme.palette.text.highlight : '#AA83DC'} size='18' style={{ cursor: 'help' }} variant='Bold' />
    </MyTooltip>
  );
};

export interface Content {
  title: string;
  description?: string;
  withLogo?: boolean;
  content: string | BN | null | undefined;
  Icon?: IconType;
  itemKey?: 'fee' | 'amount';
  warningText?: string;
}

interface ContentItemProps extends Content {
  decimal?: number;
  token?: string;
  genesisHash: string;
  noDivider?: boolean;
}

export const ContentItem = memo(function ContentItemMemo ({ Icon, content, decimal, description, genesisHash, noDivider = false, title, token, warningText, withLogo }: ContentItemProps) {
  const isExtension = useIsExtensionPopup();

  const logoInfo = useMemo(() => withLogo ? getLogo2(genesisHash, token) : undefined, [genesisHash, token, withLogo]);
  const color = useMemo(() => isExtension ? 'text.highlight' : '#BEAAD8', [isExtension]);

  return (
    <>
      <Stack direction='row' sx={{ alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <Stack direction='row' sx={{ alignItems: 'center', columnGap: '4px' }}>
          <Typography color={color} variant='B-1'>
            {title}
          </Typography>
          <DescriptionTip description={description} />
        </Stack>
        <Stack direction='row' sx={{ alignItems: 'center', columnGap: '4px' }}>
          {warningText &&
            <UnableToPayFee warningText={warningText} />
          }
          {Icon &&
            <Icon color='#AA83DC' size={18} variant='Bulk' />
          }
          {withLogo &&
            <AssetLogo assetSize='18px' baseTokenSize='0' genesisHash={genesisHash} logo={logoInfo?.logo} subLogo={undefined} />
          }
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
                  />)
                : <Typography color='text.primary' variant='B-1'>
                  {content}
                </Typography>
            : (
              <MySkeleton
                height={18}
                style={{ borderRadius: '12px', width: '75px' }}
              />
            )
          }
        </Stack>
      </Stack>
      {!noDivider &&
        <GradientDivider />
      }
    </>
  );
});

export interface ReviewProps {
  closeReview: () => void;
  genesisHash: string;
  amount?: string;
  proxyTypeFilter: ProxyTypes[] | undefined;
  setFlowStep: React.Dispatch<React.SetStateAction<TransactionFlowStep>>;
  setTxInfo: React.Dispatch<React.SetStateAction<TxInfo | undefined>>;
  selectedProxy: Proxy | undefined;
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  showProxySelection: boolean;
  setShowProxySelection: React.Dispatch<React.SetStateAction<boolean>>;
  transaction: SubmittableExtrinsic<'promise', ISubmittableResult>;
  transactionInformation: Content[];
  pool?: PoolInfo | undefined;
  showAccountBox?: boolean;
  restakeReward?: boolean;
  setRestakeReward?: React.Dispatch<React.SetStateAction<boolean>>;
  reviewHeader?: React.ReactNode;
}

export default function Review ({ amount, closeReview, genesisHash, pool, proxyTypeFilter, restakeReward, reviewHeader, selectedProxy, setFlowStep, setRestakeReward, setSelectedProxy, setShowProxySelection, setTxInfo, showAccountBox = true, showProxySelection, transaction, transactionInformation }: ReviewProps): React.ReactElement {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const selectedAccount = useSelectedAccount();
  const isExtension = useIsExtensionPopup();

  const isRow = useMemo(() => (pool && pool?.bondedPool?.state?.toString() !== 'Creating'), [pool]);
  const fsStyle = isExtension ? {} : { bgcolor: '#05091C', borderRadius: '14px', gap: '7px', padding: '15px 15px 8px' };

  return (
    <Stack direction='column' sx={{ height: '515px', p: '15px', pb: 0, position: 'relative', width: '100%', zIndex: 1 }}>
      {reviewHeader}
      {!showAccountBox && setRestakeReward && restakeReward !== undefined &&
        <RewardHeaderAmount
          amount={amount}
          genesisHash={genesisHash}
          style={{ bgcolor: '#110F2A', borderRadius: '14px', p: '24px' }}
          token={token}
        />
      }
      {showAccountBox && (isRow
        ? (
          <RowAccountBox
            genesisHash={genesisHash}
            selectedAccount={selectedAccount}
          />)
        : (
          <AccountBox
            genesisHash={genesisHash}
            selectedAccount={selectedAccount}
          />))}
      {pool && isRow &&
        <PoolItem
          genesisHash={genesisHash}
          onDetailClick={noop}
          poolInfo={pool}
          status={t('Joining')}
          style={{ marginTop: '8px' }}
        />
      }
      <Grid container item sx={{ flexDirection: 'column', gap: '6px', maxHeight: '170px', mt: '20px', overflow: 'hidden', overflowY: 'auto', width: '100%', ...fsStyle }}>
        {transactionInformation.map(({ content, description, title, warningText, withLogo }, index) => (
          <ContentItem
            content={content}
            decimal={decimal}
            description={description}
            genesisHash={genesisHash}
            key={index}
            noDivider={pool && !isRow}
            title={title}
            token={token}
            warningText={warningText}
            withLogo={withLogo}
          />
        ))}
      </Grid>
      {setRestakeReward && restakeReward !== undefined &&
        <RestakeRewardToggler
          restake={restakeReward}
          setRestake={setRestakeReward}
        />
      }
      {pool && !isRow &&
        <PoolItem
          genesisHash={genesisHash}
          onDetailClick={noop}
          poolInfo={pool}
          status={t('Creating')}
          style={{ marginTop: '14px' }}
        />
      }
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
        transaction={transaction}
      />
    </Stack>
  );
}
