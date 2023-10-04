// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { Affirm, Warning } from '../../../components';
import { useIsMounted, useTranslation } from '../../../hooks';
import { Result, Validator } from '../../../util/validators';

interface BasicProps {
  isError?: boolean;
  value?: string | null;
  onChange?: (value: string) => void;
}

type Props<T extends BasicProps> = T & {
  className?: string;
  component: React.ComponentType<T>;
  defaultValue?: string;
  onValidatedChange: (value: string | null) => void;
  validator: Validator<string>;
  onEnter?: () => void;
  isFocused?: boolean;
  style?: React.CSSProperties;
}

function ValidatedInput2<T extends Record<string, unknown>>({ className, component: Input, defaultValue, isFocused, onEnter, onValidatedChange, style, validator, ...props }: Props<T>): React.ReactElement<Props<T>> {
  const [value, setValue] = useState(defaultValue || '');
  const [validationResult, setValidationResult] = useState<Result<string>>(Result.ok(''));
  const isMounted = useIsMounted();
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    // Do not show any error on first mount
    if (!isMounted) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async (): Promise<void> => {
      const result = await validator(value);

      setValidationResult(result);
      onValidatedChange(Result.isOk(result) ? value : null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, validator, onValidatedChange]);

  return (
    <div
      className={className}
      style={style}
    >
      <Input
        {...props as unknown as T}
        isError={value && Result.isError(validationResult)}
        isFocused={isFocused}
        onChange={setValue}
        onEnter={onEnter}
        value={value}
      />
      {value && Result.isOk(validationResult) && props.dataInputRepeatPassword &&
        <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '30px', width: '400px' }}>
          <Affirm
            isAffirm
            isBelowInput
            theme={theme}
          >
            {t<string>('Password match')}
          </Affirm>
        </Grid>
      }
      {value && Result.isError(validationResult) &&
        <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '30px', width: '400px' }}>
          <Warning
            isBelowInput
            isDanger
            theme={theme}
          >
            {validationResult.error.errorDescription}
          </Warning>
        </Grid>
      }
    </div>
  );
}

export default ValidatedInput2;
