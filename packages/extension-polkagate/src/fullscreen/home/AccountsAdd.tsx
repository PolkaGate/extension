// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Add } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from '../../hooks';

function AccountsAdd (): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const onClick = useCallback(() => navigate('account/create'), [navigate]);
  const toggleHover = useCallback(() => setHovered((pre) => !pre), []);

  return (
    <Stack alignItems='center' direction='row' justifyContent='flex-start' sx={{ ml: '10px' }}>
      <Typography color='#EAEBF1' sx={{ userSelect: 'none' }} textTransform='uppercase' variant='H-2'>
        {t('Accounts')}
      </Typography>
      <Box
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={onClick}
        onMouseEnter={(toggleHover)}
        onMouseLeave={toggleHover}
        sx={{
          background: hovered ? '#6E00B1' : 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'inline-flex',
          marginLeft: '10px',
          p: '2px',
          transition: 'all 250ms ease-out'
        }}
      >
        <Box
          sx={{
            alignItems: 'center',
            background: hovered ? '#6E00B1' : 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
            borderRadius: '50%',
            color: '#FFFFFF',
            display: 'flex',
            height: '23px',
            justifyContent: 'center',
            transition: 'all 250ms ease-out',
            width: '23px'
          }}
        >
          <Add sx={{ color: '#FFFFFF', fontSize: 19, stroke: '#FFFFFF', strokeWidth: 1.1 }} />
        </Box>
      </Box>
    </Stack>
  );
}

export default React.memo(AccountsAdd);
