// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CreateMLCEngine, hasModelInCache } from '@mlc-ai/web-llm';
import { LinearProgress, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { AI_MODEL_ID, DEFAULT_MODEL_ID } from '@polkadot/extension-base/background/handlers/txAiAgent';
import { ActionButton, DecisionButtons, GradientButton, Motion, Radio, TwoToneText } from '@polkadot/extension-polkagate/src/components';
import { useAlerts, useTranslation } from '@polkadot/extension-polkagate/src/hooks';
import { getStorage, setStorage } from '@polkadot/extension-polkagate/src/util';

import { DraggableModal } from '../../components/DraggableModal';

interface Props {
    onCancel: () => void;
    onClose: () => void;
}

const BUTTONS_STYLE = { height: '44px', mt: '65px', width: '100%' };

const DownloadSection = ({ model, onCancel, onDone, progress }: { model: string; progress: number; onCancel: () => void; onDone: () => void; }) => {
    const { t } = useTranslation();

    const handleCancel = useCallback(() => {
        onCancel();
        window.location.reload();
    }, [onCancel]);

    const normalizedModelName = model.replace('(Recommended)', '');

    return (
        <Motion>
            <Stack alignItems='center' direction='column' sx={{ mt: '20px' }}>
                <Typography color='text.primary' sx={{ textAlign: 'left' }} variant='B-1'>
                    <TwoToneText
                        text={t('Downloading and applying the {{normalizedModelName}} model. This may take a few minutes depending on the model size and your device performance', { replace: { normalizedModelName } })}
                        textPartInColor={normalizedModelName}
                    />
                </Typography>
                <Typography color='text.primary' sx={{ mt: '15px', textAlign: 'left' }} variant='B-1'>
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
    const { notify } = useAlerts();

    const PREFERRED_AI_MODELS = useMemo(() => [
        { description: t('Balanced speed and accuracy (Recommended)'), id: 'gemma-2-2b-it-q4f16_1-MLC', name: 'Gemma 2 - 2B' },
        { description: t('Better reasoning, slightly slower'), id: 'Phi-3.5-mini-instruct-q4f16_1-MLC', name: 'Phi 3.5 mini - 3B' },
        { description: t('Highest accuracy, higher resource usage'), id: 'Qwen3-4B-q4f16_1-MLC', name: 'Qwen3-4B' },
        { description: t(' Strong general-purpose model'), id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC', name: 'Llama 3.2 - 3B' }
    ], [t]);

    useEffect(() => {
        // Initialize the selected model from storage
        getStorage(AI_MODEL_ID).then((modelId) => {
            setSelectedModel(modelId as string | undefined ?? DEFAULT_MODEL_ID);
        }).catch(console.error);
    }, []);

    const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
    const [progress, setProgress] = useState<number>(0); // 0–1
    const [isModelInCache, setIsModelInCache] = useState<boolean>();

    const selectedModelName = useMemo(() => PREFERRED_AI_MODELS.find(({ id }) => id === selectedModel)?.name, [PREFERRED_AI_MODELS, selectedModel]);

    useEffect(() => {
        if (!selectedModel) {
            return;
        }

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
        if (!selectedModel) {
            return;
        }

        setStorage(AI_MODEL_ID, selectedModel).catch(console.error);

        if (isModelInCache) {
            return onClose();
        }

        setProgress(0.0001); // start progress

        CreateMLCEngine(selectedModel, {
            initProgressCallback: ({ progress, text }) => {
                console.info('Downloading AI model:', text);
                progress && setProgress(progress);
            }
        }).catch((error: unknown) => {
            const message = error instanceof Error ? error.message : String(error);

            notify(message, 'error');
        });
    }, [isModelInCache, notify, onClose, selectedModel]);

    return (
        <DraggableModal
            onClose={onClose}
            open
            showBackIconAsClose
            style={{ minHeight: '400px', padding: '20px' }}
            title={progress ? t('Downloading AI Model') : t('AI Model Management')}
        >
            {progress && selectedModelName
                ? <DownloadSection
                    model={selectedModelName}
                    onCancel={onCancel}
                    onDone={onClose}
                    progress={progress}
                  />
                : <>
                    <Typography color='#BEAAD8' sx={{ display: 'block', p: '10px 0', textAlign: 'left', width: '100%' }} variant='B-4'>
                        {t('Choose the AI model for transaction analysis. You can switch models based on speed, accuracy, and resource usage.')}
                    </Typography>
                    <Stack alignItems='center' columnGap='10px' direction='column' sx={{ alignItems: 'flex-start', mt: '20px' }}>
                        {PREFERRED_AI_MODELS.map((model, index) => {
                            const checked = model.id === selectedModel;

                            return (
                                <Stack direction='column' key={index} sx={{ alignItems: 'left' }}>
                                    <Radio
                                        checked={checked}
                                        columnGap='5px'
                                        label={model.description}
                                        onChange={onChangeModel}
                                        value={model.id}
                                    />
                                    <Typography color='#674394' sx={{ m: '-5px 0 0 36px', textAlign: 'left' }} variant='B-5'>
                                        {model.name}
                                    </Typography>
                                </Stack>
                            );
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
