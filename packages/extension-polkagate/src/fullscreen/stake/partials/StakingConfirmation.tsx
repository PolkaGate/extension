// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';

import { Avatar, Container, Stack, Typography, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { memo, useCallback, useContext, useMemo } from 'react';

import FailSuccessIcon from '@polkadot/extension-polkagate/src/popup/history/partials/FailSuccessIcon';
import getLogo from '@polkadot/extension-polkagate/src/util/getLogo';

import { ActionButton, CurrencyContext, DisplayBalance, GradientButton, Identity2, NeonButton } from '../../../components';
import { useChainInfo, useRouteRefresh, useStakingConsts, useTokenPriceBySymbol, useTranslation } from '../../../hooks';
import { GlowBox, GradientDivider, VelvetBox } from '../../../style';
import { amountToHuman, countDecimalPlaces, getSubscanChainName, isValidAddress, toShortAddress, toTitleCase } from '../../../util';

interface AmountProps {
  amount: string | undefined;
  genesisHash: string | undefined;
  token: string | undefined;
  differentValueColor?: string;
  isExtension?: boolean;
}

export const Amount = memo(function MemoAmount ({ amount, differentValueColor, genesisHash, isExtension, token }: AmountProps) {
  const { decimal, token: nativeToken } = useChainInfo(genesisHash, true);
  const _token = token ?? nativeToken;
  const price = useTokenPriceBySymbol(token, genesisHash);
  const { currency } = useContext(CurrencyContext);

  const textColor = useMemo(() => isExtension ? 'text.highlight' : 'text.secondary', [isExtension]);

  const amountInHuman = amountToHuman((amount ?? '0'), decimal);

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
        <Typography color={textColor} variant='H-3'>
          {decimalToShow}
        </Typography>
        <Typography color={textColor} pl='3px' variant='H-3'>
          {_token}
        </Typography>
      </Stack>
      <Typography color={differentValueColor ?? 'text.secondary'} pl='3px' variant='B-4'>
        {currency?.sign}{value}
      </Typography>
    </Stack>
  );
});

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
  transactionDetail: TransactionDetail;
}

const Header = ({ genesisHash, transactionDetail }: HeaderProps) => {
  const { amount, description, failureText, nominators, success, token } = transactionDetail;

  return (
    <GlowBox style={{ m: 0, width: '100%' }}>
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
        {amount &&
          <Amount
            amount={amount}
            genesisHash={genesisHash}
            token={token}
          />}
      </FailSuccessIcon>
    </GlowBox>
  );
};

interface DetailProps {
  genesisHash: string | undefined;
  transactionDetail: TransactionDetail;
}

const Detail = ({ genesisHash, transactionDetail }: DetailProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const mainEntries = useMemo(() => {
    const fieldsToDisplay = ['fee', 'block', 'txHash'];

    return fieldsToDisplay
      .map((field) => [field, transactionDetail[field as keyof TransactionDetail]])
      .filter(([_, value]) => value !== undefined && value !== null) as [string, string | number | undefined][];
  }, [transactionDetail]);

  const extraEntries = useMemo(() => {
    if (transactionDetail.extra && typeof transactionDetail.extra === 'object') {
      return Object.entries(transactionDetail.extra).filter(([_, value]) => value !== undefined && value !== null);
    }

    return [];
  }, [transactionDetail]);

  const getContentTypeAndColor = useCallback((key: string, content: string | number | undefined) => {
    const isHash = key === 'txHash';
    const isBlock = key === 'block';
    const isBalance = ['amount', 'deposit', 'fee'].includes(key);
    const isAddress = isValidAddress(content as string);
    const isFromAddress = key === 'from' && isAddress;
    const isDate = key === 'date';
    const color = (isBlock || isDate) ? 'text.primary' : 'text.secondary';

    return { color, isAddress, isBalance, isBlock, isDate, isFromAddress, isHash };
  }, []);

  const entriesToRender = [...extraEntries, ...mainEntries].filter(([_, content]) => content !== null && content !== undefined);

  return (
    <VelvetBox>
      <Stack direction='column' sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', justifyContent: 'center', p: '12px 18px' }}>
        {entriesToRender.map(([key, content], index) => {
          const withDivider = entriesToRender.length > index + 1;
          const { color, isAddress, isBalance, isBlock, isDate, isFromAddress, isHash } = getContentTypeAndColor(key, content);

          return (
            <React.Fragment key={key}>
              <Container disableGutters sx={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                <Typography color='text.secondary' textTransform='capitalize' variant='B-1' width='fit-content'>
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
                      ? toShortAddress(String(content as string), 6)
                      : isBalance
                        ? (
                          <DisplayBalance
                            balance={content as string}
                            decimal={decimal}
                            style={{
                              color: theme.palette.primary.main,
                              width: 'max-content'
                            }}
                            token={token}
                          />)
                        : isDate
                          ? new Date(content as string).toLocaleString('en-US', { day: 'numeric', hour: 'numeric', hour12: true, minute: '2-digit', month: 'short', second: '2-digit', weekday: 'short', year: 'numeric' })
                          : content
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
  genesisHash: string | undefined;
  goToHistory?: () => void;
  backToHome?: () => void;
}

function Buttons ({ address, backToHome, genesisHash, goToHistory }: ButtonsProps) {
  const { t } = useTranslation();
  const { chainName } = useChainInfo(genesisHash, true);

  const goToExplorer = useCallback(() => {
    const network = getSubscanChainName(chainName);
    const url = `https://${network}.subscan.io/account/${address}`;

    chrome.tabs.create({ url }).catch(console.error);
  }, [address, chainName]);

  return (
    <Stack direction='column' sx={{ gap: '17px', mt: '5px', position: 'relative', zIndex: 1 }}>
      {
        goToHistory &&
        <NeonButton
          contentPlacement='center'
          onClick={goToHistory}
          style={{
            height: '44px'
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
            height: '44px'
          }}
          text={t('Staking Home')}
          variant='text'
        />
      }
      <GradientButton
        onClick={goToExplorer}
        startIconNode={
          <Avatar
            src={getLogo('subscan')}
            sx={{ borderRadius: '50%', height: 20, marginRight: '8px', width: 20, zIndex: 2 }}
            variant='square'
          />
        }
        style={{ zIndex: 1 }}
        text={t('View on Explorer')}
      />
    </Stack>
  );
}

interface Props {
  address: string;
  backToHome?: () => void;
  genesisHash: string | undefined;
  goToHistory?: () => void;
  transactionDetail: TransactionDetail;
}

export default function Confirmation ({ address, backToHome, genesisHash, goToHistory, transactionDetail }: Props) {
  const refresh = useRouteRefresh();

  const handleHome = useCallback(() => {
    backToHome?.();
    refresh();
  }, [backToHome, refresh]);

  return (
    <Stack direction='column' sx={{ gap: '8px', p: '15px 15px 0', zIndex: 1 }}>
      <Header genesisHash={genesisHash} transactionDetail={transactionDetail} />
      <Detail
        genesisHash={genesisHash}
        transactionDetail={transactionDetail}
      />
      <Buttons
        address={address}
        backToHome={backToHome ? handleHome : undefined}
        genesisHash={genesisHash}
        goToHistory={goToHistory}
      />
    </Stack>
  );
}
