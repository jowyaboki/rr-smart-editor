export interface Project {
  id: string;
  name: string;
  description?: string;
  brandKitId?: string; // Integration with Brand Kit
  createdAt: string;
  updatedAt: string;
}
