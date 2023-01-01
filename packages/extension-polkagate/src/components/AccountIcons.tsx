// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconTheme } from '@polkadot/react-identicon/types';

import { faShieldHalved, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { useTranslation } from '../hooks';
import { Proxy } from '../util/types';
import { getSubstrateAddress } from '../util/utils';
import { ActionContext } from './contexts';
import Identicon from './Identicon';
import { Infotip } from '.';

interface Props {
  formatted: string | undefined;
  recoverable?: boolean;
  identiconTheme: IconTheme;
  prefix?: number;
  proxies: Proxy[] | undefined;
  judgements?: RegExpMatchArray | null | undefined
}

export default function AccountIcons({ formatted, identiconTheme, judgements, prefix, proxies, recoverable = false }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const address = getSubstrateAddress(formatted);

  const openManageProxy = useCallback(() => {
    address && onAction(`/manageProxies/${address}`);
  }, [address, onAction]);

  return (
    <Grid container direction='column' sx={{ width: '17%', ml: '8px' }}>
      <Grid item m='auto' width='fit-content'>
        <Identicon
          iconTheme={identiconTheme}
          judgement={judgements}
          prefix={prefix}
          size={40}
          value={formatted}
        />
      </Grid>
      <Grid container direction='row' item justifyContent='center'>
        <Grid item>
          <Infotip placement='bottom-start' text={t('Is recoverable')}>
            <IconButton 
            // disabled={!recoverable}
             sx={{ height: '15px', width: '15px' }}>
              <FontAwesomeIcon
                color={recoverable ? theme.palette.success.main : theme.palette.action.disabledBackground}
                fontSize='13px'
                icon={faShieldHalved}
              />
            </IconButton>
          </Infotip>
        </Grid>
        <Grid item>
          <Infotip placement='bottom-end' text={t('Has proxy')}>
            <IconButton onClick={openManageProxy} sx={{ height: '15px', width: '15px' }}>
              <FontAwesomeIcon
                color={proxies?.length ? theme.palette.success.main : theme.palette.action.disabledBackground}
                fontSize='13px'
                icon={faSitemap}
              />
            </IconButton>
          </Infotip>
        </Grid>
      </Grid>
    </Grid>
  );
}
