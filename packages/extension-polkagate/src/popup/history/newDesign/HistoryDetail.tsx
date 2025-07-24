// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransitionProps } from '@mui/material/transitions';
import type { TransactionDetail } from '../../../util/types';

import { Avatar, Collapse, Container, Dialog, Grid, Slide, Stack, Typography, useTheme } from '@mui/material';
import { CloseCircle, TickCircle } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';

import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/components/DraggableModal';
import { BN_ZERO } from '@polkadot/util';

import { FadeOnScroll, FormatBalance2, FormatPrice, GradientButton } from '../../../components';
import CustomCloseSquare from '../../../components/SVG/CustomCloseSquare';
import { useChainInfo, useIsExtensionPopup, useSelectedAccount, useTokenPriceBySymbol, useTranslation } from '../../../hooks';
import { calcPrice } from '../../../hooks/useYouHave2';
import { GlowBox, GradientDivider, VelvetBox } from '../../../style';
import { getVoteType, isReward, toTitleCase } from '../../../util';
import { CHAINS_ON_POLKAHOLIC, CHAINS_WITH_BLACK_LOGO } from '../../../util/constants';
import getLogo from '../../../util/getLogo';
import { amountToMachine, countDecimalPlaces, formatTimestamp, toShortAddress } from '../../../util/utils';
import { getLink } from '../Explorer';

const Transition = React.forwardRef(function Transition (props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
  return <Slide direction='up' easing='ease-in-out' ref={ref} timeout={250} {...props} />;
});

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

  return (
    <GlowBox style={{ m: 0, pb: '15px', width: '100%' }}>
      <HistoryStatus
        action={historyItem.subAction ?? historyItem.action}
        success={historyItem.success}
      />
      <HistoryAmount
        amount={historyItem.amount ?? '0'}
        decimal={historyItem.decimal ?? 0}
        genesisHash={historyItem.chain?.genesisHash ?? ''}
        sign={sign}
        token={historyItem.token ?? ''}
      />
    </GlowBox>
  );
}

function DetailCard ({ historyItem }: Props) {
  const items = useMemo(() => {
    const card: Record<string, string | number>[] = [];

    const createNamedObject = (name: keyof TransactionDetail) => ({ [name]: historyItem[name] as string | number });

    const hash = { hash: historyItem.txHash ?? '' };

    card.push(createNamedObject('date'));
    historyItem.from && card.push({ from: historyItem.from.address ?? '' });
    historyItem.to && card.push({ to: historyItem.to.address ?? '' });
    historyItem.delegatee && card.push(createNamedObject('delegatee'));
    historyItem.conviction && card.push(createNamedObject('conviction'));
    historyItem.voteType && card.push(createNamedObject('voteType'));
    historyItem.refId && card.push(createNamedObject('refId'));
    card.push(createNamedObject('fee'));
    card.push(createNamedObject('block'));
    card.push(hash);

    return card;
  }, [historyItem]);

  return (
    <VelvetBox style={{ padding: '4px' }}>
      <Container disableGutters sx={{ bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'column', p: '12px 18px', width: '100%' }}>
        {historyItem.calls?.length && <DisplayCalls calls={historyItem.calls} />}
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
            <>
              <Container disableGutters key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color='text.secondary' textTransform='capitalize' variant='B-1' width='fit-content'>
                  {toTitleCase(key)}
                </Typography>
                <Typography color={color} sx={{ bgcolor: isAddress || isHash ? '#C6AECC26' : 'none', borderRadius: '9px', p: '2px 3px' }} variant='B-1' width='fit-content'>
                  {isBlock && '#'}
                  {isAddress
                    ? toShortAddress(value.toString())
                    : isHash
                      ? toShortAddress(value.toString(), 6)
                      : isDate
                        ? formatTimestamp(value)
                        : isVoteType
                          ? getVoteType(value as number)
                          : isFee
                            ? <FormatBalance2
                              decimalPoint={4}
                              decimals={[historyItem?.decimal ?? 0]}
                              style={{
                                color: '#AA83DC',
                                fontFamily: 'Inter',
                                fontSize: '13px',
                                fontWeight: 500,
                                width: 'max-content'
                              }}
                              tokens={[historyItem?.token ?? '']}
                              value={value as string}
                            />
                            : value
                  }
                </Typography>
              </Container>
              {withDivider && <GradientDivider style={{ my: '7px' }} />}
            </>
          );
        })}
      </Container>
    </VelvetBox>
  );
}

function Content ({ historyItem, style = {} }: { historyItem: TransactionDetail | undefined, style?: React.CSSProperties}): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedAccount = useSelectedAccount();
  const { chainName } = useChainInfo(historyItem?.chain?.genesisHash, true);

  const isWestmint = chainName?.replace(/\s/g, '') === 'WestendAssetHub';

  const { link, name } = useMemo(() => {
    if (CHAINS_ON_POLKAHOLIC.includes(chainName ?? '')) {
      return { link: getLink(chainName ?? '', 'polkaholic', 'extrinsic', historyItem?.txHash ?? ''), name: 'polkaholic' };
    }

    if (isWestmint) {
      return { link: getLink(chainName ?? '', 'statscan', 'extrinsic', String(selectedAccount?.address ?? '')), name: 'statescan' };
    }

    return { link: getLink(chainName ?? '', 'subscan', 'extrinsic', historyItem?.txHash ?? ''), name: 'subscan' };
  }, [chainName, historyItem?.txHash, isWestmint, selectedAccount?.address]);

  const openExplorer = useCallback(() => window.open(link, '_blank'), [link]);

  return (
    <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#120D27', border: '2px solid #FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: 'calc(100% - 78px)', overflow: 'hidden', overflowY: 'auto', p: '10px', position: 'relative', zIndex: 1 , ...style }}>
      {historyItem &&
          <>
            <DetailHeader historyItem={historyItem} />
            <Grid container item ref={containerRef} sx={{ height: 'fit-content', maxHeight: '330px', overflowY: 'auto', pb: '65px' }}>
              <DetailCard historyItem={historyItem} />
              <FadeOnScroll containerRef={containerRef} />
            </Grid>
            <GradientButton
              onClick={openExplorer}
              startIconNode={
                <Avatar
                  src={getLogo(name)}
                  sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(name) && theme.palette.mode === 'dark') ? 'invert(1)' : '', height: 20, marginRight: '8px', width: 20, zIndex: 2 }}
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
            noDivider
            onClose={handleClose}
            open={!!historyItem}
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
