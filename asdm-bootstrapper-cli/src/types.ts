export interface Toolset {
  id: string;
  name: string;
  description: string;
  version: string;
  downloadUrl: string;
}

export interface Spec {
  id: string;
  name: string;
  description: string;
  version: string;
  downloadUrl: string;
}

export interface Context {
  id: string;
  name: string;
  description: string;
  version: string;
  downloadUrl: string;
}

export interface ToolsetRegistry {
  version: string;
  toolsets: Toolset[];
}

export interface SpecsRegistry {
  version: string;
  specs: Spec[];
}

export interface ContextsRegistry {
  version: string;
  contexts: Context[];
}
