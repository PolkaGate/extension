// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, type SxProps, type Theme } from '@mui/material';
import { Data } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProxies, useTranslation } from '../hooks';
import { PASEO_ASSET_HUB_GENESIS_HASH, STATEMINE_GENESIS_HASH, STATEMINT_GENESIS_HASH } from '../util/constants';
import MyTooltip from './MyTooltip';

interface Props {
  address: string | undefined;
  style?: React.CSSProperties;
}

function HasProxyOnHubIndicator({ address, style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const paseoProxies = useProxies(PASEO_ASSET_HUB_GENESIS_HASH, address);
  const kusamaProxies = useProxies(STATEMINE_GENESIS_HASH, address);
  const polkadotProxies = useProxies(STATEMINT_GENESIS_HASH, address);

  const [hasProxy, setHasProxy] = useState(
    {
      kusama: false,
      paseo: false,
      polkadot: false
    });

  const hasProxyOnAH = Object.values(hasProxy).some(Boolean);

  useEffect((): void => {
    if (paseoProxies?.length) {
      setHasProxy((pre) => {
        pre.paseo = true;

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
  }, [kusamaProxies, polkadotProxies, paseoProxies]);

  const onClick = useCallback((): void => {
    if (!hasProxyOnAH) {
      return;
    }

    const navigateGenesis = hasProxy?.polkadot
      ? STATEMINT_GENESIS_HASH
      : hasProxy?.kusama
        ? STATEMINE_GENESIS_HASH
        : PASEO_ASSET_HUB_GENESIS_HASH;

    navigate(`/proxyManagement/${address}/${navigateGenesis}`) as void;
  }, [address, hasProxy, hasProxyOnAH, navigate]);

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
        hasProxyOnAH &&
        <MyTooltip content={t('Account has proxy on {{chains}}.',
          {
            replace:
              { chains: `${hasProxy.polkadot ? 'Polkadot' : ''}${hasProxy.kusama && hasProxy.polkadot ? ', ' : ''}${hasProxy.kusama ? 'Kusama' : ''}${hasProxy.kusama && hasProxy.paseo ? ' and ' : ''}${hasProxy.paseo ? 'Paseo' : ''}` }
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

export default React.memo(HasProxyOnHubIndicator);
