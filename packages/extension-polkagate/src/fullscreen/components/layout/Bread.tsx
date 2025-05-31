// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { Clock, Data, Home } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { noop } from '@polkadot/util';

import { useTranslation } from '../../../hooks';

function BreadcrumbItem({ icon: Icon, label, onClick = noop }: { icon: React.ElementType; label: string; onClick?: () => void }): React.ReactElement {
  return (
    <Stack columnGap='5px' direction='row'>
      <Icon color='#AA83DC' size='18' variant='Bulk' />
      <Typography
        color='#AA83DC'
        onClick={onClick}
        sx={{ cursor: onClick !== noop ? 'pointer' : 'default' }}
        variant='B-2'
      >
        {label}
      </Typography>
    </Stack>
  );
}

function Breadcrumbs(): React.ReactElement {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isImport = useMemo(() => ['restore', 'attach', 'import'].some((keyword) => pathname.includes(keyword)), [pathname]);

  const onImportClick = useCallback(() => {
    navigate('/account/have-wallet');
  }, [navigate]);

  const showHome = useMemo(() => {
    return !pathname.includes('/historyfs') && !pathname.includes('/proxyManagement');
  }, [pathname]);

  return (
    <Stack columnGap='20px' direction='row' sx={{ height: '24px', m: '20px' }}>
      {showHome && (
        <BreadcrumbItem icon={Home} label={t('Home')} />
      )}
      {isImport &&
        <Typography color='#AA83DC' onClick={onImportClick} sx={{ cursor: 'pointer' }} variant='B-2'>
          {t('Import account')}
        </Typography>
      }
      {pathname.includes('/historyfs') &&
        <BreadcrumbItem icon={Clock} label={t('History')} onClick={noop} />
      }
      {pathname.includes('/proxyManagement') &&
        <BreadcrumbItem icon={Data} label={t('Proxy Management')} onClick={noop} />
      }
    </Stack>

  );
}

export default React.memo(Breadcrumbs);
