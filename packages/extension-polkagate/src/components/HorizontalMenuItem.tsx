// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, IconButton, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  title: string;
  icon: any;
  divider?: boolean;
  onClick: () => void;
  exceptionWidth?: number;
}

export default function HorizontalMenuItem({ divider = false, exceptionWidth = 0, icon, onClick, title }: Props): React.ReactElement {
  const itemRef = useRef(null);
  const [parentWidth, setParentWidth] = useState<number>(0);
  const [childCount, setChildCount] = useState<number>(0);
  const [childWidth, setChildWidth] = useState<number>(0);

  useEffect(() => {
    setParentWidth(itemRef?.current.parentNode.offsetWidth);
    parentWidth !== 0 && setChildCount(itemRef?.current.parentNode.childElementCount);
    childCount !== 0 && setChildWidth((parentWidth / ((childCount + 1) / 2)) - 6);
  }, [childCount, childWidth, itemRef, parentWidth]);

  return (
    <>
      <Grid
        container
        direction='column'
        item
        justifyContent='center'
        maxWidth={childWidth + exceptionWidth}
        ref={itemRef}
        width='fit-content'
      >
        <Grid
          container
          item
          justifyContent='center'
        >
          <IconButton
            onClick={onClick}
            sx={{
              alignSelf: 'center',
              m: 'auto',
              py: 0,
              transform: 'scale(0.9)',
              width: 'fit-content'
            }}
          >
            {icon}
          </IconButton>
        </Grid>
        <Grid
          item
          textAlign='center'
        >
          <Typography
            fontSize='12px'
            fontWeight={300}
          >
            {title}
          </Typography>
        </Grid>
      </Grid>
      {divider &&
        <Grid
          alignItems='center'
          item
          justifyContent='center'
        >
          <Divider
            orientation='vertical'
            sx={{
              bgcolor: 'text.primary',
              height: '30px',
              m: 'auto 2px',
              width: '2px'
            }}
          />
        </Grid>
      }
    </>
  );
}
