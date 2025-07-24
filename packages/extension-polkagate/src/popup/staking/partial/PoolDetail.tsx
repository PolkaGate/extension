// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransitionProps } from '@mui/material/transitions';
import type { Compact } from '@polkadot/types';
import type { INumber } from '@polkadot/types/types';
import type { MyPoolInfo, PoolInfo } from '../../../util/types';

import { Collapse, Container, Dialog, Grid, Link, Slide, Stack, Typography, useTheme } from '@mui/material';
import { ArrowDown2, BuyCrypto, Chart21, CommandSquare, DiscountCircle, FlashCircle, People } from 'iconsax-react';
import React, { useCallback, useMemo, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router';

import { calcPrice } from '@polkadot/extension-polkagate/src/hooks/useYouHave2';
import { type BN, BN_ZERO } from '@polkadot/util';

import Subscan from '../../../assets/icons/Subscan';
import { CryptoFiatBalance, FadeOnScroll, FormatBalance2, Identity2 } from '../../../components';
import CustomCloseSquare from '../../../components/SVG/CustomCloseSquare';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useChainInfo, useTokenPriceBySymbol, useTranslation } from '../../../hooks';
import { GradientDivider } from '../../../style';
import { isHexToBn, toShortAddress } from '../../../util/utils';
import { Email, Web, XIcon } from '../../settings/icons';
import SocialIcon from '../../settings/partials/SocialIcon';
import BlueGradient from '../stakingStyles/BlueGradient';
import DetailGradientBox from '../stakingStyles/DetailGradientBox';
import { StakingInfoStack } from './NominatorsTable';
import { PoolIdenticon } from './PoolIdenticon';
import Progress from './Progress';

const Transition = React.forwardRef(function Transition (props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
  return <Slide direction='up' easing='ease-in-out' ref={ref} timeout={250} {...props} />;
});

