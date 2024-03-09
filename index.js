import { saveSettingsDebounced } from '../../../../script.js';
import { extension_settings, renderExtensionTemplate } from '../../../extensions.js';
import { getTokenCount } from '../../../tokenizers.js';

const MODULE_NAME = 'CacheChunker';

const settings = {
    chunkSize: 2,
    maxMessageHistoryContext: 2000,
};

/**
 * Removes messages from the chat array in chunks of N messages until the max context length is reached, improving
 * cache utilization.
 * @param {object[]} chat Array of chat messages
 */
function trimContext(chat) {
    console.debug('Trimming context, message count before:', chat.length);

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

window['CacheChunker_trimContext'] = trimContext;

jQuery(async () => {
    if (!extension_settings.cache_chunker) {
        extension_settings.cache_chunker = settings;
    }

    Object.assign(settings, extension_settings.cache_chunker);

    $('#extensions_settings2').append(renderExtensionTemplate('third-party/' + MODULE_NAME, 'settings'));

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
