// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack } from '@mui/material';
import React from 'react';

import ContactUs from '@polkadot/extension-polkagate/src/popup/settings/about/ContactUs';
import LegalDocuments from '@polkadot/extension-polkagate/src/popup/settings/about/LegalDocuments';
import RateUs from '@polkadot/extension-polkagate/src/popup/settings/about/RateUs';
import Resources from '@polkadot/extension-polkagate/src/popup/settings/about/Resources';
import Introduction from '@polkadot/extension-polkagate/src/popup/settings/partials/Introduction';
import Socials from '@polkadot/extension-polkagate/src/popup/settings/partials/Socials';

import { Motion } from '../../components';
import { useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';

function MyDivider(): React.ReactElement {
  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, rgba(210, 185, 241, 0.07) 0%, rgba(210, 185, 241, 0.35) 50.06%, rgba(210, 185, 241, 0.07) 100%)',
        height: '14px',
        mx: '5px',
        width: '1px'
      }}
    />
  );
}

function About(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Motion variant='slide'>
      <VelvetBox>
        <Stack alignItems='center' direction='row' justifyContent='flex-start' sx={{ backgroundColor: 'background.paper', borderRadius: '14px', height: '72px', p: '0', width: '100%' }}>
          <Introduction style={{ height: '54px', width: 'fit-content' }} />
          <MyDivider />
          <RateUs style={{ border: 0, columnGap: '20px', width: 'fit-content' }} />
        </Stack>
        <Stack alignItems='start' columnGap='50px' direction='row' justifyContent='flex-start' sx={{ backgroundColor: 'background.paper', borderRadius: '14px', height: '144px', mt: '4px', p: '20px', width: '100%' }}>
          <Socials label={t('STAY TUNED')} short style={{ alignItems: 'start', rowGap: '15px', width: 'fit-content' }} />
          <Resources style={{ rowGap: '15px' }} />
          <ContactUs style={{ rowGap: '15px' }} />
          <LegalDocuments style={{ rowGap: '22px' }} />
        </Stack>
      </VelvetBox>
    </Motion>
  );
}

export default React.memo(About);
