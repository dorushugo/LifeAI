import { User } from "@/app/page";
import { PsychologicalEngine } from "./psychologicalEngine";
import { EventSystem } from "./eventsystem";
import { PromptEngineering } from './promptEngineering';

export class GameOrchestrator {
  private psychEngine: PsychologicalEngine;
  private eventSystem: EventSystem;
  private promptEngine: PromptEngineering;

  constructor(private user: User) {
    this.psychEngine = new PsychologicalEngine(user);
    this.eventSystem = new EventSystem(user);
    this.promptEngine = new PromptEngineering();
  }

  private getCurrentContext(): string {
    // Implement the logic to get the current context
    return "current context";
  }

  async processUserResponse(response: string): Promise<{
    updatedUser: User;
    nextQuestion: string;
    options: string[];
    feedback: string;
    impacts: {
      health: number;
      money: number;
      karma: number;
      QI: number;
      socialSkills: number;
    };
  }> {
    // Génère un prompt optimisé pour l'analyse
    const analysisPrompt = await this.promptEngine.generatePrompt(
      this.user,
      response,
      "analysis"
    );

    // Analyse la réponse
    const analysis = await this.psychEngine.analyzeDecision(response);

    // Génère la prochaine question
    const questionPrompt = await this.promptEngine.generatePrompt(
      this.user,
      this.getCurrentContext(),
      "question"
    );

    // Analyse psychologique de la réponse
    const psychAnalysis = await this.psychEngine.analyzeDecision(response);

    // Génération du prochain événement
    const nextEvent = await this.eventSystem.generateEvent();

    // Calcul des impacts
    const impacts = this.calculateImpacts(psychAnalysis);

    // Mise à jour de l'utilisateur
    const updatedUser = {
      ...this.user,
      health: Math.max(0, Math.min(100, this.user.health + impacts.health)),
      money: this.user.money + impacts.money,
      karma: this.user.karma + impacts.karma,
      QI: Math.max(70, Math.min(135, this.user.QI + impacts.QI)),
      socialSkills: Math.max(0, this.user.socialSkills + impacts.socialSkills),
      psychologicalProfile: psychAnalysis.newProfile
    };

    return {
      updatedUser,
      nextQuestion: nextEvent.description,
      options: nextEvent.choices.map(c => c.text),
      feedback: this.generateFeedback(psychAnalysis, impacts),
      impacts
    };
  }

  async generatePhaseRecap(): Promise<{
    summary: string;
    developmentPath: string;
    recommendations: string[];
  }> {
    // Analyse du développement sur la période
    const psychSummary = await this.psychEngine.generatePeriodSummary();
    const eventSummary = this.eventSystem.getPeriodSummary();

    return {
      summary: this.generateSummary(psychSummary, eventSummary),
      developmentPath: `Strengths: ${psychSummary.developmentPath.strengths.join(", ")}, Weaknesses: ${psychSummary.developmentPath.weaknesses.join(", ")}, Focus Areas: ${psychSummary.developmentPath.focusAreas.join(", ")}`,
      recommendations: [
        ...psychSummary.recommendations,
        ...eventSummary.recommendations
      ]
    };
  }

  private calculateImpacts(analysis: any) {
    return {
      health: this.calculateHealthImpact(analysis),
      money: this.calculateMoneyImpact(analysis),
      karma: this.calculateKarmaImpact(analysis),
      QI: this.calculateQIImpact(analysis),
      socialSkills: this.calculateSocialSkillsImpact(analysis)
    };
  }

  private calculateHealthImpact(analysis: any): number {
    const baseImpact = analysis.emotions.positive ? 2 : -1;
    const stressImpact = analysis.stress * -0.5;
    return baseImpact + stressImpact;
  }

  private calculateMoneyImpact(analysis: any): number {
    return analysis.decisions.financial || 0;
  }

  private calculateKarmaImpact(analysis: any): number {
    return analysis.decisions.ethical * 2;
  }

  private calculateQIImpact(analysis: any): number {
    return analysis.learning * 0.5;
  }

  private calculateSocialSkillsImpact(analysis: any): number {
    return analysis.social.interaction * 1.5;
  }

  private generateFeedback(analysis: any, impacts: any): string {
    let feedback = "";

    if (impacts.health !== 0) {
      feedback += `Santé ${impacts.health > 0 ? "+" : ""}${impacts.health}. `;
    }
    if (impacts.karma !== 0) {
      feedback += `Karma ${impacts.karma > 0 ? "+" : ""}${impacts.karma}. `;
    }
    if (analysis.insights.length > 0) {
      feedback += analysis.insights[0];
    }

    return feedback;
  }

  private generateSummary(psychSummary: any, eventSummary: any): string {
    return `À ${this.user.age} ans, vous avez développé ${psychSummary.mainTraits.join(", ")}. 
    ${eventSummary.majorEvents} ont marqué cette période de votre vie.`;
  }
}