// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FeeInfo } from '../fullscreen/sendFund/types';
import type { TransactionDetail } from '../util/types';

import { Avatar, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import FailSuccessIcon from '@polkadot/extension-polkagate/src/popup/history/partials/FailSuccessIcon';
import getLogo from '@polkadot/extension-polkagate/src/util/getLogo';

import Subscan from '../assets/icons/Subscan';
import { ActionButton, DisplayBalance, GradientButton, Identity2, NeonButton } from '../components';
import { DraggableModal } from '../fullscreen/components/DraggableModal';
import { useChainInfo, useIsBlueish, useIsExtensionPopup, useRouteRefresh, useStakingConsts, useTranslation } from '../hooks';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { GlowBox, GradientDivider, VelvetBox } from '../style';
import { getSubscanChainName, isValidAddress, toShortAddress, toTitleCase, updateStorage } from '../util';
import { STORAGE_KEY } from '../util/constants';
import { mapRelayToSystemGenesisIfMigrated } from '../util/migrateHubUtils';
import DisplayAmount from './DisplayAmount';

interface ProxyAccountsProps {
  accounts: string[];
  genesisHash: string;
}

const ProxyAccounts = ({ accounts, genesisHash }: ProxyAccountsProps) => {
  return (
    <Grid alignItems='center' container direction='row' item justifyContent='center' margin='10px 0 15px' width='90%'>
      {accounts?.map((acc, index) => (
        <Identity2
          address={acc}
          genesisHash={genesisHash}
          identiconSize={16}
          key={index}
          nameStyle={{ textAlign: 'center' }}
          showShortAddress
          style={{ backgroundColor: '#C6AECC26', borderRadius: '9px', color: '#AA83DC', margin: '3px', padding: '4px 8px 4px 4px', variant: 'B-2' }}
        />
      ))}
    </Grid>
  );
};

const ValidatorsConfirm = ({ genesisHash, nominators }: { genesisHash: string | undefined; nominators: string[] }) => {
  const { t } = useTranslation();
  const stakingConst = useStakingConsts(genesisHash);

  return (
    <Stack alignItems='flex-end' direction='row' pb='30px' pt='12px'>
      <Typography color='text.primary' lineHeight='normal' variant='H-1'>
        {nominators.length}
      </Typography>
      <Typography color='#AA83DC' variant='H-3'>
        {`/ ${stakingConst?.maxNominations ?? 16}`}
      </Typography>
      <Typography color='text.secondary' pl='3px' variant='H-3'>
        {t('nominated')}
      </Typography>
    </Stack>
  );
};

interface HeaderProps {
  genesisHash: string | undefined;
  isBlueish: boolean;
  transactionDetail: TransactionDetail;
}

const Header = ({ genesisHash, isBlueish, transactionDetail }: HeaderProps) => {
  const { accounts, amount, assetDecimal, description, failureText, nominators, success, token } = transactionDetail;

  return (
    <GlowBox isBlueish={isBlueish} style={{ m: 0, minHeight: '120px', width: '100%' }}>
      <FailSuccessIcon
        description={description}
        failureText={failureText}
        success={success}
      >
        {nominators &&
          <ValidatorsConfirm
            genesisHash={genesisHash}
            nominators={nominators}
          />
        }
        {
          accounts && genesisHash
            ? <>
              {
                accounts.length > 1
                  ? <ProxyAccounts
                    accounts={accounts}
                    genesisHash={genesisHash}
                    />
                  : <Identity2
                    address={accounts[0]}
                    addressStyle={{ color: '#AA83DC', variant: 'B-1' }}
                    charsCount={5}
                    genesisHash={genesisHash}
                    nameStyle={{ paddingBottom: '7px', textAlign: 'center' }}
                    noIdenticon
                    style={{ maxWidth: '170px', overflow: 'hidden', padding: '10px 0 18px', textOverflow: 'ellipsis', variant: 'B-3' }}
                    withShortAddress
                    />
              }
            </>
            : amount &&
            <DisplayAmount
              amount={amount}
              assetDecimal={assetDecimal}
              genesisHash={genesisHash}
              token={token}
            />
        }
      </FailSuccessIcon>
    </GlowBox>
  );
};

interface DetailProps {
  genesisHash: string | undefined;
  isBlueish?: boolean;
  showDate: boolean | undefined;
  transactionDetail: TransactionDetail;
}

const Detail = ({ genesisHash, isBlueish, showDate, transactionDetail }: DetailProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal: nativeAssetDecimal, token: nativeToken } = useChainInfo(genesisHash, true);

  const { accounts, amount, assetDecimal, decimal, extra, token = nativeToken } = transactionDetail;
  const _decimal = assetDecimal ?? decimal ?? nativeAssetDecimal;

  const mainEntries = useMemo(() => {
    const isAmountInHeader = amount && !accounts;

    const baseFields = ['deposit', 'fee', 'block', 'txHash'];

    const fieldsToDisplay = [
      ...(showDate ? ['date'] : []),
      ...(isAmountInHeader ? baseFields : ['amount', ...baseFields])
    ];

    return fieldsToDisplay
      .map((field) => [field, transactionDetail[field as keyof TransactionDetail]])
      .filter(([_, value]) => value !== undefined && value !== null) as [string, TransactionDetail[keyof TransactionDetail]][];
  }, [accounts, amount, showDate, transactionDetail]);

  const extraEntries = useMemo(() => {
    if (extra && typeof extra === 'object') {
      return Object.entries(extra).filter(([_, value]) => value !== undefined && value !== null);
    }

    return [];
  }, [extra]);

  const getContentTypeAndColor = useCallback((key: string, content: TransactionDetail[keyof TransactionDetail]) => {
    const isHash = key === 'txHash';
    const isBlock = key === 'block';
    const isFee = ['fee'].includes(key);
    const isBalance = isFee || ['amount', 'deposit'].includes(key);
    const isAddress = isValidAddress(content as string);
    const isFromToAddress = isAddress && ['from', 'to'].includes(key);
    const isDate = showDate && key === 'date';
    const color = (isBlock || isDate) ? 'text.primary' : isBlueish ? 'text.highlight' : 'text.secondary';

    return { color, isAddress, isBalance, isBlock, isDate, isFee, isFromToAddress, isHash };
  }, [isBlueish, showDate]);

  const entriesToRender = [...extraEntries, ...mainEntries].filter(([_, content]) => content !== null && content !== undefined);

  return (
    <VelvetBox>
      <Stack direction='column' sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', justifyContent: 'center', maxHeight: '260px', overflow: 'auto', p: '12px 18px' }}>
        {entriesToRender.map(([key, content], index) => {
          const withDivider = entriesToRender.length > index + 1;
          const { color, isAddress, isBalance, isBlock, isDate, isFee, isFromToAddress, isHash } = getContentTypeAndColor(key, content);

          return (
            <React.Fragment key={key}>
              <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                <Typography color={isBlueish ? 'text.highlight' : 'text.secondary'} textTransform='capitalize' variant='B-1' width='fit-content'>
                  {key === 'txHash' ? t('Transaction ID') : toTitleCase(key)}
                </Typography>
                <Stack columnGap='3px' direction='row' justifyContent='end'>
                  {
                    isFromToAddress &&
                    <Identity2
                      address={content as string}
                      genesisHash={POLKADOT_GENESIS}
                      identiconSize={18}
                      showSocial={false}
                      style={{ color: 'text.primary', variant: 'B-1' }}
                      withShortAddress={false}
                    />
                  }
                  <Typography color={color} sx={{ bgcolor: isHash || isAddress ? '#C6AECC26' : 'none', borderRadius: '9px', p: '2px 3px' }} variant='B-1' width='fit-content'>
                    {isBlock && '#'}
                    {isHash || isAddress
                      ? toShortAddress(String(content), 6)
                      : isBalance
                        ? (
                          <DisplayBalance
                            balance={
                              isFee && typeof content === 'object' && 'fee' in (content as any)
                                ? (content as FeeInfo).fee
                                : (content as string)
                            }
                            decimal={(isFee && typeof content === 'object' && 'decimal' in (content as any)
                              ? (content as FeeInfo).decimal
                              : isFee ? nativeAssetDecimal : _decimal) ?? 0}
                            style={{
                              color: isBlueish ? theme.palette.text.highlight : theme.palette.primary.main,
                              width: 'max-content'
                            }}
                            token={(isFee && typeof content === 'object' && 'token' in (content as any)
                              ? (content as FeeInfo).token
                              : isFee ? nativeToken : token) ?? ''}
                          />)
                        : isDate
                          ? new Date(content as number).toLocaleString('en-US', { day: 'numeric', hour: 'numeric', hour12: true, minute: '2-digit', month: 'short', second: '2-digit', weekday: 'short', year: 'numeric' })
                          : content as string
                    }
                  </Typography>
                </Stack>
              </Container>
              {
                withDivider &&
                <GradientDivider style={{ my: '5px' }} />
              }
            </React.Fragment>
          );
        })}
      </Stack>
    </VelvetBox>
  );
};

