import React, { useState, useEffect, ReactNode } from 'react';
import { defaultContent } from '@/data/defaultContent';
import { CmsMetaMap, ContentContext, SiteContent } from './contentContextState';

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [isLoading, setIsLoading] = useState(true);
  const [cmsMeta, setCmsMeta] = useState<CmsMetaMap>({});
  const [cmsSolutions, setCmsSolutions] = useState<unknown[]>([]);
  const [cmsBlogPosts, setCmsBlogPosts] = useState<unknown[]>([]);

  // Load content from API or LocalStorage
  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await fetch('/api/content.php');
        if (res.ok) {
          const payload = await res.json();
          const siteContent = payload?.site_content;
          if (siteContent && typeof siteContent === 'object') {
            setContent(prev => ({ ...prev, ...siteContent }));
          }
          if (payload?.meta && typeof payload.meta === 'object') setCmsMeta(payload.meta as CmsMetaMap);
          if (Array.isArray(payload?.solutions)) setCmsSolutions(payload.solutions);
          if (Array.isArray(payload?.blog_posts)) setCmsBlogPosts(payload.blog_posts);
          setIsLoading(false);
          return;
        }
      } catch {
        console.warn("Backend not reachable, using fallback.");
      }
      
      try {
        const res = await fetch('/api/get_content.php');
        if (res.ok) {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            if (data && Object.keys(data).length > 0) {
              setContent(prev => ({ ...prev, ...data }));
              setIsLoading(false);
              return;
            }
          } catch {
            console.warn("Invalid JSON from backend", text);
          }
        }
      } catch {
        console.warn("Legacy backend not reachable, using fallback.");
      }

      // Fallback to local storage
      const saved = localStorage.getItem('site_content');
      if (saved) {
        try {
           setContent(prev => ({ ...prev, ...JSON.parse(saved) }));
        } catch (e) {
           console.error("Failed to parse local storage", e);
        }
      }
      setIsLoading(false);
    };
    loadContent();
  }, []);

  const updateContent = (newContent: SiteContent) => {
    setContent(newContent);
  };

  const saveContent = async () => {
    try {
      // Save to local storage
      localStorage.setItem('site_content', JSON.stringify(content));
      
      // Save to Backend
      const res = await fetch('/api/save_content.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      
      if (res.ok) {
        const result = await res.json();
        return result.success === true;
      }
      return false;
    } catch (error) {
      console.error("Failed to save content to backend", error);
      return false;
    }
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, isLoading, saveContent, cmsMeta, cmsSolutions, cmsBlogPosts }}>
      {children}
    </ContentContext.Provider>
  );
};
