// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ClickAwayListener, Grid, Popover, Stack, styled, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useContext, useRef, useState } from 'react';

import { useSelectedAccount } from '../hooks';
import { updateMeta } from '../messaging';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { AccountContext, GlowCheck, ScrollingTextBox } from '.';

const DropContentContainer = styled(Grid)(({ preferredWidth }: { preferredWidth: number | undefined }) => ({
  background: '#05091C',
  border: '4px solid',
  borderColor: '#1B133C',
  borderRadius: '12px',
  columnGap: '5px',
  flexWrap: 'nowrap',
  margin: 'auto',
  marginTop: '4px',
  maxHeight: '300px',
  minWidth: '222px',
  overflowY: 'scroll',
  padding: '6px',
  rowGap: '4px',
  transition: 'all 250ms ease-out',
  width: `${preferredWidth}px`
}));

interface DropAccountContentProps {
  contentDropWidth?: number | undefined;
  containerRef: React.RefObject<HTMLDivElement>;
  open: boolean;
}

function DropAccountContent ({ containerRef, contentDropWidth, open }: DropAccountContentProps) {
  const id = open ? 'dropContent-popover' : undefined;
  const anchorEl = open ? containerRef.current : null;
  const { accounts } = useContext(AccountContext);
  const selectedAccount = useSelectedAccount();

  const onClick = useCallback((address: string) => {
    const accountToUnselect = accounts.find(({ address: accountAddress, selected }) => selected && address !== accountAddress);

    Promise.all([
      updateMeta(address, JSON.stringify({ selected: true })),
      ...(accountToUnselect ? [updateMeta(accountToUnselect.address, JSON.stringify({ selected: false }))] : [])
    ])
      .catch(console.error);
  }, [accounts]);

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom'
      }}
      id={id}
      open={open}
      slotProps={{
        paper: {
          sx: {
            background: 'none',
            backgroundImage: 'none'
          }
        }
      }}
      sx={{ mt: '4px' }}
      transformOrigin={{
        horizontal: 'left',
        vertical: 'top'
      }}
    >
      <DropContentContainer container direction='column' item preferredWidth={contentDropWidth}>
        {accounts.map(({ address, name }, index) => {
          const isSelected = address === selectedAccount?.address;

          return (
            <Stack alignItems='center' columnGap='10px' direction='row' justifyContent='start' key={index} onClick={() => onClick(address)} sx={{ '&:hover': { bgcolor: '#6743944D', borderRadius: '8px', cursor: 'pointer' }, height: '40px', px: '5px' }}>
              {isSelected
                ? <GlowCheck
                  show={true}
                  size='18px'
                />
                : <PolkaGateIdenticon
                  address={address}
                  size={18}
                />}
              <Typography color={isSelected ? '#FF4FB9' : 'text.primary'} variant='B-2'>
                {name}
              </Typography>
            </Stack>
          );
        })}
      </DropContentContainer>
    </Popover>
  );
}

const DropSelectContainer = styled(Grid)(({ focused }: { focused: boolean }) => ({
  ':hover': { background: '#674394' },
  alignItems: 'center',
  backdropFilter: 'blur(20px)',
  background: focused ? '#1B133C' : '#1B133CB2',
  borderRadius: '12px',
  boxShadow: '0px 0px 24px 8px #4E2B7259 inset',
  columnGap: '5px',
  cursor: 'pointer',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  padding: '0 10px',
  transition: 'all 250ms ease-out',
  width: '160px'
}));

interface Props {
  style?: SxProps<Theme>;
}

function AccountSelectionDropDown ({ style }: Props) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedAccount = useSelectedAccount();

  const [open, setOpen] = useState<boolean>(false);

  const toggleOpen = useCallback(() => setOpen((prev) => !prev), []);
  const handleClickAway = useCallback(() => setOpen(false), []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <DropSelectContainer container focused={open} item onClick={toggleOpen} ref={containerRef} sx={style}>
          <Grid alignItems='center' columnGap='10px' container direction='row' item justifyContent='start' sx={{ flexWrap: 'nowrap', width: '180px' }}>
            <PolkaGateIdenticon
              address={String(selectedAccount?.address)}
              size={18}
            />
            <ScrollingTextBox
              text={selectedAccount?.name ?? ''}
              textStyle={{
                color: 'text.primary',
                ...theme.typography['B-2']
              }}
              width={90}
            />
          </Grid>
          <ArrowDown2 color={open ? '#FF4FB9' : '#AA83DC'} size='24' style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'all 250ms ease-out ' }} variant='Bold' />
        </DropSelectContainer>
      </ClickAwayListener>
      <DropAccountContent
        containerRef={containerRef}
        open={open}
      />
    </>
  );
}

export default AccountSelectionDropDown;
