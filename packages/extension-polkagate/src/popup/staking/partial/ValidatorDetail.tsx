// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransitionProps } from '@mui/material/transitions';
import type { SpStakingIndividualExposure } from '@polkadot/types/lookup';
import type { ValidatorInformation } from '../../../hooks/useValidatorsInformation';

import { Avatar, Container, Dialog, Grid, Link, Slide, Stack, styled, Typography, useTheme } from '@mui/material';
import React from 'react';

import { BN } from '@polkadot/util';

import { riot, subscan } from '../../../assets/icons';
import CustomCloseSquare from '../../../components/SVG/CustomCloseSquare';
import { useChainInfo, useTranslation, useValidatorApy } from '../../../hooks';
import { GradientDivider, PolkaGateIdenticon } from '../../../style';
import { toShortAddress } from '../../../util/utils';
import { Discord, Email, Github, Web, XIcon } from '../../settings/icons';
import SocialIcon from '../../settings/partials/SocialIcon';
import BlueGradient from '../staking styles/BlueGradient';
import AccountsTable from './AccountsTable';
import { ValidatorStakingInfo } from './NominatorsTable';

const Transition = React.forwardRef(function Transition (props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
  return <Slide direction='up' easing='ease-in-out' ref={ref} timeout={250} {...props} />;
});

interface ValidatorDetailProps {
  validatorDetail: ValidatorInformation | undefined;
  handleClose: () => void;
  genesisHash: string;
}

const GradientBox = styled('div')(() => ({
  backdropFilter: 'blur(10px)',
  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(6, 10, 29, 0) 100%)',
  borderRadius: '24px',
  height: '150px',
  left: 6,
  position: 'absolute',
  right: 6,
  top: 8
}));

interface ValidatorIdSocialsProps {
  validatorDetail: ValidatorInformation;
}

const ValidatorIdSocials = ({ validatorDetail }: ValidatorIdSocialsProps) => {
  const theme = useTheme();

  const bgColor = '#FFFFFF1A';

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', flexDirection: 'row', m: 0, width: '32%' }}>
      {validatorDetail.identity?.discord &&
        <SocialIcon Icon={<Discord color={theme.palette.icon.secondary} width='14px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
      {validatorDetail.identity?.email &&
        <SocialIcon Icon={<Email color={theme.palette.icon.secondary} width='14px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
      {validatorDetail.identity?.github &&
        <SocialIcon Icon={<Github color={theme.palette.icon.secondary} width='14px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
      {(validatorDetail.identity?.matrix || validatorDetail.identity?.riot) &&
        <Link
          href={''}
          rel='noreferrer'
          sx={{ alignItems: 'center', bgcolor: '#FFFFFF1A', borderRadius: '999px', display: 'flex', height: '24px', justifyContent: 'center', width: '24px' }}
          target='_blank'
          underline='none'
        >
          <Avatar
            src={riot as string}
            sx={{ height: '15px', width: '15px' }}
          />
        </Link>
      }
      {validatorDetail.identity?.twitter &&
        <SocialIcon Icon={<XIcon color={theme.palette.icon.secondary} width='14px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
      {validatorDetail.identity?.web &&
        <SocialIcon Icon={<Web color={theme.palette.icon.secondary} width='14px' />} bgColor={bgColor} link='https://www.youtube.com/@polkagate' size={24} />
      }
    </Container>
  );
};

interface ValidatorIdentityDetailProps {
  validatorDetail: ValidatorInformation;
  genesisHash: string;
}

const ValidatorIdentityDetail = ({ genesisHash, validatorDetail }: ValidatorIdentityDetailProps) => {
  const { chainName } = useChainInfo(genesisHash);

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
            href={`https://${chainName}.subscan.io/account/${validatorDetail.accountId.toString()}`}
            rel='noreferrer'
            sx={{ alignItems: 'center', bgcolor: '#FFFFFF1A', borderRadius: '999px', display: 'flex', height: '24px', justifyContent: 'center', width: '24px' }}
            target='_blank'
            underline='none'
          >
            <Avatar
              src={subscan as string}
              sx={{ height: '15px', width: '15px' }}
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
        <Typography color='#82FFA5' sx={{ fontSize: '12px', fontWeight: 700 }}>
          {toShortAddress(validatorDetail.accountId)}
        </Typography>
      </Container>
    </Stack>
  );
};

export default function ValidatorDetail ({ genesisHash, handleClose, validatorDetail }: ValidatorDetailProps): React.ReactElement {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const validatorAPY = useValidatorApy(api, String(validatorDetail?.accountId), !!(new BN(validatorDetail?.stakingLedger.total as unknown as string))?.gtn(0));

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
            <CustomCloseSquare color='#AA83DC' onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
          </Grid>
          <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#120D27', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: 'calc(100% - 78px)', overflow: 'hidden', overflowY: 'scroll', p: '10px', position: 'relative', zIndex: 1 }}>
            <BlueGradient style={{ top: '-120px' }} />
            <GradientBox />
            <Stack direction='column' sx={{ position: 'relative', width: '100%', zIndex: 1 }}>
              <ValidatorIdentityDetail
                genesisHash={genesisHash}
                validatorDetail={validatorDetail}
              />
              <GradientDivider style={{ mb: '12px' }} />
              <Container disableGutters sx={{ alignItems: 'flex-end', columnGap: '4px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', px: '12px' }}>
                <ValidatorStakingInfo amount={validatorDetail.exposureMeta?.own ?? 0} decimal={decimal} title={t('Own')} token={token} />
                <ValidatorStakingInfo text={String(Number(validatorDetail.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validatorDetail.validatorPrefs.commission) / (10 ** 7)) + '%'} title={t('Commission')} />
                <ValidatorStakingInfo amount={validatorDetail.exposureMeta?.total ?? 0} decimal={decimal} title={t('Total')} token={token} />
                <ValidatorStakingInfo text={validatorAPY ?? '--'} title={t('APY')} />
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
