// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Pagination, PaginationItem, type PaginationRenderItemParams } from '@mui/material';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react';
import React, { useCallback } from 'react';

interface Props {
  page: number;
  setPage: (page: number) => void;
  count: number;
}

function MyPagination({ count, page, setPage }: Props): React.ReactElement {
  const onChange = useCallback((_: unknown, value: number) => setPage(value), [setPage]);

  const renderFunction = useCallback((item: PaginationRenderItemParams) => (
    <PaginationItem
      {...item}
      slots={{
        next: () => <ArrowRight2 color='#AA83DC' size='16px' variant='Bold' />,
        previous: () => <ArrowLeft2 color='#AA83DC' size='16px' variant='Bold' />
      }}
    />
  ), []);

  return (
    <Pagination
      color='primary'
      count={count}
      onChange={onChange}
      page={page}
      renderItem={renderFunction}
      shape='rounded'
      sx={{
        '& .MuiPaginationItem-root': {
          backgroundColor: '#2D1E4A',
          border: 'none',
          borderRadius: '12px',
          color: '#AA83DC',
          typography: 'B-6'
        },
        '& .MuiPaginationItem-root.Mui-selected': {
          background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
          border: 'none',
          color: '#fff'
        },
        '& .MuiPaginationItem-root.MuiPaginationItem-ellipsis': {
          backgroundColor: 'transparent',
          border: 'none'
        }
      }}
      variant='outlined'
    />
  );
}

export default React.memo(MyPagination);
