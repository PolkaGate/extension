// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountWithChildren } from '@polkadot/extension-base/background/types';

import { Container } from '@mui/material';
import React from 'react';

// import PAccount from './PAccount';
import AccountPreview from '../../components/AccountPreview';

interface Props extends AccountWithChildren {
  parentName?: string;
  setTotalPrice: React.Dispatch<React.SetStateAction<any | undefined>>
  totalPrice: number | undefined;
}

export default function AccountsTree({ parentName, setTotalPrice, suri, totalPrice, ...account }: Props): React.ReactElement<Props> {
  return (
    <Container
      className='tree'
      disableGutters
      sx={{ borderBottom: '1px solid', borderColor: 'secondary.light' }}
    >
      <AccountPreview
        {...account}
        parentName={parentName}
        setTotalPrice={setTotalPrice}
        suri={suri}
        totalPrice={totalPrice}
      />
      {account?.children?.map((child, index) => (
        <AccountsTree
          key={`${index}:${child.address}`}
          {...child}
          parentName={account.name}
          setTotalPrice={setTotalPrice}
          totalPrice={totalPrice}
        />
      ))}
    </Container>
  );
}
