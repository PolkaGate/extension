// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';

import { Address, ChainLogo } from '../../../components';
import { useOutsideClick } from '../../../hooks';

interface Props {
  allAddresses: [string, string | null, string | undefined][];
  onSelect: (address: string) => void;
  selectedAddress: string;
  selectedName: string | null;
  selectedGenesis: string | undefined;
}

export default function AddressDropdown ({ allAddresses, onSelect, selectedAddress, selectedGenesis, selectedName }: Props): React.ReactElement<Props> {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const _hideDropdown = useCallback(() => setDropdownVisible(false), []);
  const _toggleDropdown = useCallback(() => setDropdownVisible(!isDropdownVisible), [isDropdownVisible]);
  const _selectParent = useCallback((newParent: string) => () => onSelect(newParent), [onSelect]);

  useOutsideClick([ref], _hideDropdown);

  return (
    <div style={{ position: 'relative' }}>
      <Grid container overflow='hidden' sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', position: 'relative' }}>
        <Grid alignItems='center' container item justifyContent='space-around' xs={11}>
          <Grid item maxWidth='245px'>
            <Address
              address={selectedAddress}
              className='address'
              genesisHash={selectedGenesis}
              name={selectedName}
              showCopy={false}
              style={{ border: 'none', borderRadius: 0, m: 0, pl: '5px', px: 0, width: '245px' }}
            />
          </Grid>
          <Grid item width='30px'>
            <ChainLogo genesisHash={selectedGenesis} />
          </Grid>
        </Grid>
        <Grid alignItems='center' container item onClick={_toggleDropdown} ref={ref} sx={{ borderLeft: '1px solid', borderLeftColor: 'secondary.light', cursor: 'pointer' }} xs={1}>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: isDropdownVisible ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
        </Grid>
      </Grid>
      <Grid container sx={{ '> .tree:last-child': { border: 'none' }, bgcolor: 'background.paper', border: '2px solid', borderColor: 'secondary.light', borderRadius: '5px', boxShadow: '0px 3px 10px rgba(255, 255, 255, 0.25)', maxHeight: '220px', overflow: 'hidden', overflowY: 'scroll', position: 'absolute', top: '75px', transform: isDropdownVisible ? 'scaleY(1)' : 'scaleY(0)', transformOrigin: 'top', transitionDuration: '0.3s', transitionProperty: 'transform', visibility: isDropdownVisible ? 'visible' : 'hidden', zIndex: 10 }}>
        {allAddresses.map(([address, genesisHash, name]) => (
          <Grid alignItems='center' className='tree' container item key={address} onClick={_selectParent(address)} sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', cursor: 'pointer', pr: '30px' }}>
            <Grid item xs={10.7}>
              <Address
                address={address}
                className='address'
                genesisHash={genesisHash}
                name={name}
                showCopy={false}
                style={{ border: 'none', m: 0, px: 'auto', width: '100%' }}
              />
            </Grid>
            <Grid item>
              <ChainLogo genesisHash={genesisHash} />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
