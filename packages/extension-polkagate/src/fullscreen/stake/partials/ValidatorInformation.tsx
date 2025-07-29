// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-nocheck

import type { ValidatorInformation } from '@polkadot/extension-polkagate/hooks/useValidatorsInformation';
import type { SpStakingIndividualExposure } from '@polkadot/types/lookup';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { DetailPanel, FormatBalance2, Identity2 } from '@polkadot/extension-polkagate/components';
import { useChainInfo, useTranslation } from '@polkadot/extension-polkagate/hooks';

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
          address={nominator.who.toString()}
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
}

const LeftColumnContent = ({ genesisHash, nominators }: LeftColumnContentProps) => {
  return (
    <>
      <Stack direction='column' sx={{ p: '18px', position: 'relative', width: '100%', zIndex: 1 }}>
        {nominators.map((item, index) => (
          <NominatorItem
            genesisHash={genesisHash}
            key={index}
            nominator={item}
          />
        ))}
      </Stack>
    </>
  );
};

const RightColumnContent = () => {
  return <></>;
};

interface Props {
  onClose: () => void;
  genesisHash: string | undefined;
  validator: ValidatorInformation;
  onSelect?: () => void;
}

export default function ValidatorInformation ({ genesisHash, onClose, onSelect, validator }: Props) {
  const handleSelect = useCallback(() => {
    if (!onSelect) {
      return undefined;
    }

    onSelect();
    onClose();
  }, [onClose, onSelect]);

  return (
    <DetailPanel
      RightItem
      leftColumnContent={
        <LeftColumnContent
          genesisHash={genesisHash}
          nominators={validator.exposurePaged?.others as unknown as SpStakingIndividualExposure[] ?? []}
        />
      }
      maxHeight={690}
      onClose={onClose}
      rightColumnContent={
        <RightColumnContent />
      }
    />
  );
}
