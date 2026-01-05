// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';
import type { DropdownOption } from '@polkadot/extension-polkagate/util/types';

import { Stack, Typography } from '@mui/material';
import { Firstline } from 'iconsax-react';
import React from 'react';

import { DropSelect } from '../../components';
import { useTranslation } from '../../hooks';
import MyPagination from './MyPagination';

interface Props {
  options: DropdownOption[];
  itemsPerPage: string | number;
  page: number;
  setItemsPerPagePage: React.Dispatch<React.SetStateAction<number | string>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalItems: number;
}

function PaginationRow({ itemsPerPage, options, page, setItemsPerPagePage, setPage, totalItems }: Props): React.ReactElement {
  const { t } = useTranslation();

  const _itemsPerPage = Number(itemsPerPage);
  const paginationCount = Math.ceil(totalItems / _itemsPerPage);

  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' sx={{ height: '56px', p: '12px', width: '100%' }}>
      {
        totalItems > 0 &&
        <Stack columnGap='5px' direction='row'>
          <Firstline color='#674394' size='18px' variant='Bold' />
          <Typography color='#AA83DC' variant='B-4'>
            {t('{{start}} - {{end}} of {{totalItems}} items', { replace: { end: Math.min(page * _itemsPerPage, totalItems), start: (page - 1) * _itemsPerPage + 1, totalItems } })}
          </Typography>
        </Stack>
      }
      {
        paginationCount > 1 &&
        <MyPagination
          count={paginationCount}
          page={page}
          setPage={setPage}
        />
      }
      {
        totalItems >= _itemsPerPage &&
        <Stack alignItems='center' columnGap='5px' direction='row'>
          <Typography color='#AA83DC' sx={{ whiteSpace: 'nowrap' }} variant='B-4'>
            {t('Show')}:
          </Typography>
          <DropSelect
            contentDropWidth={50}
            defaultValue={options[0].value}
            displayContentType='text'
            dropContentStyle={{
              fontSize: '12px',
              minWidth: 'fit-content',
              padding: '4px 6px'
            }}
            onChange={setItemsPerPagePage}
            options={options}
            showCheckAsIcon={false}
            simpleArrow
            style={{
              border: 'none',
              color: '#EAEBF1',
              columnGap: 0,
              margin: 0,
              minWidth: 'fit-content',
              padding: 0,
              paddingLeft: '10px'
            }}
            textVariant={'B-4' as Variant}
            value={itemsPerPage}
          />
        </Stack>
      }
    </Stack>
  );
}

export default React.memo(PaginationRow);
