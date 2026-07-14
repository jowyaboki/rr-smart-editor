# API Documentation

## Projects

- `GET /projects`: List all projects.
- `POST /projects`: Create a new project.
- `POST /projects/:id/duplicate`: Clone a project.
- `PUT /projects/:id`: Update project name or timeline.
- `DELETE /projects/:id`: Delete a project.

## Media

- `GET /projects/:projectId/media`: List media for a project.
- `POST /projects/:projectId/media`: Upload new media (Multipart/form-data).

## Rendering

- `POST /renders/:projectId`: Start an MP4 render.
- `GET /renders/:renderId`: Get render status and progress.

## AI

- `POST /ai/generate-script`: Generate a script from a prompt.
- `POST /ai/generate-image`: Generate an image from a prompt.
- `POST /ai/generate-voiceover`: Generate voiceover from text.

## Templates

- `GET /templates`: List available templates.
- `POST /templates`: Save a project as a template.
- `POST /templates/:templateId/use`: Create a project from a template.
