// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme } from '@mui/material';
import { KUSAMA_GENESIS, POLKADOT_GENESIS, WESTEND_GENESIS } from '@polkagate/apps-config';
import { Data } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProxies, useSelectedAccount, useTranslation } from '../hooks';
import { KUSAMA_GENESIS_HASH, WESTEND_GENESIS_HASH } from '../util/constants';
import MyTooltip from './MyTooltip';

interface Props {
  size?: string | number;
  style?: React.CSSProperties;
}

function HasProxyIndicator({ style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();
  const navigate = useNavigate();

  const westendProxies = useProxies(WESTEND_GENESIS_HASH, account?.address);
  const kusamaProxies = useProxies(KUSAMA_GENESIS_HASH, account?.address);
  const polkadotProxies = useProxies(POLKADOT_GENESIS, account?.address);

  const [hasProxy, setHasProxy] = useState(
    {
      kusama: false,
      polkadot: false,
      westend: false
    });

  const hasProxyOnRelay = Object.values(hasProxy).some(Boolean);

  useEffect((): void => {
    if (westendProxies?.length) {
      setHasProxy((pre) => {
        pre.westend = true;

        return pre;
      });
    }

    if (kusamaProxies?.length) {
      setHasProxy((pre) => {
        pre.kusama = true;

        return pre;
      });
    }

    if (polkadotProxies?.length) {
      setHasProxy((pre) => {
        pre.polkadot = true;

        return pre;
      });
    }
  }, [kusamaProxies, polkadotProxies, westendProxies]);

  const onClick = useCallback((): void => {
    if (!hasProxyOnRelay) {
      return;
    }

    const genesisHash = hasProxy?.polkadot ? POLKADOT_GENESIS : hasProxy?.kusama ? KUSAMA_GENESIS : WESTEND_GENESIS;

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigate(`/proxyManagement/${account?.address}/${genesisHash}`);
  }, [account?.address, hasProxy, hasProxyOnRelay, navigate]);

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
    height: '40px',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 250ms ease-out',
    width: '40px',
    ...style
  };

  return (
    <>
      {
        hasProxyOnRelay &&
        <MyTooltip content={t('Account has proxy on {{chains}}.',
          {
            replace:
              { chains: `${hasProxy.polkadot ? 'Polkadot' : ''}${hasProxy.kusama && hasProxy.polkadot ? ', ' : ''}${hasProxy.kusama ? 'Kusama' : ''}${hasProxy.kusama && hasProxy.westend ? ' and ' : ''}${hasProxy.westend ? 'Westend' : ''}` }
          })}
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
