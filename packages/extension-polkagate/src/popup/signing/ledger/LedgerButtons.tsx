// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { ColorSwatch } from 'iconsax-react';
import React from 'react';

import useIsBlueish from '@polkadot/extension-polkagate/src/hooks/useIsBlueish';

import { DecisionButtons } from '../../../components';
import useTranslation from '../../../hooks/useTranslation';
import LedgerErrorMessage from './LedgerErrorMessage';

interface Props {
  error: string | null | undefined;
  disabled?: boolean;
  isBusy?: boolean | undefined;
  ledgerWarning: string | null;
  ledgerLocked: boolean;
  onRefresh: () => void;
  onSignLedger: () => void;
  onCancel: () => void;
  style?: React.CSSProperties;
}

function LedgerButtons ({ disabled, error, isBusy, ledgerLocked, ledgerWarning, onCancel, onRefresh, onSignLedger, style = {} }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const isBlueish = useIsBlueish();

  return (
    <Grid container sx={{ bottom: 0, position: 'absolute', ...style }}>
      {!!ledgerWarning &&
        <LedgerErrorMessage error={ledgerWarning} />
      }
      {error &&
        <LedgerErrorMessage error={error} />
      }
      {!error && !ledgerWarning &&
        <Grid alignItems='center' columnGap='5px' container item sx={{ mb: '25px' }}>
          <ColorSwatch color={ isBlueish ? '#596AFF' : '#674394'} size='24px' variant='Bold' />
          <Typography color={ isBlueish ? '#809ACB' : '#AA83DC'} sx={{ textAlign: 'left', width: '90%' }} variant='B-4'>
            {t('This is a ledger account. To complete this transaction, use your ledger')}
          </Typography>
        </Grid>
      }
      <DecisionButtons
        cancelButton
        disabled={disabled}
        divider
        flexibleWidth
        isBusy={isBusy}
        onPrimaryClick={ledgerLocked || error ? onRefresh : onSignLedger}
        onSecondaryClick={onCancel}
        primaryBtnText={ledgerLocked || error ? t('Refresh') : t('Sign on Ledger')}
        secondaryBtnText={t('Cancel')}
      />
    </Grid>
  );
}

export default React.memo(LedgerButtons);