const unwrapRewardAccount = (rewardDestination: string | undefined) => {
  try {
    const parsed = rewardDestination ? JSON.parse(rewardDestination) as unknown : undefined;

    if (parsed && typeof parsed === 'object' && parsed !== null && 'account' in parsed) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return (parsed as { account?: string }).account;
    }

    return undefined;
  } catch {
    return undefined;
  }
};

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
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '6px', m: 0, width: 'fit-content' }}>
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
  const { t } = useTranslation();
  const { chainName } = useChainInfo(genesisHash, true);
  const navigate = useNavigate();

  const poolStatus = useMemo(() => {
    const status = poolDetail.bondedPool?.state.toString();

    return status === 'Open'
      ? t('pool')
      : status === 'Destroying'
        ? t('destroying')
        : t('blocked');
  }, [poolDetail.bondedPool?.state, t]);

  const { bgcolor, textColor } = useMemo(() => {
    const status = poolDetail.bondedPool?.state.toString();

    return status === 'Open'
      ? { bgcolor: 'rgba(128, 154, 203, 0.15)', textColor: 'rgba(128, 154, 203, 1)' }
      : { bgcolor: 'rgba(255, 79, 185, 0.15)', textColor: 'rgba(255, 79, 185, 1)' };
  }, [poolDetail.bondedPool?.state]);

  // Navigate to the staking reward chart using the stash ID,
  // since we're specifically interested in rewards associated with the stash id of the pool (i.e., pool rewards).
  const stashId = poolDetail?.stashIdAccount?.accountId.toString() ?? '';
  const onRewardChart = useCallback(() => navigate('/stakingReward/' + stashId + '/' + genesisHash + '/stash') as void, [genesisHash, navigate, stashId]);

  return (
    <Stack direction='column' sx={{ p: '12px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'flex-start', columnGap: '4px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <PoolStashIdSocials poolDetail={poolDetail} />
        <Grid container item sx={{ border: '8px solid #00000033', borderRadius: '999px', height: 'fit-content', width: 'fit-content' }}>
          <PoolIdenticon
            poolInfo={poolDetail}
            size={48}
          />
        </Grid>
        <Grid container item sx={{ gap: '4px', justifyContent: 'flex-end', width: '32%' }}>
          <Chart21 color='#809ACB' onClick={onRewardChart} size='24' style={{ backgroundColor: '#FFFFFF1A', borderRadius: '999px', cursor: 'pointer', padding: '4px' }} variant='Bulk' />
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
            <Typography color={textColor} sx={{ bgcolor, borderRadius: '10px', ml: '6px', p: '4px 6px' }} textTransform='uppercase' variant='B-5'>
              {poolStatus}
            </Typography>
          </Typography>
        </Grid>
        <Typography color='#82FFA5' sx={{ fontFamily: 'JetBrainsMono', fontSize: '14px', fontWeight: 700 }}>
          {toShortAddress(poolDetail.stashIdAccount?.accountId.toString())}
        </Typography>
      </Container>
    </Stack>
  );
};

interface PoolMembersProps {
  members: {
    accountId: string;
    member: {
      points: number;
      poolId: number;
    };
  }[];
  genesisHash: string | undefined;
  totalStaked: string;
}

const PoolMembers = ({ genesisHash, members, totalStaked }: PoolMembersProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const containerRef = useRef(null);

  return (
    <>
      <Stack direction='column' ref={containerRef} sx={{ bgcolor: '#222540A6', borderRadius: '10px', gap: '12px', maxHeight: '220px', overflow: 'hidden', overflowY: 'auto', p: '12px', width: '100%' }}>
        <Container disableGutters sx={{ display: 'flex', flexDirection: 'row' }}>
          <Typography color='text.highlight' letterSpacing='1px' textAlign='left' textTransform='uppercase' variant='S-1' width='40%'>
            {t('Identity')}
          </Typography>
          <Typography color='text.highlight' letterSpacing='1px' textAlign='left' textTransform='uppercase' variant='S-1' width='35%'>
            {t('Staked')}
          </Typography>
          <Typography color='text.highlight' letterSpacing='1px' textAlign='right' textTransform='uppercase' variant='S-1' width='25%'>
            {t('Percent')}
          </Typography>
        </Container>
        <Stack direction='column' sx={{ gap: '8px', width: '100%' }}>
          {members.map((member, index) => {
            const percentage = (Number(member.member.points.toString()) / Number(totalStaked)) * 100;
            // const percentage = ((isHexToBn(member.member.points.toString()).div(isHexToBn(totalStaked.toString()))).muln(100)).toString();

            return (
              <React.Fragment key={index}>
                <Container disableGutters sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Identity2
                    address={member.accountId}
                    genesisHash={genesisHash ?? ''}
                    identiconSize={18}
                    showShortAddress
                    style={{ variant: 'B-4', width: '40%' }}
                  />
                  <FormatBalance2
                    decimals={[decimal ?? 0]}
                    style={{ ...theme.typography['B-4'], textAlign: 'left', width: '35%' }}
                    tokenColor={theme.palette.text.highlight}
                    tokens={[token ?? '']}
                    value={isHexToBn(member.member.points.toString())}
                  />
                  <Typography color='text.primary' textAlign='right' variant='B-4' width='25%'>
                    {isNaN(percentage) ? '--' : percentage.toFixed(2)}%
                  </Typography>
                </Container>
                {members.length > index + 1 && <GradientDivider isBlueish />}
              </React.Fragment>
            );
          })}
        </Stack>
      </Stack>
      <FadeOnScroll containerRef={containerRef} height='40px' ratio={0.075} />
    </>
  );
};

interface PoolRewardProps {
  genesisHash: string | undefined;
  totalPoolReward: string;
}

const PoolReward = ({ genesisHash, totalPoolReward }: PoolRewardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const price = useTokenPriceBySymbol(token ?? '', genesisHash ?? '');
  const fiatBalance = useMemo(() => calcPrice(price.price, isHexToBn(totalPoolReward) ?? BN_ZERO, decimal ?? 0), [decimal, price?.price, totalPoolReward]);

  return (
    <Stack direction='column' sx={{ alignItems: 'center', bgcolor: '#222540A6', borderRadius: '10px', gap: '18px', p: '12px', width: '100%' }}>
      <Typography color='text.highlight' letterSpacing='1px' textAlign='left' textTransform='uppercase' variant='S-1' width='100%'>
        {t('Pool Claimable Reward')}
      </Typography>
      <CryptoFiatBalance
        cryptoBalance={isHexToBn(totalPoolReward)}
        cryptoProps={{ style: { ...theme.typography['B-4'] }, tokenColor: theme.palette.text.highlight }}
        decimal={decimal ?? 0}
        fiatBalance={fiatBalance}
        fiatProps={{ decimalColor: theme.palette.text.primary }}
        style={{
          alignItems: 'start',
          rowGap: 0,
          textAlign: 'left',
          width: '100%'
        }}
        token={token ?? ''}
      />
    </Stack>
  );
};

interface CollapseSectionProp {
  title: string;
  TitleIcon: React.ReactNode;
  open: boolean;
  children: React.ReactNode;
  onClick: () => void;
  notShow?: boolean;
  sideText?: string;
}

const CollapseSection = ({ TitleIcon, children, notShow, onClick, open, sideText, title }: CollapseSectionProp) => {
  const theme = useTheme();

  return (
    <Collapse collapsedSize='44px' in={open} sx={{ bgcolor: '#060518', borderRadius: '14px', display: notShow ? 'none' : 'block', p: '4px' }}>
      <Container disableGutters onClick={onClick} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '6px', p: '8px 14px 11px' }}>
        {TitleIcon}
        <Typography color={open ? '#596AFF' : theme.palette.text.primary} sx={{ transition: 'all 150ms ease-out', width: 'fit-content' }} variant='B-2'>
          {title}
        </Typography>
        <ArrowDown2 color={open ? '#596AFF' : theme.palette.text.highlight} size='17' style={{ rotate: open ? '180deg' : 'none', transition: 'all 150ms ease-out' }} />
        {sideText &&
          <Grid container item sx={{ alignItems: 'center', justifyContent: 'flex-end' }} xs>
            <Typography color='text.highlight' sx={{ bgcolor: '#809ACB33', borderRadius: '8px', p: '2px 3px' }} variant='B-4'>
              {sideText}
            </Typography>
          </Grid>}
      </Container>
      <Stack direction='column' sx={{ bgcolor: '#222540A6', borderRadius: '10px', position: 'relative' }}>
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
  poolDetail: MyPoolInfo | undefined;
  handleClose: () => void;
  genesisHash: string | undefined;
  comprehensive?: boolean; // if it is true all the information will be shown in the table
  openMenu?: boolean;
}

