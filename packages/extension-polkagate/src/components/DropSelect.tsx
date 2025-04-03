// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { DropdownOption } from '../util/types';

import { Avatar, ClickAwayListener, Grid, Popover, styled, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowDown2 } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { GradientDivider } from '../style';
import { CHAINS_WITH_BLACK_LOGO } from '../util/constants';
import getLogo from '../util/getLogo';
import GlowCheck from './GlowCheck';

const icon = (text: string) => getLogo(text);

const DropSelectContainer = styled(Grid)(({ focused }: { focused: boolean }) => ({
  '&:hover': { background: '#2D1E4A' },
  alignItems: 'center',
  background: focused ? '#05091C' : '#1B133C',
  border: '1px solid',
  borderColor: '#BEAAD833',
  borderRadius: '12px',
  columnGap: '5px',
  cursor: 'pointer',
  justifyContent: 'space-between',
  padding: '12px',
  transition: 'all 250ms ease-out'
}));

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
  overflowY: 'scroll',
  padding: '6px',
  rowGap: '4px',
  transition: 'all 250ms ease-out',
  width: preferredWidth ? `${preferredWidth}px` : 'fit-content'
}));

const ContentDisplayContainer = styled(Grid)(({ isSelectedItem }: { isSelectedItem: boolean }) => ({
  '&:hover': { background: '#6743944D' },
  alignItems: 'center',
  background: isSelectedItem ? '#6743944D' : 'transparent',
  borderRadius: '8px',
  columnGap: '5px',
  cursor: 'pointer',
  minWidth: '150px',
  padding: '10px 8px'
}));

interface ContentDisplayProps {
  text: string | number;
  setSelectedValue: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | number | undefined;
  onChange?: (value: number | string) => void;
  value: string | number;
}

function LogoContentDisplay ({ onChange, selectedValue, setOpen, setSelectedValue, text, value }: ContentDisplayProps) {
  const theme = useTheme();

  const isSelectedItem = useMemo(() => [text, value].includes(selectedValue ?? ''), [selectedValue, text, value]);

  const handleClick = useCallback(() => {
    setSelectedValue(value);
    setOpen(false);
    onChange && onChange(value);
  }, [onChange, setOpen, setSelectedValue, value]);

  return (
    <ContentDisplayContainer container isSelectedItem={isSelectedItem} item onClick={handleClick} style={{ justifyContent: 'space-between' }}>
      <Grid alignItems='center' container item sx={{ columnGap: '5px' }} xs>
        <Avatar
          src={icon(text as string)}
          sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(value as string) && theme.palette.mode === 'dark') ? 'invert(1)' : 'none', height: 18, width: 18 }}
          variant='square'
        />
        <Typography color='text.primary' textTransform='capitalize' variant='B-2'>
          {text}
        </Typography>
      </Grid>
      <GlowCheck
        show={isSelectedItem}
        size='15px'
        timeout={100}
      />
    </ContentDisplayContainer>
  );
}

function TextContentDisplay ({ onChange, selectedValue, setOpen, setSelectedValue, text, value }: ContentDisplayProps) {
  const isSelectedItem = useMemo(() => [text, value].includes(selectedValue ?? ''), [selectedValue, text, value]);

  const handleClick = useCallback(() => {
    setSelectedValue(value);
    setOpen(false);
    onChange && onChange(value);
  }, [onChange, setOpen, setSelectedValue, value]);

  return (
    <ContentDisplayContainer container isSelectedItem={isSelectedItem} item onClick={handleClick}>
      <GlowCheck
        show={isSelectedItem}
        size='15px'
        timeout={250}
      />
      <Typography color='text.primary' textTransform='capitalize' variant='B-2'>
        {text}
      </Typography>
    </ContentDisplayContainer>
  );
}

interface DropContentProps {
  contentDropWidth: number | undefined;
  containerRef: React.RefObject<HTMLDivElement>;
  options: DropdownOption[];
  displayContentType?: 'logo' | 'text';
  setSelectedValue: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | number | undefined;
  onChange?: (value: number | string) => void;
  open: boolean;
  withDivider: boolean;
}

function DropContent ({ containerRef, contentDropWidth, displayContentType, onChange, open, options, selectedValue, setOpen, setSelectedValue, withDivider }: DropContentProps) {
  const id = open ? 'dropContent-popover' : undefined;
  const anchorEl = open ? containerRef.current : null;

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
    >
      <DropContentContainer container direction='column' item preferredWidth={contentDropWidth}>
        {options.map(({ text, value }, index) => {
          const isLastOne = options.length === index + 1;

          return (
            <>
              {displayContentType === 'text'
                ? (
                  <TextContentDisplay
                    key={index}
                    onChange={onChange}
                    selectedValue={selectedValue}
                    setOpen={setOpen}
                    setSelectedValue={setSelectedValue}
                    text={text}
                    value={value}
                  />)
                : (
                  <LogoContentDisplay
                    key={index}
                    onChange={onChange}
                    selectedValue={selectedValue}
                    setOpen={setOpen}
                    setSelectedValue={setSelectedValue}
                    text={text}
                    value={value}
                  />)
              }
              {withDivider && !isLastOne && <GradientDivider style={{ my: '3px' }} />}
            </>
          );
        })}
      </DropContentContainer>
    </Popover>
  );
}

interface Props {
  style?: SxProps<Theme>;
  defaultValue?: string | number;
  options: DropdownOption[];
  value?: string | number | undefined;
  onChange?: (value: number | string) => void;
  disabled?: boolean;
  displayContentType?: 'logo' | 'text';
  withDivider?: boolean;
}

function DropSelect ({ defaultValue, disabled, displayContentType = 'text', onChange, options, style, value, withDivider = false }: Props) {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<number | string | undefined>(defaultValue);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contentDropWidth = useMemo(() => containerRef.current?.clientWidth, [containerRef.current?.clientWidth]);
  const defaultValueText = useMemo(() => options.find(({ value }) => value === defaultValue)?.text, [defaultValue, options]);
  const selectedValueText = useMemo(() => options.find(({ value: optionValue }) => optionValue === (selectedValue ?? value))?.text, [options, selectedValue, value]);

  const toggleOpen = useCallback(() => !disabled && setOpen((isOpen) => !isOpen), [disabled]);
  const handleClickAway = useCallback(() => setOpen(false), []);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <DropSelectContainer container focused={open} item onClick={toggleOpen} ref={containerRef} sx={style}>
          <Grid alignItems='center' container item sx={{ columnGap: '5px' }} xs>
            {displayContentType === 'logo' && selectedValueText &&
              <>
                <Avatar
                  src={icon(selectedValueText)}
                  sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(value as string) && theme.palette.mode === 'dark') ? 'invert(1)' : 'none', height: 18, width: 18 }}
                  variant='square'
                />
              </>
            }
            <Typography color='text.secondary' variant='B-1'>
              {selectedValueText ?? defaultValueText}
            </Typography>
          </Grid>
          <ArrowDown2 color={open ? '#FF4FB9' : '#AA83DC'} size='16' style={{ rotate: open ? '180deg' : 'none', transition: 'all 250ms ease-out' }} variant='Bold' />
        </DropSelectContainer>
      </ClickAwayListener>
      <DropContent
        containerRef={containerRef}
        contentDropWidth={contentDropWidth}
        displayContentType={displayContentType}
        onChange={onChange}
        open={open}
        options={options}
        selectedValue={selectedValue}
        setOpen={setOpen}
        setSelectedValue={setSelectedValue}
        withDivider={withDivider}
      />
    </>
  );
}

export default DropSelect;
