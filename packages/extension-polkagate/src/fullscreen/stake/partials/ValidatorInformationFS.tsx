// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SpStakingIndividualExposure } from '@polkadot/types/lookup';
import type { ValidatorInformation } from '../../../hooks/useValidatorsInformation';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { ActionButton, DetailPanel, FormatBalance2, Identity2 } from '../../../components';
import { useChainInfo, useTranslation, useValidatorApy } from '../../../hooks';
import { VelvetBox } from '../../../style';
import { getSubstrateAddress, isHexToBn } from '../../../util/utils';
import { InfoBox } from './InfoBox';

interface NominatorItemProps {
  nominator: SpStakingIndividualExposure;
  genesisHash: string | undefined;
}

const NominatorItem = ({ genesisHash, nominator }: NominatorItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '18px' }}>
      <Stack direction='column' sx={{ width: 'max-content' }}>
        <Identity2
          address={getSubstrateAddress(nominator.who.toString())}
          genesisHash={genesisHash ?? ''}
          identiconSize={24}
          showShortAddress
          showSocial={false}
          style={{ width: '210px' }}
        />
        <Grid container item sx={{ alignItems: 'center', gap: '4px', ml: '30px', width: 'fit-content' }}>
          <Typography color='#AA83DC' textAlign='left' variant='B-4'>
            {t('staked')}:
          </Typography>
          <FormatBalance2
            decimalPoint={2}
            decimals={[decimal ?? 0]}
            style={{ color: theme.palette.text.primary, fontFamily: 'Inter', fontSize: '12px', fontWeight: 500, width: 'fit-content' }}
            tokens={[token ?? '']}
            value={nominator.value}
          />
        </Grid>
      </Stack>
      <Identity2
        address={nominator.who.toString()}
        genesisHash={genesisHash ?? ''}
        justSocials
        style={{ width: '100px' }}
      />
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
    <Stack direction='column' sx={{ p: '50px 18px 0', width: '100%', zIndex: 1 }}>
      <Stack direction='column' sx={{ gap: '4px', height: '350px', maxHeight: '350px', overflow: 'auto', pb: '18px', width: '100%' }}>
        {nominators.map((item, index) => (
          <NominatorItem
            genesisHash={genesisHash}
            key={index}
            nominator={item}
          />
        ))}
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
}

const RightColumnContent = ({ genesisHash, validator }: RightColumnContentProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const commission = useMemo(() => String(Number(validator.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validator.validatorPrefs.commission) / (10 ** 7)) + '%', [validator.validatorPrefs.commission]);
  const validatorAPY = useValidatorApy(api, String(validator?.accountId), !!(isHexToBn(validator?.stakingLedger.total as unknown as string))?.gtn(0));

  return (
    <>
      <VelvetBox childrenStyle={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '4px', maxWidth: '268px' }} style={{ height: 'fit-content', margin: 0, width: 'fit-content' }}>
        <Typography color='text.secondary' p='14px' textAlign='left' variant='B-1' width='100%'>
          {t('Information')}
        </Typography>
        <InfoBox
          Amount={
            <FormatBalance2
              decimalPoint={2}
              decimals={[decimal ?? 0]}
              style={{ ...theme.typography['H-2'], color: theme.palette.text.primary, width: 'fit-content' }}
              tokens={[token ?? '']}
              value={validator.stakingLedger.total}
            />
          }
          // decimal={decimal}
          label={t('Staked')}
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
          value={validatorAPY ?? '---'}
        />
      </VelvetBox>
    </>
  );
};

interface Props {
  onClose: () => void;
  genesisHash: string | undefined;
  validator: ValidatorInformation;
}

export default function ValidatorInformationFS ({ genesisHash, onClose, validator }: Props) {
  return (
    <DetailPanel
      RightItem={
        <Identity2
          address={getSubstrateAddress(validator.accountId.toString())}
          genesisHash={genesisHash ?? ''}
          showShortAddress
          showSocial={false}
        />
      }
      leftColumnContent={
        <LeftColumnContent
          genesisHash={genesisHash}
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
          validator={validator}
        />
      }
    />
  );
}
