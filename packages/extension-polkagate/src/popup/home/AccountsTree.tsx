// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Backdrop, Container, Grid, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo } from 'react';

import { PButton } from '../../components';
import { useActiveRecoveries, useApi, useTranslation } from '../../hooks';
import { windowOpen } from '../../messaging';
import { SOCIAL_RECOVERY_CHAINS } from '../../util/constants';
import getParentNameSuri from '../../util/getParentNameSuri';
import AccountPreview from './AccountPreview';

interface Props extends AccountWithChildren {
  parentName?: string;
  quickActionOpen?: string | boolean;
  setQuickActionOpen: React.Dispatch<React.SetStateAction<string | boolean | undefined>>;
  hideNumbers: boolean | undefined;
  setHasActiveRecovery: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AccountsTree({ hideNumbers, parentName, quickActionOpen, setQuickActionOpen, setHasActiveRecovery, suri, ...account }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(SOCIAL_RECOVERY_CHAINS.includes(account?.genesisHash ?? '') ? account.address : undefined);
  const activeRecovery = useActiveRecoveries(api, account.address);

  useEffect(() => {
    setHasActiveRecovery(!!activeRecovery);
  }, [activeRecovery, setHasActiveRecovery]);

  const parentNameSuri = getParentNameSuri(parentName, suri);
  const handleClose = useCallback(() => setQuickActionOpen(undefined), [setQuickActionOpen]);

  const label = useMemo(
    (): string | undefined => {
      if (account?.isHardware) {
        return t('Ledger');
      }

      if (account?.isExternal) {
        return t('Watch-only');
      }

      if (account?.parentAddress) {
        return t('Derived from {{parentNameSuri}}', { replace: { parentNameSuri } });
      }

      return undefined;
    },
    [account, parentNameSuri, t]
  );

  const goCloseRecovery = useCallback(() => {
    account.address && windowOpen(`/socialRecovery/${account.address}/true`).catch(console.error);
  }, [account.address]);

  return (
    <>
      <Container
        className='tree'
        disableGutters
        sx={{
          backgroundColor: 'background.paper',
          borderColor: activeRecovery ? 'warning.main' : 'secondary.main',
          borderRadius: '5px',
          borderStyle: account?.parentAddress ? 'dashed' : 'solid',
          borderWidth: activeRecovery ? '2px' : '0.5px',
          mb: '6px',
          position: 'relative'
        }}
      >
        <Grid item sx={{ bgcolor: '#454545', color: 'white', fontSize: '10px', ml: 3, position: 'absolute', px: 1, width: 'fit-content' }}>
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
        {activeRecovery &&
          <Grid container item pb='10px'>
            <PButton
              _mt='1px'
              _onClick={goCloseRecovery}
              text={t<string>('End Recovery')}
            />
          </Grid>}
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
