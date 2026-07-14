import React from 'react';
import { pluginRegistry } from '../manager/PluginRegistry';

interface ExtensionPointProps {
  name: 'sidebar' | 'toolbar' | 'inspector' | 'timeline';
  context?: any;
}

export const ExtensionPoint: React.FC<ExtensionPointProps> = ({ name, context }) => {
  const plugins = pluginRegistry.list();

  // This is a simplified version. In a real app, plugins would register
  // their UI contributions explicitly.
  return (
    <>
      {plugins.map(plugin => (
        <React.Fragment key={plugin.manifest.id}>
           {/* Render plugin-specific UI here if they contribute to this point */}
        </React.Fragment>
      ))}
    </>
  );
};
