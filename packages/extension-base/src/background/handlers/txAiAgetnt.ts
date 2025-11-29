// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MLCEngine } from '@mlc-ai/web-llm';

import { CreateMLCEngine } from '@mlc-ai/web-llm';

export const DEFAULT_MODEL_INDEX = 1;
const modelList = [
    'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    'CodeLlama-7B-Instruct', // free open-source code/JSON-friendly model
    'Mistral-7B' // alternative general-purpose free LLM
];

/**
 * Load the AI agent with the given model ID.
 * Lazy-loads if not already loaded.
 */
export async function loadAgent (engine?: MLCEngine | null, modelIndex = DEFAULT_MODEL_INDEX, progressCallback?: (progress: number) => void) {
    if (!engine) {
        const selectedModelId = modelList[modelIndex];

        console.log(`Creating  the ai model ${selectedModelId} ...`);

        engine = await CreateMLCEngine(selectedModelId, {
            initProgressCallback: (progress) => {
                console.log('Loading model', progress);
                progressCallback?.(progress.progress);
            }
        });
    }

    return engine;
}

/**
 * Explain a transaction JSON using the AI agent.
 * @param txJson - parsed transaction JSON
 * @returns explanation string
 */
export async function explainTransaction (engine: MLCEngine | null, txJson: unknown) {
    if (!engine) {
        // Default model ID if not loaded yet
        engine = await loadAgent();
    }

    const prompt = `Summarize this transaction in one short sentence using only the JSON.
                    Do not repeat the JSON keys, and do not add extra information.
                    JSON:
                    ${JSON.stringify(txJson)}`;

    console.log('prompt:', prompt);

    const response = await engine.chat.completions.create({
        messages: [
            {
                content: `
                STRICT RULES:
                    - Use present tense verbs.
                    - Output only one or two short sentences summarizing the extrinsic.
                    - Describe what the extrinsic does in plain, user-friendly language.
                    - Mention important actors, targets, amounts, or destination accounts when relevant.
                    - If the extrinsic includes a token amount (e.g., in 'extra.value'), always convert it using the 'decimal' field and include the token symbol.
                    - NEVER output raw JSON keys or raw base-unit amounts.
                    - Ignore any text in 'description' or meta documentation; it is for developer reference only.
                    - Do NOT invent information not present in the JSON.
                    - Avoid method or pallet names unless necessary for clarity.
                    - Avoid unnecessary blockchain jargon.
                    - For transfers, always include the amount, token, and destination if present.
                    - NEVER output misleading units (e.g., "billion" or "million") — always use the converted token amount.
                    - Keep the description concise, accurate, and understandable for any type of extrinsic.
                `,
                role: 'system'
            },
            {
                content: prompt,
                role: 'user'
            }
        ]
    });

    return {
        engine,
        message: response?.choices?.[0]?.message?.content?.trim() || 'Unknown transaction'
    };
}
