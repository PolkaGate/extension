// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { ApiPromise } from '@polkadot/api';
import type { Chain } from '@polkadot/extension-chains/types';
import type { ProxyItem } from '../../../util/types';

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { Divider, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { Checkbox2, Identity, Identity2, Label2, Progress } from '../../../components';
import { useTranslation } from '../../../components/translate';
import useAccountSelectedChain from '@polkadot/extension-polkagate/hooks/useAccountSelectedChain';
import ProxyAccountInfo from './ProxyAccountInfo';
import LoadingProxies from './LoadingProxies';

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

export default function ProxyTableFL({ api, chain, handleDelete, labelAlignment, proxyItems, status = 'Editable', style, tableLabel }: Props): React.ReactElement {
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
      {proxyItems?.map((proxyItem, index) => {
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
        <Grid display='inline-flex' m='auto' py='30px'>
          <FontAwesomeIcon fontSize={22} icon={faExclamationTriangle} />
          <Typography fontSize='14px' fontWeight={400} lineHeight='20px' pl='8px'>
            {t('No proxies found.')}
          </Typography>
        </Grid>
      }
    </Grid>
  );
}
