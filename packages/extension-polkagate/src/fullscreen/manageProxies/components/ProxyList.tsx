// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxyItem } from '../../../util/types';

import { Grid, type SxProps, type Theme } from '@mui/material';
import React, { useCallback } from 'react';

import { useTranslation } from '../../../components/translate';
import { EmptyListBox } from '../../components';
import LoadingProxies from './LoadingProxies';
import ProxyAccountInfo from './ProxyAccountInfo';

interface Props {
  handleDelete?: (proxyItem: ProxyItem) => void;
  proxyItems: ProxyItem[] | null | undefined;
  style?: SxProps<Theme>;
}

export default function ProxyList ({ handleDelete, proxyItems, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const _handleDelete = useCallback((proxyItem: ProxyItem) => handleDelete && handleDelete(proxyItem), [handleDelete]);

  const isDeleting = proxyItems?.find(({ status }) => status === 'remove');

  return (
    <Grid alignItems='start' container gap='10px' item sx={{ maxHeight: isDeleting ? '464px' : '600px', mt: '10px', overflowY: 'scroll', width: '100%', ...style }}>
      {proxyItems?.filter(({ status }) => status !== 'new').map((proxyItem, index) => {
        return (
          <ProxyAccountInfo
            handleDelete={_handleDelete}
            key={index}
            proxyItem={proxyItem}
          />
        );
      })}
      {proxyItems === undefined &&
        <LoadingProxies length={6} />
      }
      {proxyItems === null &&
        <EmptyListBox
          style={{ marginTop: '20px' }}
          text={t('No proxies found.')}
        />
      }
    </Grid>
  );
}
