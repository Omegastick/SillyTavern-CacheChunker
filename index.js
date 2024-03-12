import { saveSettingsDebounced } from '../../../../script.js';
import { extension_settings, renderExtensionTemplate } from '../../../extensions.js';
import { getTokenCount, guesstimate } from '../../../tokenizers.js';

const MODULE_NAME = 'CacheChunker';

const settings = {
    enabled: true,

    chunkSize: 2,
    maxMessageHistoryContext: 2000,
};

/**
 * Removes messages from the chat array in chunks of N messages until the max context length is reached, improving
 * cache utilization.
 * @param {object[]} chat Array of chat messages
 */
function trimContext(chat) {
    if (!settings.enabled) {
        return;
    }

    console.debug('Trimming context, message count before:', chat.length);

    const startingPoint = getStartingPoint(chat, settings.maxMessageHistoryContext, settings.chunkSize);
    console.debug('Starting point:', startingPoint);
    chat.splice(0, startingPoint);

    while (getTokenCount(renderChat(chat)) > settings.maxMessageHistoryContext) {
        chat.splice(0, settings.chunkSize);
    }

    console.debug('Trimming context, message count after:', chat.length);
}

function renderChat(chat) {
    return chat.map((message) => {
        return message.mes;
    }).join('\n');
}

/**
 * Uses guesstimate to get a starting point for the chunking process.
 * @param {object[]} chat Array of chat messages
 * @param {number} maxTokens Maximum number of tokens to allow in the chat array
 * @param {number} chunkSize Number of messages to remove at a time
 * @param {number} tolerance Amount added to the estimated starting point as a percentage of the total message count
 * @returns {number} Index of the starting point for the chunking process
 */
function getStartingPoint(chat, maxTokens, chunkSize, tolerance = 0.1) {
    const totalTokens = guesstimate(renderChat(chat));
    const target = maxTokens + (maxTokens * tolerance);

    if (totalTokens <= target) {
        return 0;
    }

    const targetAsPercentage = target / totalTokens;
    const targetWithTolerance = targetAsPercentage + tolerance;
    const index = Math.floor(chat.length * targetWithTolerance);
    const chunkedIndex = index - (index % chunkSize);

    return chunkedIndex;
}

window['CacheChunker_trimContext'] = trimContext;

jQuery(async () => {
    if (!extension_settings.cache_chunker) {
        extension_settings.cache_chunker = settings;
    }

    Object.assign(settings, extension_settings.cache_chunker);

    $('#extensions_settings2').append(renderExtensionTemplate('third-party/' + MODULE_NAME, 'settings'));

    $('#cache_chunker_enabled').prop('checked', settings.enabled).on('input', () => {
        settings.enabled = !!$('#cache_chunker_enabled').prop('checked');
        Object.assign(extension_settings.cache_chunker, settings);
        saveSettingsDebounced();
    });

    $('#cache_chunker_chunk_size').val(settings.chunkSize).on('change', () => {
        settings.chunkSize = Number($('#cache_chunker_chunk_size').val());
        Object.assign(extension_settings.cache_chunker, settings);
        saveSettingsDebounced();
    });

    $('#cache_chunker_max_message_history_context').val(settings.maxMessageHistoryContext).on('change', () => {
        settings.maxMessageHistoryContext = Number($('#cache_chunker_max_message_history_context').val());
        Object.assign(extension_settings.cache_chunker, settings);
        saveSettingsDebounced();
    });
});
