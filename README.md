# Cache Chunker

If you naively trim the oldest messages from context, you'll have to rebuild the cache every message once you hit the context limit. This extension instead trims N messages at a time, so you only have to rebuild the cache every N messages.

## Configuration

There are two settings you can configure for this extension:

- Chunk Size: The number of messages to trim at a time. Default is 10.
- Max Message History Context: This is the maximum length of the messages part of the context. This should be roughly `max context length - character card length`. I'd like to automate this in the future.
