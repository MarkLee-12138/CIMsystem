
export enum NodeCategory {
  SUPPLY = 'SUPPLY',
  ENGINE = 'ENGINE',
  CONSUMPTION = 'CONSUMPTION'
}

export interface ProcessNode {
  id: string;
  title: string;
  category: NodeCategory;
  description: string;
  icon: string;
  details?: string[];
  metrics?: { label: string; value: string }[];
}

export interface SimulationState {
  isActive: boolean;
  currentStep: number;
}
