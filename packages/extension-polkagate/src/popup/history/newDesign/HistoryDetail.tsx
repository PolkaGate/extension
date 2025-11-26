// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransactionDetail } from '../../../util/types';

import { Avatar, Collapse, Container, Dialog, Grid, Stack, Typography, useTheme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { CloseCircle, TickCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/components/DraggableModal';
import { BN_ZERO } from '@polkadot/util';

import { DisplayBalance, FadeOnScroll, FormatPrice, GradientButton, Identity2, Transition } from '../../../components';
import CustomCloseSquare from '../../../components/SVG/CustomCloseSquare';
import { useChainInfo, useIsExtensionPopup, useTokenPriceBySymbol, useTranslation } from '../../../hooks';
import { GlowBox, GradientDivider, VelvetBox } from '../../../style';
import { amountToMachine, calcPrice, countDecimalPlaces, formatTimestamp, getVoteType, isReward, toShortAddress, toTitleCase } from '../../../util';
import { CHAINS_WITH_BLACK_LOGO } from '../../../util/constants';
import getLogo from '../../../util/getLogo';
import { getLink } from '../explorer';

interface Props {
  historyItem: TransactionDetail;
}

interface HistoryDetailProps {
  setOpenMenu: React.Dispatch<React.SetStateAction<TransactionDetail | undefined>>;
  historyItem: TransactionDetail | undefined;
}

const isReceived = (historyItem: TransactionDetail) => !historyItem.subAction && historyItem.action.toLowerCase() !== 'send';
const isSend = (historyItem: TransactionDetail) => !historyItem.subAction && historyItem.action.toLowerCase() === 'send';

const DisplayCalls = memo(function DisplayCalls ({ calls }: { calls: string[]; }) {
  const { t } = useTranslation();

  const [open, setOpen] = useState<boolean>(false);

  const toggleCollapse = useCallback(() => calls.length > 1 && setOpen((isOpen) => !isOpen), [calls.length]);

  return (
    <>
      <Container disableGutters onClick={toggleCollapse} sx={{ alignItems: 'center', cursor: calls.length > 1 ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between' }}>
        <Typography color='text.secondary' textTransform='capitalize' variant='B-1' width='fit-content'>
          {t('Extrinsics')}
        </Typography>
        <Collapse collapsedSize={26} in={open} sx={{ width: 'fit-content' }}>
          <Container disableGutters sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'column', rowGap: '3px' }}>
            {calls.map((call) => (
              <Typography color='text.secondary' key={call} sx={{ bgcolor: '#C6AECC26', borderRadius: '9px', p: '2px 3px' }} variant='B-1' width='fit-content'>
                {call}
              </Typography>
            ))}
          </Container>
        </Collapse>
      </Container>
      <GradientDivider style={{ my: '7px' }} />
    </>
  );
});

function HistoryStatus ({ action, success }: { action: string, success: boolean }) {
  const { t } = useTranslation();

  return (
    <Stack sx={{ alignItems: 'center', mt: '-5px' }}>
      <Grid container item sx={{ backdropFilter: 'blur(4px)', border: '8px solid', borderColor: '#00000033', borderRadius: '999px', overflow: 'hidden', width: 'fit-content' }}>
        {success
          ? <TickCircle color='#82FFA5' size='50' style={{ background: '#000', borderRadius: '999px', margin: '-4px' }} variant='Bold' />
          : <CloseCircle color='#FF4FB9' size='50' style={{ background: '#000', borderRadius: '999px', margin: '-4px' }} variant='Bold' />
        }
      </Grid>
      <Typography color='#AA83DC' pt='8px' textTransform='capitalize' variant='B-2'>
        {action}
        {' - '}
        {success
          ? t('Completed')
          : t('Failed')
        }
      </Typography>
    </Stack>
  );
}

function HistoryAmount ({ amount, decimal, genesisHash, sign, token }: { amount: string, decimal: number, sign?: string, token?: string, genesisHash: string }) {
  const price = useTokenPriceBySymbol(token, genesisHash);

  const totalBalancePrice = useMemo(() => calcPrice(price.price, amountToMachine(amount, decimal) ?? BN_ZERO, decimal ?? 0), [amount, decimal, price.price]);

  const [integerPart, decimalPart] = amount.split('.');

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
    <Stack sx={{ alignItems: 'center' }}>
      <Stack alignItems='flex-end' direction='row' py='4px'>
        <Typography color='text.primary' lineHeight='normal' variant='H-1'>
          {sign}{integerPart}
        </Typography>
        <Typography color='text.secondary' variant='H-3'>
          {decimalToShow}
        </Typography>
        <Typography color='text.secondary' pl='3px' variant='H-3'>
          {token}
        </Typography>
      </Stack>
      <FormatPrice
        commify
        fontFamily='Inter'
        fontSize='12px'
        fontWeight={500}
        ignoreHide
        num={totalBalancePrice ?? 0}
        skeletonHeight={14}
        textColor='#BEAAD8'
        width='fit-content'
      />
    </Stack>
  );
}

function DetailHeader ({ historyItem }: Props) {
  const sign = isReward(historyItem) || isReceived(historyItem) ? '+' : isSend(historyItem) ? '-' : '';

  const { action, amount = '0', chain, decimal = 0, subAction, success, token = '' } = historyItem;

  return (
    <GlowBox style={{ m: 0, pb: '15px', width: '100%' }}>
      <HistoryStatus
        action={subAction ?? action}
        success={success}
      />
      <HistoryAmount
        amount={amount}
        decimal={decimal}
        genesisHash={chain?.genesisHash ?? ''}
        sign={sign}
        token={token}
      />
    </GlowBox>
  );
}

function DetailCard ({ historyItem }: Props) {
  const { calls, conviction, decimal = 0, delegatee, from, refId, to, token = '', txHash: hash = '', voteType } = historyItem;

  const items = useMemo(() => {
    const card: Record<string, string | number>[] = [];

    const createNamedObject = (name: keyof TransactionDetail) => ({ [name]: historyItem[name] as string | number });

    card.push(createNamedObject('date'));
    from && card.push({ from: from.address ?? '' });
    to && card.push({ to: to.address ?? '' });
    delegatee && card.push(createNamedObject('delegatee'));
    conviction && card.push(createNamedObject('conviction'));
    voteType && card.push(createNamedObject('voteType'));
    refId && card.push(createNamedObject('refId'));
    card.push(createNamedObject('fee'));
    card.push(createNamedObject('block'));
    card.push({ hash });

    return card;
  }, [conviction, delegatee, from, hash, historyItem, refId, to, voteType]);

  return (
    <VelvetBox style={{ padding: '4px' }}>
      <Container disableGutters sx={{ bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'column', p: '12px 18px', width: '100%' }}>
        {
          !!calls?.length &&
          <DisplayCalls calls={calls} />
        }
        {items.map((item, index) => {
          const [key, value] = Object.entries(item)[0];
          const withDivider = items.length > index + 1;
          const isAddress = ['to', 'from', 'delegatee'].includes(key);
          const isHash = key === 'hash';
          const isDate = key === 'date';
          const isBlock = key === 'block';
          const isVoteType = key === 'voteType';
          const isFee = key === 'fee';

          const color = isAddress || isHash ? 'text.secondary' : isDate ? 'text.primary' : '#AA83DC';

          return (
            <React.Fragment key={index}>
              <Container disableGutters key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color='text.secondary' textTransform='capitalize' variant='B-1' width='fit-content'>
                  {toTitleCase(key)}
                </Typography>
                <Typography color={color} sx={{ bgcolor: isHash ? '#C6AECC26' : 'none', borderRadius: '9px', p: '2px 3px' }} variant='B-1' width='fit-content'>
                  {isBlock && '#'}
                  {isAddress
                    ? <Identity2
                      address={value.toString()}
                      addressStyle={{ backgroundColor: '#C6AECC26', borderRadius: '9px', marginTop: '-3%', padding: '2px 3px' }}
                      charsCount={4}
                      direction='row'
                      genesisHash={historyItem.chain?.genesisHash || POLKADOT_GENESIS}
                      identiconSize={18}
                      nameStyle={{ py: '2px' }}
                      showSocial={false}
                      style={{ color: 'text.primary', variant: 'B-1' }}
                      withShortAddress={true}
                      />
                    : isHash
                      ? toShortAddress(value.toString(), 6)
                      : isDate
                        ? formatTimestamp(value)
                        : isVoteType
                          ? getVoteType(value as number)
                          : isFee
                            ? <DisplayBalance
                              balance={value as string}
                              decimal={decimal}
                              style={{
                                color: '#AA83DC',
                                width: 'max-content'
                              }}
                              token={token}
                              />
                            : value
                  }
                </Typography>
              </Container>
              {withDivider && <GradientDivider style={{ my: '7px' }} />}
            </React.Fragment>
          );
        })}
      </Container>
    </VelvetBox>
  );
}

function Content ({ historyItem, style = {} }: { historyItem: TransactionDetail | undefined, style?: React.CSSProperties }): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const { chainName } = useChainInfo(historyItem?.chain?.genesisHash, true);

  const { link, name } = useMemo(() => getLink(chainName ?? '', 'extrinsic', historyItem?.txHash ?? ''), [chainName, historyItem?.txHash]);

  const openExplorer = useCallback(() => link && window.open(link, '_blank'), [link]);

  return (
    <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#120D27', border: '2px solid #FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: 'calc(100% - 78px)', overflow: 'hidden', overflowY: 'auto', p: '10px', position: 'relative', zIndex: 1, ...style }}>
      {historyItem &&
        <>
          <DetailHeader historyItem={historyItem} />
          <Grid container item ref={containerRef} sx={{ height: 'fit-content', maxHeight: '330px', overflowY: 'auto', pb: '65px' }}>
            <DetailCard historyItem={historyItem} />
            <FadeOnScroll containerRef={containerRef} />
          </Grid>
          <GradientButton
            disabled={!link}
            onClick={openExplorer}
            startIconNode={
              <Avatar
                src={getLogo(name)}
                sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(name ?? '') && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: 20, marginRight: '8px', width: 20, zIndex: 2 }}
                variant='square'
              />
            }
            style={{
              bottom: '15px',
              position: 'absolute',
              width: '96%',
              zIndex: 1
            }}
            text={t('View on Explorer')}
          />
        </>
      }
    </Grid>
  );
}

