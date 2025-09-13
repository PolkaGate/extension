// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../util/types';
import type { FeeInfo } from '../sendFund/types';

import { Avatar, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { CloseCircle, TickCircle } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';

import getLogo from '@polkadot/extension-polkagate/src/util/getLogo';

import { subscan } from '../../assets/icons';
import { ActionButton, FormatBalance2, GradientButton, Identity2, NeonButton } from '../../components';
import { useChainInfo, useCurrency, useIsBlueish, useTokenPriceBySymbol, useTranslation } from '../../hooks';
import StakingActionButton from '../../popup/staking/partial/StakingActionButton';
import { GlowBox, GradientDivider, VelvetBox } from '../../style';
import { toTitleCase } from '../../util';
import { amountToHuman, countDecimalPlaces, getSubscanChainName, isValidAddress, toShortAddress } from '../../util/utils';
import { DraggableModal } from '../components/DraggableModal';

const SubScanIcon = ({ size = '13px' }: { size?: string }) => (
  <Avatar
    src={subscan as string}
    sx={{ height: size, width: size, zIndex: 2 }}
  />
);

interface AmountProps {
  amount: string | undefined;
  genesisHash: string | undefined;
  assetDecimal: number | undefined;
  token: string | undefined;
}

const Amount = ({ amount, assetDecimal, genesisHash, token }: AmountProps) => {
  const { decimal: nativeAssetDecimal, token: nativeToken } = useChainInfo(genesisHash, true);

  const currency = useCurrency();

  const _decimal = assetDecimal ?? nativeAssetDecimal;
  const _token = token ?? nativeToken;
  const price = useTokenPriceBySymbol(_token, genesisHash);

  const amountInHuman = amountToHuman((amount ?? '0'), _decimal);

  const value = ((price.price ?? 0) * parseFloat(amountInHuman)).toFixed(2);
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
    <Stack alignItems='center' direction='column' py='4px'>
      <Stack alignItems='flex-end' direction='row'>
        <Typography color='text.primary' lineHeight='normal' variant='H-1'>
          {integerPart}
        </Typography>
        <Typography color='text.secondary' variant='H-3'>
          {decimalToShow}
        </Typography>
        <Typography color='text.secondary' pl='3px' variant='H-3'>
          {_token}
        </Typography>
      </Stack>
      <Typography color='text.secondary' pl='3px' variant='B-4'>
        {currency?.sign}{value}
      </Typography>
    </Stack>
  );
};

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
          style={{ bgcolor: '#C6AECC26', borderRadius: '9px', color: '#AA83DC', m: '3px', padding: '4px 8px 4px 4px', variant: 'B-2' }}
        />
      ))}
    </Grid>
  );
};

interface HeaderProps {
  genesisHash: string | undefined;
  transactionDetail: TransactionDetail;
}

