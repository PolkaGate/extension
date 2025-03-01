// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Autocomplete, Grid, type SxProps, TextField, type Theme, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useProfiles } from '../hooks';
import Label from './Label';

interface Props {
  disabled?: boolean;
  helperText?: string;
  label: string;
  placeHolder?: string;
  profileName: string | undefined;
  setProfileName: React.Dispatch<React.SetStateAction<string | undefined>>;
  style?: SxProps<Theme>;
}

export default function ProfileInput({ disabled = false, helperText = '', label, placeHolder = '', profileName, setProfileName, style }: Props): React.ReactElement<Props> {
  const containerRef = useRef<HTMLDivElement>(null);

  const { userDefinedProfiles } = useProfiles();

  const [isPopperOpen, setTogglePopper] = useState<boolean>(false);
  const [focus, setFocus] = useState<boolean>(false);
  const [enteredProfile, setEnteredProfile] = useState<string | undefined>();
  const [dropdownWidth, setDropdownWidth] = useState<string>('0');

  const autocompleteOptions = useMemo(() => userDefinedProfiles.map((profile, index) => ({ index, profile })), [userDefinedProfiles]);

  useEffect(() => {
    profileName && setEnteredProfile(profileName);
  }, [profileName]);

  useEffect(() => {
    if (containerRef) {
      setDropdownWidth(`${(containerRef.current?.offsetWidth || 0)}px`);
    }
  }, [containerRef?.current?.offsetWidth]);

  const handleProfile = useCallback((value?: string): void => {
    setTogglePopper(false);

    if (!value) {
      setProfileName(undefined);
      setEnteredProfile(undefined);

      return;
    }

    setEnteredProfile(value);
    setProfileName(value);
  }, [setProfileName]);

  const openPopper = useCallback(() =>
    userDefinedProfiles.length > 0 && !enteredProfile && !isPopperOpen && setTogglePopper(true)
    , [userDefinedProfiles.length, enteredProfile, isPopperOpen]);

  const closePopper = useCallback(() =>
    setTogglePopper(false)
    , []);

  return (
    <Grid alignItems='flex-end' container justifyContent='space-between' ref={containerRef} sx={{ position: 'relative', ...style }}>
      <Label
        helperText={helperText}
        label={label}
        style={{ position: 'relative', width: '100%' }}
      >
        <Autocomplete
          componentsProps={{ paper: { sx: { '> ul': { m: 0, p: 0 }, border: '2px solid', borderColor: 'secondary.light', maxHeight: window.innerHeight / 2, ml: '-1px', my: '5px', p: 0, width: dropdownWidth } } }}
          disableClearable
          disabled={disabled || !autocompleteOptions}
          freeSolo
          // eslint-disable-next-line react/jsx-no-bind
          getOptionLabel={(option) => option?.toString() || ''}
          inputValue={enteredProfile ?? ''}
          // eslint-disable-next-line react/jsx-no-bind
          onBlur={() => setFocus(false)}
          onClose={closePopper}
          // eslint-disable-next-line react/jsx-no-bind
          onFocus={() => setFocus(true)}
          onOpen={openPopper}
          open={isPopperOpen && !enteredProfile}
          options={autocompleteOptions as unknown[]}
          // eslint-disable-next-line react/jsx-no-bind
          renderInput={(params) => (
            <TextField
              {...params}
              InputProps={{
                ...params.InputProps
              }}
              // eslint-disable-next-line react/jsx-no-bind
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleProfile(event.target.value)}
              placeholder={placeHolder}
              sx={{ '> div.MuiOutlinedInput-root': { '> fieldset': { border: 'none' }, '> input.MuiAutocomplete-input': { border: 'none', lineHeight: '31px', p: 0 }, border: 'none', height: '31px', p: 0, px: '5px' }, bgcolor: 'background.paper', border: `${focus ? '2px' : '1px'} solid`, borderColor: `${focus ? 'action.focus' : 'secondary.light'}`, borderRadius: '5px', height: '32px', lineHeight: '31px' }}
            />
          )}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          // eslint-disable-next-line react/jsx-no-bind
          renderOption={(_props, { index, profile }: { index: number, profile: string }) => {
            return (
              // eslint-disable-next-line react/jsx-no-bind
              <Grid alignItems='center' container item justifyContent='space-between' key={index} onClick={() => handleProfile(profile)} sx={{ '&:not(:last-child)': { borderBottom: '1px solid', borderBottomColor: 'secondary.light', mb: '5px' }, cursor: 'pointer', p: '5px' }}>
                <Typography fontSize='12px' fontWeight={400} lineHeight='25px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
                  {profile}
                </Typography>
              </Grid>);
          }}
          sx={{ border: 'none', height: '31px', p: 0 }}
        />
      </Label>
    </Grid>
  );
}
