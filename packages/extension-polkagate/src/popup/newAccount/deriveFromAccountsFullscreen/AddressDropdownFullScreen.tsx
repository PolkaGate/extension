// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Collapse, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { ChainLogo, NewAddress } from '../../../components';
import { useOutsideClick, useTranslation } from '../../../hooks';

interface Props {
  allAddresses: [string, string | null, string | undefined][];
  onSelect: (address: string) => void;
  selectedAddress: string | undefined;
  selectedName: string | null | undefined;
  selectedGenesis: string | null | undefined;
  style?: SxProps<Theme> | undefined;
  withoutChainLogo?: boolean;
}

export default function AddressDropdownFullScreen({ allAddresses, onSelect, selectedAddress, selectedGenesis, selectedName, style, withoutChainLogo }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);

  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);

  const hideDropdown = useCallback(() => setDropdownVisible(false), []);
  const toggleDropdown = useCallback(() => setDropdownVisible(!isDropdownVisible), [isDropdownVisible]);
  const selectParent = useCallback((newParent: string) => () => onSelect(newParent), [onSelect]);

  useOutsideClick([ref], hideDropdown);

  return (
    <Grid container item sx={{ position: 'relative', ...style }}>
      <Grid container overflow='hidden' sx={{ bgcolor: 'background.paper', border: isDarkMode ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '1px', boxShadow: '2px 3px 4px 0px #0000001A', position: 'relative' }}>
        <Grid alignItems='center' container item justifyContent='space-around' px='15px' xs>
          {selectedAddress
            ? <>
              <Grid container item xs>
                <NewAddress
                  address={selectedAddress}
                  name={selectedName}
                  showCopy={false}
                  style={{ border: 'none', borderRadius: 0, boxShadow: 'none', m: 0, pl: '5px', px: 0 }}
                />
              </Grid>
              {!withoutChainLogo &&
                <Grid container item width='fit-content'>
                  <ChainLogo genesisHash={selectedGenesis as string} />
                </Grid>}
            </>
            : <Grid alignItems='center' container height='70px' item>
              <Typography fontSize='14px' fontWeight={400} sx={{ pl: '30px' }}>
                {t('Select an account')}
              </Typography>
            </Grid>
          }
        </Grid>
        <Grid alignItems='center' container item onClick={toggleDropdown} ref={ref} sx={{ borderLeft: '1px solid', borderLeftColor: isDarkMode ? 'secondary.light' : 'divider', cursor: 'pointer', px: '10px', width: 'fit-content' }}>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: theme.palette.secondary.light, strokeWidth: '2px', transform: isDropdownVisible ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
        </Grid>
      </Grid>
      <Grid container sx={{ position: 'absolute', top: '75px', zIndex: 10 }}>
        <Collapse in={isDropdownVisible} sx={{ width: '100%' }}>
          <Grid container sx={{ bgcolor: 'background.paper', border: isDarkMode ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '1px', boxShadow: `0px 3px 10px ${isDarkMode ? '#ffffff40' : '#0000001A'}`, maxHeight: '250px', overflow: 'hidden', overflowY: 'scroll' }}>
            {allAddresses.map(([address, genesisHash, name]) => (
              <Grid alignItems='center' container item key={address} onClick={selectParent(address)} sx={{ borderBottom: '1px solid', borderBottomColor: isDarkMode ? 'secondary.light' : 'divider', cursor: 'pointer', px: '25px' }}>
                <Grid container item xs>
                  <NewAddress
                    address={address}
                    name={name}
                    showCopy={false}
                    style={{ border: 'none', borderRadius: 0, boxShadow: 'none', m: 0, pl: '5px', px: 0 }}
                  />
                </Grid>
                {!withoutChainLogo &&
                  <Grid container item width='fit-content'>
                    <ChainLogo genesisHash={genesisHash as string} />
                  </Grid>}
              </Grid>
            ))}
          </Grid>
        </Collapse>
      </Grid>
    </Grid>
  );
}
