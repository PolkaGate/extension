// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransitionProps } from '@mui/material/transitions';
import type { Compact } from '@polkadot/types';
import type { INumber } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { PoolInfo } from '../../../util/types';

import { Collapse, Container, Dialog, Grid, Link, Slide, Stack, Typography, useTheme } from '@mui/material';
import { ArrowDown2, BuyCrypto, CommandSquare, DiscountCircle, FlashCircle, People } from 'iconsax-react';
import React, { useCallback, useMemo, useReducer } from 'react';

import Subscan from '@polkadot/extension-polkagate/src/assets/icons/Subscan';

import { Identity2 } from '../../../components';
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

interface StakingInfoStackWithIconProps {
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
        <SocialIcon Icon={<Email color='#809ACB' width='14px' />} bgColor={bgColor} link={poolDetail.identity.info.email} size={24} />
      }
      {poolDetail.identity?.info.twitter &&
        <SocialIcon Icon={<XIcon color='#809ACB' width='13px' />} bgColor={bgColor} link={poolDetail.identity.info.twitter} size={24} />
      }
      {poolDetail.identity?.info.web &&
        <SocialIcon Icon={<Web color='#809ACB' width='14px' />} bgColor={bgColor} link={poolDetail.identity.info.web} size={24} />
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

interface CollapseSectionProp {
  title: string;
  TitleIcon: React.ReactNode;
  open: boolean;
  children: React.ReactNode;
  onClick: () => void;
}

const CollapseSection = ({ TitleIcon, children, onClick, open, title }: CollapseSectionProp) => {
  const theme = useTheme();

  return (
    <Collapse collapsedSize='44px' in={open} sx={{ bgcolor: '#060518', borderRadius: '14px', p: '4px' }}>
      <Container disableGutters onClick={onClick} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '6px', p: '8px 14px 11px' }}>
        {TitleIcon}
        <Typography color={open ? '#596AFF' : theme.palette.text.primary} sx={{ transition: 'all 150ms ease-out', width: 'fit-content' }} variant='B-2'>
          {title}
        </Typography>
        <ArrowDown2 color={open ? '#596AFF' : theme.palette.text.highlight} size='17' style={{ rotate: open ? '180deg' : 'none', transition: 'all 150ms ease-out' }} />
      </Container>
      <Stack direction='column' sx={{ bgcolor: '#222540A6', borderRadius: '10px' }}>
        {children}
      </Stack>
    </Collapse>
  );
};

interface RoleItemProps {
  role: string;
  address: string | undefined;
  genesisHash: string | undefined;
}

const RoleItem = ({ address, genesisHash, role }: RoleItemProps) => {
  const { t } = useTranslation();
  const { chainName } = useChainInfo(genesisHash, true);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', px: '18px' }}>
      <Typography color='text.primary' sx={{ textAlign: 'left', textTransform: 'capitalize', width: '70px' }} variant='B-1'>
        {t(role)}
      </Typography>
      {address
        ? <Identity2 address={address} genesisHash={genesisHash ?? ''} identiconSize={18} showShortAddress showSocial style={{ maxWidth: '175px', minWidth: '175px', variant: 'B-1' }} />
        : '  ---  '
      }
      <Grid container item width='fit-content'>
        <Link
          aria-disabled={!address}
          href={`https://${chainName}.subscan.io/account/${address}`}
          rel='noreferrer'
          sx={{ alignItems: 'center', bgcolor: '#FFFFFF1A', borderRadius: '999px', display: 'flex', height: '20px', justifyContent: 'center', width: '20px' }}
          target='_blank'
          underline='none'
        >
          <Subscan
            color='#809ACB'
          />
        </Link>
      </Grid>
    </Container>
  );
};

interface PoolDetailProps {
  poolDetail: PoolInfo | undefined;
  handleClose: () => void;
  genesisHash: string | undefined;
}

type CollapseState = Record<string, boolean>;

