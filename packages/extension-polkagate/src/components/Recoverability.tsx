// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option } from '@polkadot/types';
// @ts-expect-error recovery config lookup is not exposed by generated package types
import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { Grid, type SxProps, type Theme, useTheme } from '@mui/material';
import { Shield } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { isEthereumAddress } from '@polkadot/util-crypto';

import { useChainInfo, useIsDark, useSelectedAccount, useTranslation } from '../hooks';
import { KUSAMA_GENESIS_HASH, WESTEND_GENESIS_HASH } from '../util/constants';
import MyTooltip from './MyTooltip';

interface Props {
  size?: string | number;
  style?: React.CSSProperties;
}

function Recoverability({ style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();
  const address = useSelectedAccount()?.address;
  const { api: westendApi } = useChainInfo(WESTEND_GENESIS_HASH);
  const { api: kusamaApi } = useChainInfo(KUSAMA_GENESIS_HASH);

  const [recoverableTooltip, setRecoverable] = useState(
    {
      kusama: false,
      westend: false
    });

  useEffect((): void => {
    if (!westendApi || !address || isEthereumAddress(address)) {
      return;
    }

    westendApi.query?.['recovery']?.['recoverable'](address)
      .then((result) => {
        const recoveryOpt = result as Option<PalletRecoveryRecoveryConfig>;

        recoveryOpt.isSome && setRecoverable((pre) => {
          pre.westend = true;

          return pre;
        });
      })
      .catch(console.error);
  }, [address, westendApi]);

  useEffect((): void => {
    if (!kusamaApi || !address || isEthereumAddress(address)) {
      return;
    }

    kusamaApi.query?.['recovery']?.['recoverable'](address)
      .then((result) => {
        const recoveryOpt = result as Option<PalletRecoveryRecoveryConfig>;

        recoveryOpt.isSome && setRecoverable((pre) => {
          pre.kusama = true;

          return pre;
        });
      })
      .catch(console.error);
  }, [address, kusamaApi]);

  const onClick = useCallback((): void => {
    // go to proxy settings page
  }, []);

  const containerStyle: SxProps<Theme> = {
    '&:hover': {
      bgcolor: theme.palette.surface.hover
    },
    alignItems: 'center',
    bgcolor: theme.palette.surface.input,
    border: '1px solid',
    borderColor: isDark ? theme.palette.border.paper : theme.palette.border.strong,
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
        (recoverableTooltip.kusama || recoverableTooltip.westend) &&
        <MyTooltip content={t('Account is recoverable on {{chains}}.',
          {
            replace:
              { chains: `${recoverableTooltip.kusama ? 'Kusama' : ''}${recoverableTooltip.kusama && recoverableTooltip.westend ? ' and ' : ''}${recoverableTooltip.westend ? 'Westend' : ''}` }
          })}
        >
          <Grid container item onClick={onClick} sx={containerStyle}>
            <Shield color={isDark ? theme.palette.primary.main : theme.palette.text.secondary} size='20' variant='Bulk' />
          </Grid>
        </MyTooltip>
      }
    </>
  );
}

export default React.memo(Recoverability);
