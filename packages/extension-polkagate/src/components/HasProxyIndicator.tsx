// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import { Data } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { useChainInfo, useProxies, useSelectedAccount, useTranslation } from '../hooks';
import { KUSAMA_GENESIS_HASH, WESTEND_GENESIS_HASH } from '../util/constants';
import MyTooltip from './MyTooltip';

interface Props {
  size?: string | number;
  style?: React.CSSProperties;
}

function HasProxyIndicator ({ style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();
  const { api: westendApi } = useChainInfo(WESTEND_GENESIS_HASH);
  const { api: kusamaApi } = useChainInfo(KUSAMA_GENESIS_HASH);
  const { api: polkadotApi } = useChainInfo(POLKADOT_GENESIS);

  const westendProxies = useProxies(westendApi, account?.address);
  const kusamaProxies = useProxies(kusamaApi, account?.address);
  const polkadotProxies = useProxies(polkadotApi, account?.address);

  const [recoverableTooltip, setRecoverable] = useState(
    {
      kusama: false,
      polkadot: false,
      westend: false
    });

  useEffect((): void => {
    if (westendProxies?.length) {
      setRecoverable((pre) => {
        pre.westend = true;

        return pre;
      });
    }

    if (kusamaProxies?.length) {
      setRecoverable((pre) => {
        pre.kusama = true;

        return pre;
      });
    }

    if (polkadotProxies?.length) {
      setRecoverable((pre) => {
        pre.polkadot = true;

        return pre;
      });
    }
  }, [kusamaProxies, polkadotProxies, westendProxies]);

  const onClick = useCallback((): void => {
    // go to proxy settings page
  }, []);

  const containerStyle: SxProps<Theme> = {
    '&:hover': {
      bgcolor: '#674394'
    },
    alignItems: 'center',
    bgcolor: '#05091C',
    border: '1px solid',
    borderColor: '#1B133C',
    borderRadius: '12px',
    cursor: 'pointer',
    justifyContent: 'center',
    marginTop: '-5px',
    p: '7px',
    position: 'relative',
    transition: 'all 250ms ease-out',
    width: 'fit-content',
    ...style
  };

  return (
    <>
      {
        (recoverableTooltip.polkadot || recoverableTooltip.kusama || recoverableTooltip.westend) &&
        <MyTooltip content={t('Account has proxy on {{chains}}.',
          { replace:
        { chains: `${recoverableTooltip.polkadot ? 'Polkadot' : ''}${recoverableTooltip.kusama && recoverableTooltip.polkadot ? ', ' : ''}${recoverableTooltip.kusama ? 'Kusama' : ''}${recoverableTooltip.kusama && recoverableTooltip.westend ? ' and ' : ''}${recoverableTooltip.westend ? 'Westend' : ''}` } })}
        >
          <Grid container item onClick={onClick} sx={containerStyle}>
            <Data color='#AA83DC' size='20' variant='Bulk' />
          </Grid>
        </MyTooltip>
      }
    </>
  );
}

export default React.memo(HasProxyIndicator);
