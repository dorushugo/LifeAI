import { User } from "@/app/page";

interface PromptTemplate {
  systemPrompt: string;
  userPrompt: string;
  formatInstructions: string;
  ageGroup: "early" | "child" | "preteen";
  contextType: "question" | "response" | "analysis";
}

export class PromptEngineering {
  private templates: Map<string, PromptTemplate>;

  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Templates pour les jeunes enfants (0-5 ans)
    this.templates.set("early_question", {
      systemPrompt: "Tu es un assistant bienveillant qui parle à un très jeune enfant.",
      userPrompt: "Pose une question simple et adaptée à un enfant de {age} ans sur {topic}.",
      formatInstructions: "Utilise un langage simple et des exemples concrets.",
      ageGroup: "early",
      contextType: "question"
    });

    // Templates pour les enfants (5-10 ans)
    this.templates.set("child_question", {
      systemPrompt: "Tu es un mentor qui guide un enfant dans son développement.",
      userPrompt: "Crée une situation éducative adaptée à un enfant de {age} ans concernant {topic}.",
      formatInstructions: "Inclus des éléments d'apprentissage et de réflexion.",
      ageGroup: "child",
      contextType: "question"
    });

    // Templates pour les pré-ados (10-15 ans)
    this.templates.set("preteen_question", {
      systemPrompt: "Tu es un conseiller qui aide à développer la pensée critique.",
      userPrompt: "Propose une situation complexe sur {topic} qui fait réfléchir.",
      formatInstructions: "Encourage la réflexion approfondie et l'analyse.",
      ageGroup: "preteen",
      contextType: "question"
    });
  }

  async generatePrompt(
    user: User,
    context: string,
    type: "question" | "response" | "analysis"
  ): Promise<string> {
    const ageGroup = this.determineAgeGroup(user.age);
    const template = this.getTemplate(ageGroup, type);
    
    return this.formatPrompt(template, {
      age: user.age,
      topic: context,
      profile: user.psychologicalProfile
    });
  }

  private determineAgeGroup(age: number): "early" | "child" | "preteen" {
    if (age <= 5) return "early";
    if (age <= 10) return "child";
    return "preteen";
  }

  private getTemplate(
    ageGroup: "early" | "child" | "preteen",
    type: "question" | "response" | "analysis"
  ): PromptTemplate {
    const key = `${ageGroup}_${type}`;
    const template = this.templates.get(key);
    
    if (!template) {
      throw new Error(`Template not found for ${key}`);
    }
    
    return template;
  }

  private formatPrompt(template: PromptTemplate, params: Record<string, any>): string {
    let prompt = `${template.systemPrompt}\n\n`;
    
    // Remplace les variables dans le prompt utilisateur
    let userPrompt = template.userPrompt;
    Object.entries(params).forEach(([key, value]) => {
      userPrompt = userPrompt.replace(`{${key}}`, value.toString());
    });
    
    prompt += `${userPrompt}\n\n`;
    prompt += `${template.formatInstructions}\n\n`;

    // Ajoute des instructions spécifiques selon l'âge
    if (template.ageGroup === "early") {
      prompt += "Instructions supplémentaires :\n";
      prompt += "- Utilise des phrases très courtes\n";
      prompt += "- Évite les concepts abstraits\n";
      prompt += "- Inclus des éléments visuels dans les descriptions\n";
    } else if (template.ageGroup === "child") {
      prompt += "Instructions supplémentaires :\n";
      prompt += "- Encourage la curiosité\n";
      prompt += "- Propose des situations de la vie quotidienne\n";
      prompt += "- Inclus des éléments de réflexion simple\n";
    } else {
      prompt += "Instructions supplémentaires :\n";
      prompt += "- Encourage la pensée critique\n";
      prompt += "- Aborde des concepts plus complexes\n";
      prompt += "- Propose des situations qui font réfléchir\n";
    }

    return prompt;
  }

  getQuestionTemplates(age: number): string[] {
    const templates = [];
    
    if (age <= 5) {
      templates.push(
        "Tu préfères {option1} ou {option2} ?",
        "Que fais-tu si {situation} ?",
        "Comment te sens-tu quand {événement} ?"
      );
    } else if (age <= 10) {
      templates.push(
        "Que choisirais-tu entre {option1} et {option2} ? Pourquoi ?",
        "Comment réagirais-tu si {situation} ?",
        "Que penses-tu de {sujet} ?"
      );
    } else {
      templates.push(
        "Quelle est ton opinion sur {sujet} ?",
        "Comment analyserais-tu {situation} ?",
        "Que ferais-tu dans cette situation : {scénario} ?"
      );
    }

    return templates;
  }

  enhanceResponse(response: string, age: number): string {
    if (age <= 5) {
      // Simplifie le langage
      return this.simplifyLanguage(response);
    } else if (age <= 10) {
      // Ajoute des explications adaptées
      return this.addAgeAppropriateExplanations(response);
    } else {
      // Enrichit avec des réflexions
      return this.addCriticalThinking(response);
    }
  }

  private simplifyLanguage(text: string): string {
    // Remplace les mots complexes par des synonymes simples
    const simplifications = {
      "difficile": "dur",
      "comprendre": "voir",
      "réfléchir": "penser",
      // ... autres simplifications
    };

    let simplified = text;
    Object.entries(simplifications).forEach(([complex, simple]) => {
      simplified = simplified.replace(new RegExp(complex, 'gi'), simple);
    });

    return simplified;
  }

  private addAgeAppropriateExplanations(text: string): string {
    return `${text}\n\nPour t'aider à comprendre :\n- ${this.generateSimpleExplanation(text)}`;
  }

  private addCriticalThinking(text: string): string {
    return `${text}\n\nPour aller plus loin, réfléchis à :\n- ${this.generateThinkingPrompts(text)}`;
  }

  private generateSimpleExplanation(text: string): string {
    // Génère une explication simple basée sur le contenu
    return "Voici une façon plus simple de voir les choses...";
  }

  private generateThinkingPrompts(text: string): string {
    // Génère des questions de réflexion
    return "Qu'est-ce que cela pourrait signifier pour toi ?";
  }
}
