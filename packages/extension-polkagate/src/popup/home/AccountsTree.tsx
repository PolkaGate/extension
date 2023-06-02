// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Backdrop, Container, Grid, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { useTranslation } from '../../hooks';
import getParentNameSuri from '../../util/getParentNameSuri';
import AccountPreview from './AccountPreview';

interface Props extends AccountWithChildren {
  parentName?: string;
  quickActionOpen?: string | boolean;
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
  hideNumbers: boolean | undefined;
}

export default function AccountsTree({ hideNumbers, parentName, quickActionOpen, setQuickActionOpen, suri, ...account }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const parentNameSuri = getParentNameSuri(parentName, suri);
  const handleClose = useCallback(() => setQuickActionOpen(undefined), []);

  const label = useMemo(
    (): string | undefined => {
      if (account?.isHardware) {
        return t('Ledger');
      }

      if (account?.isExternal) {
        return t('Address only');
      }

      if (account?.parentAddress) {
        return t('Derived from {{parentNameSuri}}', { replace: { parentNameSuri } });
      }

      return undefined;
    },
    [account, parentNameSuri, t]
  );

  return (
    <>
      <Container
        className='tree'
        disableGutters
        sx={{
          backgroundColor: 'background.paper',
          borderColor: 'secondary.main',
          borderRadius: '5px',
          borderStyle: account?.parentAddress ? 'dashed' : 'solid',
          borderWidth: '0.5px',
          mb: '6px',
          position: 'relative'
        }}
      >
        <Grid item sx={{ bgcolor: 'label.main', color: 'white', fontSize: '10px', ml: 3, position: 'absolute', px: 1, width: 'fit-content' }}>
          {label}
        </Grid>
        <AccountPreview
          {...account}
          hideNumbers={hideNumbers}
          parentName={parentName}
          quickActionOpen={quickActionOpen}
          setQuickActionOpen={setQuickActionOpen}
          suri={suri}
        />
        <Backdrop
          onClick={handleClose}
          open={quickActionOpen !== undefined}
          sx={{ bgcolor: quickActionOpen === account.address ? 'transparent' : theme.palette.mode === 'dark' ? 'rgba(23, 23, 23, 0.8)' : 'rgba(241, 241, 241, 0.7)', borderRadius: '5px', bottom: '-1px', left: '-1px', position: 'absolute', right: '-1px', top: '-1px' }}
        />
      </Container>
      {account?.children?.map((child, index) => (
        <AccountsTree
          key={`${index}:${child.address}`}
          {...child}
          hideNumbers={hideNumbers}
          parentName={account.name}
          quickActionOpen={quickActionOpen}
          setQuickActionOpen={setQuickActionOpen}
        />
      ))}
    </>
  );
}
