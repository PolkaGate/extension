// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Dialog, Grid, Slide, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useIsTestnetEnabled, useSelectedChains } from '../../../hooks';
import { TEST_NETS } from '../../../util/constants';
import { HEADER_COMPONENT_STYLE } from '../../governance/FullScreenHeader';
import ChainList from '../components/ChainList';

export interface CurrencyItemType { code: string; country: string; currency: string; sign: string; }

export default function FavoriteChains(): React.ReactElement {
  const theme = useTheme();
  const selectedChains = useSelectedChains();
  const isTestNetEnabled = useIsTestnetEnabled();
  const ref = useRef<DOMRect>();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const color = theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.secondary;

  useEffect(() => {
    if (anchorEl?.getBoundingClientRect()) {
      ref.current = anchorEl.getBoundingClientRect();
    }
  }, [anchorEl]);

  const onChainListClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  }, [anchorEl]);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const badgeCount = useMemo(() => {
    if (!selectedChains?.length) {
      return 0;
    }

    let filteredList = selectedChains;

    if (!isTestNetEnabled) {
      filteredList = selectedChains.filter((item) => !TEST_NETS.includes(item));
    }

    return filteredList.length;
  }, [isTestNetEnabled, selectedChains]);

  return (
    <Badge
      badgeContent={badgeCount}
      color='success'
      sx={{
        '& .MuiBadge-badge': {
          color: 'white'
        }
      }}
    >
      <Grid
        alignItems='center'
        component='button'
        container
        direction='column'
        item
        justifyContent='center'
        onClick={onChainListClick}
        sx={{ ...HEADER_COMPONENT_STYLE, zIndex: anchorEl && theme.zIndex.modal + 1 }}
      >
        <FontAwesomeIcon
          color={color}
          fontSize='22px'
          icon={faSliders}
        />
      </Grid>
      <Dialog
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            borderRadius: '7px',
            boxShadow: theme.palette.mode === 'dark'
              ? '0px 4px 4px rgba(255, 255, 255, 0.25)'
              : '0px 0px 25px 0px rgba(0, 0, 0, 0.50)',
            left: ((anchorEl?.getBoundingClientRect() || ref.current)?.right ?? 0) - 310,
            position: 'absolute',
            top: ((anchorEl?.getBoundingClientRect() || ref.current)?.bottom ?? 0) - 30
          }
        }}
        TransitionComponent={Slide}
        onClose={handleClose}
        open={!!anchorEl}
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)'
            }
          }
        }}
      >
        <ChainList anchorEl={anchorEl} />
      </Dialog>
    </Badge>
  );
}
