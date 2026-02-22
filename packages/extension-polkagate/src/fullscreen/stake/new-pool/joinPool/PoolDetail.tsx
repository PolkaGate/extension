// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-non-null-assertion */

import type { MyPoolInfo, PoolInfo } from '../../../../util/types';

import { Container, Grid, Link, Stack, Typography } from '@mui/material';
import { BuyCrypto, CommandSquare, DiscountCircle, FlashCircle, People } from 'iconsax-react';
import React, { Fragment, memo, useCallback, useMemo } from 'react';

import { noop } from '@polkadot/util';

import { useChainInfo, useIsExtensionPopup, usePoolDetail, useTranslation } from '../../../..//hooks';
import Subscan from '../../../../assets/icons/Subscan';
import { DetailPanel, GradientButton, GradientDivider } from '../../../../components';
import SnowFlake from '../../../../components/SVG/SnowFlake';
import { CollapseSection, PoolMembers, PoolReward, PoolStashIdSocials, RoleItem, StakingInfoStackWithIcon } from '../../../../popup/staking/partial/PoolDetail';
import { PoolIdenticon } from '../../../../popup/staking/partial/PoolIdenticon';
import { getSubscanChainName, toShortAddress } from '../../../../util';

interface PoolIdentityDetailProps {
  poolDetail: PoolInfo;
  genesisHash: string | undefined;
  poolStatus: string;
}

const PoolIdentityDetail = ({ genesisHash, poolDetail, poolStatus }: PoolIdentityDetailProps) => {
  const { chainName } = useChainInfo(genesisHash, true);
  const network = getSubscanChainName(chainName);

  const { bgcolor, textColor } = useMemo(() => {
    const status = poolDetail.bondedPool?.state.toString();

    return status === 'Open'
      ? { bgcolor: 'rgba(170, 131, 220, 0.15)', textColor: 'rgba(170, 131, 220, 1)' }
      : { bgcolor: 'rgba(255, 79, 185, 0.15)', textColor: 'rgba(255, 79, 185, 1)' };
  }, [poolDetail.bondedPool?.state]);

  return (
    <Stack direction='column' sx={{ alignItems: 'center', gap: '8px', p: '12px', width: '100%' }}>
      <Grid container item sx={{ border: '8px solid #00000033', borderRadius: '999px', height: 'fit-content', width: 'fit-content' }}>
        <PoolIdenticon
          poolInfo={poolDetail}
          size={48}
        />
      </Grid>
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
      <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', m: 0, width: 'fit-content' }}>
        <PoolStashIdSocials poolDetail={poolDetail} />
        <Link
          href={`https://${network}.subscan.io/account/${poolDetail.stashIdAccount?.accountId.toString()}`}
          rel='noreferrer'
          sx={{ alignItems: 'center', bgcolor: '#FFFFFF1A', borderRadius: '999px', display: 'flex', height: '24px', justifyContent: 'center', width: '24px' }}
          target='_blank'
          underline='none'
        >
          <Subscan
            color='#AA83DC'
            height={24}
            width={24}
          />
        </Link>
      </Container>
    </Stack>
  );
};

interface LeftColumnContentProps {
  genesisHash: string | undefined;
  poolDetail: MyPoolInfo | undefined;
  handleCollapses: (type: string) => () => void;
  collapse: Record<string, boolean>;
  roles: { bouncer: string | undefined; depositor: string | undefined; nominator: string | undefined; root: string | undefined; };
  ids: { 'reward ID': string | undefined; 'stash ID': string | undefined; };
  totalPoolRewardAsFiat: number;
  poolStatus: string;
}

