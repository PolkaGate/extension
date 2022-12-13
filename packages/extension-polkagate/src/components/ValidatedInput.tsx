// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useTranslation } from '../hooks';
import { useIsMounted } from '../hooks/';
import { Result, Validator } from '../util/validators';
import Affirm from './Affirm';
import Warning from './Warning';

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
}

function ValidatedInput<T extends Record<string, unknown>>({ className, component: Input, defaultValue, onValidatedChange, validator, ...props }: Props<T>): React.ReactElement<Props<T>> {
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
      style={{
        margin: 'auto',
        paddingTop: '21px',
        width: '92%'
      }}
    >
      <Input
        {...props as unknown as T}
        isError={value && Result.isError(validationResult)}
        onChange={setValue}
        value={value}
      />
      {value && Result.isOk(validationResult) && props.dataInputRepeatPassword && (
        <Affirm
          isAffirm
          isBelowInput
          theme={theme}
        >
          {t<string>('Password match')}
        </Affirm>
      )}
      {value && Result.isError(validationResult) && (
        <Warning
          isBelowInput
          isDanger
          theme={theme}
        >
          {validationResult.error.errorDescription}
        </Warning>
      )}
    </div>
  );
}

export default ValidatedInput;
