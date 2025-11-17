export interface TransactionContext {
    [key: string]: unknown;
  }
  
  export interface TransactionStep<T extends TransactionContext> {
    name: string;
    execute: (context: T) => Promise<unknown>;
    rollback: (context: T) => Promise<void>;
  }
  
  export interface TransactionResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
  }