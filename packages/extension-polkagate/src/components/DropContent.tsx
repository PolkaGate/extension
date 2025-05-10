// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
import type { DropdownOption } from '../util/types';

import { Avatar, Grid, Popover, styled, Typography } from '@mui/material';
import { Global } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import { useIsDark } from '../hooks';
import { GradientDivider } from '../style';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { CHAINS_WITH_BLACK_LOGO } from '../util/constants';
import getLogo from '../util/getLogo';
import GlowCheck from './GlowCheck';

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
  Icon?: Icon;
  onChange?: (value: number | string) => void;
  setSelectedValue: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | number | undefined;
  text: string | number;
  value: string | number;
  logoType?: 'logo' | 'icon' | 'account' | undefined;
  showCheckAsIcon?: boolean;
}

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

function LogoContentDisplay({ Icon, logoType, onChange, selectedValue, setOpen, setSelectedValue, showCheckAsIcon, text, value }: ContentDisplayProps) {
  const isSelectedItem = useMemo(() => [text, value].includes(selectedValue ?? ''), [selectedValue, text, value]);

  const handleClick = useCallback(() => {
    setSelectedValue(value);
    setOpen(false);
    onChange && onChange(value);
  }, [onChange, setOpen, setSelectedValue, value]);

  return (
    <ContentDisplayContainer container isSelectedItem={isSelectedItem} item onClick={handleClick} style={{ justifyContent: 'space-between' }}>
      <Grid alignItems='center' container item sx={{ columnGap: '5px', flexWrap: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'nowrap' }} xs>
        {logoType === 'account'
          ? showCheckAsIcon && isSelectedItem
            ? <GlowCheck
              show={isSelectedItem}
              size='18px'
              timeout={100}
            />
            : <PolkaGateIdenticon
              address={value}
              size={18}
            />
          : Icon
            ? <Icon color='#BEAAD8' size='18' variant='Bulk' />
            : <Logo
              text={text as string}
            />
        }
        <Typography color='text.primary' textTransform='capitalize' variant='B-2'>
          {text}
        </Typography>
      </Grid>
      {
        !showCheckAsIcon &&
        <GlowCheck
          show={isSelectedItem}
          size='15px'
          timeout={100}
        />
      }
    </ContentDisplayContainer>
  );
}

function TextContentDisplay({ onChange, selectedValue, setOpen, setSelectedValue, text, value }: ContentDisplayProps) {
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
  Icon?: Icon;
  displayContentType?: 'logo' | 'text' | 'icon' | 'account';
  options: DropdownOption[];
  open: boolean;
  onChange?: (value: number | string) => void;
  setSelectedValue: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | number | undefined;
  showCheckAsIcon?: boolean;
  withDivider: boolean;
}

function DropSelect({ Icon, containerRef, contentDropWidth, displayContentType, onChange, open, options, selectedValue, setOpen, setSelectedValue, showCheckAsIcon, withDivider }: DropContentProps) {
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
                    Icon={Icon}
                    key={index}
                    logoType={displayContentType}
                    onChange={onChange}
                    selectedValue={selectedValue}
                    setOpen={setOpen}
                    setSelectedValue={setSelectedValue}
                    showCheckAsIcon={showCheckAsIcon}
                    text={text}
                    value={value}
                  />)
              }
              {withDivider && !isLastOne &&
                <GradientDivider style={{ my: '3px' }} />
              }
            </>
          );
        })}
      </DropContentContainer>
    </Popover>
  );
}

export default DropSelect;
