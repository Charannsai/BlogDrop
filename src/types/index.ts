export interface User {
  id: string;
  email: string;
  displayName: string;
  subdomain: string;
  createdAt: string;
}

export interface Blog {
  id: string;
  userId: string;
  title: string;
  slug: string;
  coverImage?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  randomUrl: string;
  content: BlockData[];
}

export type BlockType = 
  | 'text' 
  | 'heading' 
  | 'image' 
  | 'video' 
  | 'button' 
  | 'divider' 
  | 'code'
  | 'quote';

export interface BlockData {
  id: string;
  type: BlockType;
  content: string;
  // Optional properties based on block type
  url?: string;
  alt?: string;
  level?: 1 | 2 | 3; // For headings
  language?: string; // For code blocks
  linkUrl?: string; // For buttons
  linkText?: string; // For buttons
}

export interface Theme {
  id: string;
  name: string;
  fontFamily: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
}