import { PermissionService } from '@ai-video-editor/collaboration';

export const webPermissions = new PermissionService();
export const hasTimelineWriteAccess = (role: any) => webPermissions.checkPermission(role, 'editor');
export const hasReviewAccess = (role: any) => webPermissions.checkPermission(role, 'reviewer');
