// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Container, Grid } from '@mui/material';
import React from 'react';

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

  return (
    <Container
      className='tree'
      disableGutters
      sx={{ borderBottom: '1px solid', borderColor: 'secondary.light', position: 'relative' }}
    >
      <Grid
        item
        sx={{ bgcolor: '#454545', color: 'white', fontSize: '10px', ml: 3, position: 'absolute', px: 1, width: 'fit-content' }}>
        {account?.isExternal ? t('Address only') : ''}
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
