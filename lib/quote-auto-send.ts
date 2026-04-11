/**
 * When `QUOTE_AUTO_SEND` is not `"false"`, AI quotes email the client immediately after save.
 * Set `QUOTE_AUTO_SEND=false` for review mode: draft stays unsent until an admin sends it.
 */
export function isQuoteAutoSendEnabled(): boolean {
  return process.env.QUOTE_AUTO_SEND !== 'false'
}