interface ButtonsProps {
  address: string;
  backToHome?: () => void;
  backToHomeText?: string;
  genesisHash: string | undefined;
  goToHistory?: () => void;
  isBlueish: boolean;
  success: boolean;
}

function Buttons ({ address, backToHome, backToHomeText, genesisHash, goToHistory, isBlueish, success }: ButtonsProps) {
  const { t } = useTranslation();
  const { chainName } = useChainInfo(genesisHash, true);

  const goToExplorer = useCallback(() => {
    const network = getSubscanChainName(chainName);

    const url = `https://${network}.subscan.io/account/${address}`;

    chrome.tabs.create({ url }).catch(console.error);
  }, [address, chainName]);

  const btnStyle = {
    height: '44px',
    width: '100%'
  };

  return (
    <Stack direction='column' sx={{ alignItems: 'center', gap: '8px', left: 0, mt: '2px', width: '100%' }}>
      {
        goToHistory && success &&
        <NeonButton
          contentPlacement='center'
          onClick={goToHistory}
          style={btnStyle}
          text={t('History')}
        />
      }
      {
        backToHome &&
        <ActionButton
          contentPlacement='center'
          isBlueish={isBlueish}
          onClick={backToHome}
          style={btnStyle}
          text={backToHomeText || t('Back to Home')}
          variant='text'
        />
      }
      {isBlueish
        ? <StakingActionButton
          onClick={goToExplorer}
          startIcon={
            <Subscan
              color='#ffffff'
              height={13}
              width={13}
            />}
          style={{ width: '100%' }}
          text={t('View on Explorer')}
          />
        : <GradientButton
          onClick={goToExplorer}
          startIconNode={
            <Avatar
              src={getLogo('subscan')}
              sx={{ borderRadius: '50%', height: 20, marginRight: '8px', width: 20, zIndex: 2 }}
              variant='square'
            />
          }
          style={{ ...btnStyle, zIndex: 2 }}
          text={t('View on Explorer')}
          />
      }
    </Stack>
  );
}

