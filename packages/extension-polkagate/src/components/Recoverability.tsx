// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Option } from '@polkadot/types';
//@ts-ignore
import type { PalletRecoveryRecoveryConfig } from '@polkadot/types/lookup';

import { Grid, type SxProps, type Theme } from '@mui/material';
import { Shield } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { useChainInfo, useSelectedAccount, useTranslation } from '../hooks';
import { KUSAMA_GENESIS_HASH, WESTEND_GENESIS_HASH } from '../util/constants';
import MyTooltip from './MyTooltip';

interface Props {
  size?: string | number;
  style?: React.CSSProperties;
}

function Recoverability ({ style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();
  const { api: westendApi } = useChainInfo(WESTEND_GENESIS_HASH);
  const { api: kusamaApi } = useChainInfo(KUSAMA_GENESIS_HASH);

  const [recoverableTooltip, setRecoverable] = useState(
    {
      kusama: false,
      westend: false
    });

  useEffect((): void => {
    if (!westendApi || !account) {
      return;
    }

    westendApi.query?.['recovery']?.['recoverable'](account.address)
      .then((result) => {
        const recoveryOpt = result as Option<PalletRecoveryRecoveryConfig>;

        recoveryOpt.isSome && setRecoverable((pre) => {
          pre.westend = true;

          return pre;
        });
      })
      .catch(console.error);
  }, [account, westendApi]);

  useEffect((): void => {
    if (!kusamaApi || !account) {
      return;
    }

    kusamaApi.query?.['recovery']?.['recoverable'](account.address)
      .then((result) => {
        const recoveryOpt = result as Option<PalletRecoveryRecoveryConfig>;

        recoveryOpt.isSome && setRecoverable((pre) => {
          pre.kusama = true;

          return pre;
        });
      })
      .catch(console.error);
  }, [account, kusamaApi]);

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
        (recoverableTooltip.kusama || recoverableTooltip.westend) &&
        <MyTooltip content={t('Account is recoverable on {{chains}}.',
          {
            replace:
              { chains: `${recoverableTooltip.kusama ? 'Kusama' : ''}${recoverableTooltip.kusama && recoverableTooltip.westend ? ' and ' : ''}${recoverableTooltip.westend ? 'Westend' : ''}` }
          })}
        >
          <Grid container item onClick={onClick} sx={containerStyle}>
            <Shield color='#AA83DC' size='20' variant='Bulk' />
          </Grid>
        </MyTooltip>
      }
    </>
  );
}

export default React.memo(Recoverability);
