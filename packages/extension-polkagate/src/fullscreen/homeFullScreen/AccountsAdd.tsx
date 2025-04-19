// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Stack, Typography } from '@mui/material';
import { Add } from 'iconsax-react';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from '../../hooks';

function AccountsAdd(): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const onClick = useCallback(() => navigate('account/create'), [navigate]);

  return (
    <Stack alignItems='center' direction='row' justifyContent='flex-start' sx={{ cursor: 'pointer', ml: '10px' }}>
      <Typography color='#EAEBF1' sx={{ userSelect: 'none' }} textTransform='uppercase' variant='H-2'>
        {t('Accounts')}
      </Typography>
      <Box
        onClick={onClick}
        sx={{
          background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          borderRadius: '50%',
          display: 'inline-flex',
          marginLeft: '10px',
          p: '2px'
        }}
      >
        <Box
          sx={{
            '&:hover': {
              background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
              transition: 'all 250ms ease-out'
            },
            alignItems: 'center',
            backgroundColor: '#1E1E1E',
            borderRadius: '50%',
            color: '#FFFFFF',
            display: 'flex',
            height: '23px',
            justifyContent: 'center',
            width: '23px'
          }}
        >
          <Add color='#FFFFFF' size='20' variant='Linear' />
        </Box>
      </Box>
    </Stack>
  );
}

export default React.memo(AccountsAdd);
