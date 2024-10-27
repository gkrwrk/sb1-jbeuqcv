interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let attempt = 1;
  let delay = options.initialDelay;

  while (attempt <= options.maxAttempts) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === options.maxAttempts) {
        throw error;
      }

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * 2, options.maxDelay);
      
      // Add some jitter
      const jitter = Math.random() * 200;
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
      
      attempt++;
    }
  }

  throw new Error('Retry failed: max attempts reached');
}