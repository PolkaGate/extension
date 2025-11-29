// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import { Like1, Setting2 } from 'iconsax-react';
import React from 'react';

import { ActionButton, MySkeleton } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { EXTENSION_NAME } from '@polkadot/extension-polkagate/src/util/constants';

const OffNotificationMessage = ({ onClick, style }: { onClick: () => void; style?: SxProps<Theme>; }) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ alignItems: 'center', gap: '36px', p: '32px 10px', pb: '15px', width: '100%', ...style }}>
      <Typography color='text.secondary' variant='B-1' width='100%'>
        {t('You’ve turned off notifications. Enable them anytime to get updates on your accounts, governance, and staking rewards!')}
      </Typography>
      <ActionButton
        StartIcon={Setting2}
        onClick={onClick}
        style={{ width: 'fit-content' }}
        text={t('Enable notifications')}
      />
    </Stack>
  );
};

const ColdStartNotification = ({ onClick, style }: { onClick: () => void; style?: SxProps<Theme>; }) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ alignItems: 'center', gap: '16px', p: '32px 10px 15px', width: '100%', ...style }}>
      <Typography color='text.primary' textAlign='left' variant='B-2' width='100%'>
        {`${t('Introducing notifications')}!`}
      </Typography>
      <Typography color='text.secondary' textAlign='left' variant='B-1' width='100%'>
        {t('{{extensionName}} now has notifications! Important warnings and updates will be delivered to you as notifications, so make sure you don\'t miss any.',
          { replace: { extensionName: EXTENSION_NAME } })}
      </Typography>
      <Typography color='text.primary' textAlign='left' variant='B-1' width='100%'>
        {t('Fine-tune your notification experience in Settings')}
      </Typography>
      <ActionButton
        StartIcon={Setting2}
        onClick={onClick}
        style={{ mt: '15px', width: 'fit-content' }}
        text={t('Enable notifications')}
      />
    </Stack>
  );
};

const NotificationLoading = ({ count = 3 }: { count?: number }) => {
  return (
    <Stack direction='column' sx={{ gap: '6px', width: '100%' }}>
      {Array(count).fill(1).map((item, index) => (
        <Stack direction='column' key={item as number + index} sx={{ bgcolor: '#05091C', borderRadius: '14px', gap: '16px', p: '10px', width: '100%' }}>
          <MySkeleton
            height={16}
            width={90}
          />
          <Stack direction='row' gap='10px'>
            <MySkeleton
              height={32}
              width={32}
            />
            <Stack direction='column' gap='10px' width='calc(100% - 50px)'>
              <Grid alignItems='center' container item justifyContent='space-between'>
                <MySkeleton
                  height={14}
                  width={90}
                />
                <MySkeleton
                  height={14}
                  width={55}
                />
              </Grid>
              <MySkeleton
                height={14}
                width={220}
              />
            </Stack>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

const NoNotificationYet = ({ onClick, style }: { onClick: () => void; style?: SxProps<Theme>; }) => {
  const { t } = useTranslation();

  return (
    <Stack direction='column' sx={{ alignItems: 'center', gap: '16px', p: '32px 10px 15px', width: '100%', ...style }}>
      <Typography color='text.primary' textAlign='left' variant='B-2' width='100%'>
        {t('Everything’s calm, you don’t have any notifications yet')}.
      </Typography>
      <ActionButton
        EndIcon={Like1}
        onClick={onClick}
        style={{ mt: '15px', width: 'fit-content' }}
        text={t('Good')}
      />
    </Stack>
  );
};

export { ColdStartNotification, NoNotificationYet, NotificationLoading, OffNotificationMessage };
