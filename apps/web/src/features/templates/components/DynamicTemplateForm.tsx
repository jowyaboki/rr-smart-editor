import React, { useState } from 'react';
import { useDynamicForm } from '../hooks/useDynamicForm';
import { TemplateParameter } from '../types';

interface DynamicTemplateFormProps {
  parameters: TemplateParameter[];
  onSubmit: (values: Record<string, any>) => void;
}

export const DynamicTemplateForm: React.FC<DynamicTemplateFormProps> = ({ parameters, onSubmit }) => {
  const { values, visibleParameters, setParamValue, validateForm } = useDynamicForm(parameters);
  const [errors, setErrors] = useState<string[]>([]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const audit = validateForm();
    if (audit.valid) {
      setErrors([]);
      onSubmit(values);
    } else {
      setErrors(audit.errors);
    }
  };

  return (
    <form onSubmit={handleApply} style={{ padding: '12px', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', marginTop: '12px' }}>
      <span style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '12px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
        Configure Parameters
      </span>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {visibleParameters.map((param) => (
          <div key={param.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: '#ccc' }}>
              {param.name} {param.required && <span style={{ color: '#f44336' }}>*</span>}
            </label>

            {param.type === 'text' && (
              <input
                type="text"
                value={values[param.id] ?? param.defaultValue}
                onChange={(e) => setParamValue(param.id, e.target.value)}
                style={{ padding: '4px 8px', fontSize: '11px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '2px' }}
              />
            )}

            {param.type === 'number' && (
              <input
                type="number"
                min={param.min}
                max={param.max}
                step={param.step}
                value={values[param.id] ?? param.defaultValue}
                onChange={(e) => setParamValue(param.id, parseFloat(e.target.value))}
                style={{ padding: '4px 8px', fontSize: '11px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '2px' }}
              />
            )}

            {param.type === 'boolean' && (
              <label style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="checkbox"
                  checked={values[param.id] ?? param.defaultValue}
                  onChange={(e) => setParamValue(param.id, e.target.checked)}
                />
                Enable option
              </label>
            )}

            {param.type === 'color' && (
              <input
                type="color"
                value={values[param.id] ?? param.defaultValue}
                onChange={(e) => setParamValue(param.id, e.target.value)}
                style={{ border: 'none', background: 'none', width: '40px', height: '24px', cursor: 'pointer' }}
              />
            )}
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <div style={{ marginBottom: '12px', padding: '6px', background: '#2c0d0d', borderLeft: '3px solid #f44336', borderRadius: '2px' }}>
          {errors.map((err, idx) => (
            <div key={idx} style={{ fontSize: '10px', color: '#f44336' }}>
              {err}
            </div>
          ))}
        </div>
      )}

      <button
        type="submit"
        style={{ width: '100%', padding: '6px', fontSize: '11px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        Compile Blueprint
      </button>
    </form>
  );
};
export default DynamicTemplateForm;
