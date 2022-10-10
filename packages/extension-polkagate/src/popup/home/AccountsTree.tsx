// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Container, Grid } from '@mui/material';
import React, { useMemo } from 'react';

// import PAccount from './PAccount';
import AccountPreview from '../../components/AccountPreview';
import { useTranslation } from '../../hooks';

interface Props extends AccountWithChildren {
  parentName?: string;
  setAllPrices: React.Dispatch<React.SetStateAction<any | undefined>>
  allPrices: number | undefined;
}

export default function AccountsTree({ allPrices, parentName, setAllPrices, suri, ...account }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const label = useMemo(
    (): string | undefined => {
      if (account?.isExternal) {
        return t('Address only');
      }

      if (account?.isHardware) {
        return t('Ledger');
      }

      return;
    },
    [account, t]
  );

  return (
    <Container
      className='tree'
      disableGutters
      sx={{ borderBottom: '1px solid', borderColor: 'secondary.light', position: 'relative' }}
    >
      <Grid
        item
        sx={{ bgcolor: '#454545', color: 'white', fontSize: '10px', ml: 3, position: 'absolute', px: 1, width: 'fit-content' }}>
        {label}
      </Grid>
      <AccountPreview
        {...account}
        allPrices={allPrices}
        parentName={parentName}
        setAllPrices={setAllPrices}
        suri={suri}
      />
      {account?.children?.map((child, index) => (
        <AccountsTree
          key={`${index}:${child.address}`}
          {...child}
          allPrices={allPrices}
          parentName={account.name}
          setAllPrices={setAllPrices}
        />
      ))}
    </Container>
  );
}
