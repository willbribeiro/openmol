import React, { useState, useEffect, useRef } from 'react';
import { Search, Box, Download, Settings, Database, Loader2, Trash2 } from 'lucide-react';
import MoleculeViewer from './components/MoleculeViewer';
import type { MoleculeViewerRef } from './components/MoleculeViewer';
import type { MoleculeData } from './types/molecule';
import { searchPubChem, getMoleculeData } from './utils/chemistry';
import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from './utils/storage';
import { useHotkeys } from 'react-hotkeys-hook';

const App: React.FC = () => {
  const [molecule, setMolecule] = useState<MoleculeData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const viewerRef = useRef<MoleculeViewerRef>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = loadFromLocalStorage<MoleculeData>('openmol_last_molecule');
    if (saved) {
      setMolecule(saved);
    }
  }, []);

  // Save to local storage when molecule changes
  useEffect(() => {
    if (molecule) {
      saveToLocalStorage('openmol_last_molecule', molecule);
    } else {
      removeFromLocalStorage('openmol_last_molecule');
    }
  }, [molecule]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const cids = await searchPubChem(searchQuery);
      if (cids && cids.length > 0) {
        const data = await getMoleculeData(cids[0]);
        setMolecule({
          ...data,
          id: `pubchem-${cids[0]}`,
        } as MoleculeData);
      } else {
        setError('No molecule found for that name.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
    setError(null);
  };

  const handleReset = () => {
    setMolecule(null);
    removeFromLocalStorage('openmol_last_molecule');
  };

  const handleExportPNG = async () => {
    if (viewerRef.current && molecule) {
      try {
        const filename = await viewerRef.current.capture({
          quality: 95,
          width: undefined, // Use container width
          height: undefined, // Use container height
          filename: `${molecule.name.replace(/\s+/g, '_').toLowerCase()}_snapshot.png`,
        });
        
        if (filename) {
          setError(null);
          // Show success message briefly
          const successMsg = `Exported: ${filename}`;
          console.log(successMsg);
        }
      } catch (err) {
        console.error('Failed to export PNG:', err);
        setError('Failed to capture image. Please try again.');
      }
    } else if (!molecule) {
      setError('No molecule loaded to export.');
    }
  };

  // Keyboard shortcut for export (Ctrl+Shift+E)
  useHotkeys(
    'ctrl+shift+e',
    () => handleExportPNG(),
    [molecule], // Dependencies
    { preventDefault: true }
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <aside className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="text-blue-400" />
            <h1 className="font-bold text-xl tracking-tight">OpenMol</h1>
          </div>
          {molecule && (
             <button 
              onClick={handleReset}
              title="Clear current molecule"
              className="text-slate-500 hover:text-red-400 transition-colors"
             >
               <Trash2 size={16} />
             </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search Section */}
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Search (PubChem)</h2>
            <form onSubmit={handleSearch} className="space-y-2">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Caffeine, Aspirin..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-1.5 text-slate-400 hover:text-white disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
              </div>
            </form>
            
            <div className="mt-2">
              <button 
                type="button"
                onClick={loadDemoMolecule}
                className="w-full text-left text-sm py-2 px-3 rounded-md hover:bg-slate-700 transition-colors"
              >
                Load Demo (H2O)
              </button>
            </div>

            {error && (
              <div className="mt-2 p-2 text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded">
                {error}
              </div>
            )}
          </section>

          {/* Tools Section */}
          <section>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Tools</h2>
            <nav className="space-y-1">
              <button className="w-full flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-700 transition-colors text-sm">
                <Database size={18} />
                <span>Databases</span>
              </button>
              <button className="w-full flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate-700 transition-colors text-sm">
                <Download size={18} />
                <span>Export</span>
              </button>
              <button className="w-full flex items-center gap-3 py-2 px-3 rounded-md hover:bg-slate/700 transition-colors text-sm">
                <Settings size={18} />
                <span>Settings</span>
              </button>
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
            <span className="font-medium text-blue-300">{molecule ? molecule.name : 'None'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleExportPNG}
              disabled={!molecule}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:text-slate-400 rounded text-white transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export PNG
            </button>
          </div>
        </header>

        {/* Viewer Area */}
        <div className="flex-1 bg-black relative">
          {molecule ? (
            <MoleculeViewer data={molecule} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-center px-4">
              <Box size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-light">Ready to visualize</p>
              <p className="text-sm">Search for a molecule or load a demo to start.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
