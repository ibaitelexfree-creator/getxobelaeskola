import { query } from '../lib/postgres.js';

/**
 * Middleware to meter token usage (input/output) per user/tenant
 * Estimates token usage based on character count (approx 4 chars/token)
 */
export const tokenMetering = (req, res, next) => {
  // Extract user and tenant context
  const userId = req.headers['x-user-id'] || req.headers['user-id'] || null;
  const tenantId = req.headers['x-tenant-id'] || req.headers['tenant-id'] || null;

  // Estimate Input Tokens
  let inputTokens = 0;
  if (req.body && Object.keys(req.body).length > 0) {
    try {
      const bodyStr = JSON.stringify(req.body);
      inputTokens = Math.ceil(bodyStr.length / 4);
    } catch (e) {
      // Ignore stringify errors
    }
  } else if (req.headers['content-length']) {
      inputTokens = Math.ceil(parseInt(req.headers['content-length']) / 4);
  }

  // Capture Output
  const originalSend = res.send;
  let recorded = false;

  res.send = function (body) {
    if (!recorded) {
        recorded = true;
        let outputTokens = 0;
        if (body) {
            try {
                let length = 0;
                if (typeof body === 'string') {
                    length = body.length;
                } else if (Buffer.isBuffer(body)) {
                    length = body.length;
                } else if (typeof body === 'object') {
                    length = JSON.stringify(body).length;
                }
                outputTokens = Math.ceil(length / 4);
            } catch (e) {
                console.error('[TokenMetering] Error calculating output size:', e);
            }
        }

        // Record asynchronously
        recordUsage({
            userId,
            tenantId,
            inputTokens,
            outputTokens,
            endpoint: req.originalUrl || req.url,
            method: req.method,
            statusCode: res.statusCode
        });
    }

    return originalSend.apply(this, arguments);
  };

  next();
};

async function recordUsage(data) {
  try {
    if (!data.endpoint) return;

    await query(
      `INSERT INTO token_metering
       (user_id, tenant_id, input_tokens, output_tokens, endpoint, method, status_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        data.userId,
        data.tenantId,
        data.inputTokens || 0,
        data.outputTokens || 0,
        data.endpoint,
        data.method,
        data.statusCode
      ]
    );
  } catch (error) {
    // Silent fail to not affect main application
    // console.warn('[TokenMetering] Failed to record usage:', error.message);
  }
}
