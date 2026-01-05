// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Add } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { Setting2 } from 'iconsax-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useIsHovered from '@polkadot/extension-polkagate/src/hooks/useIsHovered2';
import { AccountsListManagement } from '@polkadot/extension-polkagate/src/popup/accountsLists';
import { PROFILE_MODE } from '@polkadot/extension-polkagate/src/popup/accountsLists/type';

import { useTranslation } from '../../hooks';
import { DraggableModal } from '../components/DraggableModal';

function AccountsAdd (): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isHovered, ref } = useIsHovered();

  const [openModal, setOpen] = useState(false);

  const onClick = useCallback(() => navigate('account/create') as void, [navigate]);

  const onActionClick = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <Stack alignItems='center' direction='row' justifyContent='Space-between' sx={{}}>
        <Stack alignItems='center' direction='row' justifyContent='flex-start' sx={{ ml: '10px' }}>
          <Typography color='#EAEBF1' sx={{ userSelect: 'none' }} textTransform='uppercase' variant='H-2'>
            {t('Accounts')}
          </Typography>
          <Box
            onClick={onClick}
            ref={ref}
            sx={{
              background: isHovered ? '#6E00B1' : 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
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
                background: isHovered ? '#6E00B1' : 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
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
        <Setting2 color='#AA83DC' onClick={onActionClick} size='24' style={{ cursor: 'pointer' }} variant='Bulk' />
      </Stack>
      {openModal &&
        <DraggableModal
          dividerStyle={{ marginBottom: 0 }}
          onClose={onClose}
          open={openModal}
          rightItemStyle = {{ right: '28px' }}
          showBackIconAsClose
          style={{ minHeight: '550px', padding: '20px 0 0' }}
          title={t('customization')}
        >
          <AccountsListManagement defaultMode={PROFILE_MODE.SETTING_MODE} onDone={onClose} />
        </DraggableModal>}
    </>
  );
}

export default React.memo(AccountsAdd);
