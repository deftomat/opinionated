/**
 * Represents an fatal error raised by tool.
 *
 * `ToolError` should be handled and app should fail immediately.
 */
export class ToolError extends Error {
  readonly messages: string[];

  constructor(...messages: string[]) {
    super(messages.join('\n'));
    Error.captureStackTrace(this, ToolError);
    this.messages = messages;
  }

  get isToolError() {
    return true;
  }
}

/**
 * Represents an warning raised by tool.
 *
 * `ToolWarning` should be handled and app should continue with warnings.
 */
export class ToolWarning extends Error {
  readonly messages: string[];

  constructor(...messages: string[]) {
    super(messages.join('\n'));
    Error.captureStackTrace(this, ToolWarning);
    this.messages = messages;
  }

  get isToolWarning() {
    return true;
  }
}
