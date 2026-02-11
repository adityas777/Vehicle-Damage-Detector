
export interface DamageDetail {
  damageType: 'Scratch' | 'Dent' | 'Crack' | 'Broken Part' | 'Paint Damage';
  location: string;
  severity: 'Low' | 'Medium' | 'High';
  estimatedCostINR: number;
  confidenceScore: number;
  explanation: string;
}

export interface DamageAnalysis {
  damages: DamageDetail[];
  totalEstimatedCostINR: number;
  costFactors: string[];
}

export interface AnalysisResult {
    image: string;
    analysis: DamageAnalysis;
}

export interface ClaimsInformation {
    eligibleClaims: {
        claimType: string;
        description: string;
    }[];
    claimProcedure: string[];
    requiredDocuments: string[];
}