interface ContentProps {
  address: string;
  backToHome?: () => void;
  backToHomeText?: string;
  genesisHash: string | undefined;
  isModal?: boolean;
  showHistoryButton?: boolean;
  onClose?: () => void;
  showStakingHome?: boolean;
  showDate?: boolean;
  transactionDetail: TransactionDetail;
}

function Content ({ address, backToHome, backToHomeText, genesisHash, isModal, onClose, showDate, showHistoryButton, showStakingHome, transactionDetail }: ContentProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isBlueish = useIsBlueish();
  const isExtension = useIsExtensionPopup();
  const navigate = useNavigate();
  const refresh = useRouteRefresh();

  const stakingPath = useMemo(() =>
    pathname.startsWith('/pool/')
      ? 'pool'
      : pathname.startsWith('/solo/')
        ? 'solo'
        : pathname.includes('easyStake')
          ? transactionDetail.extra?.['easyStakingType']
          : undefined
    , [pathname, transactionDetail.extra]);

  const { redirectPath, redirectToSamePath } = useMemo(() => {
    if (!genesisHash || !stakingPath) {
      return {
        redirectPath: '',
        redirectToSamePath: false
      };
    }

    const stakingGenesisHash = mapRelayToSystemGenesisIfMigrated(genesisHash);
    const redirectPath = `/${stakingPath}/${stakingGenesisHash}`;

    return {
      redirectPath,
      redirectToSamePath: pathname === redirectPath
    };
  }, [genesisHash, pathname, stakingPath]);

  const backToStakingHome = useCallback(() => {
    onClose && redirectToSamePath
      ? onClose()
      : navigate(redirectPath, { replace: true }) as void;
  }
    , [onClose, navigate, redirectPath, redirectToSamePath]);

  const handleHome = useCallback(() => {
    backToHome?.();

    if (stakingPath && showStakingHome) {
      backToStakingHome();
    }

    redirectToSamePath && refresh();
  }, [backToHome, backToStakingHome, redirectToSamePath, refresh, showStakingHome, stakingPath]);

  const goToHistory = useCallback(() => {
    updateStorage(STORAGE_KEY.ACCOUNT_SELECTED_CHAIN, { [address]: genesisHash })
      .finally(() => navigate(isExtension ? '/history' : '/historyfs') as void)
      .catch(console.error);
  }, [address, genesisHash, isExtension, navigate]);

  const _backToHomeText = (pathname.startsWith('/fullscreen-stake/') || stakingPath) ? t('Staking Home') : backToHomeText;

  return (
    <Stack direction='column' sx={{ gap: '8px', height: isModal ? '100%' : 'inherit', p: '15px 15px 0', zIndex: 1 }}>
      <Header
        genesisHash={genesisHash}
        isBlueish={isBlueish}
        transactionDetail={transactionDetail}
      />
      <Stack direction='column' sx={{ gap: '8px', height: 'inherit', justifyContent: 'space-between' }}>
        <Detail
          genesisHash={genesisHash}
          isBlueish={isBlueish}
          showDate={showDate}
          transactionDetail={transactionDetail}
        />
        <Buttons
          address={address}
          backToHome={(backToHome || showStakingHome) ? handleHome : undefined}
          backToHomeText={_backToHomeText}
          genesisHash={genesisHash}
          goToHistory={showHistoryButton ? goToHistory : undefined}
          isBlueish={isBlueish}
          success={transactionDetail.success}
        />
      </Stack>
    </Stack>
  );
}

