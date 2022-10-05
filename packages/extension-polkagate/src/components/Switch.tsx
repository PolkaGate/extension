// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@mui/material';
import { Theme } from '@mui/material/styles';
import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';

import { ThemeSwitchContext } from '../../../extension-ui/src/components';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';

interface Props {
  className?: string;
  theme: Theme;
}

function Switch ({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isChecked, setChecked] = useState<boolean>(false);
  const setTheme = useContext(ThemeSwitchContext);

  const _onChangeTheme = useCallback(
    (checked: boolean): void => setTheme(checked ? 'dark' : 'light'),
    [setTheme]
  );

  const _onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      _onChangeTheme(event.target.checked);
      setChecked(!isChecked);
    },
    [_onChangeTheme, isChecked]
  );

  return (
    <div className={className}>
      <Typography
        display='inline'
        fontSize='18px'
        fontWeight={300}
      >
        {t<string>('Light')}
      </Typography>
      <label>
        <input
          checked={isChecked}
          className='checkbox'
          onChange={_onChange}
          type='checkbox'
        />
        <span className='slider' />
      </label>
      <Typography
        display='inline'
        fontSize='18px'
        fontWeight={300}
      >
        {t<string>('Dark')}
      </Typography>
    </div>
  );
}

export default styled(Switch)(({ theme }: Props) => `
  label {
    position: relative;
    display: inline-block;
    width: 41px;
    height: 19.5px;
    margin: 8px;
  }

  .checkbox {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider:before {
      transform: translateX(22px);
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${theme.palette.background.default};
    transition: 0.2s;
    border-radius: 100px;
    border: 1px solid ${theme.palette.secondary.light};

    &:before {
      position: absolute;
      content: '';
      height: 16.2px;
      width: 16.2px;
      left: 0.5px;
      bottom: 0.7px;
      background-color: ${theme.palette.secondary.light};
      transition: 0.4s;
      border-radius: 50%;
    }
  }
`);
