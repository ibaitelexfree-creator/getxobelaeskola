
export class FallbackChain {
    /**
     * @param {object} primaryClient - The main API client (e.g. Jules)
     * @param {object} secondaryClient - The backup API client (e.g. Flash)
     */
    constructor(primaryClient, secondaryClient) {
        this.primary = primaryClient;
        this.secondary = secondaryClient;
    }

    async post(url, data, config) {
        try {
            return await this.primary.post(url, data, config);
        } catch (err) {
            if (this._isRateLimitError(err)) {
                console.warn(`[FallbackChain] ⚠️ Primary failed (429). Switching to secondary for POST ${url}`);
                if (this.secondary && typeof this.secondary.post === 'function') {
                    return await this.secondary.post(url, data, config);
                }
            }
            throw err;
        }
    }

    async get(url, config) {
        try {
            return await this.primary.get(url, config);
        } catch (err) {
            if (this._isRateLimitError(err)) {
                console.warn(`[FallbackChain] ⚠️ Primary failed (429). Switching to secondary for GET ${url}`);
                if (this.secondary && typeof this.secondary.get === 'function') {
                    return await this.secondary.get(url, config);
                }
            }
            throw err;
        }
    }

    _isRateLimitError(err) {
        return err.response?.status === 429 || err.status === 429;
    }
}