const Header = ({ genesisHash, transactionDetail }: HeaderProps) => {
  const { t } = useTranslation();

  const { accounts, amount, assetDecimal, description, success, token } = transactionDetail;

  return (
    <GlowBox style={{ m: 0, width: '100%' }}>
      <Stack sx={{ alignItems: 'center', mt: '-5px' }}>
        <Grid container item sx={{ backdropFilter: 'blur(4px)', border: '8px solid', borderColor: '#00000033', borderRadius: '999px', overflow: 'hidden', width: 'fit-content' }}>
          {success
            ? <TickCircle color='#82FFA5' size='50' style={{ background: '#000', borderRadius: '999px', margin: '-4px' }} variant='Bold' />
            : <CloseCircle color='#FF4FB9' size='50' style={{ background: '#000', borderRadius: '999px', margin: '-4px' }} variant='Bold' />
          }
        </Grid>
        <Typography color='primary.main' pt='8px' textTransform='capitalize' variant='B-2'>
          {
            description && success
              ? description
              : success ? t('Completed') : t('Failed')
          }
        </Typography>
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
                    addressStyle={{ color: '#AA83DC' }}
                    charsCount={12}
                    genesisHash={genesisHash}
                    nameStyle={{ paddingBottom: '7px', textAlign: 'center' }}
                    noIdenticon
                    showShortAddress
                    style={{ addressVariant: 'B-1', maxWidth: '170px', overflow: 'hidden', padding: '10px 0 18px', textOverflow: 'ellipsis', variant: 'B-3' }}
                    withShortAddress
                    />
              }
            </>
            : <Amount
              amount={amount}
              assetDecimal={assetDecimal}
              genesisHash={genesisHash}
              token={token}
              />
        }
      </Stack>
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

  const _decimal = transactionDetail?.assetDecimal ?? transactionDetail?.decimal ?? nativeAssetDecimal;
  const _token = transactionDetail?.token ?? nativeToken;

  const mainEntries = useMemo(() => {
    const baseFields = ['amount', 'deposit', 'fee', 'block', 'txHash'];
    const fieldsToDisplay = showDate ? ['date', ...baseFields] : baseFields;

    return fieldsToDisplay
      .map((field) => [field, transactionDetail[field as keyof TransactionDetail]])
      .filter(([_, value]) => value !== undefined && value !== null) as [string, TransactionDetail[keyof TransactionDetail]][];
  }, [showDate, transactionDetail]);

  const extraEntries = useMemo(() => {
    if (transactionDetail.extra && typeof transactionDetail.extra === 'object') {
      return Object.entries(transactionDetail.extra).filter(([_, value]) => value !== undefined && value !== null);
    }

    return [];
  }, [transactionDetail]);

  const getContentTypeAndColor = useCallback((key: string, content: TransactionDetail[keyof TransactionDetail]) => {
    const isHash = key === 'txHash';
    const isBlock = key === 'block';
    const isFee = ['fee'].includes(key);
    const isBalance = isFee || ['amount', 'deposit'].includes(key);
    const isAddress = isValidAddress(content as string);
    const isFromAddress = key === 'from' && isAddress;
    const isDate = showDate && key === 'date';
    const color = (isBlock || isDate) ? 'text.primary' : isBlueish ? 'text.highlight' : 'text.secondary';

    return { color, isAddress, isBalance, isBlock, isDate, isFee, isFromAddress, isHash };
  }, [isBlueish, showDate]);

  const entriesToRender = [...extraEntries, ...mainEntries].filter(([_, content]) => content !== null && content !== undefined);

  return (
    <VelvetBox>
      <Stack direction='column' sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', justifyContent: 'center', p: '12px 18px' }}>
        {entriesToRender.map(([key, content], index) => {
          const withDivider = entriesToRender.length > index + 1;
          const { color, isAddress, isBalance, isBlock, isDate, isFee, isFromAddress, isHash } = getContentTypeAndColor(key, content);

          return (
            <React.Fragment key={key}>
              <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                <Typography color={isBlueish ? 'text.highlight' : 'text.secondary'} textTransform='capitalize' variant='B-1' width='fit-content'>
                  {key === 'txHash' ? t('Transaction ID') : toTitleCase(key)}
                </Typography>
                <Stack columnGap='3px' direction='row' justifyContent='end'>
                  {
                    isFromAddress &&
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
                          <FormatBalance2
                            decimalPoint={4}
                            decimals={[(isFee && typeof content === 'object' && 'decimal' in (content as any)
                              ? (content as FeeInfo).decimal
                              : isFee ? nativeAssetDecimal : _decimal) ?? 0]}
                            style={{
                              color: isBlueish ? theme.palette.text.highlight : theme.palette.primary.main,
                              fontFamily: 'Inter',
                              fontSize: '13px',
                              fontWeight: 500,
                              width: 'max-content'
                            }}
                            tokens={[(isFee && typeof content === 'object' && 'token' in (content as any)
                              ? (content as FeeInfo).token
                              : isFee ? nativeToken : _token) ?? '']}
                            value={
                              isFee && typeof content === 'object' && 'fee' in (content as any)
                                ? (content as FeeInfo).fee
                                : (content as string)
                            }
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
  isBlueish: boolean;
  genesisHash: string | undefined;
  goToHistory?: () => void;
  backToHome?: () => void;
}

function Buttons ({ address, backToHome, genesisHash, goToHistory, isBlueish }: ButtonsProps) {
  const { t } = useTranslation();
  const { chainName } = useChainInfo(genesisHash, true);

  const goToExplorer = useCallback(() => {
    const network = getSubscanChainName(chainName);

    const url = `https://${network}.subscan.io/account/${address}`;

    chrome.tabs.create({ url }).catch(console.error);
  }, [address, chainName]);

  return (
    <Stack alignItems='center' direction='column' sx={{ gap: '8px', zIndex: 1 }}>
      {
        goToHistory &&
        <NeonButton
          contentPlacement='center'
          onClick={goToHistory}
          style={{
            height: '44px',
            width: '345px'
          }}
          text={t('History')}
        />
      }
      {
        backToHome &&
        <ActionButton
          contentPlacement='center'
          onClick={backToHome}
          style={{
            height: '44px',
            width: '345px'
          }}
          text={t('Staking Home')}
          variant='text'
        />
      }
      {isBlueish
        ? <StakingActionButton
          onClick={goToExplorer}
          startIcon={<SubScanIcon />}
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
          style={{ bottom: '17px', position: 'absolute', width: '384px', zIndex: 1 }}
          text={t('View on Explorer')}
          />
      }
    </Stack>
  );
}

interface Props {
  address: string;
  backToHome?: () => void;
  genesisHash: string | undefined;
  goToHistory?: () => void;
  isModal?: boolean;
  onCloseModal?: () => void;
  showDate?: boolean;
  transactionDetail: TransactionDetail;
}

export default function Confirmation ({ address, backToHome, genesisHash, goToHistory, isModal, onCloseModal, showDate, transactionDetail }: Props) {
  const isBlueish = useIsBlueish();
  const { t } = useTranslation();

  const [openModal, setOpenModal] = useState(true);
  const _onCloseModal = useCallback(() => {
    setOpenModal(false);
  }, []);

  const Content = () => (
    <Stack direction='column' sx={{ gap: '8px', p: '15px 0', zIndex: 1 }}>
      <Header
        genesisHash={genesisHash}
        transactionDetail={transactionDetail}
      />
      <Detail
        genesisHash={genesisHash}
        isBlueish={isBlueish}
        showDate={showDate}
        transactionDetail={transactionDetail}
      />
      <Buttons
        address={address}
        backToHome={backToHome}
        genesisHash={genesisHash}
        goToHistory={goToHistory}
        isBlueish={isBlueish}
      />
    </Stack>
  );

  return (
    <>
      {isModal
        ? <DraggableModal
          noDivider
          onClose={onCloseModal ?? _onCloseModal}
          open={openModal}
          showBackIconAsClose
          style={{ backgroundColor: '#1B133C', minHeight: '615px', padding: '20px 9px 10px' }}
          title={transactionDetail.success ? t('Completed') : t('Failed')}
          >
          <Content />
        </DraggableModal>
        : <Content />
      }
    </>
  );
}
