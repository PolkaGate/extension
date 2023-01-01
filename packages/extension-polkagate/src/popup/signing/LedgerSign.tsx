// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { HexString } from '@polkadot/util/types';

import { faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { PButton, Warning } from '../../components';
import { useLedger } from '../../hooks/useLedger';
import useTranslation from '../../hooks/useTranslation';

interface Props {
  accountIndex?: number;
  addressOffset?: number;
  className?: string;
  error: string | null;
  genesisHash?: string;
  onSignature?: ({ signature }: { signature: HexString }) => void;
  payload?: ExtrinsicPayload;
  setError: (value: string | null) => void;
}

function LedgerSign({ accountIndex, addressOffset, error, genesisHash, onSignature, payload, setError }: Props): React.ReactElement<Props> {
  const [isBusy, setIsBusy] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  const { error: ledgerError, isLoading: ledgerLoading, isLocked: ledgerLocked, ledger, refresh, warning: ledgerWarning } = useLedger(genesisHash, accountIndex, addressOffset);
  
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
    (): void => {
      if (!ledger || !payload || !onSignature) {
        return;
      }

      setError(null);
      setIsBusy(true);
      ledger.sign(payload.toU8a(true), accountIndex, addressOffset)
        .then((signature) => {
          onSignature(signature);
        }).catch((e: Error) => {
          setError(e.message);
          setIsBusy(false);
        });
    },
    [accountIndex, addressOffset, ledger, onSignature, payload, setError]
  );
  
  return (
    <Grid container>
      {!!ledgerWarning && (
        <Warning theme={theme}>
          {ledgerWarning}
        </Warning>
      )}
      {error && (
        <Warning isDanger theme={theme}>
          {error}
        </Warning>
      )}
      {(ledgerLocked || error)
        ? (
          <PButton
            _isBusy={isBusy || ledgerLoading}
            _onClick={_onRefresh}
            text={t<string>('Refresh')}
          />
        )
        : (
          <PButton
            _isBusy={isBusy || ledgerLoading}
            _onClick={_onSignLedger}
            text={t<string>('Sign on Ledger')}
          />
        )
      }
    </Grid>
  );
}

export default styled(LedgerSign)`
  flex-direction: column;
  padding: 6px 24px;

  .danger {
    margin-bottom: .5rem;
  }
`;
