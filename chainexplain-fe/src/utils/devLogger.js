/**
 * Utility logger that only runs in development mode.
 * Helps trace business logic flow and data propagation across layers (Repo -> Service -> Hook -> Store).
 * In production mode, all calls are safely no-ops.
 */

const isDev = import.meta.env.DEV === true;

// CSS styles for console log formatting
const styles = {
  prefix: 'color: #9333ea; font-weight: bold; background: #faf5ff; padding: 2px 4px; border-radius: 4px; border: 1px solid #e9d5ff;',
  flow: 'color: #ea580c; font-weight: bold;',
  service: 'color: #16a34a; font-weight: bold;',
  repo: 'color: #2563eb; font-weight: bold;',
  hook: 'color: #db2777; font-weight: bold;',
  data: 'color: #6b7280; font-style: italic;',
};

export const devLogger = {
  /**
   * Log overall business flow transitions
   * @param {string} layer - The component/layer name
   * @param {string} action - Action executed
   * @param {any} [data] - Accompanying payload
   */
  flow(layer, action, data) {
    if (!isDev) return;
    console.log(
      `%c[ChainExplain]%c [Flow:${layer}] ➡️ ${action}`,
      styles.prefix,
      styles.flow,
      data !== undefined ? data : ''
    );
  },

  /**
   * Log Service layer actions
   * @param {string} serviceName - Service name
   * @param {string} method - Method executed
   * @param {any} [args] - Arguments or data
   */
  service(serviceName, method, args) {
    if (!isDev) return;
    console.log(
      `%c[ChainExplain]%c [Service:${serviceName}] ⚙️ ${method}()`,
      styles.prefix,
      styles.service,
      args !== undefined ? args : ''
    );
  },

  /**
   * Log Repository layer actions
   * @param {string} repoName - Repository name
   * @param {string} method - Method executed
   * @param {any} [args] - Request parameters or details
   */
  repo(repoName, method, args) {
    if (!isDev) return;
    console.log(
      `%c[ChainExplain]%c [Repo:${repoName}] 🌐 ${method}()`,
      styles.prefix,
      styles.repo,
      args !== undefined ? args : ''
    );
  },

  /**
   * Log React Hook lifecycle and event triggers
   * @param {string} hookName - Hook name
   * @param {string} event - Event name
   * @param {any} [data] - State or payload
   */
  hook(hookName, event, data) {
    if (!isDev) return;
    console.log(
      `%c[ChainExplain]%c [Hook:${hookName}] ⚓ ${event}`,
      styles.prefix,
      styles.hook,
      data !== undefined ? data : ''
    );
  },

  /**
   * General info logging
   * @param {string} message - Message
   * @param {any} [data] - Accompanying data
   */
  info(message, data) {
    if (!isDev) return;
    console.log(
      `%c[ChainExplain]%c ${message}`,
      styles.prefix,
      styles.data,
      data !== undefined ? data : ''
    );
  }
};
