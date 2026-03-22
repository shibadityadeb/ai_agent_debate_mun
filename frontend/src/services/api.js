// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

const DEFAULT_REQUEST_TIMEOUT_MS = 10000;
const INITIAL_JOB_REQUEST_TIMEOUT_MS = 45000;
const POLL_INTERVAL_MS = 1500;
const MAX_JOB_WAIT_MS = 65000;

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - API endpoint path
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
const fetchAPI = async (endpoint, options = {}) => {
  const { timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`[API] ${fetchOptions.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
      ...fetchOptions,
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    // Check for HTTP error status
    if (!response.ok) {
      const errorMsg =
        (isJson && (data.detail || data.message)) ||
        (typeof data === 'string' && data.trim()) ||
        `HTTP Error: ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timed out after ${timeoutMs / 1000}s`);
      console.error('[API Error]', timeoutError.message);
      throw timeoutError;
    }

    const isNetworkError = error instanceof TypeError;
    const normalizedError = isNetworkError
      ? new Error(
          'Network request failed. If this is the deployed app, verify the backend is reachable and that CORS allows this frontend origin.'
        )
      : error;

    console.error('[API Error]', normalizedError.message);
    throw normalizedError;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

/**
 * Start a new debate
 * @param {string} topic - Debate topic
 * @param {array} countries - List of country names
 * @returns {Promise<object>} - Debate initialization response
 */
export const startDebate = async (topic, countries = []) => {
  if (!topic || topic.trim() === '') {
    throw new Error('Topic is required');
  }

  const payload = {
    topic,
    countries: Array.isArray(countries) ? countries : [],
  };

  return fetchAPI('/debate/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/**
 * Run an ongoing debate
 * @param {string} topic - Debate topic
 * @param {array} countries - List of country names
 * @returns {Promise<object>} - Debate execution response with history, votes, verdict
 */
export const runDebate = async (topic, countries = []) => {
  if (!topic || topic.trim() === '') {
    throw new Error('Topic is required');
  }

  const payload = {
    topic,
    countries: Array.isArray(countries) ? countries : [],
  };

  const acceptedJob = await fetchAPI('/debate/run', {
    method: 'POST',
    body: JSON.stringify(payload),
    timeoutMs: INITIAL_JOB_REQUEST_TIMEOUT_MS,
  });

  if (!acceptedJob?.job_id) {
    throw new Error('Backend did not return a debate job ID.');
  }

  const startedAt = Date.now();

  while (Date.now() - startedAt < MAX_JOB_WAIT_MS) {
    const status = await getDebateStatus(acceptedJob.job_id);

    if (status.status === 'completed') {
      return fetchAPI(`/debate/${acceptedJob.job_id}/result`, {
        method: 'GET',
      });
    }

    if (status.status === 'failed' || status.status === 'timed_out') {
      throw new Error(status.error || `Debate job ${status.status}.`);
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`Debate job exceeded ${MAX_JOB_WAIT_MS / 1000}s client wait limit.`);
};

/**
 * Get debate status
 * @param {string} debateId - Debate ID
 * @returns {Promise<object>} - Debate status
 */
export const getDebateStatus = async (debateId) => {
  if (!debateId) {
    throw new Error('Debate ID is required');
  }

  return fetchAPI(`/debate/${debateId}/status`, {
    method: 'GET',
  });
};

/**
 * Get debate messages
 * @param {string} debateId - Debate ID
 * @returns {Promise<array>} - Array of debate messages
 */
export const getDebateMessages = async (debateId) => {
  if (!debateId) {
    throw new Error('Debate ID is required');
  }

  return fetchAPI(`/debate/${debateId}/messages`, {
    method: 'GET',
  });
};

/**
 * Get current debate info
 * @returns {Promise<object>} - Current debate information
 */
export const getCurrentDebate = async () => {
  return fetchAPI('/debate/current', {
    method: 'GET',
  });
};
