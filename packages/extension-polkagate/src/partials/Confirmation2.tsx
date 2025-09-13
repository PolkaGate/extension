// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../util/types';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { CloseCircle, TickCircle } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';

import Subscan from '../assets/icons/Subscan';
import { ActionButton, FormatBalance2, NeonButton } from '../components';
import { useChainInfo, useIsBlueish, useTranslation } from '../hooks';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { GlowBox, GradientDivider, VelvetBox } from '../style';
import { toTitleCase, updateStorage } from '../util';
import { mapRelayToSystemGenesisIfMigrated } from '../util/migrateHubUtils';
import { amountToHuman, countDecimalPlaces, getSubscanChainName, toShortAddress } from '../util/utils';

interface SubProps {
  transactionDetail: TransactionDetail;
  genesisHash: string | undefined;
}

const ConfirmationHeader = ({ genesisHash, transactionDetail }: SubProps) => {
  const { t } = useTranslation();
  const isBlueish = useIsBlueish();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const amountInHuman = amountToHuman((transactionDetail?.amount ?? '0'), decimal);

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
      <Stack sx={{ alignItems: 'center', mt: '-5px' }}>
        <Grid container item sx={{ backdropFilter: 'blur(4px)', border: '8px solid', borderColor: '#00000033', borderRadius: '999px', overflow: 'hidden', width: 'fit-content' }}>
          {transactionDetail.success
            ? <TickCircle color='#82FFA5' size='50' style={{ background: '#000', borderRadius: '999px', margin: '-4px' }} variant='Bold' />
            : <CloseCircle color='#FF4FB9' size='50' style={{ background: '#000', borderRadius: '999px', margin: '-4px' }} variant='Bold' />
          }
        </Grid>
        <Typography color= {isBlueish ? 'text.highlight' : 'primary.main'} pt='8px' textTransform='capitalize' variant='B-2'>
          {transactionDetail.success
            ? t('Completed')
            : t('Failed')
          }
        </Typography>
        <Stack alignItems='flex-end' direction='row' py='4px'>
          <Typography color='text.primary' lineHeight='normal' variant='H-1'>
            {integerPart}
          </Typography>
          <Typography color= { isBlueish ? 'text.highlight' : 'text.secondary'} variant='H-3'>
            {decimalToShow}
          </Typography>
          <Typography color= { isBlueish ? 'text.highlight' : 'text.secondary'} pl='3px' variant='H-3'>
            {token}
          </Typography>
        </Stack>
        {/* <Typography color='text.highlight' variant='B-2'>
          {transactionDetail}
        </Typography> */}
      </Stack>
    </GlowBox>
  );
};

interface ListItemType { content: string | number | undefined; title: string; }

const ConfirmationDetail = ({ genesisHash, transactionDetail }: SubProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const listItem: ListItemType[] = useMemo(() => ([
    { content: transactionDetail.block, title: t('block') },
    { content: transactionDetail.txHash, title: t('hash') },
    { content: transactionDetail.amount, title: t('amount') },
    { content: transactionDetail.fee, title: t('fee') }
  ]), [t, transactionDetail.amount, transactionDetail.block, transactionDetail.fee, transactionDetail.txHash]);

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
                      ? toShortAddress(content.toString(), 6)
                      : (isFee || isAmount)
                        ? (
                          <FormatBalance2
                            decimalPoint={4}
                            decimals={[decimal ?? 0]}
                            style={{
                              color: theme.palette.text.highlight,
                              fontFamily: 'Inter',
                              fontSize: '13px',
                              fontWeight: 500,
                              width: 'max-content'
                            }}
                            tokens={[token ?? '']}
                            value={content as string}
                          />)
                        : content
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
}

export default function Confirmation2 ({ address, close, genesisHash, transactionDetail }: Props) {
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
    updateStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, { [address]: genesisHash })
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
        />
        <StakingActionButton
          onClick={goToExplorer}
          startIcon={
            <Subscan
              color='#ffffff'
              height = {13}
              width = {13}
            />}
          style={{ width: '345px' }}
          text={t('View on Explorer')}
        />
      </Stack>
    </Stack>
  );
}
