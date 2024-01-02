// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid } from '@mui/material';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { AccountContext, Identity } from '../../../components';
import { useChain, useOutsideClick } from '../../../hooks';
import { tieAccount } from '../../../messaging';

interface Props {
  api: ApiPromise | undefined;
  onSelect: (address: string) => void;
  selectedAddress: string | undefined;
  chainGenesis: string | undefined;
  height: string;

}

export default function AddressDropdown({ api, chainGenesis, onSelect, selectedAddress }: Props): React.ReactElement<Props> {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { hierarchy } = useContext(AccountContext);
  const chain = useChain(selectedAddress);

  const allAddresses = useMemo(() => hierarchy.map(({ address }) => address), [hierarchy]);

  const _hideDropdown = useCallback(() => setDropdownVisible(false), []);
  const _toggleDropdown = useCallback(() => setDropdownVisible(!isDropdownVisible), [isDropdownVisible]);
  const _onSelect = useCallback((addr: string) => () => {
    addr && chainGenesis && tieAccount(addr, chainGenesis).then(() => setTimeout(() => onSelect(addr), 150)).catch(console.error);
  }, [chainGenesis, onSelect]);

  useOutsideClick([ref], _hideDropdown);

  return (
    <Grid container style={{ position: 'relative' }}>
      <Grid container sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', color: 'white' }}>
        <Grid alignItems='center' container item justifyContent='space-around' maxWidth='calc(100% - 40px)' width='fit-content'>
          <Identity
            address={selectedAddress}
            api={api}
            identiconSize={24}
            showSocial={false}
            style={{
              border: 'none',
              fontSize: '14px',
              height: '40px',
              m: 0,
              minWidth: '150px',
              px: '5px',
              width: 'fit-content'
            }}
          />
        </Grid>
        <Grid alignItems='center' container item onClick={_toggleDropdown} ref={ref} sx={{ borderLeft: '1px solid', borderLeftColor: 'secondary.light', cursor: 'pointer', px: '10px', width: '40px' }}>
          <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: isDropdownVisible ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
        </Grid>
      </Grid>
      <Grid container sx={{ '> .tree:last-child': { border: 'none' }, bgcolor: 'background.paper', border: '2px solid', borderColor: 'secondary.light', borderRadius: '5px', boxShadow: '0px 3px 10px rgba(255, 255, 255, 0.25)', maxHeight: '300px', overflow: 'hidden', overflowY: 'scroll', position: 'absolute', top: '40px', transform: isDropdownVisible ? 'scaleY(1)' : 'scaleY(0)', transformOrigin: 'top', transitionDuration: '0.3s', transitionProperty: 'transform', visibility: isDropdownVisible ? 'visible' : 'hidden', zIndex: 10 }}>
        {allAddresses.filter((address) => address !== selectedAddress).map((address) => (
          <Grid alignItems='center' container item key={address} onClick={_onSelect(address)} sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', cursor: 'pointer' }}>
            <Identity
              address={address}
              // api={api}
              chain={chain}
              identiconSize={24}
              showSocial={false}
              style={{
                border: 'none',
                fontSize: '14px',
                height: '40px',
                m: 0,
                minWidth: '150px',
                px: '5px',
                width: 'fit-content'
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
}
