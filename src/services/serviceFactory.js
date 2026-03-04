import { loanService } from './loanService';
import { finxactService } from './finxactService';
import { bamService } from './bamService';
import { orchestrationService } from './orchestrationService';
import { mockLoanService, mockFinxactService, mockBamService, mockOrchestrationService } from './mockProvider';

export function getServices(apiMode) {
  if (apiMode === 'real') {
    return {
      loan: loanService,
      finxact: finxactService,
      bam: bamService,
      orchestration: orchestrationService,
    };
  }
  return {
    loan: mockLoanService,
    finxact: mockFinxactService,
    bam: mockBamService,
    orchestration: mockOrchestrationService,
  };
}
