// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../util/types';

import { Avatar, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { CloseCircle, TickCircle } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import getLogo from '@polkadot/extension-polkagate/src/util/getLogo';

import { subscan } from '../../assets/icons';
import { ActionButton, FormatBalance2, GradientButton, Identity2, NeonButton } from '../../components';
import { useChainInfo, useIsBlueish, useTranslation } from '../../hooks';
import StakingActionButton from '../../popup/staking/partial/StakingActionButton';
import { GlowBox, GradientDivider, VelvetBox } from '../../style';
import { toTitleCase } from '../../util';
import { amountToHuman, countDecimalPlaces, toShortAddress } from '../../util/utils';

const SubScanIcon = ({ size = '13px' }: { size?: string }) => (
  <Avatar
    src={subscan as string}
    sx={{ height: size, width: size, zIndex: 2 }}
  />
);

interface AmountProps {
  amount: string | undefined;
  genesisHash: string | undefined;
}

const Amount = ({ amount, genesisHash }: AmountProps) => {
  const { decimal, token } = useChainInfo(genesisHash, true);

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
    <Stack alignItems='flex-end' direction='row' py='4px'>
      <Typography color='text.primary' lineHeight='normal' variant='H-1'>
        {integerPart}
      </Typography>
      <Typography color='text.secondary' variant='H-3'>
        {decimalToShow}
      </Typography>
      <Typography color='text.secondary' pl='3px' variant='H-3'>
        {token}
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
    <Grid alignItems='center' container direction='row' item justifyContent='center' margin='10px 0 15px' width= '90%'>
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

  const { accounts, amount, description, success } = transactionDetail;

  return (
    <GlowBox style={{ m: 0, width: '100%' }}>
      <Stack sx={{ alignItems: 'center', mt: '-5px' }}>
        <Grid container item sx={{ backdropFilter: 'blur(4px)', border: '8px solid', borderColor: '#00000033', borderRadius: '999px', overflow: 'hidden', width: 'fit-content' }}>
          {success
            ? <TickCircle color='#82FFA5' size='50' style={{ background: '#000', borderRadius: '999px', margin: '-4px' }} variant='Bold' />
            : <CloseCircle color='#FF4FB9' size='50' style={{ background: '#000', borderRadius: '999px', margin: '-4px' }} variant='Bold' />
          }
        </Grid>
        <Typography color='#AA83DC' pt='8px' textTransform='capitalize' variant='B-2'>
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
                    style={{ addressVariant: 'B-1', padding: '10px 0 18px', variant: 'B-3' }}
                    withShortAddress
                  />
              }
            </>
            : <Amount
              amount={amount}
              genesisHash={genesisHash}
            />
        }
      </Stack>
    </GlowBox>
  );
};

interface DetailProps {
  genesisHash: string | undefined;
  isBlueish?: boolean;
  transactionDetail: TransactionDetail;
}

const Detail = ({ genesisHash, isBlueish, transactionDetail }: DetailProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const mainEntries = useMemo(() => {
    const fieldsToDisplay = ['amount', 'deposit', 'fee', 'block', 'txHash'];

    return Object.entries(transactionDetail).filter(([key, value]) => fieldsToDisplay.includes(key) && value !== undefined && value !== null);
  }, [transactionDetail]);

  const extraEntries = useMemo(() => {
    if (transactionDetail.extra && typeof transactionDetail.extra === 'object') {
      return Object.entries(transactionDetail.extra).filter(([_, value]) => value !== undefined && value !== null);
    }

    return [];
  }, [transactionDetail]);

  const entriesToRender = [...extraEntries, ...mainEntries].filter(([_, content]) => content !== null && content !== undefined);

  return (
    <VelvetBox>
      <Stack direction='column' sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', justifyContent: 'center', p: '12px 18px' }}>
        {entriesToRender.map(([key, content], index) => {
          const withDivider = entriesToRender.length > index + 1;
          const isHash = key === 'txHash';
          const isBlock = key === 'block';
          const isBalance = ['amount', 'deposit', 'fee'].includes(key);

          const color = isBlock ? 'text.primary' : isBlueish ? 'text.highlight' : 'text.secondary';

          return (
            <React.Fragment key={key}>
              <Container disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color={isBlueish ? 'text.highlight' : 'text.secondary'} textTransform='capitalize' variant='B-1' width='fit-content'>
                  {toTitleCase(t(key === 'txHash' ? 'transaction id' : key))}
                </Typography>
                <Typography color={color} sx={{ bgcolor: isHash ? '#C6AECC26' : 'none', borderRadius: '9px', p: '2px 3px' }} variant='B-1' width='fit-content'>
                  {isHash
                    ? toShortAddress(String(content), 6)
                    : isBalance
                      ? (
                        <FormatBalance2
                          decimalPoint={4}
                          decimals={[decimal ?? 0]}
                          style={{
                            color: isBlueish ? theme.palette.text.highlight : '#AA83DC',
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
    const url = `https://${chainName}.subscan.io/account/${address}`;

    chrome.tabs.create({ url }).catch(console.error);
  }, [address, chainName]);

  return (
    <Stack direction='column' sx={{ gap: '8px', zIndex: 1 }}>
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
      <>
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
            style={{ bottom: '17px', position: 'absolute', width: '88%', zIndex: 1 }}
            text={t('View on Explorer')}
          />
        }
      </>
    </Stack>
  );
}

interface Props {
  address: string;
  transactionDetail: TransactionDetail;
  genesisHash: string | undefined;
  goToHistory?: () => void;
  backToHome?: () => void;
}

export default function Confirmation ({ address, backToHome, genesisHash, goToHistory, transactionDetail }: Props) {
  const isBlueish = useIsBlueish();

  return (
    <Stack direction='column' sx={{ gap: '8px', p: '15px 15px 0', zIndex: 1 }}>
      <Header genesisHash={genesisHash} transactionDetail={transactionDetail} />
      <Detail genesisHash={genesisHash} isBlueish={isBlueish} transactionDetail={transactionDetail} />
      <Buttons
        address={address}
        backToHome={backToHome}
        genesisHash={genesisHash}
        goToHistory={goToHistory}
        isBlueish={isBlueish}
      />
    </Stack>
  );
}
