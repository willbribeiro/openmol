import React, { useState } from 'react';
import { Search, Box, Download, Settings, Info, Database } from 'lucide-react';
import MoleculeViewer from './components/MoleculeViewer';
import { MoleculeData } from './types/molecule';

const App: React.FC = () => {
  const [molecule, setMolecule] = useState<MoleculeData | null>(null);

  // Mock data for demonstration
  const loadDemoMolecule = () => {
    setMolecule({
      id: 'demo-1',
      name: 'Water (H2O)',
      format: 'pdb',
      content: `REMARK   Water molecule
ATOM      1  O   HOH A   1       0.000   0.000   0.000  1.00  20.00           O 
ATOM      2  H1  HOH A   2       0.757   0.559   0.000  1.00  20.00           H 
ATOM      3  H2  HOH A   3      -0.757   0.559   0.000  1.00  20.00           H 
END
`
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center gap-2">
          <Box className="text-blue-400" />
          <h1 className="font-bold text-xl tracking-tight">OpenMol</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search Section */}
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Search</h2>
            <div className="space-y-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search by SMILES, Name..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="absolute right-2 top-1.5 text-slate-400 hover:text-white">
                  <Search size={18} />
                </button>
              </div>
              <button 
                onClick={loadDemoMolecule}
                className="w-full text-left text-sm py-2 px-3 rounded-md hover:bg-slate-700 transition-colors"
              >
                Load Demo (H2O)
              </button>
            </div>
          </section>

          {/* Tools Section */}
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tools</h2>
            <nav className="space-y-1">
              <a href="#" className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-700 transition-colors text-sm">
                <Database size={18} />
                <span>Databases</span>
              </a>
              <a href="#" className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-700 transition-colors text-sm">
                <Download size={18} />
                <span>Export</span>
              </a>
              <a href="#" className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-700 transition-colors text-sm">
                <Settings size={18} />
                <span>Settings</span>
              </a>
            </nav>
          </section>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-700 text-[10px] text-slate-500">
          OpenMol v1.0.0 (MVP) • Privacy-first
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col">
        {/* Toolbar */}
        <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">Current Molecule:</span>
            <span className="font-medium">{molecule ? molecule.name : 'None'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors">
              Export PNG
            </button>
          </div>
        </header>

        {/* Viewer Area */}
        <div className="flex-1 bg-black relative">
          {molecule ? (
            <MoleculeViewer data={molecule} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
              <Box size={48} className="mb-4 opacity-20" />
              <p>No molecule loaded. Search or load a demo.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
