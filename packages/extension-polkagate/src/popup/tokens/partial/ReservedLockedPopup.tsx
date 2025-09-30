// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { UnlockType } from '../useTokenInfoDetails';

import { faAddressCard } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CallMerge as CallMergeIcon } from '@mui/icons-material';
import { Container, Grid, IconButton, Stack, styled, Typography, useTheme } from '@mui/material';
import { Bezier, Data, type Icon, Image, LikeDislike, Paperclip2, People, ProfileCircle, Record, Sagittarius, Shield, Unlock, UsdCoin } from 'iconsax-react';
import React, { memo, useMemo } from 'react';

import { SharePopup } from '@polkadot/extension-polkagate/src/partials/index';
import { BEAT_ANIMATION } from '@polkadot/extension-polkagate/src/partials/UnableToPayFee';
import { calcPrice } from '@polkadot/extension-polkagate/src/util';

import { GradientButton, GradientDivider, TwoToneText } from '../../../components';
import Ice from '../../../components/SVG/Ice';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useTranslation } from '../../../hooks';
import AssetLoading from '../../home/partial/AssetLoading';
import { ColumnAmounts } from './ColumnAmounts';

const reasonIcon = (reason: string): React.ReactNode => {
  switch (reason.toLowerCase()) {
    case 'proxy':
      return <Data color='#AA83DC' size='26' variant='Bulk' />;

    case 'identity':
      return <ProfileCircle color='#AA83DC' size='26' variant='Bulk' />;

    case 'society':
      return <People color='#AA83DC' size='26' />;

    case 'preimage':
      return <Paperclip2 color='#AA83DC' size='26' />;

    case 'nft':
    case 'uniques':
    case 'assets':
      return <Image color='#AA83DC' size='26' />;

    case 'bounty':
      return <UsdCoin color='#AA83DC' size='26' />;

    case 'recovery':
      return <Shield color='#AA83DC' size='26' variant='Bulk' />;

    case 'delegate':
      return <Sagittarius color='#AA83DC' size='26' variant='Bulk' />;

    case 'index':
      return <CallMergeIcon sx={{ color: '#AA83DC', fontSize: '20px' }} />;

    case 'manage identity': // @Amir, please double check
      return <FontAwesomeIcon color='#AA83DC' fontSize={19} icon={faAddressCard} />;

    case 'multisig':
      return <Bezier color='#AA83DC' size='26' />;

    case 'vote':
      return <LikeDislike color='#AA83DC' size='26' variant='Bulk' />;

    case 'solo staking':
      return <SnowFlake size='24' />;

    case 'pool staking':
      return <Ice size='24' />;

    case 'referenda':
    case 'governance':
      return <Record color='#AA83DC' size='24' variant='Bulk' />;

    default:
      return null;
  }
};

const ReasonAndDescription = ({ description, inColorPart, reason }: { reason: string; description?: string | null; inColorPart?: string | null; }) => {
  const theme = useTheme();

  return (
    <Stack sx={{ alignItems: 'flex-start', width: 'fit-content' }}>
      <Typography color='text.primary' textTransform='capitalize' variant='B-2' width='fit-content'>
        {reason}
      </Typography>
      {description &&
        <TwoToneText
          color='#674394'
          style={{ color: theme.palette.text.secondary, ...theme.typography['B-5'] }}
          text={description}
          textPartInColor={inColorPart || undefined}
        />}
    </Stack>
  );
};

interface ItemProps {
  amount: BN;
  decimal: number;
  noDivider: boolean;
  price: number;
  token: string;
  reason: string;
  unlockTracks: UnlockType | undefined;
}

const BeatUnlockIcon = styled(Unlock, {
  shouldForwardProp: (prop) => prop !== 'beat'
})<{ beat?: boolean }>(({ beat }) => ({
  animation: beat ? `${BEAT_ANIMATION} 0.8s infinite` : 'none',
  display: 'inline-block',
  transformOrigin: 'center'
}));

