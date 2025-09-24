import React, { createContext, useContext } from 'react';
import { useMerge } from '../hooks/merge/useMerge';

const MergeContext = createContext(null);

export const MergeProvider = ({ children }) => {
  const mergeState = useMerge();

  console.log('MergeProvider state:', {
    hasServerFiles: mergeState.hasServerFiles,
    message: mergeState.message,
    filesCount: mergeState.files.length,
  });

  return (
    <MergeContext.Provider value={mergeState}>
      {children}
    </MergeContext.Provider>
  );
};

export function useMergeContext() {
  const context = useContext(MergeContext);
  if (!context) {
    throw new Error('useMergeContext must be used within a MergeProvider');
  }
  return context;
}