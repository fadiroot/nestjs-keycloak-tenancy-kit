import { Logger } from '@nestjs/common';
import { TransactionStep, TransactionResult } from './transaction.type';

export class TransactionManager< T extends Record<string, any>> {
  private steps: Array<TransactionStep<T>> = [];
  private completedSteps: Array<TransactionStep<T>> = [];
  private context: T;
  private logger = new Logger(TransactionManager.name);


  constructor(initialContext: T = {} as T) {
    this.context = initialContext;
  }

  addStep(step: TransactionStep<T>) {
    this.steps.push(step);
    return this;
  }

  getContext(): T {
    return this.context;
  }

  async execute(): Promise<TransactionResult<T>> {
    try {
      for (const step of this.steps) {
        this.logger.debug(`Executing step: ${step.name}`);
        const result = await step.execute(this.context);
        this.completedSteps.push(step);
        
        // Update context with step result if returned
        if (result !== undefined) {
          this.context = { ...this.context, [step.name]: result };
        }
      }

      return {
        success: true,
        data: this.context
      };
    } catch (error) {
      this.logger.error(`Transaction failed at step: ${this.completedSteps.length > 0 ? this.completedSteps[this.completedSteps.length - 1].name : 'initial'}`);
      await this.rollback();
      
      return {
        success: false,
        error: error as Error
      };
    }
  }

  private async rollback(): Promise<void> {
    for (const step of [...this.completedSteps].reverse()) {
      try {
        this.logger.debug(`Rolling back step: ${step.name}`);
        await step.rollback(this.context);
      } catch (rollbackError) {
        this.logger.error(`Rollback failed for step ${step.name}:`, rollbackError);
      }
    }
  }
}