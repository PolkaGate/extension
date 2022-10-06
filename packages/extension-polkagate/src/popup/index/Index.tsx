// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../../../extension-ui/src/types';

import { Box, Container, Divider, Grid, InputAdornment, TextField, Typography } from '@mui/material';
import { borderRadius, borderTop } from '@mui/system';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { AccountsStore } from '@polkadot/extension-base/stores'; // added for plus
import getNetworkMap from '@polkadot/extension-ui/util/getNetworkMap';
import keyring from '@polkadot/ui-keyring'; // added for plus
import { cryptoWaitReady } from '@polkadot/util-crypto'; // added for plus

import { AccountContext } from '../../../../extension-ui/src/components';
import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import HeaderBrand from '../../partials/HeaderBrand';
import AddAccount from '../welcome/AddAccount';
import AccountsTree from './AccountsTree';
import YouHave from './YouHave';

interface Props extends ThemeProps {
  className?: string;
}

export default function PAccounts({ className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [filteredAccount, setFilteredAccount] = useState<AccountWithChildren[]>([]);
  const { hierarchy } = useContext(AccountContext);
  const networkMap = useMemo(() => getNetworkMap(), []);

  // added for plus
  useEffect(() => {
    // eslint-disable-next-line no-void
    void cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setFilteredAccount(
      filter
        ? hierarchy.filter((account) =>
          account.name?.toLowerCase().includes(filter) ||
          (account.genesisHash && networkMap.get(account.genesisHash)?.toLowerCase().includes(filter))
        )
        : hierarchy
    );
  }, [filter, hierarchy, networkMap]);

  const _onFilter = useCallback((event: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>) => {
    const filter = event.target.value;

    setFilter(filter.toLowerCase());
  }, []);

  return (
    <>
      {(hierarchy.length === 0)
        ? <AddAccount />
        : (
          <>
            <Grid
              padding='0px'
              textAlign='center'
              xs={12}
            >
              <HeaderBrand
                showSettings
                text={t<string>('Polkagate')}
              />
            </Grid>
            <YouHave />
            <Container
              disableGutters
              sx={[{
                '&::-webkit-scrollbar': {
                  display: 'none',
                  width: 0
                },
                '> .tree:last-child': { border: 'none' },
                backgroundColor: 'background.paper',
                border: '0.5px solid',
                borderColor: 'secondary.light',
                borderRadius: '5px',
                m: 'auto',
                maxHeight: '430px',
                mt: '10px',
                overflowY: 'scroll',
                p: 0,
                scrollbarWidth: 'none',
                width: '92%'
              }]}
            >
              {filteredAccount.map((json, index): React.ReactNode => (
                <AccountsTree
                  {...json}
                  key={`${index}:${json.address}`}
                />
              ))}
            </Container>
          </>
        )
      }
    </>
  );
}
