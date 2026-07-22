import { z } from 'zod';

export const ProjectPayloadSchema = z.object({
  name: z.string().min(1),
  templateId: z.string().optional(),
});

export const validateProjectPayload = (payload: any) => {
  return ProjectPayloadSchema.safeParse(payload);
};
