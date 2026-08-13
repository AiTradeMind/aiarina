import { 
  BrainRepository, BrainSessionRepository, BrainTaskRepository, 
  BrainReasoningRepository, BrainConsensusRepository, 
  BrainAssignmentRepository, BrainHistoryRepository 
} from "../repositories";
import { 
  Brain, BrainSession, BrainTask, BrainReasoning, 
  BrainConsensus, BrainAssignment, BrainHistory,
  TaskAnalyzeRequest, BrainTaskAssignmentRequest
} from "../types";
import { randomUUID } from "crypto";

export class TaskClassifierService {
  classify(intent: string): { type: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', complexity: number, requiredExpertise: string[] } {
    const lower = intent.toLowerCase();
    
    if (lower.includes("trade") || lower.includes("buy") || lower.includes("sell") || lower.includes("execute")) {
      return { type: "TRADING", priority: "CRITICAL", complexity: 0.9, requiredExpertise: ["execution", "risk"] };
    }
    if (lower.includes("research") || lower.includes("analysis") || lower.includes("market") || lower.includes("report")) {
      return { type: "RESEARCH", priority: "MEDIUM", complexity: 0.8, requiredExpertise: ["analysis", "fundamentals"] };
    }
    if (lower.includes("risk") || lower.includes("exposure") || lower.includes("drawdown")) {
      return { type: "RISK", priority: "HIGH", complexity: 0.85, requiredExpertise: ["risk", "quant"] };
    }
    
    return { type: "GENERAL", priority: "LOW", complexity: 0.4, requiredExpertise: ["general"] };
  }
}

export class ReasoningService {
  private reasoningRepo = new BrainReasoningRepository();

  async logReasoning(taskId: string, step: number, logic: string, conclusion: string, confidence: number): Promise<void> {
    await this.reasoningRepo.addReasoning({
      id: randomUUID(),
      taskId,
      step,
      logic,
      conclusion,
      confidence,
      timestamp: new Date().toISOString()
    });
  }
}

export class ConsensusPlannerService {
  private consensusRepo = new BrainConsensusRepository();
  
  async initConsensus(taskId: string, requiredModels: number): Promise<BrainConsensus> {
    const consensus: BrainConsensus = {
      id: randomUUID(),
      taskId,
      requiredModels,
      achievedModels: 0,
      consensusScore: null,
      status: 'GATHERING',
      resolution: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await this.consensusRepo.createConsensus(consensus);
    return consensus;
  }
}

export class AssignmentPlannerService {
  private assignmentRepo = new BrainAssignmentRepository();

  async assignModel(request: BrainTaskAssignmentRequest): Promise<BrainAssignment> {
    const assignment: BrainAssignment = {
      id: randomUUID(),
      taskId: request.taskId,
      modelId: request.modelId,
      role: request.role,
      status: 'PENDING',
      assignedAt: new Date().toISOString(),
      completedAt: null,
      response: null,
      score: null
    };
    await this.assignmentRepo.createAssignment(assignment);
    return assignment;
  }
}

export class BrainManagerService {
  private brainRepo = new BrainRepository();
  private sessionRepo = new BrainSessionRepository();
  private taskRepo = new BrainTaskRepository();
  private historyRepo = new BrainHistoryRepository();
  
  private classifier = new TaskClassifierService();
  private reasoning = new ReasoningService();
  private consensus = new ConsensusPlannerService();
  private assignment = new AssignmentPlannerService();

  async ensureBrainExists(): Promise<Brain> {
    const brains = await this.brainRepo.getBrains();
    if (brains.length > 0) return brains[0];
    
    const brain: Brain = {
      id: 'core-brain-001',
      name: 'AIARINA Central Intelligence',
      status: 'ONLINE',
      mode: 'STANDARD',
      activeTasks: 0,
      systemLoad: 0.1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await this.brainRepo.createBrain(brain);
    return brain;
  }

  async getStatus(): Promise<Brain> {
    return await this.ensureBrainExists();
  }

  async analyzeRequest(request: TaskAnalyzeRequest): Promise<BrainTask> {
    const brain = await this.ensureBrainExists();
    
    // Create Session
    const session: BrainSession = {
      id: randomUUID(),
      brainId: brain.id,
      status: 'ACTIVE',
      context: JSON.stringify(request.context),
      createdAt: new Date().toISOString(),
      completedAt: null
    };
    await this.sessionRepo.createSession(session);
    
    // Classify Task
    const classification = this.classifier.classify(request.intent);
    
    // Create Task
    const task: BrainTask = {
      id: randomUUID(),
      sessionId: session.id,
      type: classification.type,
      priority: classification.priority,
      complexity: classification.complexity,
      status: 'ANALYZING',
      intent: request.intent,
      requiredExpertise: classification.requiredExpertise,
      estimatedTokens: Math.floor(classification.complexity * 10000) + 1000,
      estimatedCost: classification.complexity * 0.1,
      estimatedDuration: Math.floor(classification.complexity * 6000) + 1000,
      confidenceTarget: 0.9,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await this.taskRepo.createTask(task);
    
    await this.reasoning.logReasoning(
      task.id, 
      1, 
      `Intent analyzed: ${request.intent}. Classification: ${task.type}.`, 
      `Proceeding with ${task.priority} priority execution.`,
      0.95
    );

    // Update brain active tasks
    await this.brainRepo.updateBrain(brain.id, { activeTasks: brain.activeTasks + 1 });
    
    // Log history
    await this.historyRepo.addHistory({
      id: randomUUID(),
      brainId: brain.id,
      eventType: 'TASK_CREATED',
      eventData: JSON.stringify({ taskId: task.id, type: task.type }),
      timestamp: new Date().toISOString()
    });

    return task;
  }
  
  async getTasks(): Promise<BrainTask[]> {
    return await this.taskRepo.getTasks();
  }

  async getHistory(): Promise<BrainHistory[]> {
    const brain = await this.ensureBrainExists();
    return await this.historyRepo.getHistory(brain.id);
  }

  async planConsensus(taskId: string, requiredModels: number): Promise<BrainConsensus> {
    return await this.consensus.initConsensus(taskId, requiredModels);
  }
  
  async assignTask(taskId: string, modelId: string, role: 'PRIMARY' | 'SECONDARY' | 'CRITIC' | 'VERIFIER'): Promise<BrainAssignment> {
    const task = await this.taskRepo.getTask(taskId);
    if (!task) throw new Error("Task not found");
    
    await this.taskRepo.updateTask(taskId, { status: 'ASSIGNED' });
    
    await this.reasoning.logReasoning(
      taskId,
      2,
      `Assigning task to ${modelId} as ${role}.`,
      `Awaiting model response.`,
      0.90
    );
    
    return await this.assignment.assignModel({ taskId, modelId, role });
  }
}
