// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import { Stack } from '@mui/material';
import React, { type CSSProperties, memo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

import ValidatorInformationFS from '../../partials/ValidatorInformationFS';
import ValidatorItem from './ValidatorItem';

interface NominatorsTableProp {
  genesisHash: string;
  validatorsInformation: ValidatorInformation[];
  onSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selected?: string[];
}

function ValidatorsTable ({ genesisHash, onSelect, selected, validatorsInformation }: NominatorsTableProp): React.ReactElement {
  const [validatorDetail, setValidatorDetail] = React.useState<ValidatorInformation | undefined>(undefined);

  const toggleValidatorDetail = useCallback((validatorInfo: ValidatorInformation | undefined) => () => {
    setValidatorDetail(validatorInfo);
  }, []);

  return (
    <>
      <Stack direction='column' sx={{ height: 'fit-content', width: '100%' }}>
        <List
          height={474}
          itemCount={validatorsInformation.length}
          itemSize={84}
          style={{ paddingBottom: '15px' }}
          width='100%'
        >
          {({ index, style }: { index: number, style: CSSProperties }) => {
            const validatorInfo = validatorsInformation[index];

            return (
              <div key={index} style={{ ...style }}>
                <ValidatorItem
                  genesisHash={genesisHash}
                  isSelected={selected ? selected.includes(validatorInfo.accountId.toString()) : undefined}
                  onDetailClick={toggleValidatorDetail(validatorInfo)}
                  onSelect={onSelect}
                  selectable={!!onSelect}
                  validatorInfo={validatorInfo}
                />
              </div>
            );
          }}
        </List>
      </Stack>
      {validatorDetail &&
        <ValidatorInformationFS
          genesisHash={genesisHash}
          onClose={toggleValidatorDetail(undefined)}
          validator={validatorDetail}
        />}
    </>
  );
}

export default memo(ValidatorsTable);
