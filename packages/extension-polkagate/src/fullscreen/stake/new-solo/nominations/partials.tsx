// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { ValidatorInformation } from '@polkadot/extension-polkagate/hooks/useValidatorsInformation';
import type { SpStakingExposurePage, SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';

import { alpha, Box, Grid, IconButton, Stack, Typography } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback } from 'react';

import { toBN } from '@polkadot/extension-polkagate/src/util/utils';

import { ValidatorInfo } from './ValidatorItem';

export function LabelBar ({ Icon, color, count, isCollapsed, label, setCollapse }: {
  Icon: Icon;
  color: string;
  count: number | undefined;
  isCollapsed?: boolean;
  label: string | undefined;
  setCollapse?: React.Dispatch<React.SetStateAction<boolean>>;
}): React.ReactElement {
  const onClick = useCallback(() => {
    setCollapse?.((pre) => !pre);
  }, [setCollapse]);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: '#05091C', borderRadius: '14px', lineHeight: '45px', m: '10px 0 2px', p: '0  6px 0 13px', width: '99%' }}>
      <Stack alignItems='center' columnGap='4px' direction='row'>
        <Icon color={color} size='18' variant='Bulk' />
        <Typography sx={{ color: 'text.primary' }} variant='B-2'>
          {label}
        </Typography>
        <Typography sx={{ bgcolor: alpha(color, 0.15), borderRadius: '1024px', color, lineHeight: '19px', minWidth: '23px' }} variant='B-1'>
          {count || 0}
        </Typography>
      </Stack>
      <IconButton onClick={onClick} sx={{ '&:hover': { bgcolor: '#8E6ACF' }, bgcolor: '#AA83DC', borderRadius: '8px', height: '36px', width: '34px' }}>
        <ArrowDown2
          color='#05091C'
          size='14' style={{
            transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }} variant='Bold'
        />
      </IconButton>
    </Grid>
  );
}

function Curve (): React.ReactElement {
  return (
    <Box
      sx={{
        borderBottom: '1px solid #2D1E4A',
        borderLeft: '1px solid #2D1E4A',
        borderRadius: '0 0 0 66%',
        height: '22px',
        left: '12px',
        position: 'absolute',
        top: '5px',
        width: '16px'
      }}
    />
  );
}

export function Line ({ height }: { height: number }): React.ReactElement {
  return (
    <Box
      sx={{
        borderBottom: '1px solid #2D1E4A',
        borderLeft: '1px solid #2D1E4A',
        borderRadius: '0',
        height: `${height}px`,
        left: '12px',
        position: 'absolute',
        top: '55px',
        width: '0'
      }}
    />
  );
}

export const Validators = React.memo(function Validators ({ address, bgcolor, genesisHash, isActive, validators, withCurve }: { address?: string | undefined, bgcolor?: string | undefined, genesisHash: string | undefined, isActive?: boolean | undefined, validators: ValidatorInformation[], withCurve?: boolean }): React.ReactElement {
  return (
    <>
      {
        validators?.map((validator, index) => {
          let myShare;

          if (isActive && address) {
            const mySupport = (validator.exposurePaged as unknown as SpStakingExposurePage).others.find(({ who }) => who.toString() === address)?.value;

            if (mySupport) {
              const PRECISION = 1_00;
              const myShareBN = toBN(mySupport).muln(100 * PRECISION).div(toBN((validator.exposureMeta as unknown as SpStakingPagedExposureMetadata).total));

              myShare = myShareBN.toNumber() / PRECISION;
            }
          }

          return (
            <Stack direction='row' key={index} sx={{ position: 'relative' }}>
              {
                withCurve &&
                <Curve />
              }
              <ValidatorInfo
                bgcolor={bgcolor}
                genesisHash={genesisHash}
                isActive={isActive}
                key={index}
                myShare={myShare}
                style={{ marginLeft: '3%', width: '94%' }}
                validatorInfo={validator}
              />
            </Stack>
          );
        })
      }
    </>
  );
});
