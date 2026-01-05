// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Box, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TwoToneText from '../../components/TwoToneText';

interface Props {
  Icon: Icon;
  label: string;
  labelPartInColor?: string;
  style?: React.CSSProperties;
  url: string;
}

function CreationButton({ Icon, label, labelPartInColor = '', style, url }: Props): React.ReactElement {
  const navigate = useNavigate();

  const [hovered, setHovered] = useState<boolean>(false);
  const [colorChangeActive, setColorChangeActive] = useState<boolean>(false);

  const onClick = useCallback(() => navigate(url), [navigate, url]);

  const onMouseEnter = useCallback(() => {
    setHovered(true);
    setColorChangeActive(true);
    setTimeout(() => {
      setColorChangeActive(false);
    }, 400);
  }, []);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);

  return (
    <Box
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{ background: hovered ? '#2D1E4A' : '#2D1E4A8C', borderRadius: '18px', cursor: 'pointer', height: '148px', p: '15px 15px', position: 'relative', width: '148px', ...style }}
    >
      <Icon color={hovered ? '#AA83DC' : '#BEAAD8'} size='36' variant='Bulk' />
      <Typography bottom={0} color={colorChangeActive ? '#BEAAD8' : '#EAEBF1'} display='block' p='0 15px 15px 0' position='absolute' textAlign='left' variant='B-2'>
        <TwoToneText
          text={label}
          textPartInColor={labelPartInColor}
        />
      </Typography>
    </Box>
  );
}

export default React.memo(CreationButton);
