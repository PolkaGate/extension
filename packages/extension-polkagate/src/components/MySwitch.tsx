// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SwitchProps } from '@mui/material/Switch';

import { Box, Stack, Typography, type TypographyOwnProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { EyeSlash } from 'iconsax-react';
import * as React from 'react';

import useIsBlueish from '@polkadot/extension-polkagate/src/hooks/useIsBlueish';

import useIsDark from '../hooks/useIsDark';

interface Props extends SwitchProps {
  columnGap?: string;
  label?: string;
  labelStyle?: TypographyOwnProps;
  style?: React.CSSProperties;
  showHidden?: boolean;
}

const HiddenIcon = () => {
  return (
    <Box sx={{
      alignItems: 'center',
      background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)',
      borderRadius: '50%',
      display: 'flex',
      height: '18px',
      justifyContent: 'center',
      width: '18px'
    }}
    >
      <EyeSlash color='#FFFFFF' size='12' variant='Bold' />
    </Box>
  );
};

const MySwitch = ({ checked, columnGap, label, labelStyle = {}, onChange, showHidden = false, style = {}, ...props }: Props) => {
  const isDark = useIsDark();
  const isBlueish = useIsBlueish();

  return (
    <Stack alignItems='center' columnGap={columnGap} component='label' direction='row' sx={{ ...style }}>
      <StyledSwitch
        checked={Boolean(checked)}
        checkedIcon={showHidden ? <HiddenIcon /> : <Box sx={{ borderRadius: '50%', height: '10px', width: '10px' }} />}
        disableRipple
        focusVisibleClassName='.Mui-focusVisible'
        isBlueish={isBlueish}
        isDark={isDark}
        onChange={onChange}
        showHidden={showHidden}
        {...props}
      />
      <Typography color={showHidden && !checked ? 'text.secondary' : 'text.primary'} sx={{ cursor: 'pointer', width: 'max-content' }} variant='B-1' {...labelStyle}>
        {label}
      </Typography>
    </Stack>
  );
};

const StyledSwitch = styled(Switch, {
  shouldForwardProp: (prop) => prop !== 'isBlueish' && prop !== 'isDark' && prop !== 'showHidden'
})<{ isDark: boolean, isBlueish: boolean, showHidden: boolean }>(({ checked, isBlueish, isDark, showHidden, theme }) => ({
  background: checked
    ? isDark
      ? 'linear-gradient(#2D1E4A, #2D1E4A) padding-box, linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%) border-box'
      : '#CCD2EA'
    : isDark
      ? '#2D1E4A'
      : '#FFFFFF',
  backgroundClip: checked ? 'padding-box, border-box' : 'unset',
  backgroundOrigin: 'border-box',
  border: `2px solid ${checked
    ? isDark
      ? isBlueish
        ? '#3988FF'
        : 'transparent'
      : '#3988FF'
    : isDark
      ? '#6743944D'
      : '#CCD2EA'
    }`,
  borderRadius: '109.71px',
  cursor: 'pointer',
  height: '24px',
  padding: 0,
  width: '36px',
  '&:hover': {
    border: checked ? undefined : '2px solid #674394'
  },
  '&:hover .MuiSwitch-thumb': {
    background: checked
      ? isDark ? '#EAEBF1' : '#3988FF'
      : isDark ? '#BEAAD8' : '#CCD2EA'
  },
  '& .MuiSwitch-root': {
    height: '100%',
    width: '100%'
  },
  '& .MuiSwitch-switchBase': {
    alignSelf: 'anchor-center',
    left: 0,
    margin: '0 3px',
    padding: 0,
    transition: theme.transitions.create(['transform', 'background-color', 'box-shadow'], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }),
    '&.Mui-checked': {
      background: showHidden ? undefined : isDark ? '#EAEBF1' : '#3988FF',
      padding: showHidden ? 0 : 2,
      transform: showHidden ? 'translate(10px, 5%)' : 'translate(13px, 20%)', // horizontal + vertical for checked
      '& .MuiSwitch-thumb': {
        background: isDark ? '#EAEBF1' : '#3988FF'
      },
      '& + .MuiSwitch-track': {
        backgroundColor: '#EAEBF1',
        transition: theme.transitions.create('background-color', {
          duration: 300,
          easing: 'ease-in-out'
        }),
        ...theme.applyStyles('dark', {
          backgroundColor: '#2D1E4A'
        })
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5
      }
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.grey[100],
      ...theme.applyStyles('dark', {
        color: theme.palette.grey[600]
      })
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: 0.7,
      ...theme.applyStyles('dark', {
        opacity: 0.3
      })
    }
  },
  '& .MuiSwitch-thumb': {
    background: isDark ? '#674394' : '#CCD2EA',
    boxSizing: 'border-box',
    height: 10.29,
    transform: 'translateY(50%)', // proper vertical center
    transition: theme.transitions.create(['background-color', 'transform'], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }),
    width: 10.29
  },
  '& .MuiSwitch-track': {
    backgroundColor: isDark ? '#39393D' : '#FFFFFF',
    transition: theme.transitions.create(['background-color'], {
      duration: 500
    })
  }
}));

export default MySwitch;
