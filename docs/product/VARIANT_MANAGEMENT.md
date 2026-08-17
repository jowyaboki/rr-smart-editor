# Variant Lineage Management

## Lineage Schema
```typescript
export interface VariantLineage {
  parentProjectId: string;
  variantId: string;
  variantType: '16:9' | '9:16' | '1:1' | '4:5' | 'short_cut' | 'brand_alt';
  sourceVersion: string;
  createdAt: string;
}
```
Lineage metadata connects variant instances back to the parent project without copying media binary assets.
