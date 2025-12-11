// Page layout templates with pre-configured block structures

import { Block, createDefaultBlock } from "./blocks";

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  category: "landing" | "info" | "marketing" | "basic";
  preview?: string;
  blocks: Block[];
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: "blank",
    name: "Blank Page",
    description: "Start from scratch with no blocks",
    category: "basic",
    blocks: [],
  },
  {
    id: "simple-page",
    name: "Simple Page",
    description: "Basic page with title and content",
    category: "basic",
    blocks: [
      {
        ...createDefaultBlock("hero"),
        content: {
          heading: "Page Title",
          subheading: "A brief introduction to this page",
          ctaText: "",
          ctaLink: "",
        },
      },
      createDefaultBlock("wysiwyg"),
    ],
  },
  {
    id: "landing-page",
    name: "Landing Page",
    description: "Hero, features, testimonials, and CTA",
    category: "landing",
    blocks: [
      {
        ...createDefaultBlock("hero"),
        content: {
          heading: "Transform Your Business Today",
          subheading:
            "The all-in-one solution to help you achieve your goals faster",
          ctaText: "Get Started Free",
          ctaLink: "#signup",
          secondaryCtaText: "Learn More",
          secondaryCtaLink: "#features",
        },
      },
      {
        ...createDefaultBlock("features"),
        content: {
          title: "Why Choose Us",
          subtitle: "Everything you need to succeed",
          features: [
            {
              id: "1",
              icon: "Zap",
              title: "Lightning Fast",
              description: "Optimized for speed and performance",
            },
            {
              id: "2",
              icon: "Shield",
              title: "Secure by Default",
              description: "Enterprise-grade security built-in",
            },
            {
              id: "3",
              icon: "TrendingUp",
              title: "Scale with Ease",
              description: "Grow without limits or complexity",
            },
            {
              id: "4",
              icon: "Heart",
              title: "Customer Focused",
              description: "We're here to help you succeed",
            },
            {
              id: "5",
              icon: "Smartphone",
              title: "Mobile Ready",
              description: "Perfect experience on any device",
            },
            {
              id: "6",
              icon: "Lock",
              title: "Privacy First",
              description: "Your data stays yours, always",
            },
          ],
          columns: 3,
        },
      },
      {
        ...createDefaultBlock("testimonials"),
        content: {
          title: "What Our Customers Say",
          testimonials: [
            {
              id: "1",
              quote:
                "This product has completely transformed how we work. Highly recommended!",
              author: "Sarah Johnson",
              role: "CEO",
              company: "TechCorp",
            },
            {
              id: "2",
              quote:
                "The best investment we've made this year. ROI was immediate.",
              author: "Michael Chen",
              role: "Founder",
              company: "StartupXYZ",
            },
            {
              id: "3",
              quote:
                "Customer support is outstanding. They truly care about your success.",
              author: "Emily Rodriguez",
              role: "Product Manager",
              company: "InnovateCo",
            },
          ],
        },
      },
      {
        ...createDefaultBlock("cta"),
        content: {
          heading: "Ready to Get Started?",
          description:
            "Join thousands of satisfied customers and transform your business today",
          buttonText: "Start Free Trial",
          buttonLink: "#signup",
          style: "solid",
        },
      },
    ],
  },
  {
    id: "about-page",
    name: "About Page",
    description: "Company story with team section",
    category: "info",
    blocks: [
      {
        ...createDefaultBlock("hero"),
        content: {
          heading: "About Us",
          subheading:
            "Our mission is to help businesses succeed through innovative solutions",
          ctaText: "",
          ctaLink: "",
        },
      },
      {
        ...createDefaultBlock("wysiwyg"),
        content: {
          html: "<h2>Our Story</h2><p>Founded in [year], we set out to solve a problem that many businesses face...</p>",
        },
      },
      {
        ...createDefaultBlock("features"),
        content: {
          title: "Our Values",
          features: [
            {
              id: "1",
              icon: "Users",
              title: "Customer First",
              description:
                "Everything we do is focused on helping our customers succeed",
            },
            {
              id: "2",
              icon: "Lightbulb",
              title: "Innovation",
              description:
                "We constantly push boundaries to deliver cutting-edge solutions",
            },
            {
              id: "3",
              icon: "Heart",
              title: "Integrity",
              description:
                "We build trust through transparency and honest communication",
            },
          ],
          columns: 3,
        },
      },
      {
        ...createDefaultBlock("cta"),
        content: {
          heading: "Want to Learn More?",
          description: "Get in touch with our team to see how we can help",
          buttonText: "Contact Us",
          buttonLink: "/contact",
          style: "solid",
        },
      },
    ],
  },
  {
    id: "contact-page",
    name: "Contact Page",
    description: "Contact information and inquiry form",
    category: "info",
    blocks: [
      {
        ...createDefaultBlock("hero"),
        content: {
          heading: "Get in Touch",
          subheading:
            "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
          ctaText: "",
          ctaLink: "",
        },
      },
      {
        ...createDefaultBlock("wysiwyg"),
        content: {
          html: "<h2>Contact Information</h2><p>Email: hello@example.com<br>Phone: (555) 123-4567<br>Address: 123 Main St, City, State 12345</p>",
        },
      },
    ],
  },
  {
    id: "features-page",
    name: "Features Page",
    description: "Detailed feature showcase",
    category: "marketing",
    blocks: [
      {
        ...createDefaultBlock("hero"),
        content: {
          heading: "Powerful Features",
          subheading:
            "Everything you need to build, grow, and scale your business",
          ctaText: "Start Free Trial",
          ctaLink: "#signup",
        },
      },
      {
        ...createDefaultBlock("features"),
        content: {
          title: "Core Features",
          subtitle: "Built for modern businesses",
          features: [
            {
              id: "1",
              icon: "Zap",
              title: "Fast Performance",
              description: "Lightning-fast load times and smooth interactions",
            },
            {
              id: "2",
              icon: "Globe",
              title: "Global CDN",
              description: "Content delivered from edge locations worldwide",
            },
            {
              id: "3",
              icon: "Lock",
              title: "Advanced Security",
              description: "Bank-level encryption and security protocols",
            },
            {
              id: "4",
              icon: "BarChart",
              title: "Analytics",
              description: "Deep insights into user behavior and performance",
            },
            {
              id: "5",
              icon: "RefreshCw",
              title: "Auto Updates",
              description: "Always up-to-date with the latest features",
            },
            {
              id: "6",
              icon: "Headphones",
              title: "24/7 Support",
              description: "Round-the-clock assistance when you need it",
            },
          ],
          columns: 3,
        },
      },
      {
        ...createDefaultBlock("cta"),
        content: {
          heading: "Experience the Difference",
          description:
            "See why thousands of businesses trust us with their growth",
          buttonText: "Get Started",
          buttonLink: "#signup",
          style: "solid",
        },
      },
    ],
  },
  {
    id: "pricing-page",
    name: "Pricing Page",
    description: "Pricing tiers with features and CTA",
    category: "marketing",
    blocks: [
      {
        ...createDefaultBlock("hero"),
        content: {
          heading: "Simple, Transparent Pricing",
          subheading:
            "Choose the plan that fits your needs. No hidden fees, cancel anytime.",
          ctaText: "",
          ctaLink: "",
        },
      },
      {
        ...createDefaultBlock("wysiwyg"),
        content: {
          html: "<div class='text-center'><p>Pricing tiers will go here - integrate with your pricing component</p></div>",
        },
      },
      {
        ...createDefaultBlock("faq"),
        content: {
          title: "Frequently Asked Questions",
          faqs: [
            {
              id: "1",
              question: "Can I change my plan later?",
              answer:
                "Yes! You can upgrade or downgrade your plan at any time from your account settings.",
            },
            {
              id: "2",
              question: "What payment methods do you accept?",
              answer:
                "We accept all major credit cards, PayPal, and bank transfers for enterprise plans.",
            },
            {
              id: "3",
              question: "Is there a free trial?",
              answer:
                "Yes! All plans come with a 14-day free trial. No credit card required.",
            },
          ],
        },
      },
      {
        ...createDefaultBlock("cta"),
        content: {
          heading: "Ready to Get Started?",
          description: "Start your free trial today and see the difference",
          buttonText: "Start Free Trial",
          buttonLink: "#signup",
          style: "solid",
        },
      },
    ],
  },
  {
    id: "faq-page",
    name: "FAQ Page",
    description: "Comprehensive FAQ with categories",
    category: "info",
    blocks: [
      {
        ...createDefaultBlock("hero"),
        content: {
          heading: "Frequently Asked Questions",
          subheading:
            "Find answers to common questions about our product and services",
          ctaText: "",
          ctaLink: "",
        },
      },
      {
        ...createDefaultBlock("faq"),
        content: {
          title: "General Questions",
          faqs: [
            {
              id: "1",
              question: "How do I get started?",
              answer:
                "Simply sign up for a free account and follow our quick-start guide.",
            },
            {
              id: "2",
              question: "Do you offer customer support?",
              answer:
                "Yes! We offer 24/7 customer support via email, chat, and phone.",
            },
            {
              id: "3",
              question: "Can I cancel anytime?",
              answer:
                "Absolutely. You can cancel your subscription at any time with no penalties.",
            },
          ],
        },
      },
      {
        ...createDefaultBlock("cta"),
        content: {
          heading: "Still Have Questions?",
          description:
            "Our team is here to help. Get in touch and we'll respond quickly.",
          buttonText: "Contact Support",
          buttonLink: "/contact",
          style: "solid",
        },
      },
    ],
  },
  {
    id: "gallery-page",
    name: "Gallery Page",
    description: "Image showcase with grid layout",
    category: "marketing",
    blocks: [
      {
        ...createDefaultBlock("hero"),
        content: {
          heading: "Our Gallery",
          subheading: "Explore our collection of work and achievements",
          ctaText: "",
          ctaLink: "",
        },
      },
      {
        ...createDefaultBlock("gallery"),
        content: {
          images: [],
          columns: 3,
          aspectRatio: "landscape",
        },
      },
    ],
  },
];

// Helper to get template by ID
export function getTemplateById(id: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find((t) => t.id === id);
}

// Helper to get templates by category
export function getTemplatesByCategory(
  category: LayoutTemplate["category"],
): LayoutTemplate[] {
  return LAYOUT_TEMPLATES.filter((t) => t.category === category);
}
