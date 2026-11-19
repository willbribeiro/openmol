import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { MoleculeData } from '../types/molecule';

export interface MoleculeViewerRef {
  capture: (options?: CaptureOptions) => Promise<string | null>;
  clear: () => void;
}

interface CaptureOptions {
  quality?: number; // 0-100, default 95
  width?: number; // Default to container width
  height?: number; // Default to container height
  filename?: string; // Default to molecule name with timestamp
}

interface MoleculeViewerProps {
  data: MoleculeData | null;
}

const MoleculeViewer = forwardRef<MoleculeViewerRef, MoleculeViewerProps>(({ data }, ref) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    capture: (options?: CaptureOptions) => {
      return new Promise<string | null>((resolve) => {
        if (!viewerInstance.current || !containerRef.current) {
          resolve(null);
          return;
        }

        const config = viewerInstance.current.getConfig();
        
        // Get container dimensions
        const container = containerRef.current!;
        const width = options?.width || container.clientWidth;
        const height = options?.height || container.clientHeight;

        // Configure export settings
        const exportConfig = {
          quality: options?.quality ?? 95,
          dragAndDrop: false,
          width: width,
          height: height,
          backgroundColor: config.backgroundColor,
        };

        try {
          viewerInstance.current.png(exportConfig, (blob: Blob) => {
            if (!blob) {
              resolve(null);
              return;
            }

            const url = URL.createObjectURL(blob);
            const filename = options?.filename || `${data?.name || 'molecule'}_snapshot_${Date.now()}.png`;
            
            // Create download link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            resolve(filename);
          });
        } catch (error) {
          console.error('Failed to capture PNG:', error);
          resolve(null);
        }
      });
    },
    clear: () => {
      if (viewerInstance.current) {
        viewerInstance.current.clear();
      }
    },
  }));

  useEffect(() => {
    if (viewerRef.current && !viewerInstance.current) {
      // @ts-ignore
      viewerInstance.current = window.d3mol.createViewer(viewerRef.current, {
        backgroundColor: 'black',
        antialiasing: true,
      });
    }
  }, []);

  useEffect(() => {
    if (viewerInstance.current && data) {
      viewerInstance.current.clear();
      viewerInstance.current.addModel(data.content, data.format as any);
      
      // Apply styling
      viewerInstance.current.setStyle({}, { 
        stick: { radius: 0.3 },
        sphere: { radius: 0.25 }
      });
      
      // Zoom to fit the molecule
      viewerInstance.current.zoomTo();
      
      // Render with antialiasing for better quality
      viewerInstance.current.render();
    } else if (viewerInstance.current && !data) {
      viewerInstance.current.clear();
    }
  }, [data]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px]"
      style={{ backgroundColor: 'black' }}
    />
  );
});

MoleculeViewer.displayName = 'MoleculeViewer';

export default MoleculeViewer;
