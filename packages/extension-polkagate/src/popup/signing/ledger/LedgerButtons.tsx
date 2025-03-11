// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import { ColorSwatch, Warning2 } from 'iconsax-react';
import React from 'react';

import { DecisionButtons } from '../../../components';
import useTranslation from '../../../hooks/useTranslation';

interface Props {
  ledgerWarning: string | null;
  error: string | null | undefined;
  ledgerLocked: boolean;
  isBusy?: boolean | undefined;
  onRefresh: () => void;
  onSignLedger: () => void;
  onCancel: () => void
}

const ErrorMessage = ({ error }: { error: string }) => {
  const parts = error.split(/('.*?')/); // Split on the quoted part

  return (
    <Grid alignItems='center' columnGap='5px' container item sx={{ mb: '25px' }}>
      <Warning2 color='#FF4FB9' size='24px' variant='Bold' />
      <Typography sx={{ textAlign: 'left', width: '90%' }} variant='B-4'>
        {parts.map((part, index) => (
          part.startsWith("'") && part.endsWith("'")
            ? <span key={index} style={{ color: '#AA83DC' }}>{part}</span> // Color for quoted text
            : <span key={index} style={{ color: '#FF4FB9' }}>{part}</span> // Color for other text
        ))}
      </Typography>
    </Grid>
  );
};

function LedgerButtons ({ error, isBusy, ledgerLocked, ledgerWarning, onCancel, onRefresh, onSignLedger }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  return (
    <Grid container sx={{ bottom: 0, position: 'absolute' }}>
      {!!ledgerWarning &&
        <ErrorMessage error={ledgerWarning} />
      }
      {error &&
        <ErrorMessage error={error} />
      }
      {!error && !ledgerWarning &&
        <Grid alignItems='center' columnGap='5px' container item sx={{ mb: '25px' }}>
          <ColorSwatch color='#674394' size='24px' variant='Bold' />
          <Typography color='#AA83DC' sx={{ textAlign: 'left', width: '90%' }} variant='B-4'>
            {t('This is a ledger account. To complete this transaction, use your ledger')}
          </Typography>
        </Grid>
      }
      <DecisionButtons
        cancelButton
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
