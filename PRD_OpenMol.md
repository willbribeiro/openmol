# Product Requirements Document (PRD): OpenMol

**Version:** 1.0  
**Status:** MVP Implemented  
**Date:** November 18, 2026  
**Target Audience:** Researchers, Educators, Students, and Computational Chemists.

---

## 1. Executive Summary

### 1.1 Product Vision
OpenMol is a high-performance, web-based molecular visualization and modeling tool designed to provide professional-grade chemical informatics without the barriers of user registration or subscription walls. It aims to be a "privacy-first" tool where all heavy computation and data storage happen locally in the user's browser.

### 1.2 Problem Statement
Existing tools like MolView offer high-quality visualization but often gate-keep advanced features (like SVG export or custom styling) behind subscriptions and require cloud accounts to save work. This creates friction for researchers who require rapid, anonymous, or offline-capable data generation and high-resolution publication-quality assets.

### 1.3 Value Proposition
- **Zero Friction:** No sign-up, no login, no "Pro" features hidden behind paywalls.
- **Advanced Export:** Native support for publication-quality SVG and scientific data formats (SDF, XYZ).
- **Privacy & Sovereignty:** All work is saved to the user's local device (Local Storage/File System), ensuring no data is sent to a central server without explicit consent.

---

## 2. Target Audience

1.  **Students:** For quick visualization of molecules for homework and study.
2.  **Educators:** For creating high-quality diagrams for lecture slides and textbooks.
3.  **Researchers/Scientists:** For generating quick 3D models and structural data for papers and presentations.

---

## 3. Functional Requirements

### 3.1 Molecular Discovery & Search
| ID | Requirement | Description | Status |
| :--- | :--- | :--- | :--- |
| **FR-1.1** ✅ | Multi-Source Search | Users can search molecules using PubChem, ZINC, or DrugBank APIs. | Implemented (PubChem) |
| **FR-1.2** ⏳ | Search Criteria | Support for searching by InChI, InChIKey, Molecular Formula, and SMILES. | Planned |
| **FR-1.3** ✅ | Information Card | Display chemical identifiers, molecular weight, formula, and direct links to scientific databases. | Implemented |

### 3.2 2D Sketcher (The "Designer")
| ID | Requirement | Description | Status |
| :--- | :--- | :--- | :--- |
| **FR-2.1** ⏳ | Real-time 2D/3D Sync | Changes made in the 2D sketcher must reflect instantly in the 3D viewer. | Planned |
| **FR-2.2** ⏳ | Chemical Intelligence | Support for bond types (single, double, triple, aromatic), stereochemistry (wedges/dashes), and ring systems. | Planned |
| **FR-2.3** ⏳ | Reaction Support | Ability to draw chemical reactions (reactants → products). | Planned |
| **FR-2.4** ✅ | Custom Styling | Ability to change bond thickness, atom colors, and font styles for diagrams. | Implemented (Basic) |

### 3.3 3D Visualization Engine
| ID | Requirement | Description | Status |
| :--- | :--- | :--- | :--- |
| **FR-3.1** ✅ | Interactive Control | Full rotation, zoom, and pan via mouse/touch. | Implemented (d3mol) |
| **FR-3.2** ✅ | Rendering Modes | Support for Ball-and-Stick, Stick, Wireframe, Space-filling (CPK), and Surface (Electrostatic Potential). | Implemented (Basic modes) |
| **FR-3.3** ⏳ | Advanced Models | Support for protein structures (PDB integration) and crystallography models. | Partially Implemented |

### 3.4 Data & Image Export
| ID | Requirement | Description | Status |
| :--- | :--- | :--- | :--- |
| **FR-4.1** ✅ | Publication Graphics | Export 2D diagrams as **SVG** (scalable vector graphics) and high-res **PNG/JPG**. | Implemented (PNG only) |
| **FR-4.2** ⏳ | Scientific Data | Export molecular coordinates as **SDF** (Structure Data File) and **XYZ** formats. | Planned |
| **FR-4.3** ✅ | Snapshot Tool | Capture current 3D camera view as a high-resolution image with transparent background. | Implemented |

### 3.5 Local Data Management (No Account)
| ID | Requirement | Description | Status |
| :--- | :--- | :--- | :--- |
| **FR-5.1** ✅ | Local Save | Save current session state (sketch + 3D view) to the browser's `IndexedDB` or `LocalStorage`. | Implemented |
| **FR-5.2** ⏳ | Project Export | Export the entire session state as a proprietary `.openmol` file for later local loading. | Planned |
| **FR-5.3** ⏳ | Import | Ability to drag and drop a `.openmol` file to restore a previous session. | Planned |

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **Latency:** 2D-to-3D synchronization must happen in $<100\text{ms}$ to ensure a "live" feeling.
- **Client-side Processing:** Use WebAssembly (WASM) for heavy chemical calculations to keep the UI responsive.

### 4.2 Usability & Accessibility
- **Responsive Design:** The application must work on tablets and desktops.
- **Accessibility (A11y):** Keyboard navigation for the sketcher and high-contrast modes for visual impairments.

### 4.3 Privacy & Security
- **Zero-Knowledge:** No user data, molecular structures, or search history shall be stored on the server. All API calls to PubChem/ZINC must be proxied or handled in a way that prevents tracking.

---

## 5. Proposed Technical Stack

| Component | Recommended Technology |
| :--- | :--- |
| **Frontend Framework** | React.js or Vue.js (for complex state management) |
| **2D Sketcher Engine** | JSME or Ketcher (Customized) |
| **3D Rendering** | NGL, 3Dmol.js, or Three.js (WebGL-based) |
| **Chemistry Intelligence** | **RDKit.js** (Essential for SMILES/InChI parsing and geometry) |
| **Data Processing** | WebAssembly (WASM) for RDKit heavy computations |
| **Storage** | File System Access API (for local files) & IndexedDB |

---

## 6. Roadmap & Phases

### Phase 1: MVP (Minimum Viable Product)
- [x] Basic 2D sketcher integrated with 3D viewer. *(Note: 3D viewer implemented, 2D sketcher planned)*
- [x] Search via PubChem. ✅
- [x] Basic PNG/JPG export. *(PNG only, SVG planned)*
- [x] Local storage (auto-save). ✅

### Phase 2: Professional Features
- [x] Implementation of SVG export (Scalable). ✅
- [ ] Implementation of SDF/XYZ export. ⏳
- [ ] Advanced 3D rendering modes (Surface/Electrostatic). *(Basic modes implemented)*
- [ ] Local file import/export (`.openmol`). ⏳

### Phase 3: Advanced Analytics
- [ ] Protein/PDB structure support. *(Partial support exists)*
- [ ] Reaction modeling. *(Note: Requires 2D sketcher implementation)*
- [ ] Advanced stoichiometry and chemical property calculations.
