// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FeeInfo } from '../fullscreen/sendFund/types';
import type { TransactionDetail } from '../util/types';

import { Container, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import Subscan from '../assets/icons/Subscan';
import { ActionButton, DisplayBalance, NeonButton } from '../components';
import { useChainInfo, useIsBlueish, useTranslation } from '../hooks';
import FailSuccessIcon from '../popup/history/partials/FailSuccessIcon';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { GlowBox, GradientDivider, VelvetBox } from '../style';
import { amountToHuman, countDecimalPlaces, getSubscanChainName, toShortAddress, toTitleCase, updateStorage } from '../util';
import { mapRelayToSystemGenesisIfMigrated } from '../util/migrateHubUtils';

interface SubProps {
  transactionDetail: TransactionDetail;
  genesisHash: string | undefined;
}

const ConfirmationHeader = ({ genesisHash, transactionDetail }: SubProps) => {
  const isBlueish = useIsBlueish();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const { amount, failureText, success } = transactionDetail;
  const amountInHuman = amountToHuman((amount ?? '0'), decimal);

  const [integerPart, decimalPart] = amountInHuman.split('.');

  const decimalToShow = useMemo(() => {
    if (decimalPart) {
      const countDecimal = countDecimalPlaces(Number('0.' + decimalPart));
      const toCut = countDecimal > 4 ? 4 : countDecimal;

      return `.${decimalPart.slice(0, toCut)}`;
    } else {
      return '.00';
    }
  }, [decimalPart]);

  return (
    <GlowBox isBlueish style={{ m: 0, width: '100%' }}>
      <FailSuccessIcon
        failureText={failureText}
        isBlueish={isBlueish}
        success={success}
      >
        <Stack alignItems='flex-end' direction='row' py='4px'>
          <Typography color='text.primary' lineHeight='normal' variant='H-1'>
            {integerPart}
          </Typography>
          <Typography color={isBlueish ? 'text.highlight' : 'text.secondary'} variant='H-3'>
            {decimalToShow}
          </Typography>
          <Typography color={isBlueish ? 'text.highlight' : 'text.secondary'} pl='3px' variant='H-3'>
            {token}
          </Typography>
        </Stack>
      </FailSuccessIcon>
    </GlowBox>
  );
};

interface ListItemType { content: FeeInfo | string | number | undefined; title: string; }

const ConfirmationDetail = ({ genesisHash, transactionDetail }: SubProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const { amount, block, fee, txHash } = transactionDetail;
  const listItem: ListItemType[] = useMemo(() => ([
    { content: block, title: t('block') },
    { content: txHash, title: t('hash') },
    { content: amount, title: t('amount') },
    { content: fee, title: t('fee') }
  ]), [amount, block, fee, t, txHash]);

  return (
    <VelvetBox noGlowBall>
      <Stack direction='column' sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', justifyContent: 'center', p: '12px 18px' }}>
        {listItem.map(({ content, title }, index) => {
          const withDivider = listItem.length > index + 1;
          const isHash = title === 'hash';
          const isBlock = title === 'block';
          const isFee = title === 'fee';
          const isAmount = title === 'amount';

          const color = isBlock ? 'text.primary' : 'text.highlight';

          return (
            <React.Fragment key={index}>
              <Container disableGutters key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color='text.highlight' textTransform='capitalize' variant='B-1' width='fit-content'>
                  {toTitleCase(title)}
                </Typography>
                <Typography color={color} sx={{ bgcolor: isHash ? '#C6AECC26' : 'none', borderRadius: '9px', p: '2px 3px' }} variant='B-1' width='fit-content'>
                  {content === undefined
                    ? '--'
                    : isHash
                      ? toShortAddress(String(content), 6)
                      : (isFee || isAmount)
                        ? (
                          <DisplayBalance
                            balance={content as string}
                            decimal={decimal}
                            style={{
                              color: theme.palette.text.highlight,
                              width: 'max-content'
                            }}
                            token={token}
                          />)
                        : content as string
                  }
                </Typography>
              </Container>
              {withDivider && <GradientDivider style={{ my: '5px' }} />}
            </React.Fragment>
          );
        })}
      </Stack>
    </VelvetBox>
  );
};

interface Props {
  address: string;
  transactionDetail: TransactionDetail;
  genesisHash: string | undefined;
  close?: () => void
  noStakingHomeButton?: boolean;
}

export default function Confirmation2 ({ address, close, genesisHash, noStakingHomeButton = false, transactionDetail }: Props) {
  const { t } = useTranslation();
  const { chainName } = useChainInfo(genesisHash, true);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { redirectPath, redirectToSamePath } = useMemo(() => {
    if (!genesisHash) {
      return {
        redirectPath: '',
        redirectToSamePath: false
      };
    }

    const stakingGenesisHash = mapRelayToSystemGenesisIfMigrated(genesisHash);

    let stakingPath = pathname.startsWith('/pool/') ? 'pool' : 'solo';
    let redirectPath = `/${stakingPath}/${stakingGenesisHash}`;

    if (pathname.includes('easyStake') && transactionDetail.extra?.['easyStakingType']) {
      stakingPath = transactionDetail.extra['easyStakingType'];
      redirectPath = `/${stakingPath}/${stakingGenesisHash}`;
    }

    return {
      redirectPath,
      redirectToSamePath: pathname === redirectPath
    };
  }, [genesisHash, pathname, transactionDetail.extra]);

  const goToHistory = useCallback(() => {
    updateStorage(STORAGE_KEY.ACCOUNT_SELECTED_CHAIN, { [address]: genesisHash })
      .finally(() => navigate('/history') as void)
      .catch(console.error);
  }, [address, genesisHash, navigate]);

  const backToStakingHome = useCallback(() =>
    close && redirectToSamePath
      ? close()
      : navigate(redirectPath, { replace: true }) as void
    , [close, navigate, redirectPath, redirectToSamePath]);

  const goToExplorer = useCallback(() => {
    const network = getSubscanChainName(chainName);
    const url = `https://${network}.subscan.io/account/${address}`;

    chrome.tabs.create({ url }).catch(console.error);
  }, [address, chainName]);

  return (
    <Stack direction='column' sx={{ gap: '8px', height: 'calc(100% - 34px)', p: '15px 15px 0' }}>
      <ConfirmationHeader genesisHash={genesisHash} transactionDetail={transactionDetail} />
      <ConfirmationDetail genesisHash={genesisHash} transactionDetail={transactionDetail} />
      <Stack direction='column' sx={{ alignItems: 'center', bottom: '15px', gap: '8px', height: '150px', left: 0, position: 'absolute', width: '100%' }}>
        <NeonButton
          contentPlacement='center'
          onClick={goToHistory}
          style={{
            height: '44px',
            width: '345px'
          }}
          text={t('History')}
        />
        {!noStakingHomeButton &&
          <ActionButton
            contentPlacement='center'
            isBlueish
            onClick={backToStakingHome}
            style={{
              height: '44px',
              width: '345px'
            }}
            text={t('Staking Home')}
            variant='text'
          />}
        <StakingActionButton
          onClick={goToExplorer}
          startIcon={
            <Subscan
              color='#ffffff'
              height={13}
              width={13}
            />}
          style={{ width: '345px' }}
          text={t('View on Explorer')}
        />
      </Stack>
    </Stack>
  );
}
