import { createContext } from "react";
import { defaultContent } from "@/data/defaultContent";

export type SiteContent = typeof defaultContent;

export type CmsMetaMap = Record<
  string,
  {
    title: string;
    description: string;
    ogImage?: string;
    robots?: string;
    updatedAt?: string;
  }
>;

export interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: SiteContent) => void;
  isLoading: boolean;
  saveContent: () => Promise<boolean>;
  cmsMeta: CmsMetaMap;
  cmsSolutions: unknown[];
  cmsBlogPosts: unknown[];
}

export const ContentContext = createContext<ContentContextType | undefined>(undefined);
