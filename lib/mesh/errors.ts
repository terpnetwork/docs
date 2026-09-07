/**
 * Structured mesh query errors so Connect can map friction signals
 * (design §7): 5xx → headstash availability, not opaque FE failure.
 */

export class MeshQueryError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly path: string,
  ) {
    super(message)
    this.name = 'MeshQueryError'
  }

  get isServerError(): boolean {
    return this.status >= 500
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }
}

export function isMeshQueryError(err: unknown): err is MeshQueryError {
  return err instanceof MeshQueryError
}
