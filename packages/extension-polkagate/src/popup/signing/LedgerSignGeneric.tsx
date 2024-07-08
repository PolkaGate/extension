// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { PButton, Warning } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { useGenericLedger } from '../../hooks';
import { hexToU8a } from '@polkadot/util';
import getChainInfo from './getChainInfo';
import type { ApiPromise } from '@polkadot/api';

interface Props {
  accountIndex?: number;
  addressOffset?: number;
  className?: string;
  error: string | null;
  api: ApiPromise | undefined
  onSignature?: ({ signature }: { signature: HexString }) => void;
  payload?: ExtrinsicPayload;
  setError: (value: string | null) => void;
  showError?: boolean;
}

function LedgerSignGeneric({ accountIndex, addressOffset, error, api, onSignature, payload, setError, showError = true }: Props): React.ReactElement<Props> {
  const [isBusy, setIsBusy] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  const { error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, ledger, refresh, warning: ledgerWarning } = useGenericLedger(accountIndex, addressOffset);

  useEffect(() => {
    if (ledgerError) {
      setError(ledgerError);
    }
  }, [ledgerError, setError]);

  const _onRefresh = useCallback(() => {
    refresh();
    setError(null);
  }, [refresh, setError]);

  const _onSignLedger = useCallback(
    async (): Promise<void> => {
      if (!ledger || !payload || !onSignature || !api) {
        return;
      }

      setError(null);
      setIsBusy(true);

      const metadata = await getChainInfo(api);

      const _metadata = metadata ? hexToU8a(JSON.stringify(metadata)) : new Uint8Array(0);
      
      console.log('metadata:', _metadata)
      
      ledger.signTransaction(payload.toU8a(true), _metadata, accountIndex, addressOffset)
        .then((signature) => {
          onSignature(signature);
        }).catch((e: Error) => {

          setError(e.message);
          setIsBusy(false);
        });
    },
    [accountIndex, addressOffset, ledger, onSignature, payload, setError, api]
  );

  return (
    <Grid container>
      {!!ledgerWarning &&
        <Warning marginTop={0} theme={theme}>
          {ledgerWarning}
        </Warning>
      }
      {error && showError &&
        <Warning isDanger marginTop={0} theme={theme}>
          {error}
        </Warning>
      }
      {ledgerLocked || error
        ? <PButton
          _isBusy={isBusy || ledgerLoading}
          _onClick={_onRefresh}
          text={t<string>('Refresh')}
        />
        : <PButton
          _isBusy={isBusy || ledgerLoading}
          _onClick={_onSignLedger}
          text={t<string>('Sign on Ledger')}
        />
      }
    </Grid>
  );
}

export default styled(LedgerSignGeneric)`
  flex-direction: column;
  padding: 6px 24px;

  .danger {
    margin-bottom: .5rem;
  }
`;
