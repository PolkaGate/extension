// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
// @ts-ignore
import type { SpStakingIndividualExposure } from '@polkadot/types/lookup';
import type { BN } from '@polkadot/util';
import type { ValidatorInformation } from '../../../hooks/useValidatorsInformation';

import { Box, Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { type CSSProperties, memo, useCallback, useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';

import { ActionButton, DetailPanel, DisplayBalance, GradientButton, Identity2 } from '../../../components';
import { useChainInfo, useTranslation, useValidatorApy } from '../../../hooks';
import { Email, Web, XIcon } from '../../../popup/settings/icons';
import SocialIcon from '../../../popup/settings/partials/SocialIcon';
import { PolkaGateIdenticon, VelvetBox } from '../../../style';
import { getSubstrateAddress, isHexToBn, toShortAddress } from '../../../util';
import { getTokenUnit } from '../util/utils';
import { InfoBox } from './InfoBox';

export const MiniSocials = ({ accountInfo }: { accountInfo: DeriveAccountRegistration | undefined }) => {
  return (
    <Grid alignItems='center' columnGap='2px' container item sx={{ width: 'fit-content' }}>
      {accountInfo?.email &&
        <SocialIcon Icon={<Email color='#AA83DC' width='18px' />} link={`mailto:${accountInfo.email}`} size={24} />
      }
      {accountInfo?.web &&
        <SocialIcon Icon={<Web color='#AA83DC' width='18px' />} link={accountInfo.web} size={24} />

      }
      {accountInfo?.twitter &&
        <SocialIcon Icon={<XIcon color='#AA83DC' width='18px' />} bgColor='#AA83DC26' link={`https://twitter.com/${accountInfo.twitter}`} size={24} />
      }
    </Grid>
  );
};

interface NominatorItemProps {
  nominator: SpStakingIndividualExposure;
  genesisHash: string | undefined;
}

const NominatorItem = ({ genesisHash, nominator }: NominatorItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const [accountInfo, setAccountInfo] = useState<DeriveAccountRegistration | undefined>(undefined);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '18px' }}>
      <Stack direction='column' sx={{ width: 'max-content' }}>
        <Identity2
          address={getSubstrateAddress(nominator.who.toString())}
          genesisHash={genesisHash ?? ''}
          identiconSize={24}
          returnIdentity={setAccountInfo}
          showShortAddress
          showSocial={false}
          style={{ width: '210px' }}
        />
        <Grid container item sx={{ alignItems: 'center', gap: '4px', ml: '30px', width: 'fit-content' }}>
          <Typography color='#AA83DC' textAlign='left' variant='B-4'>
            {t('Staked')}:
          </Typography>
          <DisplayBalance
            balance={nominator.value}
            decimal={decimal}
            decimalPoint={2}
            style={{ color: theme.palette.text.primary, fontFamily: 'Inter', fontSize: '12px', fontWeight: 500}}
            token={token}
          />
        </Grid>
      </Stack>
      <MiniSocials accountInfo={accountInfo} />
    </Container>
  );
};

interface LeftColumnContentProps {
  nominators: SpStakingIndividualExposure[];
  genesisHash: string | undefined;
  onClose: () => void;
}

const LeftColumnContent = ({ genesisHash, nominators, onClose }: LeftColumnContentProps) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ gap: '6px', p: '50px 18px 0', width: '100%', zIndex: 1 }}>
      <Box
        sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', justifySelf: 'center', m: '5px 0 15px', width: '100%' }}
      />
      <Stack direction='column' sx={{ gap: '4px', height: '350px', maxHeight: '350px', overflow: 'auto', pb: '18px', width: '100%' }}>
        {nominators.length > 0 &&
          <List
            height={515}
            itemCount={nominators.length}
            itemSize={82}
            width='100%'
          >
            {({ index, style }: { index: number, style: CSSProperties }) => {
              const item = nominators[index];

              return (
                <div key={index} style={{ paddingBottom: '2px', ...style }}>
                  <NominatorItem
                    genesisHash={genesisHash}
                    nominator={item}
                  />
                </div>
              );
            }}
          </List>}
        {nominators.length === 0 &&
          <Typography color='#AA83DC' sx={{ pt: '25px', textAlign: 'center', width: '100%' }} variant='B-2'>
            {t('No nominators')}
          </Typography>
        }
      </Stack>
      <ActionButton
        contentPlacement='center'
        onClick={onClose}
        style={{ height: '44px', width: '100%' }}
        text={t('Back')}
      />
    </Stack>
  );
};

