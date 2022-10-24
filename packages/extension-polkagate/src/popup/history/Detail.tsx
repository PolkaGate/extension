// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Cancel as CancelIcon, CheckCircle as CheckCircleIcon, LensBlur as LensBlurIcon } from '@mui/icons-material';
import { Divider, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { PButton } from '../../components';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';

interface Props {
  item?: string;
}

export default function Detail({ item }: Props): React.ReactElement {
  const { t } = useTranslation();

  const _onBack = useCallback(() => {
    return 'sdasd';
  }, []);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBack}
        showBackArrow
        text={t<string>('Transaction Detail')}
      />
      <Grid
        alignItems='center'
        justifyContent='center'
        pt='10px'
        textAlign='center'
      >
        <Typography
          fontSize='20px'
          fontWeight={400}
        >
          primary action
        </Typography>
        {/* {Condition && */}
        <Typography
          fontSize='18px'
          fontWeight={300}
        >
          secondary action
        </Typography>
        {/* } */}
        <Divider
          sx={{
            bgcolor: 'secondary.light',
            height: '2px',
            m: '3px auto',
            width: '35%'
          }}
        />
        {/* <CheckCircleIcon
          sx={{
            bgcolor: '#fff',
            borderRadius: '50%',
            color: 'success.main',
            fontSize: '54px',
            mt: '20px'
          }}
        /> */}
        <CancelIcon
          sx={{
            bgcolor: '#fff',
            borderRadius: '50%',
            color: 'warning.main',
            fontSize: '54px',
            mt: '20px'
          }}
        />
        <Typography
          fontSize='16px'
          fontWeight={500}
          mt='10px'
        >
          status
        </Typography>
        {/* <Typography
          fontSize='16px'
          fontWeight={400}
          mt='15px'
        >
          Reason
        </Typography> */}
        <Typography
          fontSize='16px'
          fontWeight={400}
          mt='15px'
        >
          date
        </Typography>
        <Divider
          sx={{
            bgcolor: 'secondary.light',
            height: '2px',
            m: '3px auto',
            width: '75%'
          }}
        />
        <Typography
          fontSize='16px'
          fontWeight={400}
        >
          From
        </Typography>
        <Divider
          sx={{
            bgcolor: 'secondary.light',
            height: '2px',
            m: '3px auto',
            width: '75%'
          }}
        />
        <Typography
          fontSize='16px'
          fontWeight={400}
        >
          To
        </Typography>
        <Divider
          sx={{
            bgcolor: 'secondary.light',
            height: '2px',
            m: '3px auto',
            width: '75%'
          }}
        />
        <Typography
          fontSize='16px'
          fontWeight={400}
        >
          Amount
        </Typography>
        <Typography
          fontSize='16px'
          fontWeight={400}
        >
          Fee
        </Typography>
        <Divider
          sx={{
            bgcolor: 'secondary.light',
            height: '2px',
            m: '3px auto',
            width: '75%'
          }}
        />
        <Typography
          fontSize='16px'
          fontWeight={400}
        >
          Block
        </Typography>
        <Typography
          fontSize='16px'
          fontWeight={400}
        >
          Hash
        </Typography>
        <LensBlurIcon
          sx={{
            fontSize: '40px',
            mt: '20px'
          }}
        />
      </Grid>
      <PButton
        _onClick={_onBack}
        text={t<string>('Back')}
      />
    </>
  );
}
