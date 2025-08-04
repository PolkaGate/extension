// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Stack, Typography } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';

import { GradientButton } from '../../../../components';
import { useFastUnstaking, useTranslation } from '../../../../hooks';
import { CheckEligibility, EligibilityItem, EligibilityStatus } from '../../../../popup/staking/solo-new/fast-unstake/FastUnstake';
import { PROXY_TYPE } from '../../../../util/constants';
import StakingPopup from '../../partials/StakingPopup';
import { FULLSCREEN_STAKING_TX_FLOW, type FullScreenTransactionFlow } from '../../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: () => void;
}

export default function FastUnstaking ({ address, genesisHash, onClose }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { checkDone,
    eligibilityCheck,
    isEligible,
    transactionInformation,
    tx } = useFastUnstaking(address, genesisHash);

  const [flowStep, setFlowStep] = useState<FullScreenTransactionFlow>(FULLSCREEN_STAKING_TX_FLOW.NONE);

  const POPUP_HEIGHT = useMemo(() => {
    if (flowStep === FULLSCREEN_STAKING_TX_FLOW.NONE) {
      return isEligible === undefined ? 450 : 505;
    } else {
      return 605;
    }
  }, [flowStep, isEligible]);

  const onNext = useCallback(() => setFlowStep(FULLSCREEN_STAKING_TX_FLOW.REVIEW), []);
  const closeReview = useCallback(() => {
    setFlowStep(FULLSCREEN_STAKING_TX_FLOW.NONE);
    onClose();
  }, [onClose]);

  return (
    <StakingPopup
      address={address}
      flowStep={flowStep}
      genesisHash={genesisHash}
      maxHeight={POPUP_HEIGHT}
      minHeight={POPUP_HEIGHT}
      onClose={onClose}
      proxyTypeFilter={PROXY_TYPE.STAKING}
      setFlowStep={setFlowStep}
      showBack
      title={t('Fast unstake')}
      transaction={tx}
      transactionInformation={transactionInformation}
    >
      <Stack direction='column' justifyContent='space-between' sx={{ display: 'block', minHeight: '410px', mt: '16px', position: 'relative', px: '15px', rowGap: '12px', zIndex: 1 }}>
        <CheckEligibility loading={!checkDone} />
        <Stack direction='column' justifyContent='space-between' sx={{ rowGap: '12px' }}>
          {
            eligibilityCheck.map(({ status, text }, index) => (
              <EligibilityItem
                done={status}
                key={index}
                text={text}
              />
            ))
          }
        </Stack>
        {!isEligible &&
          <EligibilityStatus
            onBack={closeReview}
            status={isEligible}
          />
        }
        {isEligible &&
          <Stack direction='column' sx={{ bottom: '15px', height: '120px', left: 0, mx: '15px', position: 'absolute', rowGap: '24px', width: 'calc(100% - 30px)' }}>
            <Container disableGutters sx={{ columnGap: '8px', display: 'flex' }}>
              <Warning2 color='#596AFF' size='55' style={{ height: 'fit-content', marginTop: '4px' }} variant='Bold' />
              <Typography color='text.highlight' textAlign='left' variant='B-4'>
                {t('You can proceed to do fast unstake. Note your stake amount will be available within a few minutes after submitting the transaction')}
              </Typography>
            </Container>
            <GradientButton
              disabled={!isEligible || !checkDone}
              onClick={onNext}
              text={t('Next')}
            />
          </Stack>
        }
      </Stack>
    </StakingPopup>
  );
}
