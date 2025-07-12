// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { ArrowDown2, Key } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { getStorage } from '@polkadot/extension-polkagate/src/util';

import { useTranslation } from '../../../components/translate';
import useIsDark from '../../../hooks/useIsDark';
import { ExtensionPopups } from '../../../util/constants';
import SetPassword from './SetPassword';

export default function Password (): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();

  const [showPopUp, setShowPopUp] = useState<ExtensionPopups>(ExtensionPopups.NONE);
  const [lastEditDate, setLastEdit] = useState<string>();

  useEffect(() => {
    getStorage('loginInfo').then((info) => {
      const timestamp = info?.lastEdit as number | undefined;

      if (timestamp) {
        const date = new Date(timestamp);

        const day = date.getDate();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        setLastEdit(`${day}.${month}.${year}`);
      }
    }).catch(console.error);
  }, []);

  const onClick = useCallback(() => {
    setShowPopUp(ExtensionPopups.PASSWORD);
  }, []);

  return (
    <>
      <Stack direction='column'>
        <Typography color='text.primary' fontSize='22px' m='30px 0 15px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
          {t('Change password')}
        </Typography>
        <Stack
          columnGap='10px' direction='row' sx={{
            ':hover': { background: '#2D1E4A' },
            alignItems: 'center',
            bgcolor: '#1B133CB2',
            border: '1px solid #BEAAD833',
            borderRadius: '12px',
            height: '53px',
            mt: '5px',
            px: '8px',
            transition: 'all 250ms ease-out',
            width: '454px'
          }}
        >
          <Key color={isDark ? '#AA83DC' : '#745D8B'} onClick={onClick} size='18' style={{ cursor: 'pointer' }} variant='Bulk' />
          <Stack columnGap='5px' direction='column' justifyContent='center' onClick={onClick} sx={{ alignItems: 'start', cursor: 'pointer', width: '100%' }}>
            <Typography color='#BEAAD8' fontSize='16px' variant='B-2'>
              ••••••••••••••
            </Typography>
            <Stack columnGap='5px' direction='row' justifyContent='start' onClick={onClick} sx={{ alignItems: 'center', cursor: 'pointer', width: '100%' }}>
              <Typography color='primary.main' variant='B-5'>
                {t('Last edit')}:
              </Typography>
              <Typography color='text.secondary' variant='B-5'>
                {lastEditDate ?? '__,__,__'}
              </Typography>
            </Stack>
          </Stack>
          <ArrowDown2 color={isDark ? '#AA83DC' : '#745D8B'} size='16px' style={{ marginTop: '5px', transform: 'rotate(270deg)' }} variant='Bold' />
        </Stack>
      </Stack>
      {
        showPopUp === ExtensionPopups.PASSWORD &&
        <SetPassword
          openMenu={showPopUp === ExtensionPopups.PASSWORD}
          setPopup={setShowPopUp}
        />}
    </>
  );
}
