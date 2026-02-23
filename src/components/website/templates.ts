import { SiteConfig, makeSectionId } from "@/types/site";

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  preview: string;
}

export const templateList: TemplateInfo[] = [
  {
    id: "professional",
    name: "Professional Services",
    description: "Perfect for consultants, agencies, and B2B businesses",
    icon: "briefcase",
    color: "bg-blue-600",
    preview: "Clean, corporate layout with features, about us, and services sections",
  },
  {
    id: "restaurant",
    name: "Restaurant & Food",
    description: "Great for restaurants, cafes, catering, and food businesses",
    icon: "utensils",
    color: "bg-orange-600",
    preview: "Warm design with menu, gallery, testimonials, and contact sections",
  },
  {
    id: "retail",
    name: "Retail & Shop",
    description: "Ideal for retail stores, spaza shops, and product businesses",
    icon: "shopping-bag",
    color: "bg-green-600",
    preview: "Vibrant layout with products, gallery, stats, and customer reviews",
  },
];

export function buildTemplate(templateId: string, businessName?: string): SiteConfig {
  const name = businessName || "My Business";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  switch (templateId) {
    case "restaurant":
      return {
        businessName: name,
        slug,
        templateId: "restaurant",
        theme: { primary: "#ea580c", accent: "#d97706" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "centered",
              title: "Authentic Flavours, Made with Love",
              subtitle: "Experience the best of South African cuisine in a warm, welcoming atmosphere.",
              badgeText: "Now Open for Dine-in & Takeaway",
              ctaPrimaryText: "View Our Menu",
              ctaSecondaryText: "Book a Table",
              backgroundImageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "5+", label: "Years Serving" },
                { value: "200+", label: "Menu Items" },
                { value: "4.8", label: "Star Rating" },
                { value: "Daily", label: "Fresh Prep" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Menu Highlights",
              subtitle: "Chef's Specials",
              items: [
                { title: "Braai Platter", desc: "Succulent grilled meats with pap and chakalaka", price: "R189" },
                { title: "Bunny Chow", desc: "Traditional Durban-style curry in a bread bowl", price: "R75" },
                { title: "Bobotie", desc: "Classic Cape Malay spiced mince with yellow rice", price: "R95" },
                { title: "Shisa Nyama", desc: "Choose your cut, grilled to perfection over open flames", price: "R120" },
                { title: "Vetkoek & Mince", desc: "Deep-fried dough filled with savory spiced mince", price: "R55" },
                { title: "Malva Pudding", desc: "Sweet spongy dessert with warm custard sauce", price: "R45" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Space",
              subtitle: "Step inside our restaurant",
              images: [
                { url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600", caption: "Dining Area" },
                { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600", caption: "Signature Dishes" },
                { url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600", caption: "Our Kitchen" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "What Our Guests Say",
              subtitle: "Real reviews from happy customers",
              items: [
                { name: "Thandi M.", role: "Regular Customer", text: "Best braai in Joburg! The atmosphere is amazing and the staff are so friendly." },
                { name: "John P.", role: "Food Blogger", text: "Authentic South African cuisine that reminds you of home cooking. A must-visit!" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Visit Us",
              subtitle: "We'd love to welcome you. Walk in or reserve your table.",
              phone: "+27 11 234 5678",
              email: "hello@restaurant.co.za",
              address: "42 Vilakazi Street, Soweto, 1804",
              whatsapp: "+27 11 234 5678",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "retail":
      return {
        businessName: name,
        slug,
        templateId: "retail",
        theme: { primary: "#16a34a", accent: "#0d9488" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "bold",
              title: "Quality Products, Great Prices",
              subtitle: "Your one-stop shop for everyday essentials and unique local goods.",
              badgeText: "Trusted Local Shop",
              ctaPrimaryText: "Shop Now",
              ctaSecondaryText: "WhatsApp Us",
              backgroundImageUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "1000+", label: "Products" },
                { value: "500+", label: "Happy Customers" },
                { value: "Same Day", label: "Delivery" },
                { value: "Best", label: "Prices" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Shop With Us",
              subtitle: "Our Promise",
              imagePosition: "right",
              items: [
                { title: "Quality Guaranteed", desc: "Every product is carefully selected for quality and value." },
                { title: "Fast Delivery", desc: "Same-day delivery within 10km radius of our store." },
                { title: "Local & Imported", desc: "Best of both worlds - supporting local and global brands." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Product Categories",
              subtitle: "What We Sell",
              items: [
                { title: "Groceries & Essentials", desc: "Fresh produce, canned goods, and household items" },
                { title: "Fashion & Clothing", desc: "Trendy and affordable apparel for the whole family" },
                { title: "Electronics", desc: "Phones, accessories, and gadgets at competitive prices" },
                { title: "Beauty & Health", desc: "Skincare, cosmetics, and wellness products" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Store",
              subtitle: "Visit us today",
              images: [
                { url: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=600", caption: "Store Front" },
                { url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600", caption: "Product Display" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Customer Reviews",
              subtitle: "What our shoppers say",
              items: [
                { name: "Sipho K.", role: "Loyal Customer", text: "Always find what I need here. Great prices and the staff are always helpful!" },
                { name: "Nomsa D.", role: "Local Resident", text: "My go-to shop for everything. Fast delivery and quality products every time." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Find Us",
              subtitle: "Visit our store or order for delivery.",
              phone: "+27 12 345 6789",
              email: "orders@myshop.co.za",
              address: "Shop 5, Maponya Mall, Soweto, 1818",
              whatsapp: "+27 12 345 6789",
              enableWhatsApp: true,
            },
          },
        ],
      };

    default:
      return {
        businessName: name,
        slug,
        templateId: "professional",
        theme: { primary: "#2563eb", accent: "#16a34a" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "corporate",
              title: "Empowering Local SMMEs to Grow Online",
              subtitle: "Professional digital presence for South African businesses. Fast, reliable, and compliant.",
              badgeText: "Masakhe Verified SMME",
              ctaPrimaryText: "Get a Quote",
              ctaSecondaryText: "Contact Us",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "10+", label: "Years Operating" },
                { value: "500+", label: "Happy Clients" },
                { value: "24h", label: "Response Time" },
                { value: "Yes", label: "POPIA Ready" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "What We Offer",
              subtitle: "Our Expertise",
              imagePosition: "right",
              items: [
                { title: "Strategic Planning", desc: "Helping you map out your business growth path." },
                { title: "Digital Marketing", desc: "Reaching more customers where they spend their time." },
                { title: "Compliance Support", desc: "Ensuring your business stays ahead of regulations." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "Our Story",
              quote: "We believe in the power of South African small businesses to transform communities.",
              imagePosition: "left",
              items: [
                { title: "Locally Based", desc: "We understand the unique challenges of the SA market." },
                { title: "Expert Team", desc: "Decades of combined experience in business consulting." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Featured Services",
              subtitle: "Comprehensive Solutions",
              items: [
                { title: "Business Registration", desc: "Fast tracking your CIPC registration process." },
                { title: "Tax Compliance", desc: "Keeping your SARS status green and worry-free." },
                { title: "Web Presence", desc: "Building sites that actually convert visitors to clients." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Get In Touch",
              subtitle: "We'd love to hear from you. Reach out today.",
              email: "contact@business.co.za",
              phone: "012 345 6789",
              address: "123 Business Way, Sandton, 2196",
              whatsapp: "+27 12 345 6789",
              enableWhatsApp: true,
            },
          },
        ],
      };
  }
}
