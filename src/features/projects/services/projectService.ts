import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import { Project } from "../types/project";
import { CreateProjectInput } from "../schemas/projectSchema";

const PROJECTS_COLLECTION = "projects";

export const projectService = {
  async getAll(): Promise<Project[]> {
    const querySnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    })) as Project[];
  },

  async create(data: CreateProjectInput, ownerId: string): Promise<string> {
    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...data,
      ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  },
};
