// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AdvancedDropdownOption } from '../util/types';

import { Avatar, Grid, Popover, styled, Typography, useTheme } from '@mui/material';
import { Global } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useIsDark, useTranslation } from '../hooks';
import { GradientDivider } from '../style';
import PolkaGateIdenticon from '../style/PolkaGateIdenticon';
import { CHAINS_WITH_BLACK_LOGO } from '../util/constants';
import resolveLogoInfo from '../util/logo/resolveLogoInfo';
import GlowCheck from './GlowCheck';
import SearchField from './SearchField';

const DropContentContainer = styled(Grid, {
  shouldForwardProp: (prop) => prop !== 'preferredWidth'
})(({ preferredWidth, theme }: { preferredWidth: number | undefined; theme?: any }) => ({
  background: theme.palette.mode === 'dark' ? '#05091C' : '#FFFFFF',
  border: '4px solid',
  borderColor: theme.palette.mode === 'dark' ? '#1B133C' : '#EEF1FF',
  borderRadius: '12px',
  boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 12px 32px rgba(133, 140, 176, 0.18)',
  columnGap: '5px',
  flexWrap: 'nowrap',
  margin: 'auto',
  marginTop: '4px',
  maxHeight: '300px',
  overflow: 'hidden',
  overflowY: 'auto',
  padding: '6px',
  rowGap: '4px',
  transition: 'all 250ms ease-out',
  width: preferredWidth ? `${preferredWidth}px` : 'fit-content'
}));

const ContentDisplayContainer = styled(Grid, { shouldForwardProp: (prop) => prop !== 'isSelectedItem' })(({ isSelectedItem, style, theme }: { isSelectedItem: boolean, style: React.CSSProperties, theme?: any }) => ({
  '&:hover': { background: theme.palette.mode === 'dark' ? '#6743944D' : '#F3F6FD' },
  alignItems: 'center',
  background: isSelectedItem ? (theme.palette.mode === 'dark' ? '#6743944D' : '#EEF2FB') : 'transparent',
  borderRadius: '8px',
  columnGap: '5px',
  cursor: 'pointer',
  minWidth: '150px',
  padding: '10px 8px',
  ...style
}));

interface ContentDisplayProps {
  Icon?: React.ElementType | React.JSX.Element;
  onChange?: (value: number | string) => void;
  setSelectedValue: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | number | undefined;
  style?: React.CSSProperties
  text: string | number;
  value: string | number;
  logoType?: 'logo' | 'icon' | 'account' | 'iconOption' | undefined;
  showCheckAsIcon?: boolean;
}

function OptionLogo({ text }: { text: string }) {
  const theme = useTheme();
  const isDark = useIsDark();
  const icon = resolveLogoInfo(text)?.logo;

  return (
    <Avatar
      src={icon}
      sx={{ borderRadius: '50%', filter: (CHAINS_WITH_BLACK_LOGO.includes(text) && isDark) ? 'invert(1)' : 'none', height: 18, width: 18 }}
      variant='square'
    >
      {!icon &&
        <Global color={isDark ? '#AA83DC' : theme.palette.text.secondary} size='18' variant='Bulk' />
      }
    </Avatar>
  );
}