interface Props {
  address: string;
  backToHome?: () => void;
  backToHomeText?: string;
  genesisHash: string | undefined;
  showHistoryButton?: boolean;
  isModal?: boolean;
  onClose?: () => void;
  showStakingHome?: boolean;
  showDate?: boolean;
  transactionDetail: TransactionDetail;
}

export default function Confirmation ({ address, backToHome, backToHomeText, genesisHash, isModal, onClose, showDate, showHistoryButton = true, showStakingHome = true, transactionDetail }: Props) {
  const { t } = useTranslation();

  const [openModal, setOpenModal] = useState(true);
  const _onCloseModal = useCallback(() => {
    setOpenModal(false);
  }, []);

  const contentProps = {
    address,
    backToHome,
    backToHomeText,
    genesisHash,
    isModal,
    onClose,
    showDate,
    showHistoryButton,
    showStakingHome,
    transactionDetail
  };

  return (
    <>
      {isModal
        ? (
          <DraggableModal
            noDivider
            onClose={onClose ?? _onCloseModal}
            open={openModal}
            showBackIconAsClose
            style={{ backgroundColor: '#1B133C', minHeight: '600px', padding: '20px 9px 10px' }}
            title={transactionDetail.success ? t('Completed') : t('Failed')}
          >
            <Content {...contentProps} />
          </DraggableModal>
        )
        : <Content {...contentProps} />
      }
    </>
  );
}
