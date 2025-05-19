// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransitionProps } from '@mui/material/transitions';
import type { Compact } from '@polkadot/types';
import type { INumber } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { PoolInfo } from '../../../util/types';

import { Container, Dialog, Grid, Link, Slide, Stack, Typography, useTheme } from '@mui/material';
import { DiscountCircle, People } from 'iconsax-react';
import React from 'react';

import Subscan from '@polkadot/extension-polkagate/src/assets/icons/Subscan';

import CustomCloseSquare from '../../../components/SVG/CustomCloseSquare';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useChainInfo, useTranslation } from '../../../hooks';
import { GradientDivider, PolkaGateIdenticon } from '../../../style';
import { toShortAddress } from '../../../util/utils';
import { Email, Web, XIcon } from '../../settings/icons';
import SocialIcon from '../../settings/partials/SocialIcon';
import BlueGradient from '../stakingStyles/BlueGradient';
import DetailGradientBox from '../stakingStyles/DetailGradientBox';
import { StakingInfoStack } from './NominatorsTable';

const Transition = React.forwardRef(function Transition (props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
  return <Slide direction='up' easing='ease-in-out' ref={ref} timeout={250} {...props} />;
});

interface PoolDetailProps {
  poolDetail: PoolInfo | undefined;
  handleClose: () => void;
  genesisHash: string | undefined;
}

interface StakingInfoStackWithIconProps{
  Icon: React.ReactNode;
  amount?: string | BN | Compact<INumber> | null | undefined;
  decimal?: number | undefined;
  title: string;
  token?: string | undefined;
  text?: string | undefined;
}

const StakingInfoStackWithIcon = ({ Icon, amount, decimal, text, title, token }: StakingInfoStackWithIconProps) => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '8px', width: 'fit-content' }}>
      {Icon}
      <StakingInfoStack amount={amount} decimal={decimal} text={text} title={title} token={token} />
    </Container>
  );
};

interface PoolStashIdSocialsProps {
  poolDetail: PoolInfo;
}

const PoolStashIdSocials = ({ poolDetail }: PoolStashIdSocialsProps) => {
  const bgColor = '#FFFFFF1A';

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', flexDirection: 'row', m: 0, width: '32%' }}>
      {poolDetail.identity?.info.email &&
        <SocialIcon Icon={<Email color='#809ACB' width='14px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
      {poolDetail.identity?.info.twitter &&
        <SocialIcon Icon={<XIcon color='#809ACB' width='13px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
      {poolDetail.identity?.info.web &&
        <SocialIcon Icon={<Web color='#809ACB' width='14px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
    </Container>
  );
};

interface PoolIdentityDetailProps {
  poolDetail: PoolInfo;
  genesisHash: string | undefined;
}

const PoolIdentityDetail = ({ genesisHash, poolDetail }: PoolIdentityDetailProps) => {
  const { chainName } = useChainInfo(genesisHash, true);

  return (
    <Stack direction='column' sx={{ p: '12px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'flex-start', columnGap: '4px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <PoolStashIdSocials poolDetail={poolDetail} />
        <Grid container item sx={{ border: '8px solid #00000033', borderRadius: '999px', height: 'fit-content', width: 'fit-content' }}>
          <PolkaGateIdenticon
            address={poolDetail.stashIdAccount?.accountId.toString() ?? ''}
            size={48}
          />
        </Grid>
        <Grid container item sx={{ justifyContent: 'flex-end', width: '32%' }}>
          <Link
            href={`https://${chainName}.subscan.io/account/${poolDetail.stashIdAccount?.accountId.toString()}`}
            rel='noreferrer'
            sx={{ alignItems: 'center', bgcolor: '#FFFFFF1A', borderRadius: '999px', display: 'flex', height: '24px', justifyContent: 'center', width: '24px' }}
            target='_blank'
            underline='none'
          >
            <Subscan
              color='#809ACB'
            />
          </Link>
        </Grid>
      </Container>
      <Container disableGutters sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <Grid container item justifyContent='center' sx={{ columnGap: '4px', my: '6px' }}>
          <Typography color='text.primary' variant='B-2'>
            {poolDetail.metadata}
          </Typography>
        </Grid>
        <Typography color='#82FFA5' sx={{ fontFamily: 'JetBrainsMono', fontSize: '14px', fontWeight: 700 }}>
          {toShortAddress(poolDetail.stashIdAccount?.accountId.toString())}
        </Typography>
      </Container>
    </Stack>
  );
};

export default function PoolDetail ({ genesisHash, handleClose, poolDetail }: PoolDetailProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const maybeCommission = poolDetail?.bondedPool?.commission.current.isSome ? poolDetail.bondedPool.commission.current.value[0] : 0;
  const commission = Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);

  return (
    <Dialog
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
      open={!!poolDetail}
    >
      {poolDetail &&
        <Container disableGutters sx={{ height: '100%', width: '100%' }}>
          <Grid alignItems='center' container item justifyContent='center' sx={{ pb: '12px', pt: '18px' }}>
            <CustomCloseSquare color='#809ACB' onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
          </Grid>
          <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#120D27', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: 'calc(100% - 78px)', overflow: 'hidden', overflowY: 'scroll', p: '10px', position: 'relative', zIndex: 1 }}>
            <BlueGradient style={{ top: '-120px' }} />
            <DetailGradientBox />
            <Stack direction='column' sx={{ position: 'relative', width: '100%', zIndex: 1 }}>
              <PoolIdentityDetail
                genesisHash={genesisHash}
                poolDetail={poolDetail}
              />
              <GradientDivider style={{ mb: '12px' }} />
              <Container disableGutters sx={{ alignItems: 'flex-end', columnGap: '4px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '0 12px 0 10px' }}>
                <StakingInfoStackWithIcon
                  Icon={<SnowFlake color={theme.palette.text.highlight} size='18' />}
                  amount={poolDetail.bondedPool?.points}
                  decimal={decimal}
                  title={t('Staked')}
                  token={token}
                />
                <StakingInfoStackWithIcon
                  Icon={<DiscountCircle color={theme.palette.text.highlight} size='24' variant='Bulk' />}
                  text={String(commission) + '%'}
                  title={t('Commission')}
                />
                <StakingInfoStackWithIcon
                  Icon={<People color={theme.palette.text.highlight} size='24' variant='Bulk' />}
                  text={poolDetail.bondedPool?.memberCounter.toString()}
                  title={t('Members')}
                />
              </Container>
              <GradientDivider style={{ my: '12px' }} />
            </Stack>
          </Grid>
        </Container>}
    </Dialog>
  );
}