interface RightColumnContentProps {
  validator: ValidatorInformation;
  genesisHash: string | undefined;
  onSelect?: () => void;
}

const RightColumnContent = ({ genesisHash, onSelect, validator }: RightColumnContentProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const commission = useMemo(() => String(Number(validator.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validator.validatorPrefs.commission) / (10 ** 7)) + '%', [validator.validatorPrefs.commission]);
  const validatorAPY = useValidatorApy(api, String(validator?.accountId), !!(isHexToBn(validator?.stakingLedger.total as unknown as string))?.gtn(0));
  const valueUnit = ` (${getTokenUnit(validator.stakingLedger.total as unknown as BN, decimal ?? 0, token ?? '')})`;

  return (
    <Stack direction='column' sx={{ gap: '12px', width: 'fit-content' }}>
      <VelvetBox childrenStyle={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '4px', maxWidth: '260px' }} style={{ height: 'fit-content', margin: 0, width: 'fit-content' }}>
        <Typography color='text.secondary' p='14px' textAlign='left' variant='B-1' width='100%'>
          {t('Information')}
        </Typography>
        <InfoBox
          Amount={
            <DisplayBalance
              balance={validator.stakingLedger.total}
              decimal={decimal}
              decimalPoint={2}
              style={{ ...theme.typography['H-2'], color: theme.palette.text.primary }}
              token={token}
              withCurrency={false}
            />
          }
          label={t('Staked') + valueUnit}
          style={{ alignItems: 'flex-start', p: '16px', width: '128px' }}
          value={undefined}
        />
        <InfoBox
          label={t('Commission')}
          style={{ alignItems: 'flex-start', p: '16px', width: '128px' }}
          value={commission}
        />
        <InfoBox
          label={t('Nominators')}
          style={{ alignItems: 'flex-start', p: '16px', width: '128px' }}
          // @ts-ignore
          value={validator.exposureMeta?.nominatorCount ?? 0}
        />
        <InfoBox
          label={t('APY')}
          style={{ alignItems: 'flex-start', p: '16px', width: '128px' }}
          value={validatorAPY != null ? `${validatorAPY}%` : '...'}
        />
      </VelvetBox>
      {onSelect &&
        <GradientButton
          onClick={onSelect}
          style={{ width: '268px' }}
          text={t('Choose')}
        />}
    </Stack>
  );
};

const ValidatorIdentityFs = memo(function ValidatorIdentity ({ validatorInfo }: { validatorInfo: ValidatorInformation }) {
  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', flexDirection: 'row', maxWidth: '310px', overflow: 'hidden', width: 'fit-content' }}>
      <PolkaGateIdenticon
        address={validatorInfo.accountId.toString()}
        size={38}
      />
      {!validatorInfo.identity &&
        <Typography color='text.primary' variant='H-2'>
          {toShortAddress(validatorInfo.accountId)}
        </Typography>}
      {validatorInfo.identity &&
        <Typography color='text.primary' variant='H-2'>
          {validatorInfo.identity.displayParent ?? validatorInfo.identity.display}
        </Typography>}
      {validatorInfo.identity?.displayParent &&
        <Typography color='#AA83DC' sx={{ bgcolor: '#AA83DC26', borderRadius: '6px', p: '4px' }} variant='B-5'>
          {validatorInfo.identity.display}
        </Typography>}
    </Container>
  );
});

interface Props {
  onClose: () => void;
  onSelect?: () => void;
  genesisHash: string | undefined;
  validator: ValidatorInformation;
}

export default function ValidatorInformationFS ({ genesisHash, onClose, onSelect, validator }: Props) {
  const handleSelect = useCallback(() => {
    onSelect?.();
    onClose();
  }, [onClose, onSelect]);

  return (
    <DetailPanel
      LeftItem={
        <ValidatorIdentityFs validatorInfo={validator} />
      }
      leftColumnContent={
        <LeftColumnContent
          genesisHash={genesisHash}
          // @ts-ignore
          nominators={validator.exposurePaged?.others as unknown as SpStakingIndividualExposure[] ?? []}
          onClose={onClose}
        />
      }
      maxHeight={690}
      noDivider
      onClose={onClose}
      rightColumnContent={
        <RightColumnContent
          genesisHash={genesisHash}
          onSelect={onSelect ? handleSelect : undefined}
          validator={validator}
        />
      }
      showBackIconAsClose
    />
  );
}
