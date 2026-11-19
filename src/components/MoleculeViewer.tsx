import React, { useEffect, useRef } from 'react';
import { MoleculeData } from '../types/molecule';

interface MoleculeViewerProps {
  data: MoleculeData | null;
}

const MoleculeViewer: React.FC<MoleculeViewerProps> = ({ data }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);

  useEffect(() => {
    if (viewerRef.current && !viewerInstance.current) {
      // @ts-ignore
      viewerInstance.current = window.d3mol.createViewer(viewerRef.current, {
        backgroundColor: 'black',
      });
    }
  }, []);

  useEffect(() => {
    if (viewerInstance.current && data) {
      viewerInstance.current.clear();
      viewerInstance.current.addModel(data.content, data.format);
      viewerInstance.current.setStyle({}, { stick: { radius: 0.3 } });
      viewerInstance.current.zoomTo();
      viewerInstance.current.render();
    }
  }, [data]);

  return (
    <div 
      ref={viewerRef} 
      className="w-full h-full min-h-[400px]"
      style={{ backgroundColor: 'black' }}
    />
  );
};

export default MoleculeViewer;
