import type { MoleculeData } from '../types/molecule';

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

/**
 * Convert PDB format to SDF format
 * PDB files contain atomic coordinates that can be converted to SDF
 */
export function convertPDBToSDF(pdbContent: string): string {
  // Parse PDB content and create minimal SDF header with properties
  const lines = pdbContent.split('\n').filter(line => line.trim());
  
  // Extract molecule name from first ATOM record if available
  let molName = 'Molecule';
  for (const line of lines) {
    if (line.startsWith('ATOM') && line.includes('  REMARK')) {
      const remarkMatch = line.match(/REMARK\s+(\S+)/);
      if (remarkMatch) {
        molName = remarkMatch[1];
        break;
      }
    }
  }
  
  // Create SDF content with minimal property block
  let sdfContent = `Molecule: ${molName}\n`;
  sdfContent += `COMPOUND RECORD\n`;
  
  // Calculate and add minimal properties
  const atomCount = lines.filter(line => line.startsWith('ATOM')).length;
  sdfContent += `$$.CHG 0\n`;
  sdfContent += `$END\C\n`;
  sdfContent += `$NUM ${atomCount}\n`;
  sdfContent += `$END\n`;
  
  // Add atomic symbols and coordinates (simplified - real SDF has more detailed properties)
  for (const line of lines) {
    if (line.startsWith('ATOM')) {
      // Parse PDB ATOM record format:
      // ATOM   serial name resName chain resid iCode x y z occupancy tempFactor
      const match = line.match(/ATOM\s+([\d.]+)\s+(\S+)\s+(\S+)\s+(\S+)\s+[\w\s]+\s+(\d+)/);
      if (match) {
        const [, , x, y, z] = match;
        
        sdfContent += `${x} ${y} ${z}\n`;
      }
    } else if (line.startsWith('END')) {
      sdfContent += `END\n`;
    } else if (!line.trim() || line.includes('$') || line.includes('REMARK')) {
      // Keep headers and empty lines for SDF structure
      sdfContent += line + '\n';
    }
  }
  
  return sdfContent;
}

/**
 * Convert PDB format to XYZ format
 * XYZ format: first line = atom count, followed by comment line, then atomic data
 */
export function convertPDBToXYZ(pdbContent: string): string {
  const lines = pdbContent.split('\n').filter(line => line.trim());
  
  // Count ATOM records
  let atomCount = 0;
  for (const line of lines) {
    if (line.startsWith('ATOM')) {
      atomCount++;
    }
  }
  
  // Extract molecule name from remark
  let comment = 'Molecule';
  for (const line of lines) {
    const remarkMatch = line.match(/REMARK\s+(\S+)/);
    if (remarkMatch) {
      comment = remarkMatch[1];
      break;
    }
  }
  
  // Build XYZ format: count, comment, then atomic data
  let xyzContent = `${atomCount}\n`;
  xyzContent += `${comment}\n`;
  
  for (const line of lines) {
    if (line.startsWith('ATOM')) {
      const match = line.match(/ATOM\s+([\d.]+)\s+(\S+)/);
      if (match) {
        const [, atomName] = match;
        
        // Extract coordinates from standard PDB columns
        const x = line.substring(30, 38).trim();
        const y = line.substring(38, 46).trim();
        const z = line.substring(46, 54).trim();
        
        xyzContent += `${atomName}   ${x}   ${y}   ${z}\n`;
      }
    }
  }
  
  return xyzContent;
}

/**
 * Export molecule content as SDF format
 * Uses existing molecule.content (which may be PDB/SDF) and converts/export accordingly
 */
export function exportAsSDF(molecule: MoleculeData): string {
  // If content is already in SDF format, return as-is
  if (molecule.format === 'sdf') {
    return molecule.content;
  }
  
  // Convert PDB to SDF
  if (molecule.format === 'pdb') {
    return convertPDBToSDF(molecule.content);
  }
  
  // For XYZ format, first read and rebuild in proper format
  if (molecule.format === 'xyz') {
    try {
      const xyzLines = molecule.content.split('\n');
      if (xyzLines.length >= 2) {
        const atomCount = parseInt(xyzLines[0].trim(), 10);
        // SDF requires property block - create minimal one
        let sdfContent = `Molecule: ${molecule.name.replace(/\s+/g, '_')}\n`;
        sdfContent += `COMPOUND RECORD\n`;
        sdfContent += `$$.CHG 0\n`;
        sdfContent += `$END\C\n`;
        sdfContent += `$NUM ${atomCount}\n`;
        sdfContent += `$END\n`;
        
        // Extract coordinates from XYZ format (skip first two lines)
        for (let i = 2; i < xyzLines.length && i < 2 + atomCount; i++) {
          const parts = xyzLines[i].trim().split(/\s+/);
          if (parts.length >= 4) {
            sdfContent += `${parts[1]} ${parts[2]} ${parts[3]}\n`;
          }
        }
        sdfContent += `END\n`;
        return sdfContent;
      }
    } catch (err) {
      console.error('Error converting XYZ to SDF:', err);
    }
  }
  
  // Default: return original content with SDF wrapper
  return molecule.content;
}

/**
 * Export molecule content as XYZ format
 */
export function exportAsXYZ(molecule: MoleculeData): string {
  // If content is already in XYZ format, return as-is
  if (molecule.format === 'xyz') {
    return molecule.content;
  }
  
  // Convert PDB to XYZ
  if (molecule.format === 'pdb') {
    return convertPDBToXYZ(molecule.content);
  }
  
  // For SDF format, parse coordinates and output as XYZ
  if (molecule.format === 'sdf') {
    try {
      const sdfLines = molecule.content.split('\n');
      let atomCount = 0;
      const coordinateLines: string[] = [];
      
      // Parse SDF to find atoms and coordinates
      for (let i = 0; i < sdfLines.length; i++) {
        const line = sdfLines[i];
        if (line.startsWith('ATOM') || (line.match(/-\d+$/) && coordinateLines.length < 10)) {
          // Try to extract atomic data from PDB-like ATOM records
          if (line.startsWith('ATOM')) {
            atomCount++;
            const match = line.match(/ATOM\s+([\d.]+)\s+(\S+)/);
            if (match) {
              const [, atomName] = match;
              // Extract coordinates from standard PDB columns
              const x = line.substring(30, 38).trim();
              const y = line.substring(38, 46).trim();
              const z = line.substring(46, 54).trim();
              coordinateLines.push(`${atomName}   ${x}   ${y}   ${z}`);
            }
          } else if (!line.startsWith('ATOM') && !line.includes('$') && !line.startsWith('END')) {
            // Try to parse coordinates from standard columns (SDF format)
            const coords = line.split(/\s+/).slice(0, 3);
            if (coords.length === 3) {
              atomCount++;
              coordinateLines.push(`${coords[0]} ${coords[1]} ${coords[2]}`);
            }
          }
        }
      }
      
      // Build XYZ format
      let xyzContent = `${atomCount}\n`;
      xyzContent += `Molecule: ${molecule.name.replace(/\s+/g, '_')}\n`;
      for (const coordLine of coordinateLines) {
        xyzContent += coordLine + '\n';
      }
      
      return xyzContent;
    } catch (err) {
      console.error('Error converting SDF to XYZ:', err);
    }
  }
  
  // Default: return original content with XYZ wrapper
  return molecule.content;
}
