// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { ProxyItem } from '../../../util/types';

import BackspaceIcon from '@mui/icons-material/Backspace';
import { Grid, type SxProps, type Theme, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { Checkbox2 } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { EmptyListBox } from '../../components';
import LoadingProxies from './LoadingProxies';
import ProxyAccountInfo from './ProxyAccountInfo';

interface Props {
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  style?: SxProps<Theme>;
  proxyItems: ProxyItem[] | null | undefined;
  handleDelete?: (proxyItem: ProxyItem) => void;
  status?: 'Editable' | 'Read-Only';
  tableLabel?: string;
  labelAlignment?: 'left' | 'center' | 'right';
}

export default function ProxyTableFL ({ api, chain, handleDelete, labelAlignment, proxyItems, status = 'Editable', style, tableLabel }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  // const genesisHash = useAccountSelectedChain()
  const _handleDelete = useCallback((proxyItem: ProxyItem) => handleDelete && handleDelete(proxyItem), [handleDelete]);

  const Delete = ({ proxyItem }: { proxyItem: ProxyItem }) => (
    // eslint-disable-next-line react/jsx-no-bind
    <Grid height={25} onClick={() => _handleDelete(proxyItem)}>
      {proxyItem.status === 'new'
        ? <BackspaceIcon
          sx={{
            color: 'secondary.main',
            cursor: 'pointer',
            height: '25px',
            width: '30px'
          }}
        />
        : <Checkbox2
          checked={proxyItem.status === 'remove'}
          style={{ transform: 'scale(1.4)' }}
        />
      }
    </Grid>
  );

  const proxyStatus = useCallback((_status: string): string => {
    if (_status === 'new') {
      return t('Adding');
    } else if (_status === 'remove') {
      return t('Removing');
    } else {
      return t('No change');
    }
  }, [t]);

  return (
    <Grid alignItems='start' container gap='10px' item sx={{ mt: '10px', width: '100%', ...style }}>
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
        <LoadingProxies />
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