function HistoryDetail ({ historyItem, setOpenMenu }: HistoryDetailProps): React.ReactElement {
  const isExtension = useIsExtensionPopup();
  const handleClose = useCallback(() => setOpenMenu(undefined), [setOpenMenu]);

  return (
    <>
      {
        isExtension
          ? <Dialog
            PaperProps={{
              sx: {
                backgroundImage: 'unset',
                bgcolor: 'transparent',
                boxShadow: 'unset'
              }
            }}
            TransitionComponent={Transition}
            componentsProps={{
              backdrop: {
                sx: {
                  backdropFilter: 'blur(10px)',
                  background: 'radial-gradient(50% 44.61% at 50% 50%, rgba(12, 3, 28, 0) 0%, rgba(12, 3, 28, 0.7) 100%)',
                  bgcolor: 'transparent'
                }
              }
            }}
            fullScreen
            open={!!historyItem}
            >
            <Container disableGutters sx={{ height: '100%', width: '100%' }}>
              <Grid alignItems='center' container item justifyContent='center' sx={{ pb: '12px', pt: '18px' }}>
                <CustomCloseSquare color='#AA83DC' onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
              </Grid>
              <Content
                historyItem={historyItem}
              />
            </Container>
          </Dialog>
          : <DraggableModal
            closeOnAnyWhereClick
            noDivider
            onClose={handleClose}
            open={!!historyItem}
            showBackIconAsClose
            style={{ backgroundColor: '#1B133C', minHeight: '400px', padding: ' 20px 10px 10px' }}
            title={historyItem?.subAction ?? historyItem?.action}
            >
            <Content
              historyItem={historyItem}
              style={{ background: 'transparent', border: 0 }}
            />
          </DraggableModal>
      }
    </>
  );
}

export default HistoryDetail;
