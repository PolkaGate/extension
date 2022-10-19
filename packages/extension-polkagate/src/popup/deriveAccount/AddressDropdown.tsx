// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import type { ThemeProps } from '../../types';

import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Avatar, Grid } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';

import { Address, ChainLogo } from '../../components';
import { useOutsideClick } from '../../hooks';
import allChains from '../../util/chains';
import getLogo from '../../util/getLogo';

interface Props {
  allAddresses: [string, string | null, string | undefined][];
  onSelect: (address: string) => void;
  selectedAddress: string;
  selectedName: string | null;
  selectedGenesis: string | undefined;
}

export default function AddressDropdown({ allAddresses, onSelect, selectedAddress, selectedGenesis, selectedName }: Props): React.ReactElement<Props> {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const _hideDropdown = useCallback(() => setDropdownVisible(false), []);
  const _toggleDropdown = useCallback(() => setDropdownVisible(!isDropdownVisible), [isDropdownVisible]);
  const _selectParent = useCallback((newParent: string) => () => onSelect(newParent), [onSelect]);

  useOutsideClick([ref], _hideDropdown);

  const getChainLogo = (genesisHash: string | undefined | null) => getLogo(allChains.find((chain) => chain.genesisHash === genesisHash)?.chain.replace(' Relay Chain', ''));

  return (
    <div style={{ position: 'relative' }}>
      <Grid
        container
        overflow='hidden'
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'secondary.light',
          borderRadius: '5px',
          position: 'relative'
        }}
      >
        <Grid
          alignItems='center'
          container
          item
          justifyContent='space-around'
          xs={11}
        >
          <Grid
            item
            maxWidth='245px'
          >
            <Address
              address={selectedAddress}
              className='address'
              genesisHash={selectedGenesis}
              name={selectedName}
              style={{ border: 'none', borderRadius: 0, m: 0, pl: '5px', px: 0, width: '245px' }}
              showCopy={false}
            />
          </Grid>
          <Grid
            item
            width='30px'
          >
            {/* {getChainLogo(selectedGenesis)
              ? (
                <Avatar
                  src={getChainLogo(selectedGenesis)}
                  sx={{ height: 25, width: 25 }}
                  variant='square'
                />)
              : (
                <Grid
                  sx={{
                    bgcolor: 'action.disabledBackground',
                    border: '1px solid',
                    borderColor: 'secondary.light',
                    borderRadius: '50%',
                    height: '25px',
                    width: '25px'
                  }}
                >
                </Grid>)
            } */}
            <ChainLogo genesisHash={selectedGenesis} />
          </Grid>
        </Grid>
        <Grid
          alignItems='center'
          container
          item
          onClick={_toggleDropdown}
          ref={ref}
          sx={{ borderLeft: '1px solid', borderLeftColor: 'secondary.light', cursor: 'pointer' }}
          xs={1}
        >
          <ArrowForwardIosIcon
            sx={{
              color: 'secondary.light',
              fontSize: 18,
              m: 'auto',
              stroke: '#BA2882',
              strokeWidth: '2px',
              transform: isDropdownVisible ? 'rotate(-90deg)' : 'rotate(90deg)'
            }}
          />
        </Grid>
      </Grid>
      <Grid
        container
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
            width: 0
          },
          '> .tree:last-child': { border: 'none' },
          bgcolor: 'background.paper',
          border: '2px solid',
          borderColor: 'secondary.light',
          borderRadius: '5px',
          boxShadow: '0px 3px 10px rgba(255, 255, 255, 0.25)',
          maxHeight: '220px',
          overflow: 'hidden',
          overflowY: 'scroll',
          position: 'absolute',
          top: '75px',
          visibility: isDropdownVisible ? 'visible' : 'hidden',
          zIndex: 10
        }}
      >
        {allAddresses.map(([address, genesisHash, name]) => (
          <Grid
            alignItems='center'
            className='tree'
            container
            item
            key={address}
            onClick={_selectParent(address)}
            sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', pr: '33px', cursor: 'pointer' }}
          >
            <Grid
              item
              xs={10.8}
            >
              <Address
                address={address}
                className='address'
                genesisHash={genesisHash}
                name={name}
                style={{ m: 0, px: 'auto', width: '100%', border: 'none' }}
                showCopy={false}
              />
            </Grid>
            <Grid
              item
            >
              {/* {getChainLogo(genesisHash)
                ? (
                  <Avatar
                    src={getChainLogo(genesisHash)}
                    sx={{ height: 25, width: 25, borderRadius: '50%' }}
                    variant='square'
                  />)
                : (
                  <Grid
                    sx={{
                      bgcolor: 'action.disabledBackground',
                      border: '1px solid',
                      borderColor: 'secondary.light',
                      borderRadius: '50%',
                      height: '25px',
                      width: '25px'
                    }}
                  >
                  </Grid>)
              } */}
              <ChainLogo genesisHash={genesisHash} />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
