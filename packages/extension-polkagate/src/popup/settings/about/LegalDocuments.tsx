// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import { ExportSquare } from 'iconsax-react';
import React, { useCallback } from 'react';

import { useIsExtensionPopup, useTranslation } from '@polkadot/extension-polkagate/src/hooks/index';

import { PRIVACY_POLICY_LINK } from '../../../util/constants';

interface ItemProps {
  label: string;
  link: string;
}

function Item({ label, link }: ItemProps): React.ReactElement {
  const goToLink = useCallback(() => window.open(link, '_blank'), [link]);

  return (
    <Stack direction='row' justifyContent='start' onClick={goToLink} sx={{ cursor: 'pointer' }}>
      <Typography color='text.primary' sx={{ pr: '4px', textAlign: 'left' }} variant='B-1'>
        {label}
      </Typography>
      <ExportSquare color='#AA83DC' size={18} variant='Bulk' />
    </Stack>
  );
}

interface Props {
  style?: React.CSSProperties;
}

export default function LegalDocuments({ style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  return (
    <Stack direction='column' sx={{ ...style }}>
      <Typography
        color={isExtension ? 'label.secondary' : 'text.primary'}
        fontSize={!isExtension ? '22px' : undefined}
        mb='8px'
        mt='10px'
        sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }}
        variant='H-4'
      >
        {t('Legal Documents')}
      </Typography>
      <Grid
        columnGap='8px'
        container
        justifyContent={'flex-start'}
      >
        <Item
          label={t('Privacy Policy')}
          link={PRIVACY_POLICY_LINK}
        />
        <Item
          label={t('User Agreement')}
          link={PRIVACY_POLICY_LINK}
        />
      </Grid>
    </Stack>
  );
}
