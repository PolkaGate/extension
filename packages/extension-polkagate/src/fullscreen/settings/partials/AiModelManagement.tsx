// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CreateMLCEngine, hasModelInCache } from '@mlc-ai/web-llm';
import { LinearProgress, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { ActionButton, DecisionButtons, GradientButton, Motion, Radio } from '@polkadot/extension-polkagate/src/components';
import { useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { setStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

import { DraggableModal } from '../../components/DraggableModal';

interface Props {
    onCancel: () => void;
    onClose: () => void;
}

const PREFERRED_AI_MODELS = [
    { id: 'gemma-2-2b-it-q4f16_1-MLC', name: 'Gemma 2 - 2B (Recommended)' },
    { id: 'Phi-3.5-mini-instruct-q4f16_1-MLC', name: 'Phi 3.5 mini - 3B' },
    { id: 'Qwen3-4B-q4f16_1-MLC', name: 'Qwen3-4B' },
    { id: 'SmolLM2-360M-Instruct-q4f16_1-MLC', name: 'SmolLM2 - 360M' },
    { id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC', name: 'Llama 3.2 - 3B' }
];

const BUTTONS_STYLE = { height: '44px', mt: '65px', width: '100%' };

const DownloadSection = ({ onCancel, onDone, progress }: { progress: number; onCancel: () => void; onDone: () => void; }) => {
    const { t } = useTranslation();

    const handleCancel = useCallback(() => {
        onCancel();
        window.location.reload();
    }, [onCancel]);

    return (
        <Motion>
            <Stack alignItems='center' direction='column' sx={{ mt: '20px' }}>
                <Typography color='text.primary' sx={{ textAlign: 'left' }} variant='B-2'>
                    {t('Downloading and applying the selected AI model. This may take a few minutes depending on the model size and your device performance')}.
                </Typography>
                <Typography color='text.primary' sx={{ mt: '15px', textAlign: 'left' }} variant='B-2'>
                    {t('Please do not close the extension or navigate away during this process')}.
                </Typography>
                <Typography color='text.secondary' sx={{ mt: '50px', textAlign: 'left', width: '100%' }} variant='B-4'>
                    {t('Downloading')}: {(progress * 100).toFixed(2)}%
                </Typography>
                <LinearProgress sx={{ borderRadius: '14px', mt: '8px', width: '100%' }} value={progress * 100} variant='determinate' />
                {progress < 1
                    ? <ActionButton
                        contentPlacement='center'
                        onClick={handleCancel}
                        style={BUTTONS_STYLE}
                        text={t('Cancel')}
                      />
                    : <GradientButton
                        onClick={onDone}
                        style={BUTTONS_STYLE}
                        text={t('Done')}
                      />
                }
            </Stack>
        </Motion>
    );
};

export default function AiModelManagement ({ onCancel, onClose }: Props): React.ReactElement {
    const { t } = useTranslation();

    const [selectedModel, setSelectedModel] = useState<string>(PREFERRED_AI_MODELS[0].id);
    const [progress, setProgress] = useState<number>(0); // 0–100
    const [isModelInCache, setIsModelInCache] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        const checkSelectedModelInCache = async () => {
            const inCache = await hasModelInCache(selectedModel);

            setIsModelInCache(inCache);
        };

        checkSelectedModelInCache().catch(console.error);
    }, [selectedModel]);

    const onChangeModel = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setIsModelInCache(undefined);
        setSelectedModel(event.target.value);
    }, []);

    const onDownloadAndApply = useCallback(() => {
        setStorage(STORAGE_KEY.AI_MODEL_ID, selectedModel).catch(console.error);

        if (isModelInCache) {
            return onClose();
        }

        setProgress(0.0001); // start progress

        CreateMLCEngine(selectedModel, {
            initProgressCallback: ({ progress, text }) => {
                console.log('Downloading model:', text);
                progress && setProgress(progress);
            }
        }).catch(console.error);
    }, [isModelInCache, onClose, selectedModel]);

    return (
        <DraggableModal
            closeOnAnyWhereClick
            onClose={onClose}
            open
            showBackIconAsClose
            style={{ minHeight: '400px', padding: '20px' }}
            title={t('AI Model Management')}
        >
            {progress
                ? <DownloadSection
                    onCancel={onCancel}
                    onDone={onClose}
                    progress={progress}
                  />
                : <>
                    <Typography color='#BEAAD8' sx={{ p: '10px 0', textAlign: 'left', width: '100%' }} variant='B-4'>
                        {t('Choose the AI model you want to use for transaction analysis. You can switch between different models based on your preferences for speed, accuracy, and resource usage.')}
                    </Typography>
                    <Stack alignItems='center' columnGap='10px' direction='column' sx={{ alignItems: 'flex-start', mt: '20px' }}>
                        {PREFERRED_AI_MODELS.map((model, index) => {
                            const checked = model.id === selectedModel;

                            return (
                                <Radio
                                    checked={checked}
                                    columnGap='5px'
                                    key={index}
                                    label={model.name}
                                    onChange={onChangeModel}
                                    value={model.id}
                                />);
                        })}
                    </Stack>
                    <DecisionButtons
                        cancelButton
                        direction='horizontal'
                        isBusy={isModelInCache === undefined}
                        onPrimaryClick={onDownloadAndApply}
                        onSecondaryClick={onCancel}
                        primaryBtnText={isModelInCache ? t('Apply') : isModelInCache === false ? t('Download and Apply') : t('Loading...')}
                        secondaryBtnText={t('Cancel')}
                        showChevron
                        style={{ marginTop: '25px', width: '100%' }}
                    />
                </>}
        </DraggableModal>
    );
}
