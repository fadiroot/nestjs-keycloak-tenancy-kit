export interface TransactionContext {
    [key: string]: any;
  }
  
  export interface TransactionStep<T extends TransactionContext> {
    name: string;
    execute: (context: T) => Promise<any>;
    rollback: (context: T) => Promise<void>;
  }
  
  export interface TransactionResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
  }