export default function PoolDetail ({ genesisHash, handleClose, poolDetail }: PoolDetailProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const collapseReducer = useCallback((state: CollapseState, action: { type: string }): CollapseState => ({
    ...state,
    [action.type]: !state[action.type]
  }), []);

  const [collapse, dispatchCollapse] = useReducer(collapseReducer, { Ids: false, Members: false, Rewards: false, Roles: false });

  const commission = useMemo(() => {
    const maybeCommission = poolDetail?.bondedPool?.commission.current.isSome ? poolDetail.bondedPool.commission.current.value[0] : 0;

    return Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);
  }, [poolDetail?.bondedPool?.commission]);

  const roles = useMemo(() => ({
    bouncer: poolDetail?.bondedPool?.roles.bouncer?.toString(),
    depositor: poolDetail?.bondedPool?.roles.depositor?.toString(),
    nominator: poolDetail?.bondedPool?.roles.nominator?.toString(),
    root: poolDetail?.bondedPool?.roles.root?.toString()
  }), [poolDetail]);

  const ids = useMemo(() => ({
    'reward ID': poolDetail?.stashIdAccount?.rewardDestination?.toString(), // TODO: reward ID is wrong
    'stash ID': poolDetail?.stashIdAccount?.stashId.toString()
  }), [poolDetail]);

  const handleCollapses = useCallback((type: string) => () => dispatchCollapse({ type }), []);

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
          <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#120D27', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: 'calc(100% - 78px)', overflow: 'hidden', overflowY: 'auto', p: '10px', position: 'relative', zIndex: 1 }}>
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
              <GradientDivider style={{ m: '12px 0 7px' }} />
              <Stack direction='column' sx={{ gap: '8px', width: '100%' }}>
                <CollapseSection
                  TitleIcon={<FlashCircle color={collapse['Roles'] ? '#596AFF' : theme.palette.text.highlight} size='18' variant='Bulk' />}
                  onClick={handleCollapses('Roles')}
                  open={collapse['Roles']}
                  title={t('Roles')}
                >
                  <Stack direction='column' sx={{ py: '12px' }}>
                    {Object.entries(roles).map(([key, value], index) => {
                      const noDivider = Object.entries(roles).length === index + 1;

                      return (
                        <>
                          <RoleItem address={value} genesisHash={genesisHash} key={index} role={key} />
                          {!noDivider && <GradientDivider style={{ my: '8px' }} />}
                        </>
                      );
                    })}
                  </Stack>
                </CollapseSection>
                <CollapseSection
                  TitleIcon={<CommandSquare color={collapse['Ids'] ? '#596AFF' : theme.palette.text.highlight} size='18' variant='Bulk' />}
                  onClick={handleCollapses('Ids')}
                  open={collapse['Ids']}
                  title={t('Ids')}
                >
                  <Stack direction='column' sx={{ py: '12px' }}>
                    {Object.entries(ids).map(([key, value], index) => {
                      const noDivider = Object.entries(ids).length === index + 1;

                      return (
                        <>
                          <RoleItem address={value} genesisHash={genesisHash} key={index} role={key} />
                          {!noDivider && <GradientDivider style={{ my: '8px' }} />}
                        </>
                      );
                    })}
                  </Stack>
                </CollapseSection>
                <CollapseSection
                  TitleIcon={<People color={collapse['Members'] ? '#596AFF' : theme.palette.text.highlight} size='15' variant='Bulk' />}
                  onClick={handleCollapses('Members')}
                  open={collapse['Members']}
                  title={t('Members')}
                >
                  <></>
                </CollapseSection>
                <CollapseSection
                  TitleIcon={<BuyCrypto color={collapse['Rewards'] ? '#596AFF' : theme.palette.text.highlight} size='15' variant='Bulk' />}
                  onClick={handleCollapses('Rewards')}
                  open={collapse['Rewards']}
                  title={t('Rewards')}
                >
                  <></>
                </CollapseSection>
              </Stack>
            </Stack>
          </Grid>
        </Container>}
    </Dialog>
  );
}
