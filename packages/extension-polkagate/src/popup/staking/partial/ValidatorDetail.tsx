// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck

import type { SpStakingIndividualExposure } from '@polkadot/types/lookup';
import type { ValidatorInformation } from '../../../hooks/useValidatorsInformation';

import { Container, Dialog, Grid, Link, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import React from 'react';

import Riot from '@polkadot/extension-polkagate/src/assets/icons/Riot';
import Subscan from '@polkadot/extension-polkagate/src/assets/icons/Subscan';

import { Transition } from '../../../components';
import CustomCloseSquare from '../../../components/SVG/CustomCloseSquare';
import { useChainInfo, useIsBlueish, useTranslation, useValidatorApy } from '../../../hooks';
import { GradientDivider, PolkaGateIdenticon } from '../../../style';
import { getSubscanChainName, isHexToBn, toShortAddress } from '../../../util';
import { Discord, Email, Github, Web, XIcon } from '../../settings/icons';
import SocialIcon from '../../settings/partials/SocialIcon';
import BlueGradient from '../stakingStyles/BlueGradient';
import DetailGradientBox from '../stakingStyles/DetailGradientBox';
import AccountsTable from './AccountsTable';
import { StakingInfoStack } from './NominatorsTable';

interface ValidatorDetailProps {
  validatorDetail: ValidatorInformation | undefined;
  handleClose: () => void;
  genesisHash: string;
}

interface ValidatorIdSocialsProps {
  validatorDetail: ValidatorInformation;
  style?: SxProps<Theme>;
}

export const ValidatorIdSocials = ({ style, validatorDetail }: ValidatorIdSocialsProps) => {
  const isBlueish = useIsBlueish();

  const bgColor = isBlueish ? '#FFFFFF1A' : '#AA83DC26';
  const color = isBlueish ? '#809ACB' : '#AA83DC';

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', flexDirection: 'row', m: 0, width: '32%', ...style }}>
      {validatorDetail.identity?.discord &&
        <SocialIcon Icon={<Discord color={color} width='14px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
      {validatorDetail.identity?.email &&
        <SocialIcon Icon={<Email color={color} width='14px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
      {validatorDetail.identity?.github &&
        <SocialIcon Icon={<Github color={color} width='14px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
      {(validatorDetail.identity?.matrix || validatorDetail.identity?.riot) &&
        <Link
          href={''}
          rel='noreferrer'
          sx={{ alignItems: 'center', bgcolor: '#FFFFFF1A', borderRadius: '999px', display: 'flex', height: '24px', justifyContent: 'center', width: '24px' }}
          target='_blank'
          underline='none'
        >
          <Riot
            color={color}
            height={15}
            width={15}
          />
        </Link>
      }
      {validatorDetail.identity?.twitter &&
        <SocialIcon Icon={<XIcon color={color} width='13px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
      {validatorDetail.identity?.web &&
        <SocialIcon Icon={<Web color={color} width='14px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
    </Container>
  );
};

interface ValidatorIdentityDetailProps {
  validatorDetail: ValidatorInformation;
  genesisHash: string;
}

const ValidatorIdentityDetail = ({ genesisHash, validatorDetail }: ValidatorIdentityDetailProps) => {
  const { chainName } = useChainInfo(genesisHash, true);
  const network = getSubscanChainName(chainName);

  return (
    <Stack direction='column' sx={{ p: '12px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'flex-start', columnGap: '4px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <ValidatorIdSocials validatorDetail={validatorDetail} />
        <Grid container item sx={{ border: '8px solid #00000033', borderRadius: '999px', height: 'fit-content', width: 'fit-content' }}>
          <PolkaGateIdenticon
            address={validatorDetail.accountId.toString()}
            size={48}
          />
        </Grid>
        <Grid container item sx={{ justifyContent: 'flex-end', width: '32%' }}>
          <Link
            href={`https://${network}.subscan.io/account/${validatorDetail.accountId.toString()}`}
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
          {validatorDetail.identity &&
            <Typography color='text.primary' variant='B-2'>
              {validatorDetail.identity.displayParent ?? validatorDetail.identity.display}
            </Typography>}
          {validatorDetail.identity?.displayParent &&
            <Typography color='text.highlight' sx={{ bgcolor: '#809ACB26', borderRadius: '6px', p: '4px' }} variant='B-5'>
              {validatorDetail.identity.display}
            </Typography>}
        </Grid>
        <Typography color='#82FFA5' sx={{ fontFamily: 'JetBrainsMono', fontSize: '14px', fontWeight: 700 }}>
          {toShortAddress(validatorDetail.accountId)}
        </Typography>
      </Container>
    </Stack>
  );
};

export default function ValidatorDetail ({ genesisHash, handleClose, validatorDetail }: ValidatorDetailProps): React.ReactElement {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const validatorAPY = useValidatorApy(api, String(validatorDetail?.accountId), !!(isHexToBn(validatorDetail?.stakingLedger.total as unknown as string))?.gtn(0));

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
      open={!!validatorDetail}
    >
      {validatorDetail &&
        <Container disableGutters sx={{ height: '100%', width: '100%' }}>
          <Grid alignItems='center' container item justifyContent='center' sx={{ pb: '12px', pt: '18px' }}>
            <CustomCloseSquare color='#809ACB' onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
          </Grid>
          <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#110F2A', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: 'calc(100% - 78px)', overflow: 'hidden', overflowY: 'auto', p: '10px', pb: 0, position: 'relative', zIndex: 1 }}>
            <BlueGradient style={{ top: '-120px' }} />
            <DetailGradientBox />
            <Stack direction='column' sx={{ position: 'relative', width: '100%', zIndex: 1 }}>
              <ValidatorIdentityDetail
                genesisHash={genesisHash}
                validatorDetail={validatorDetail}
              />
              <GradientDivider style={{ mb: '12px' }} />
              <Container disableGutters sx={{ alignItems: 'flex-end', columnGap: '4px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '0 12px 0 10px' }}>
                <StakingInfoStack amount={validatorDetail.exposureMeta?.own ?? 0} decimal={decimal} title={t('Own')} token={token} />
                <StakingInfoStack text={String(Number(validatorDetail.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validatorDetail.validatorPrefs.commission) / (10 ** 7)) + '%'} title={t('Commission')} />
                <StakingInfoStack amount={validatorDetail.exposureMeta?.total ?? 0} decimal={decimal} title={t('Total')} token={token} />
                <StakingInfoStack text={validatorAPY != null ? `${validatorAPY}%` : '...'} title={t('APY')} />
              </Container>
              <GradientDivider style={{ my: '12px' }} />
              <Container disableGutters sx={{ alignItems: 'center', columnGap: '8px', display: 'flex', flexDirection: 'row', mb: '8px', pl: '6px' }}>
                <Typography color='text.primary' variant='B-2'>
                  {t('Nominators')}
                </Typography>
                <Typography color='text.highlight' sx={{ bgcolor: '#809ACB26', borderRadius: '8px', p: '2px 4px' }} variant='B-4'>
                  {validatorDetail.exposureMeta?.nominatorCount as unknown as string ?? '0'}
                </Typography>
              </Container>
              <AccountsTable
                accounts={validatorDetail.exposurePaged?.others as unknown as SpStakingIndividualExposure[] ?? []}
                genesisHash={genesisHash}
                style={{ px: '6px' }}
                totalStaked={validatorDetail.exposureMeta?.total as string ?? '0'}
              />
            </Stack>
          </Grid>
        </Container>}
    </Dialog>
  );
}
