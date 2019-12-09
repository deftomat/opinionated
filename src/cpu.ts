import os from 'os';

let currentlyRunning = 0;
const queue: (() => void)[] = [];

/**
 * "Allocates" one CPU core.
 */
export async function allocateCore(): Promise<{ free: () => void }> {
  const free = () => {
    currentlyRunning--;
    const startNext = queue.shift();
    if (startNext) startNext();
  };

  if (currentlyRunning <= os.cpus().length) {
    currentlyRunning++;
    return Promise.resolve({ free });
  }

  return new Promise(resolve => {
    queue.push(() => {
      currentlyRunning++;
      resolve({ free });
    });
  });
}