function LogoContentDisplay({ Icon, logoType, onChange, selectedValue, setOpen, setSelectedValue, showCheckAsIcon, text, value }: ContentDisplayProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isSelectedItem = useMemo(() => [text, value].includes(selectedValue ?? ''), [selectedValue, text, value]);

  const handleClick = useCallback(() => {
    setSelectedValue(value);
    setOpen(false);
    onChange && onChange(value);
  }, [onChange, setOpen, setSelectedValue, value]);

  const renderLogo = () => {
    if (logoType === 'account') {
      if (showCheckAsIcon && isSelectedItem) {
        return (
          <GlowCheck
            show={isSelectedItem}
            size='18px'
            timeout={100}
          />
        );
      }

      return (
        <PolkaGateIdenticon
          address={String(value)}
          size={18}
        />
      );
    }

    if (Icon) {
      if (React.isValidElement(Icon)) {
        return Icon;
      }

      if (typeof Icon === 'function' || typeof Icon === 'object') {
        const Component = Icon as React.ElementType;

        return <Component color={isDark ? '#BEAAD8' : theme.palette.text.secondary} size='18' variant='Bulk' />;
      }
    }

    return <OptionLogo text={text as string} />;
  };

  return (
    <ContentDisplayContainer container isSelectedItem={isSelectedItem} item onClick={handleClick} style={{ justifyContent: 'space-between' }}>
      <Grid alignItems='center' container item sx={{ columnGap: '5px', flexWrap: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textWrap: 'nowrap' }} xs>
        {
          showCheckAsIcon && isSelectedItem
            ? (
              <GlowCheck
                show={isSelectedItem}
                size='15px'
                timeout={250}
              />)
            : renderLogo()
        }
        <Typography color={isSelectedItem ? '#FF4FB9' : 'text.primary'} textTransform='capitalize' variant='B-2'>
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

function TextContentDisplay({ onChange, selectedValue, setOpen, setSelectedValue, showCheckAsIcon = true, style = {}, text, value }: ContentDisplayProps) {
  const isSelectedItem = useMemo(() => [text, value].includes(selectedValue ?? ''), [selectedValue, text, value]);

  const handleClick = useCallback(() => {
    setSelectedValue(value);
    setOpen(false);
    onChange && onChange(value);
  }, [onChange, setOpen, setSelectedValue, value]);

  return (
    <ContentDisplayContainer container isSelectedItem={isSelectedItem} item onClick={handleClick} style={style}>
      {
        showCheckAsIcon &&
        <GlowCheck
          show={isSelectedItem}
          size='15px'
          timeout={250}
        />
      }
      <Typography color={isSelectedItem ? '#FF4FB9' : 'text.primary'} textTransform='capitalize' variant='B-2'>
        {text}
      </Typography>
    </ContentDisplayContainer>
  );
}

interface DropContentProps {
  contentDropWidth: number | undefined;
  containerRef: React.RefObject<HTMLDivElement | null>;
  Icon: React.ElementType | React.JSX.Element | undefined;
  displayContentType?: 'logo' | 'text' | 'icon' | 'account' | 'iconOption';
  enableSearch?: boolean;
  options: AdvancedDropdownOption[];
  open: boolean;
  onChange?: (value: number | string) => void;
  searchPlaceholder?: string;
  setSelectedValue: React.Dispatch<React.SetStateAction<string | number | undefined>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | number | undefined;
  style?: React.CSSProperties;
  showCheckAsIcon?: boolean;
  withDivider: boolean;
}

function DropSelect({ Icon, containerRef, contentDropWidth, displayContentType, enableSearch = false, onChange, open, options, searchPlaceholder, selectedValue, setOpen, setSelectedValue, showCheckAsIcon, style = {}, withDivider }: DropContentProps) {
  const id = open ? 'dropContent-popover' : undefined;
  const anchorEl = open ? containerRef.current : null;
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (!open) {
      setSearchValue('');
    }
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchValue.trim()) {
      return options;
    }

    const normalizedSearch = searchValue.trim().toLowerCase();

    return options.filter(({ text, value }) =>
      text.toString().toLowerCase().includes(normalizedSearch) ||
      value.toString().toLowerCase().includes(normalizedSearch)
    );
  }, [enableSearch, options, searchValue]);

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
            backgroundImage: 'none',
            boxShadow: 'none'
          }
        }
      }}
    >
      <DropContentContainer container direction='column' item preferredWidth={contentDropWidth}>
        {enableSearch &&
          <SearchField
            focused
            onInputChange={setSearchValue}
            placeholder={searchPlaceholder ?? t('Search')}
            style={{ marginBottom: '4px' }}
          />
        }
        {filteredOptions.map(({ Icon: IconOption, text, value }, index) => {
          const isLastOne = filteredOptions.length === index + 1;

          const optionKey = `${String(value)}-${String(text)}`;

          return (
            <React.Fragment key={optionKey}>
              {displayContentType === 'text'
                ? (
                  <TextContentDisplay
                    onChange={onChange}
                    selectedValue={selectedValue}
                    setOpen={setOpen}
                    setSelectedValue={setSelectedValue}
                    showCheckAsIcon={showCheckAsIcon}
                    style={style}
                    text={text}
                    value={value}
                  />)
                : (
                  <LogoContentDisplay
                    Icon={IconOption ?? Icon}
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
            </React.Fragment>
          );
        })}
        {enableSearch && !filteredOptions.length &&
          <Typography color='text.secondary' sx={{ px: '8px', py: '10px', textAlign: 'center' }} variant='B-2'>
            {t('Nothing Found')}
          </Typography>
        }
      </DropContentContainer>
    </Popover>
  );
}

export default DropSelect;
