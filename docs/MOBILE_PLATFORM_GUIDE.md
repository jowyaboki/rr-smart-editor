# Mobile Platform Guide

Integration and operations reference for mobile client developers consuming RR Smart Editor Companion APIs on iOS and Android.

## 1. Architectural Architecture

Mobile applications consume secure, versioned JSON REST and WebSocket endpoints exposed by the API Gateway. The companion APIs support:
- **Project Monitoring**: Live sync updates of project metadata.
- **Render Queue Status**: Track progress and trigger active rendering tasks.
- **Review Approvals**: Swipe-to-approve triggers for directors.
- **Shared Comments**: Mobile keyboard overlay frame commenting.
- **Asset Uploads**: Direct camera-roll uploading to S3 with content hashes.

## 2. API Endpoint Specifications

### Device Registration
- **URL**: `POST /api/v6/mobile/devices`
- **Payload**: `{ deviceToken: string, platform: 'ios' | 'android' }`

### Remote Render Trigger
- **URL**: `POST /api/v6/mobile/projects/:projectId/render`
- **Response**: `{ success: boolean, jobId: string }`
