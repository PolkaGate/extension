// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { MyPoolInfo, Proxy, TxInfo } from '../../../../../util/types';

import { Close as CloseIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { DraggableModal } from '@polkadot/extension-polkagate/src/fullscreen/governance/components/DraggableModal';
import WaitScreen from '@polkadot/extension-polkagate/src/fullscreen/governance/partials/WaitScreen';

import { useFormatted, useTranslation } from '../../../../../hooks';
import Confirmation from '../../partials/Confirmation';
import Edit from './Edit';
import Review from './Review';
import TxDetail from './TxDetail';

interface Props {
  address: string;
  api: ApiPromise | undefined;
  chain: Chain | null | undefined;
  onClose: () => void;
  pool: MyPoolInfo;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ChangesProps {
  commission: {
    payee: string | undefined | null;
    value: number | undefined | null;
  },
  newPoolName: string | undefined | null;
  newRoles: {
    newRoot: string | undefined | null;
    newNominator: string | undefined | null;
    newBouncer: string | undefined | null;
  } | undefined
}

export const STEPS = {
  INDEX: 1,
  REVIEW: 2,
  WAIT_SCREEN: 3,
  CONFIRM: 4,
  PROXY: 100
};

export default function ManageEditPool ({ address, api, chain, onClose, pool, setRefresh }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const formatted = useFormatted(address);

  const [step, setStep] = useState<number>(STEPS.INDEX);
  const [txInfo, setTxInfo] = useState<TxInfo | undefined>();
  const [changes, setChanges] = useState<ChangesProps | undefined>();
  const [selectedProxy, setSelectedProxy] = useState<Proxy | undefined>();

  return (
    <>
      <DraggableModal minHeight={670} onClose={onClose} open>
        <>
          <Grid alignItems='center' container justifyContent='space-between' pt='15px'>
            <Grid item>
              <Typography fontSize='22px' fontWeight={700}>
                {t<string>('Edit Pool')}
              </Typography>
            </Grid>
            <Grid item>
              <CloseIcon onClick={onClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
            </Grid>
          </Grid>
          {step === STEPS.INDEX &&
            <Edit
              api={api}
              chain={chain}
              changes={changes}
              onClose={onClose}
              pool={pool}
              setChanges={setChanges}
              setStep={setStep}
            />
          }
          {[STEPS.REVIEW, STEPS.PROXY].includes(step) &&
            <Review
              address={address}
              api={api}
              chain={chain}
              changes={changes}
              formatted={String(formatted)}
              pool={pool}
              selectedProxy={selectedProxy}
              setRefresh={setRefresh}
              setSelectedProxy={setSelectedProxy}
              setStep={setStep}
              setTxInfo={setTxInfo}
              step={step}
            />
          }
          {step === STEPS.WAIT_SCREEN &&
            <WaitScreen />
          }
          {step === STEPS.CONFIRM && txInfo &&
            <Confirmation
              handleClose={onClose}
              txInfo={txInfo}
            >
              <TxDetail
                pool={pool}
                txInfo={txInfo}
              />
            </Confirmation>
          }
        </>
      </DraggableModal>
    </>
  );
}
