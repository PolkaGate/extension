// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { ArrowLeft2 } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AccountContext, ActionButton, TwoToneText } from '../../components';
import { useIsDark } from '../../hooks';

interface Props {
  url?: string;
  label: string;
  labelPartInColor?: string;
  onBack?: () => unknown;
}

function OnboardTitle({ label, labelPartInColor, onBack, url }: Props): React.ReactElement {
  const { accounts } = useContext(AccountContext);
  const isDark = useIsDark();
  const navigate = useNavigate();

  const onClick = useCallback(() => {
    onBack ? onBack() : navigate(url ?? '/');
  }, [navigate, onBack, url]);

  return (
    <Stack alignContent='start' alignItems='center' columnGap='10px' direction='row' justifyContent='start' width='100%'>
      {!accounts.length &&
        <ActionButton
          StartIcon={ArrowLeft2}
          contentPlacement='start'
          iconAlwaysBold
          iconSize={24}
          onClick={onClick}
          style={{
            '& .MuiButton-startIcon': {
              marginLeft: '5px',
              marginRight: '0px'
            },
            '&:hover': {
              background: isDark ? '#674394' : '#EFF1F9',
              transition: 'all 250ms ease-out'
            },
            background: isDark ? '#BFA1FF26' : '#FFFFFF',
            borderRadius: '10px',
            height: '36px',
            minWidth: '0px',
            padding: 0,
            width: '36px'
          }}
          variant='contained'
        />
      }
      <Typography alignSelf='end' sx={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap' }} textAlign='left' textTransform='uppercase' variant='H-1' width='100%'>
        <TwoToneText
          text={label}
          textPartInColor={labelPartInColor}
        />
      </Typography>
    </Stack>
  );
}

export default React.memo(OnboardTitle);
