import { User } from "@/app/page";

interface Event {
  description: string;
  choices: Choice[];
  requirements?: Requirement[];
}

interface Choice {
  text: string;
  impacts: {
    health?: number;
    money?: number;
    karma?: number;
    QI?: number;
    socialSkills?: number;
  };
}

interface Requirement {
  stat: keyof User;
  minValue: number;
}

export class EventSystem {
  getPeriodSummary() {
    // Implementation of period summary
    return {
      recommendations: ["Example recommendation 1", "Example recommendation 2"]
    };
  }
  private eventHistory: Event[] = [];

  constructor(private user: User) {}

  async generateEvent(): Promise<Event> {
    const event = this.getAgeAppropriateEvent();
    return this.customizeEvent(event);
  }

  private getAgeAppropriateEvent(): Event {
    if (this.user.age <= 5) {
      return this.getEarlyChildhoodEvent();
    } else if (this.user.age <= 10) {
      return this.getChildhoodEvent();
    } else {
      return this.getPreteenEvent();
    }
  }

  private getEarlyChildhoodEvent(): Event {
    const events = [
      {
        description: "Tu vois ton cousin prendre ton jouet préféré.",
        choices: [
          {
            text: "Tu le laisses faire gentiment",
            impacts: {
              karma: 2,
              socialSkills: 1,
              health: -1
            }
          },
          {
            text: "Tu pleures et appelles ta maman",
            impacts: {
              karma: 0,
              socialSkills: -1,
              health: 0
            }
          },
          {
            text: "Tu reprends le jouet de force",
            impacts: {
              karma: -2,
              socialSkills: -1,
              health: 0
            }
          }
        ]
      },
      {
        description: "Ta mère te propose de faire un gâteau.",
        choices: [
          {
            text: "Tu acceptes avec enthousiasme",
            impacts: {
              QI: 1,
              socialSkills: 2,
              health: 1
            }
          },
          {
            text: "Tu préfères regarder la TV",
            impacts: {
              QI: -1,
              health: -1
            }
          },
          {
            text: "Tu proposes d'inviter un ami",
            impacts: {
              socialSkills: 3,
              karma: 1
            }
          }
        ]
      }
    ];

    return events[Math.floor(Math.random() * events.length)];
  }

  private getChildhoodEvent(): Event {
    const events = [
      {
        description: "Un camarade te propose de tricher au contrôle.",
        choices: [
          {
            text: "Tu refuses et proposes de réviser ensemble",
            impacts: {
              karma: 3,
              QI: 2,
              socialSkills: 1
            }
          },
          {
            text: "Tu acceptes de tricher",
            impacts: {
              karma: -3,
              QI: -1
            }
          },
          {
            text: "Tu l'ignores",
            impacts: {
              karma: 1,
              socialSkills: -1
            }
          }
        ]
      },
      {
        description: "Tu vois un groupe jouer au foot dans la cour.",
        choices: [
          {
            text: "Tu demandes à jouer avec eux",
            impacts: {
              socialSkills: 2,
              health: 2
            }
          },
          {
            text: "Tu restes seul dans ton coin",
            impacts: {
              socialSkills: -1,
              health: -1
            }
          },
          {
            text: "Tu observes et attends qu'on t'invite",
            impacts: {
              socialSkills: 0,
              QI: 1
            }
          }
        ]
      }
    ];

    return events[Math.floor(Math.random() * events.length)];
  }

  private getPreteenEvent(): Event {
    const events = [
      {
        description: "Un ami te parle d'une théorie sur la simulation de la réalité.",
        choices: [
          {
            text: "Tu réfléchis et poses des questions",
            impacts: {
              QI: 3,
              socialSkills: 1
            }
          },
          {
            text: "Tu changes de sujet",
            impacts: {
              socialSkills: -1
            }
          },
          {
            text: "Tu partages tes propres théories",
            impacts: {
              QI: 2,
              socialSkills: 2
            }
          }
        ]
      }
    ];

    return events[Math.floor(Math.random() * events.length)];
  }

  private customizeEvent(event: Event): Event {
    const customizedChoices = event.choices.map(choice => ({
      ...choice,
      impacts: this.adjustImpacts(choice.impacts)
    }));

    return {
      ...event,
      choices: customizedChoices
    };
  }

  private adjustImpacts(impacts: Choice['impacts']): Choice['impacts'] {
    const adjusted = { ...impacts };

    if (this.user.psychologicalProfile.includes('curieux')) {
      if (adjusted.QI) adjusted.QI *= 1.2;
    }
    if (this.user.psychologicalProfile.includes('social')) {
      if (adjusted.socialSkills) adjusted.socialSkills *= 1.2;
    }

    const ageMultiplier = this.user.age <= 5 ? 1.5 : 1;
    Object.keys(adjusted).forEach(key => {
      const impactKey = key as keyof Choice['impacts'];
      if (adjusted[impactKey]) {
        adjusted[impactKey] = Math.round(adjusted[impactKey] * ageMultiplier);
      }
    });

    return adjusted;
  }

  generatePhaseSummary(): string {
    const recentEvents = this.eventHistory.slice(-5);
    let summary = `Durant cette période, tu as fait face à ${recentEvents.length} situations importantes.`;
    
    const positiveChoices = recentEvents.filter(e => 
      e.choices.some(c => (c.impacts.karma || 0) > 0)
    ).length;

    if (positiveChoices > recentEvents.length / 2) {
      summary += " Tu as généralement fait des choix positifs.";
    } else {
      summary += " Tes choix ont parfois été difficiles.";
    }

    return summary;
  }
}