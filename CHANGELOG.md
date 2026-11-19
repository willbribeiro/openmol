# Changelog

All notable changes to OpenMol.

## [1.0.2] - 2026-11-19

### Added
- **PNG Export**: Implemented high-quality PNG image export functionality
  - Export current 3D view as PNG with configurable quality (default: 95%)
  - Automatic filename generation based on molecule name and timestamp
  - Keyboard shortcut: `Ctrl+Shift+E` for quick export
  - Button in toolbar for manual export
  
- **Enhanced Local Storage**: Improved auto-save functionality
  - Uses localStorage for simple data persistence
  - IndexedDB support ready for larger datasets (future-ready)
  - Automatic save on molecule changes
  - Load last viewed molecule on app startup

### Changed
- **MoleculeViewer Component**: Refactored with improved capture API
  - Added `capture()` method with Promise-based async handling
  - Configurable export options (quality, dimensions, filename)
  - Better error handling and null checks
  
- **App Component**: Enhanced export workflow
  - Integrated keyboard shortcut for quick export
  - Improved error messages and user feedback
  - Better state management for export operations

### Technical Improvements
- Added `react-hotkeys-hook` package for keyboard shortcuts
- Created dedicated storage utilities (`src/utils/storage.ts`)
- Improved CSS with better transitions and accessibility features
- Enhanced TypeScript typing throughout
- Fixed build issues and improved code quality

## [1.0.1] - 2026-11-19 (Previous)

### Added
- Basic PNG export functionality
- Local storage auto-save (basic implementation)

## [1.0.0] - 2026-11-18

### Initial Release
- Basic molecular visualization using 3Dmol.js
- PubChem search integration
- Demo molecule loading
- Local storage auto-save (basic implementation)
