export async function searchPubChem(query: string): Promise<number[]> {
  try {
    const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/cids/cids/JSON`);
    if (!response.ok) {
      throw new Error('Molecule not found in PubChem');
    }
    const data = await response.json();
    return data.PubChem.Identities.CID;
  } catch (error) {
    console.error('Error searching PubChem:', error);
    throw error;
  }
}

export async function getMoleculeData(cid: number): Promise<{ name: string; content: string; format: 'sdf' | 'pdb' }> {
  // Fetching SDF with 3D coordinates as default for visualization
  const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`);
  if (!response.ok) {
    throw new Error('Failed to fetch molecular data');
  }
  const content = await response.text();
  
  // For the purpose of this MVP, we'll assume it's SDF and name it based on the CID
  return {
    name: `Molecule CID: ${cid}`,
    content: content,
    format: 'sdf'
  };
}
