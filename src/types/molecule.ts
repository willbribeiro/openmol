export type MoleculeData = {
  id: string;
  name: string;
  smiles?: string;
  pubchemId?: string;
  format: 'pdb' | 'sdf' | 'xyz' | 'mol2' | 'cif';
  content: string;
};

export type ViewerConfig = {
  style: 'stick' | 'ballAndStick' | 'sphere' | 'wireframe' | 'surface';
  resolution: 'low' | 'medium' | 'high';
};
