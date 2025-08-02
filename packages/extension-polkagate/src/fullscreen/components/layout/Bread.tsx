// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { ArrowCircleRight2, BuyCrypto, Clock, Data, Home, Triangle } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { noop } from '@polkadot/util';

import { useTranslation } from '../../../hooks';

function BreadcrumbItem ({ icon: Icon, label, onClick = noop }: { icon: React.ElementType; label: string; onClick?: () => void }): React.ReactElement {
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

function Breadcrumbs (): React.ReactElement {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isImport = useMemo(() => ['restore', 'attach', 'import'].some((keyword) => pathname.includes(keyword)), [pathname]);

  const onImportClick = useCallback(() => navigate('/account/have-wallet') as void, [navigate]);

  const showHome = useMemo(() => {
    const excludedPaths = ['/historyfs', '/proxyManagement', '/send', '/nft'];

    return !excludedPaths.some((path) => pathname.includes(path));
  }, [pathname]);

  const breadcrumbMap = useMemo(() => [
    { check: (path: string) => path.includes('/historyfs'), icon: Clock, label: t('History') },
    { check: (path: string) => path.includes('/proxyManagement'), icon: Data, label: t('Proxy Management') },
    { check: (path: string) => path.includes('/send'), icon: ArrowCircleRight2, label: t('Send') },
    { check: (path: string) => path.includes('/nft'), icon: Triangle, label: t('NFT') },
    { check: (path: string) => path.includes('/solo'), icon: BuyCrypto, label: t('Solo Staking') }
  ], [t]);

  const matchedBreadcrumb = useMemo(() => breadcrumbMap.find(({ check }) => check(pathname)), [breadcrumbMap, pathname]);

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
      {matchedBreadcrumb &&
        <BreadcrumbItem icon={matchedBreadcrumb.icon} label={matchedBreadcrumb.label} onClick={noop} />
      }
    </Stack>
  );
}

export default React.memo(Breadcrumbs);
