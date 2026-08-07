import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export interface IStorageService {
  /**
   * Uploads a file and returns its public URL and stored name.
   */
  upload(file: Buffer, originalName: string, mimeType: string): Promise<{ url: string; storedName: string }>;
  
  /**
   * Deletes a file by its stored name.
   */
  delete(storedName: string): Promise<void>;
}

export class LocalStorageService implements IStorageService {
  private uploadDir: string;

  constructor() {
    // Store in public directory so it can be served statically by Next.js
    this.uploadDir = path.join(process.cwd(), "public", "uploads", "projects");
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: Buffer, originalName: string, mimeType: string): Promise<{ url: string; storedName: string }> {
    const ext = path.extname(originalName) || "";
    const uniqueId = uuidv4();
    const storedName = `${uniqueId}${ext}`;
    const filePath = path.join(this.uploadDir, storedName);

    await fs.promises.writeFile(filePath, file);

    return {
      url: `/uploads/projects/${storedName}`,
      storedName,
    };
  }

  async delete(storedName: string): Promise<void> {
    const filePath = path.join(this.uploadDir, storedName);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}

// Export a singleton instance. 
// Can easily be swapped to SupabaseStorageService or S3StorageService in the future.
export const storageService: IStorageService = new LocalStorageService();
