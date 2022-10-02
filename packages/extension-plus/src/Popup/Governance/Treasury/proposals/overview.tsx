// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveTreasuryProposals } from '@polkadot/api-derive/types';

import { Container, Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Chain } from '../../../../../../extension-chains/src/types';
import useTranslation from '../../../../../../extension-ui/src/hooks/useTranslation';
import { ChainInfo } from '../../../../util/plusTypes';
import Proposals from './Proposals';
import SubmitProposal from './SubmitProposal';

interface Props {
  address: string;
  proposalsInfo: DeriveTreasuryProposals | null;
  chain: Chain;
  chainInfo: ChainInfo;
}

export default function Overview({ address, chain, chainInfo, proposalsInfo }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [showSubmitProposalModal, setShowSubmitProposalModal] = useState<boolean>(false);

  const handleSubmitProposal = useCallback(() => {
    setShowSubmitProposalModal(true);
  }, []);

  const handleSubmitProposalModalClose = useCallback(() => {
    setShowSubmitProposalModal(false);
  }, []);

  if (!proposalsInfo) {
    return (
      <Grid item sx={{ fontSize: 12, paddingTop: 3, textAlign: 'center' }} xs={12}>
        {t('No active proposals')}
      </Grid>
    );
  }

  const { approvals, proposalCount, proposals } = proposalsInfo;

  return (
    <Container disableGutters>
      <Proposals chain={chain} chainInfo={chainInfo} handleSubmitProposal={handleSubmitProposal} proposals={proposals} showSubmit={true} />
      <Proposals chain={chain} chainInfo={chainInfo} proposals={approvals} title={t('approved')} />

      {showSubmitProposalModal &&
        <SubmitProposal
          address={address}
          chain={chain}
          chainInfo={chainInfo}
          handleSubmitProposalModalClose={handleSubmitProposalModalClose}
          showSubmitProposalModal={showSubmitProposalModal}
        />
      }
    </Container>
  );
}