type CollapseState = Record<string, boolean>;

export default function PoolDetail ({ comprehensive, genesisHash, handleClose, openMenu, poolDetail }: PoolDetailProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const collapseReducer = useCallback((state: CollapseState, action: { type: string }): CollapseState => ({
    ...state,
    [action.type]: !state[action.type]
  }), []);

  const [collapse, dispatchCollapse] = useReducer(collapseReducer, { Ids: false, Members: false, Rewards: false, Roles: false });

  const commission = useMemo(() => {
    const maybeCommission = poolDetail?.bondedPool?.commission?.current?.isSome ? poolDetail.bondedPool.commission.current.value[0] : 0;

    return Number(maybeCommission) / (10 ** 7) < 1 ? 0 : Number(maybeCommission) / (10 ** 7);
  }, [poolDetail?.bondedPool?.commission]);

  const roles = useMemo(() => ({
    bouncer: poolDetail?.bondedPool?.roles.bouncer?.toString(),
    depositor: poolDetail?.bondedPool?.roles.depositor?.toString(),
    nominator: poolDetail?.bondedPool?.roles.nominator?.toString(),
    root: poolDetail?.bondedPool?.roles.root?.toString()
  }), [poolDetail]);

  const ids = useMemo(() => ({
    'reward ID': poolDetail?.accounts?.rewardId.toString() ?? unwrapRewardAccount(poolDetail?.stashIdAccount?.rewardDestination?.toString()),
    'stash ID': poolDetail?.accounts?.stashId.toString() ?? poolDetail?.stashIdAccount?.accountId.toString()
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
      open={Boolean(poolDetail || openMenu)}
    >
      {!poolDetail &&
        <Progress
          loaderSize={40}
          text={t('Loading pool information')}
        />
      }
      {poolDetail &&
        <Container disableGutters sx={{ height: '100%', width: '100%' }}>
          <Grid alignItems='center' container item justifyContent='center' sx={{ pb: '12px', pt: '18px' }}>
            <CustomCloseSquare color='#809ACB' onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
          </Grid>
          <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#110F2A', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: 'calc(100% - 78px)', overflow: 'hidden', overflowY: 'auto', p: '10px', position: 'relative', zIndex: 1 }}>
            <BlueGradient style={{ top: '-120px' }} />
            <DetailGradientBox />
            <Stack direction='column' sx={{ position: 'relative', width: '100%', zIndex: 1 }}>
              <PoolIdentityDetail
                genesisHash={genesisHash}
                poolDetail={poolDetail}
              />
              <GradientDivider style={{ mb: '12px' }} />
              <Container disableGutters sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '4px', justifyContent: 'space-between', p: '0 12px 0 10px' }}>
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
                          <RoleItem address={value} genesisHash={genesisHash} role={key} />
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
                        <React.Fragment key={key}>
                          <RoleItem address={value} genesisHash={genesisHash} key={index} role={key} />
                          {!noDivider && <GradientDivider style={{ my: '8px' }} />}
                        </React.Fragment>
                      );
                    })}
                  </Stack>
                </CollapseSection>
                <CollapseSection
                  TitleIcon={<People color={collapse['Members'] ? '#596AFF' : theme.palette.text.highlight} size='15' variant='Bulk' />}
                  notShow={!comprehensive}
                  onClick={handleCollapses('Members')}
                  open={collapse['Members']}
                  sideText={poolDetail.bondedPool?.memberCounter.toString()}
                  title={t('Members')}
                >
                  <PoolMembers
                    genesisHash={genesisHash}
                    members={poolDetail.poolMembers ?? []}
                    totalStaked={poolDetail.bondedPool?.points.toString() ?? '0'}
                  />
                </CollapseSection>
                <CollapseSection
                  TitleIcon={<BuyCrypto color={collapse['Rewards'] ? '#596AFF' : theme.palette.text.highlight} size='15' variant='Bulk' />}
                  notShow={!comprehensive}
                  onClick={handleCollapses('Rewards')}
                  open={collapse['Rewards']}
                  title={t('Rewards')}
                >
                  <PoolReward
                    genesisHash={genesisHash}
                    totalPoolReward={poolDetail.rewardClaimable?.toString() ?? '0'}
                  />
                </CollapseSection>
              </Stack>
            </Stack>
          </Grid>
        </Container>}
    </Dialog>
  );
}
