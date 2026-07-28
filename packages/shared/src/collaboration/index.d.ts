import { z } from 'zod';
export type ReviewStatus = 'draft' | 'needs_review' | 'changes_requested' | 'approved' | 'archived';
export interface Reviewer {
    id: string;
    name: string;
    role: string;
}
export interface Attachment {
    id: string;
    name: string;
    url: string;
    sizeBytes: number;
}
export interface Reaction {
    emoji: string;
    authorId: string;
    createdAt: string;
}
export interface Comment {
    id: string;
    threadId: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    reactions?: Reaction[];
    attachments?: Attachment[];
}
export interface Mention {
    userId: string;
    username: string;
    role?: string;
}
export interface ReviewThread {
    id: string;
    projectId: string;
    targetType: 'project' | 'scene' | 'clip' | 'transition' | 'effect' | 'text' | 'caption' | 'audio' | 'render' | 'template';
    targetId: string;
    status: ReviewStatus;
    title: string;
    comments: Comment[];
    createdAt: string;
    resolved: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
}
export interface Annotation {
    id: string;
    projectId: string;
    type: 'marker' | 'frame' | 'region' | 'text';
    timeStart: number;
    timeEnd?: number;
    label: string;
    color: string;
    priority: 'low' | 'medium' | 'high';
    authorId: string;
    createdAt: string;
}
export declare const ReviewStatusSchema: z.ZodEnum<{
    draft: "draft";
    needs_review: "needs_review";
    changes_requested: "changes_requested";
    approved: "approved";
    archived: "archived";
}>;
export declare const ReviewerSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    role: z.ZodString;
}, z.core.$strip>;
export declare const AttachmentSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    url: z.ZodString;
    sizeBytes: z.ZodNumber;
}, z.core.$strip>;
export declare const ReactionSchema: z.ZodObject<{
    emoji: z.ZodString;
    authorId: z.ZodString;
    createdAt: z.ZodString;
}, z.core.$strip>;
export declare const CommentSchema: z.ZodObject<{
    id: z.ZodString;
    threadId: z.ZodString;
    authorId: z.ZodString;
    authorName: z.ZodString;
    content: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodOptional<z.ZodString>;
    reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
        emoji: z.ZodString;
        authorId: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$strip>>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        url: z.ZodString;
        sizeBytes: z.ZodNumber;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const MentionSchema: z.ZodObject<{
    userId: z.ZodString;
    username: z.ZodString;
    role: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ReviewThreadSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    targetType: z.ZodEnum<{
        text: "text";
        render: "render";
        project: "project";
        scene: "scene";
        clip: "clip";
        transition: "transition";
        effect: "effect";
        caption: "caption";
        audio: "audio";
        template: "template";
    }>;
    targetId: z.ZodString;
    status: z.ZodEnum<{
        draft: "draft";
        needs_review: "needs_review";
        changes_requested: "changes_requested";
        approved: "approved";
        archived: "archived";
    }>;
    title: z.ZodString;
    comments: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        threadId: z.ZodString;
        authorId: z.ZodString;
        authorName: z.ZodString;
        content: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodOptional<z.ZodString>;
        reactions: z.ZodOptional<z.ZodArray<z.ZodObject<{
            emoji: z.ZodString;
            authorId: z.ZodString;
            createdAt: z.ZodString;
        }, z.core.$strip>>>;
        attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            url: z.ZodString;
            sizeBytes: z.ZodNumber;
        }, z.core.$strip>>>;
    }, z.core.$strip>>;
    createdAt: z.ZodString;
    resolved: z.ZodBoolean;
    resolvedAt: z.ZodOptional<z.ZodString>;
    resolvedBy: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const AnnotationSchema: z.ZodObject<{
    id: z.ZodString;
    projectId: z.ZodString;
    type: z.ZodEnum<{
        text: "text";
        marker: "marker";
        frame: "frame";
        region: "region";
    }>;
    timeStart: z.ZodNumber;
    timeEnd: z.ZodOptional<z.ZodNumber>;
    label: z.ZodString;
    color: z.ZodString;
    priority: z.ZodEnum<{
        low: "low";
        medium: "medium";
        high: "high";
    }>;
    authorId: z.ZodString;
    createdAt: z.ZodString;
}, z.core.$strip>;
