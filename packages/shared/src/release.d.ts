import { z } from 'zod';
export interface VersionMetadata {
    version: string;
    codename: string;
    releaseDate: string;
    environment: 'production' | 'staging' | 'development';
    changelog: {
        added: string[];
        improved: string[];
        fixed: string[];
    };
    knownIssues: string[];
    systemRequirements: {
        nodeVersion: string;
        browsersSupported: string[];
        minRamMb: number;
    };
}
export declare const VersionMetadataSchema: z.ZodObject<{
    version: z.ZodString;
    codename: z.ZodString;
    releaseDate: z.ZodString;
    environment: z.ZodEnum<{
        production: "production";
        staging: "staging";
        development: "development";
    }>;
    changelog: z.ZodObject<{
        added: z.ZodArray<z.ZodString>;
        improved: z.ZodArray<z.ZodString>;
        fixed: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
    knownIssues: z.ZodArray<z.ZodString>;
    systemRequirements: z.ZodObject<{
        nodeVersion: z.ZodString;
        browsersSupported: z.ZodArray<z.ZodString>;
        minRamMb: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CURRENT_RELEASE_METADATA: VersionMetadata;
