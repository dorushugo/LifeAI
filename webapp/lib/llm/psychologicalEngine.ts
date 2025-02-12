import { User } from "@/app/page";

export class PsychologicalEngine {
  private traits: Map<string, number>;
  private decisionHistory: string[];

  constructor(private user: User) {
    this.traits = new Map();
    this.decisionHistory = [];
    this.initializeTraits();
  }

  private initializeTraits() {
    this.traits.set("curiosity", this.calculateBaseCuriosity());
    this.traits.set("empathy", this.calculateBaseEmpathy());
    this.traits.set("resilience", this.calculateBaseResilience());
    this.traits.set("ambition", this.calculateBaseAmbition());
  }

  async analyzeDecision(decision: string) {
    // Analyse de la décision
    const analysis = {
      emotions: this.analyzeEmotions(decision),
      social: this.analyzeSocialAspects(decision),
      learning: this.analyzeLearningPotential(decision),
      decisions: {
        ethical: this.analyzeEthicalImpact(decision),
        financial: this.analyzeFinancialImpact(decision)
      },
      stress: this.calculateStressLevel(decision),
      insights: this.generateInsights(decision)
    };

    // Mise à jour des traits
    this.updateTraits(analysis);

    // Génération du nouveau profil
    const newProfile = this.generateProfile();

    return {
      ...analysis,
      newProfile
    };
  }

  async generatePeriodSummary() {
    const mainTraits = this.getMainTraits();
    const developmentPath = this.analyzeDevelopmentPath();
    const recommendations = this.generateRecommendations();

    return {
      mainTraits,
      developmentPath,
      recommendations
    };
  }

  private analyzeEmotions(decision: string) {
    const positiveWords = ["aide", "partage", "ensemble", "content"];
    const negativeWords = ["refuse", "colère", "seul", "triste"];

    let positiveCount = 0;
    let negativeCount = 0;

    const words = decision.toLowerCase().split(" ");
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    return {
      positive: positiveCount > negativeCount,
      intensity: Math.max(positiveCount, negativeCount)
    };
  }

  private analyzeSocialAspects(decision: string) {
    const socialWords = ["ami", "groupe", "famille", "autres"];
    const antisocialWords = ["seul", "évite", "refuse", "isolé"];

    let interaction = 0;
    const words = decision.toLowerCase().split(" ");
    
    words.forEach(word => {
      if (socialWords.includes(word)) interaction++;
      if (antisocialWords.includes(word)) interaction--;
    });

    return {
      interaction,
      tendency: interaction > 0 ? "social" : "solitaire"
    };
  }

  private analyzeLearningPotential(decision: string) {
    const learningWords = ["apprendre", "étudier", "comprendre", "découvrir"];
    const words = decision.toLowerCase().split(" ");
    
    return words.filter(word => learningWords.includes(word)).length * 0.5;
  }

  private analyzeEthicalImpact(decision: string) {
    const ethicalWords = ["aide", "partage", "honnête", "vérité"];
    const unethicalWords = ["ment", "triche", "vole", "fraude"];

    let ethicalScore = 0;
    const words = decision.toLowerCase().split(" ");
    
    words.forEach(word => {
      if (ethicalWords.includes(word)) ethicalScore++;
      if (unethicalWords.includes(word)) ethicalScore--;
    });

    return ethicalScore;
  }

  private analyzeFinancialImpact(decision: string) {
    const moneyWords = {
      gain: ["gagne", "économise", "investit"],
      loss: ["dépense", "achète", "perd"]
    };

    let impact = 0;
    const words = decision.toLowerCase().split(" ");
    
    words.forEach(word => {
      if (moneyWords.gain.includes(word)) impact += 2;
      if (moneyWords.loss.includes(word)) impact -= 2;
    });

    return impact;
  }

  private calculateStressLevel(decision: string) {
    const stressWords = ["pression", "stress", "inquiet", "peur"];
    const words = decision.toLowerCase().split(" ");
    
    return words.filter(word => stressWords.includes(word)).length * 0.3;
  }

  private generateInsights(decision: string) {
    const insights = [];
    const analysis = {
      social: this.analyzeSocialAspects(decision),
      learning: this.analyzeLearningPotential(decision)
    };

    if (analysis.social.interaction > 1) {
      insights.push("Vous développez vos compétences sociales");
    }
    if (analysis.learning > 0.5) {
      insights.push("Vous montrez de la curiosité intellectuelle");
    }

    return insights;
  }

  private getMainTraits() {
    return Array.from(this.traits.entries())
      .filter(([_, value]) => value > 0.7)
      .map(([trait, _]) => trait);
  }

  private analyzeDevelopmentPath() {
    const strengths = this.getMainTraits();
    const weaknesses = Array.from(this.traits.entries())
      .filter(([_, value]) => value < 0.3)
      .map(([trait, _]) => trait);

    return {
      strengths,
      weaknesses,
      focusAreas: weaknesses.slice(0, 2)
    };
  }

  private generateRecommendations() {
    const recommendations: string[] = [];
    const development = this.analyzeDevelopmentPath();

    development.focusAreas.forEach(area => {
      switch (area) {
        case "empathy":
          recommendations.push("Essayez de comprendre les autres");
          break;
        case "curiosity":
          recommendations.push("Explorez de nouveaux domaines");
          break;
        case "resilience":
          recommendations.push("Apprenez de vos échecs");
          break;
      }
    });

    return recommendations;
  }

  private calculateBaseCuriosity() {
    return (this.user.QI - 70) / 65;
  }

  private calculateBaseEmpathy() {
    return this.user.socialSkills / 100;
  }

  private calculateBaseResilience() {
    return this.user.health / 100;
  }

  private calculateBaseAmbition() {
    return (this.user.QI + this.user.socialSkills) / 200;
  }

  private generateProfile(): string {
    const traits = this.getMainTraits();
    if (traits.length === 0) return "En développement";
    return traits.join(", ");
  }

  private updateTraits(analysis: any) {
    this.traits.forEach((value, trait) => {
      const change = this.calculateTraitChange(trait, analysis);
      this.traits.set(trait, Math.max(0, Math.min(1, value + change)));
    });
  }

  private calculateTraitChange(trait: string, analysis: any): number {
    switch (trait) {
      case "curiosity":
        return analysis.learning * 0.1;
      case "empathy":
        return analysis.social.interaction * 0.1;
      case "resilience":
        return (1 - analysis.stress) * 0.05;
      case "ambition":
        return (analysis.decisions.ethical + analysis.decisions.financial) * 0.05;
      default:
        return 0;
    }
  }
}