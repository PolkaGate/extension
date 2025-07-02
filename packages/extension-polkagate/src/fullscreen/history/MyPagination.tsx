// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Pagination, PaginationItem } from '@mui/material';
import { ArrowLeft2, ArrowRight2 } from 'iconsax-react';
import React from 'react';

interface Props {
  page: number;
  setPage: (page: number) => void;
  count: number;
}

function MyPagination ({ count, page, setPage }: Props): React.ReactElement {
  return (
    <Pagination
      color='primary'
      onChange={(_, value) => setPage(value)}
      page={page}
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
      count={count}
      // eslint-disable-next-line react/jsx-no-bind
      renderItem={(item) => (
        <PaginationItem
          {...item}
          slots={{
            next: () => <ArrowRight2 color='#AA83DC' size='16px' variant='Bold' />,
            previous: () => <ArrowLeft2 color='#AA83DC' size='16px' variant='Bold' />
          }}
        />
      )}
    />
  );
}

export default React.memo(MyPagination);