const LeftColumnContent = memo(function LeftColumnContentMemo({ collapse, genesisHash, handleCollapses, ids, poolDetail, poolStatus, roles, totalPoolRewardAsFiat }: LeftColumnContentProps) {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  const getIconColor = useCallback((id: string) =>
    collapse[id] ? '#596AFF' : isExtension ? '#AA83DC' : '#FF4FB9'
    ,
    [collapse, isExtension]);

  return (
    <Stack direction='column' sx={{ position: 'relative', px: '18px', width: '100%', zIndex: 1 }}>
      <PoolIdentityDetail
        genesisHash={genesisHash}
        poolDetail={poolDetail!}
        poolStatus={poolStatus}
      />
      <Stack direction='column' sx={{ gap: '8px', width: '100%' }}>
        <CollapseSection
          TitleIcon={<FlashCircle color={getIconColor('Roles')} size='18' variant='Bulk' />}
          onClick={handleCollapses('Roles')}
          open={collapse['Roles']}
          title={t('Roles')}
        >
          <Stack direction='column' sx={{ py: '12px' }}>
            {Object.entries(roles).map(([key, value], index) => {
              const noDivider = Object.entries(roles).length === index + 1;

              return (
                <Fragment key={index}>
                  <RoleItem address={value} genesisHash={genesisHash} role={key} />
                  {!noDivider && <GradientDivider style={{ my: '8px' }} />}
                </Fragment>
              );
            })}
          </Stack>
        </CollapseSection>
        <CollapseSection
          TitleIcon={<CommandSquare color={getIconColor('Ids')} size='18' variant='Bulk' />}
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
          TitleIcon={<People color={getIconColor('Members')} size='15' variant='Bulk' />}
          onClick={handleCollapses('Members')}
          open={collapse['Members']}
          sideText={poolDetail?.bondedPool?.memberCounter.toString() ?? '0'}
          title={t('Members')}
        >
          <PoolMembers
            genesisHash={genesisHash}
            maxHeight='160px'
            members={poolDetail?.poolMembers ?? []}
            totalStaked={poolDetail?.bondedPool?.points.toString() ?? '0'}
          />
        </CollapseSection>
        <CollapseSection
          TitleIcon={<BuyCrypto color={getIconColor('Rewards')} size='15' variant='Bulk' />}
          onClick={handleCollapses('Rewards')}
          open={collapse['Rewards']}
          title={t('Rewards')}
        >
          <PoolReward
            genesisHash={genesisHash}
            totalPoolReward={poolDetail?.rewardClaimable?.toString() ?? '0'}
            totalPoolRewardAsFiat={totalPoolRewardAsFiat}
          />
        </CollapseSection>
      </Stack>
    </Stack>
  );
});

interface RightColumnContentProps {
  poolDetail: MyPoolInfo | undefined;
  genesisHash: string | undefined;
  commission: number;
  onSelect?: () => void;
  onClose?: () => void;
}

const RightColumnContent = ({ commission, genesisHash, onClose, onSelect, poolDetail }: RightColumnContentProps) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  return (
    <Stack direction='column' sx={{ gap: '12px', width: '200px' }}>
      <Stack direction='column' sx={{ bgcolor: '#05091C', border: '4px solid #1B133C', borderRadius: '27px', gap: '18px', p: '28px 22px' }}>
        <StakingInfoStackWithIcon
          Icon={<SnowFlake color='#AA83DC' size='19' />}
          amount={poolDetail?.bondedPool?.points}
          decimal={decimal}
          title={t('Staked')}
          titleColor='#AA83DC'
          token={token}
        />
        <StakingInfoStackWithIcon
          Icon={<DiscountCircle color='#AA83DC' size='24' variant='Bulk' />}
          text={String(commission) + '%'}
          title={t('Commission')}
          titleColor='#AA83DC'
        />
        <StakingInfoStackWithIcon
          Icon={<People color='#AA83DC' size='24' variant='Bulk' />}
          text={poolDetail?.bondedPool?.memberCounter.toString()}
          title={t('Members')}
          titleColor='#AA83DC'
        />
      </Stack>
      {(onSelect || onClose) &&
        <GradientButton
          onClick={onSelect ?? onClose ?? noop}
          style={{ width: '200px' }}
          text={onSelect ? t('Choose') : t('Close')}
        />}
    </Stack>
  );
};

interface Props {
  onClose: () => void;
  genesisHash: string | undefined;
  poolDetail: MyPoolInfo | null | undefined;
  onSelect?: () => void;
}

export default function PoolDetail({ genesisHash, onClose, onSelect, poolDetail }: Props) {
  const { t } = useTranslation();

  const { collapse,
    commission,
    handleCollapses,
    ids,
    poolStatus,
    roles,
    totalPoolRewardAsFiat } = usePoolDetail(poolDetail, genesisHash);

  const handleSelect = useCallback(() => {
    if (!onSelect) {
      return undefined;
    }

    onSelect();
    onClose();
  }, [onClose, onSelect]);

  if (!poolDetail) {
    return <></>;
  }

  return (
    <DetailPanel
      leftColumnContent={
        <LeftColumnContent
          collapse={collapse}
          genesisHash={genesisHash}
          handleCollapses={handleCollapses}
          ids={ids}
          poolDetail={poolDetail}
          poolStatus={poolStatus}
          roles={roles}
          totalPoolRewardAsFiat={totalPoolRewardAsFiat}
        />
      }
      leftColumnStyle={{ width: '415px' }}
      maxHeight={690}
      onClose={onClose}
      rightColumnContent={
        <RightColumnContent
          commission={commission}
          genesisHash={genesisHash}
          onClose={onClose}
          onSelect={onSelect ? handleSelect : undefined}
          poolDetail={poolDetail}
        />
      }
      showBackIconAsClose={true}
      title={t('Pool Detail')}
    />
  );
}
