// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';

import { Stack, Typography } from '@mui/material';
import { Firstline } from 'iconsax-react';
import React from 'react';

import { DropSelect } from '../../components';
import { useTranslation } from '../../hooks';
import MyPagination from './MyPagination';

const DEFAULT_ITEMS_PER_PAGE = 8;

interface Props {
  count: number;
  itemsPerPage: string | number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setItemsPerPagePage: React.Dispatch<React.SetStateAction<number | string>>;
}

function PaginationRow ({ count, itemsPerPage, page, setItemsPerPagePage, setPage }: Props): React.ReactElement {
  const { t } = useTranslation();

  const _itemsPerPage = Number(itemsPerPage);
  const paginationCount = Math.ceil(count / _itemsPerPage);

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ height: '56px', p: '12px' }}>
      <Stack columnGap='5px' direction='row'>
        <Firstline color='#674394' size='18px' variant='Bold' />
        <Typography color='#AA83DC' variant='B-4'>
          {`${(page - 1) * _itemsPerPage + 1} - ${Math.min(page * _itemsPerPage, count)} of ${count} items`}
        </Typography>
      </Stack>
      {
        paginationCount > 1 &&
        <MyPagination
          count={paginationCount}
          page={page}
          setPage={setPage}
        />
      }
      <Stack alignItems='center' columnGap='5px' direction='row'>
        <Typography color='#AA83DC' variant='B-4'>
          {t('Show:')}
        </Typography>
        <DropSelect
          contentDropWidth={50}
          defaultValue={DEFAULT_ITEMS_PER_PAGE}
          displayContentType='text'
          dropContentStyle={{
            fontSize: '12px',
            minWidth: 'fit-content',
            padding: '4px 6px'
          }}
          onChange={setItemsPerPagePage}
          options={[{ text: `${DEFAULT_ITEMS_PER_PAGE}`, value: DEFAULT_ITEMS_PER_PAGE }, { text: '10', value: 10 }, { text: '20', value: 20 }, { text: '50', value: 50 }]}
          showCheckAsIcon={false}
          simpleArrow
          style={{
            border: 'none',
            color: '#EAEBF1',
            columnGap: 0,
            margin: 0,
            minWidth: 'fit-content',
            padding: 0
          }}
          textVariant={'B-4' as Variant}
          value={itemsPerPage}
        />
      </Stack>
    </Stack>
  );
}

export default React.memo(PaginationRow);
