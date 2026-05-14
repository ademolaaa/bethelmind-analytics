import { createContext } from "react";
import { defaultContent } from "@/data/defaultContent";

export type SiteContent = typeof defaultContent;

export interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: SiteContent) => void;
  isLoading: boolean;
  saveContent: () => Promise<boolean>;
}

export const ContentContext = createContext<ContentContextType | undefined>(undefined);
