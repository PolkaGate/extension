// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { ArrowCircleRight2, Home3, ImportCurve, Money3 } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { noop } from '@polkadot/util';

import { useAccountSelectedChain, useSelectedAccount, useTranslation } from '../../../hooks';

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
  const selectedAccount = useSelectedAccount();
  const genesisHash = useAccountSelectedChain(selectedAccount?.address);

  const navigate = useNavigate();

  const showHome = useMemo(() => {
    const excludedPaths = ['/historyfs', '/proxyManagement', '/send', '/nft'];

    return !excludedPaths.some((path) => pathname.includes(path));
  }, [pathname]);

  const breadcrumbMap = useMemo(() => {
    const redirect = `/accountfs/${selectedAccount?.address}/${genesisHash}/0`;

    return [
    { check: (path: string) => ['restore', 'attach', 'import'].some((keyword) => path.includes(keyword)), icon: ImportCurve, label: t('Import account'), redirect: '/account/have-wallet' },
    { check: (path: string) => path.includes('/historyfs'), icon: Money3, label: t('Account'), redirect },
    { check: (path: string) => path.includes('/proxyManagement'), icon: Money3, label: t('Account'), redirect },
    { check: (path: string) => path.includes('/send'), icon: ArrowCircleRight2, label: t('Send') },
    { check: (path: string) => path.includes('/nft'), icon: Money3, label: t('Account'), redirect },
    { check: (path: string) => path.includes('/solo'), icon: Money3, label: t('Account'), redirect },
    { check: (path: string) => path.includes('/pool'), icon: Money3, label: t('Account'), redirect }
  ];
}, [genesisHash, selectedAccount?.address, t]);

  const matchedBreadcrumb = useMemo(() => breadcrumbMap.find(({ check }) => check(pathname)), [breadcrumbMap, pathname]);

  const onClick = useCallback(() => {
    navigate(matchedBreadcrumb?.redirect || '/') as void;
  }, [matchedBreadcrumb, navigate]);

  return (
    <Stack columnGap='20px' direction='row' sx={{ height: '24px', m: '20px' }}>
      {showHome && (
        <BreadcrumbItem icon={Home3} label={t('Home')} />
      )}
      {matchedBreadcrumb &&
        <BreadcrumbItem icon={matchedBreadcrumb.icon} label={matchedBreadcrumb.label} onClick={onClick} />
      }
    </Stack>
  );
}

export default React.memo(Breadcrumbs);