function Item ({ amount, decimal, noDivider, price, reason, token, unlockTracks }: ItemProps) {
  const totalBalance = useMemo(() => calcPrice(price, amount, decimal), [amount, decimal, price]);

  const isGovernance = useMemo(() => reason.toLocaleLowerCase().includes('gov'), [reason]);

  return (
    <>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ borderRadius: '12px', columnGap: '8px', py: '4px' }}>
        <Grid alignItems='center' container item justifyContent='center' sx={{ background: '#6743944D', border: '2px solid', borderColor: '#2D1E4A', borderRadius: '999px', height: '36px', width: '36px' }}>
          {reasonIcon(reason)}
        </Grid>
        <Grid alignItems='center' container item justifyContent='space-between' xs>
          <Grid alignItems='center' container gap='4px' item width='fit-content'>
            <ReasonAndDescription
              description={unlockTracks?.lockedTooltip}
              inColorPart={unlockTracks?.unlockDate}
              reason={reason}
            />
            {isGovernance && unlockTracks &&
              <IconButton disabled={unlockTracks.isDisable} onClick={unlockTracks.openLocked} sx={{ p: '4px' }}>
                <BeatUnlockIcon beat={!unlockTracks.isDisable} color={unlockTracks.isDisable ? '#2d1e4aff' : '#AA83DC'} size='20' variant='Bold' />
              </IconButton>
            }
          </Grid>
          <Grid container direction='column' item width='fit-content'>
            <ColumnAmounts
              cryptoAmount={amount}
              decimal={decimal}
              fiatAmount={totalBalance}
              placement='right'
              token={token}
            />
          </Grid>
        </Grid>
      </Grid>
      {
        !noDivider &&
        <GradientDivider style={{ my: '4px' }} />
      }
    </>
  );
}

interface Props {
  openMenu: boolean;
  title: string;
  TitleIcon?: Icon | undefined;
  handleClose: () => void;
  items: Record<string, BN | undefined>;
  decimal: number | undefined;
  price: number;
  token: string | undefined;
  unlockTracks: UnlockType | undefined;
}

interface ContentProps {
  decimal: number | undefined;
  handleClose: () => void;
  items: Record<string, BN | undefined>;
  price: number;
  style?: React.CSSProperties;
  token: string | undefined;
  unlockTracks: UnlockType | undefined;
}

function Content ({ decimal, handleClose, items, price, style = {}, token, unlockTracks }: ContentProps) {
  const { t } = useTranslation();

  const { reasonsToShow, stillLoading } = useMemo(() => ({
    reasonsToShow: Object.entries(items).filter(([_, amount]) => amount !== undefined) as [string, BN][],
    stillLoading: Object.entries(items).some(([_, amount]) => amount === undefined)
  }), [items]);

  const noReasons = useMemo(() => (stillLoading === false && reasonsToShow.length === 0), [reasonsToShow.length, stillLoading]);

  return (
    <>
      <Container disableGutters sx={{ background: '#05091C', borderRadius: '14px', maxHeight: '360px', my: '15px', overflowY: 'auto', p: '8px', ...style }}>
        {reasonsToShow.map(([reason, amount], index) => {
          const noDivider = reasonsToShow.length === index + 1;

          return (
            <Item
              amount={amount}
              decimal={decimal ?? 0}
              key={index}
              noDivider={noDivider}
              price={price}
              reason={reason}
              token={token ?? ''}
              unlockTracks={unlockTracks}
            />
          );
        })}
        {stillLoading &&
          <>
            {
              reasonsToShow.length > 0 &&
              <GradientDivider style={{ my: '4px' }} />
            }
            <AssetLoading itemsCount={1} noDrawer />
          </>
        }
        {noReasons &&
          <Typography color='text.secondary' component='p' p='12px' variant='B-2' width='100%'>
            {t('No reason found!')}
          </Typography>
        }
      </Container>
      <GradientButton
        contentPlacement='center'
        onClick={handleClose}
        style={{
          height: '44px',
          width: '100%'
        }}
        text={t('Close')}
      />
    </>
  );
}

function ReservedLockedPopup ({ TitleIcon, decimal, handleClose, items, openMenu, price, title, token, unlockTracks }: Props) {
  return (
    <SharePopup
      modalProps={{
        noDivider: true,
        showBackIconAsClose: true,
        style: { minHeight: 'fit-content', padding: '20px', zIndex: 1 }
      }}
      modalStyle={{ minHeight: '200px' }}
      onClose={handleClose}
      open={openMenu}
      popupProps={{
        TitleIcon,
        iconSize: 22,
        iconVariant: 'Bulk',
        style: {
          '> div#container': {
            height: 'fit-content',
            paddingBottom: '15px',
            zIndex: 1
          },
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'wrap',
          justifyContent: 'flex-end'
        }
      }}
      title={title}
    >
      <Content
        decimal={decimal}
        handleClose={handleClose}
        items={items}
        price={price}
        token={token}
        unlockTracks={unlockTracks}
      />
    </SharePopup>
  );
}

export default memo(ReservedLockedPopup);
