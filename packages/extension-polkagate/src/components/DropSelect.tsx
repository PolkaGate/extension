// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Variant } from '@mui/material/styles/createTypography';
import type { Icon } from 'iconsax-react';
import type { AdvancedDropdownOption } from '../util/types';

import { ExpandMore } from '@mui/icons-material';
import { Avatar, ClickAwayListener, Grid, styled, Typography, useTheme } from '@mui/material';
import { ArrowDown2, Global } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useIsDark } from '../hooks';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { CHAINS_WITH_BLACK_LOGO } from '../util/constants';
import getLogo from '../util/getLogo';
import { DropContent, ScrollingTextBox } from '.';

const DropSelectContainer = styled(Grid, { shouldForwardProp: (prop) => prop !== 'focused' })(({ disabled, focused }: { disabled: boolean | undefined, focused: boolean }) => ({
  '&:hover': { background: disabled ? '#1B133C' : '#2D1E4A' },
  alignItems: 'center',
  background: focused && !disabled ? '#05091C' : '#1B133C',
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

function Logo({ text }: { text: string }) {
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
  Icon?: Icon;
  contentDropWidth?: number | undefined;
  defaultValue?: string | number;
  disabled?: boolean;
  displayContentType?: 'icon' | 'logo' | 'text' | 'account' | 'iconOption';
  dropContentStyle?: React.CSSProperties;
  onChange?: (value: number | string) => void;
  options: AdvancedDropdownOption[];
  style?: React.CSSProperties;
  scrollTextOnOverflow?: boolean;
  showCheckAsIcon?: boolean;
  simpleArrow?: boolean;
  textVariant?: Variant;
  value?: string | number | undefined;
  withDivider?: boolean;
}

function DropSelect({ Icon, contentDropWidth, defaultValue, disabled, displayContentType = 'text', dropContentStyle, onChange, options, scrollTextOnOverflow, showCheckAsIcon, simpleArrow, style, textVariant, value, withDivider = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const [open, setOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<number | string | undefined>(value ?? defaultValue);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _contentDropWidth = useMemo(() => containerRef.current?.clientWidth, [containerRef.current?.clientWidth]);
  const defaultValueText = useMemo(() => options.find(({ value }) => value === defaultValue)?.text, [defaultValue, options]);
  const selectedValueText = useMemo(() => options.find(({ value: optionValue }) => optionValue === (selectedValue ?? value))?.text, [options, selectedValue, value]);
  const selectedOption = useMemo(() => options.find(({ value: optionValue }) => optionValue === (selectedValue ?? value)), [options, selectedValue, value]);

  const toggleOpen = useCallback(() => !disabled && setOpen((isOpen) => !isOpen), [disabled]);
  const handleClickAway = useCallback(() => setOpen(false), []);

  useEffect(() => {
    // Update selectedValue when the value prop changes
    setSelectedValue(value);
  }, [value]);

  const textColor = disabled ? 'text.disabled' : style?.color ?? 'text.secondary';
  const arrowColor = open ? '#FF4FB9' : disabled ? '#4B4B4B' : '#AA83DC';

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <DropSelectContainer container disabled={disabled} focused={open} item onClick={toggleOpen} ref={containerRef} sx={style}>
          <Grid alignItems='center' container item sx={{ columnGap: style?.columnGap ?? '5px', flexWrap: 'noWrap' }} xs>
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
            {displayContentType === 'iconOption' && selectedOption?.Icon &&
              <>
                {selectedOption.Icon as React.JSX.Element}
              </>
            }
            {displayContentType === 'icon' && Icon &&
              <Icon color='#BEAAD8' size='18' variant='Bulk' />
            }
            {scrollTextOnOverflow && _contentDropWidth
              ? (
                <ScrollingTextBox
                  text={selectedValueText ?? defaultValueText ?? ''}
                  textStyle={{
                    color: textColor,
                    ...theme.typography['B-4']
                  }}
                  width={Math.floor(_contentDropWidth * 0.6)}
                />)
              : <Typography color={textColor} variant={textVariant ?? 'B-1'}>
                {selectedValueText ?? defaultValueText}
              </Typography>
            }
          </Grid>
          {
            simpleArrow
              ? <ExpandMore sx={{ color: arrowColor, fontSize: '17px', transform: open ? 'rotate(180deg)' : undefined, transition: 'all 250ms ease-out' }} />
              : <ArrowDown2 color={arrowColor} size='16' style={{ rotate: open ? '180deg' : 'none', transition: 'all 250ms ease-out' }} variant='Bold' />
          }
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
        style={dropContentStyle}
        withDivider={withDivider}
      />
    </>
  );
}

export default DropSelect;
