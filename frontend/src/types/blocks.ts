// Block type definitions for the page builder

export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
  settings?: BlockSettings;
}

export type BlockType =
  | "hero"
  | "wysiwyg"
  | "features"
  | "cta"
  | "gallery"
  | "testimonials"
  | "faq";

export interface BlockSettings {
  background?: string;
  backgroundImage?: string;
  padding?: "none" | "small" | "medium" | "large";
  textAlign?: "left" | "center" | "right";
  animation?: string;
  className?: string;
}

// Hero Block
export interface HeroBlockContent {
  heading: string;
  subheading: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  backgroundOverlay?: number;
}

// WYSIWYG Block
export interface WYSIWYGBlockContent {
  html: string;
}

// Features Block
export interface FeaturesBlockContent {
  title?: string;
  subtitle?: string;
  features: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
  }>;
  columns?: 2 | 3 | 4;
}

// CTA Block
export interface CTABlockContent {
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  style?: "solid" | "outline";
}

// Gallery Block
export interface GalleryBlockContent {
  images: Array<{
    id: string;
    url: string;
    caption?: string;
    alt?: string;
  }>;
  columns?: 2 | 3 | 4;
  aspectRatio?: "square" | "landscape" | "portrait";
}

// Testimonials Block
export interface TestimonialsBlockContent {
  title?: string;
  testimonials: Array<{
    id: string;
    quote: string;
    author: string;
    role?: string;
    company?: string;
    avatar?: string;
  }>;
}

// FAQ Block
export interface FAQBlockContent {
  title?: string;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
}

// Union type for all block content types
export type BlockContent =
  | HeroBlockContent
  | WYSIWYGBlockContent
  | FeaturesBlockContent
  | CTABlockContent
  | GalleryBlockContent
  | TestimonialsBlockContent
  | FAQBlockContent;

// Block metadata for the block picker
export interface BlockMetadata {
  type: BlockType;
  name: string;
  description: string;
  icon: string;
  category: "hero" | "content" | "media" | "social" | "layout";
}

export const BLOCK_REGISTRY: BlockMetadata[] = [
  {
    type: "hero",
    name: "Hero Section",
    description:
      "Large header with title, subtitle, and call-to-action buttons",
    icon: "Layout",
    category: "hero",
  },
  {
    type: "wysiwyg",
    name: "Rich Text",
    description: "Free-form content with WYSIWYG editor",
    icon: "FileText",
    category: "content",
  },
  {
    type: "features",
    name: "Feature Grid",
    description: "Grid of features with icons and descriptions",
    icon: "Grid",
    category: "content",
  },
  {
    type: "cta",
    name: "Call to Action",
    description: "Prominent call-to-action section",
    icon: "Target",
    category: "content",
  },
  {
    type: "gallery",
    name: "Image Gallery",
    description: "Grid of images with captions",
    icon: "Images",
    category: "media",
  },
  {
    type: "testimonials",
    name: "Testimonials",
    description: "Customer testimonials and reviews",
    icon: "MessageSquare",
    category: "social",
  },
  {
    type: "faq",
    name: "FAQ",
    description: "Frequently asked questions with accordion",
    icon: "HelpCircle",
    category: "content",
  },
];

// Helper to create a new block with default content
export function createDefaultBlock(type: BlockType): Block {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const defaultContent: Record<BlockType, BlockContent> = {
    hero: {
      heading: "Welcome to Our Website",
      subheading: "Build something amazing",
      ctaText: "Get Started",
      ctaLink: "#",
    } as HeroBlockContent,
    wysiwyg: {
      html: "<p>Start writing...</p>",
    } as WYSIWYGBlockContent,
    features: {
      title: "Our Features",
      features: [
        {
          id: "1",
          icon: "Zap",
          title: "Fast",
          description: "Lightning fast performance",
        },
        {
          id: "2",
          icon: "Shield",
          title: "Secure",
          description: "Enterprise-grade security",
        },
        {
          id: "3",
          icon: "Heart",
          title: "Reliable",
          description: "99.9% uptime guarantee",
        },
      ],
      columns: 3,
    } as FeaturesBlockContent,
    cta: {
      heading: "Ready to get started?",
      description: "Join thousands of satisfied customers",
      buttonText: "Start Free Trial",
      buttonLink: "#",
      style: "solid",
    } as CTABlockContent,
    gallery: {
      images: [],
      columns: 3,
      aspectRatio: "landscape",
    } as GalleryBlockContent,
    testimonials: {
      testimonials: [],
    } as TestimonialsBlockContent,
    faq: {
      faqs: [],
    } as FAQBlockContent,
  };

  return {
    id,
    type,
    content: defaultContent[type],
    settings: {
      padding: "medium",
      textAlign: "left",
    },
  };
}
