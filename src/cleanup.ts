export const onProcessExit = new Set<Function>();

export function registerExitHandlers() {
  const cleanup = async () => {
    await Promise.all([...onProcessExit].map(fn => fn()));
    process.exit();
  };
  process.on('SIGINT', cleanup);
  process.on('SIGUSR1', cleanup);
  process.on('SIGUSR2', cleanup);
  process.on('uncaughtException', e => {
    console.error('UNCAUGHT EXCEPTION!');
    console.error(e);
    return cleanup;
  });
  process.on('unhandledRejection', e => {
    console.error('UNHANDLED REJECTION!');
    console.error(e);
    return cleanup;
  });
}
