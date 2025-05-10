// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { DropdownOption } from '../util/types';

import { Avatar, ClickAwayListener, Grid, styled, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowDown2, Global } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { useIsDark } from '../hooks';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { CHAINS_WITH_BLACK_LOGO } from '../util/constants';
import getLogo from '../util/getLogo';
import { DropContent, ScrollingTextBox } from '.';

const DropSelectContainer = styled(Grid)(({ focused }: { focused: boolean }) => ({
  '&:hover': { background: '#2D1E4A' },
  alignItems: 'center',
  background: focused ? '#05091C' : '#1B133C',
  border: '1px solid',
  borderColor: '#BEAAD833',
  borderRadius: '12px',
  columnGap: '5px',
  cursor: 'pointer',
  flexWrap: 'nowrap',
  justifyContent: 'space-between',
  padding: '12px',
  transition: 'all 250ms ease-out'
}));

function Logo ({ text }: { text: string }) {
  const isDark = useIsDark();
  const icon = getLogo(text);

  return (
    <Avatar
      src={icon}
      sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(text) && isDark) ? 'invert(1)' : 'none', height: 18, width: 18 }}
      variant='square'
    >
      {!icon &&
        <Global color='#AA83DC' size='18' variant='Bulk' />
      }
    </Avatar>
  );
}

interface Props {
  defaultValue?: string | number;
  disabled?: boolean;
  displayContentType?: 'icon' | 'logo' | 'text' | 'account';
  Icon?: Icon;
  onChange?: (value: number | string) => void;
  options: DropdownOption[];
  style?: SxProps<Theme>;
  value?: string | number | undefined;
  withDivider?: boolean;
  scrollTextOnOverFlowX?: boolean;
  showCheckAsIcon?: boolean;
  contentDropWidth?: number | undefined;
}

function DropSelect ({ Icon, contentDropWidth, defaultValue, disabled, displayContentType = 'text', onChange, options, scrollTextOnOverFlowX, showCheckAsIcon, style, value, withDivider = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const [open, setOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<number | string | undefined>(defaultValue);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _contentDropWidth = useMemo(() => containerRef.current?.clientWidth, [containerRef.current?.clientWidth]);
  const defaultValueText = useMemo(() => options.find(({ value }) => value === defaultValue)?.text, [defaultValue, options]);
  const selectedValueText = useMemo(() => options.find(({ value: optionValue }) => optionValue === (selectedValue ?? value))?.text, [options, selectedValue, value]);

  const toggleOpen = useCallback(() => !disabled && setOpen((isOpen) => !isOpen), [disabled]);
  const handleClickAway = useCallback(() => setOpen(false), []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <DropSelectContainer container focused={open} item onClick={toggleOpen} ref={containerRef} sx={style}>
          <Grid alignItems='center' container item sx={{ columnGap: '5px', flexWrap: 'noWrap' }} xs>
            {displayContentType === 'logo' && selectedValueText &&
              <Logo
                text={selectedValueText}
              />
            }
            {displayContentType === 'account' && selectedValueText &&
              <PolkaGateIdenticon
                address={selectedValueText}
                size={18}
              />
            }
            {displayContentType === 'icon' && Icon &&
              <Icon color='#BEAAD8' size='18' variant='Bulk' />
            }
            {scrollTextOnOverFlowX && _contentDropWidth
              ? <ScrollingTextBox
                text={selectedValueText ?? defaultValueText}
                textStyle={{
                  color: 'text.primary',
                  ...theme.typography['B-4']
                }}
                width={Math.floor(_contentDropWidth * 0.6)}
              />
              : <Typography color='text.secondary' variant='B-1'>
                {selectedValueText ?? defaultValueText}
              </Typography>
            }
          </Grid>
          <ArrowDown2 color={open ? '#FF4FB9' : '#AA83DC'} size='16' style={{ rotate: open ? '180deg' : 'none', transition: 'all 250ms ease-out' }} variant='Bold' />
        </DropSelectContainer>
      </ClickAwayListener>
      <DropContent
        Icon={Icon}
        containerRef={containerRef}
        contentDropWidth={contentDropWidth ?? _contentDropWidth}
        displayContentType={displayContentType}
        onChange={onChange}
        open={open}
        options={options}
        selectedValue={selectedValue}
        setOpen={setOpen}
        setSelectedValue={setSelectedValue}
        showCheckAsIcon={showCheckAsIcon}
        withDivider={withDivider}
      />
    </>
  );
}

export default DropSelect;
