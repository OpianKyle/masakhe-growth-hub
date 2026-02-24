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
  {
    id: "beauty",
    name: "Beauty & Wellness",
    description: "For salons, spas, beauty bars, and wellness practitioners",
    icon: "sparkles",
    color: "bg-pink-600",
    preview: "Elegant layout with services menu, gallery, testimonials, and booking info",
  },
  {
    id: "construction",
    name: "Construction & Trade",
    description: "For builders, plumbers, electricians, and handyman services",
    icon: "hard-hat",
    color: "bg-amber-700",
    preview: "Sturdy design with project gallery, services list, and quote request",
  },
  {
    id: "creative",
    name: "Creative & Freelance",
    description: "For photographers, designers, artists, and content creators",
    icon: "palette",
    color: "bg-purple-600",
    preview: "Portfolio-style layout with gallery showcase, about, and contact sections",
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

    case "beauty":
      return {
        businessName: name,
        slug,
        templateId: "beauty",
        theme: { primary: "#db2777", accent: "#a855f7" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "centered",
              title: "Your Beauty, Our Passion",
              subtitle: "Treat yourself to a world-class pampering experience. Expert stylists, premium products, and a welcoming atmosphere.",
              badgeText: "Book Your Appointment Today",
              ctaPrimaryText: "View Services",
              ctaSecondaryText: "Book Now",
              backgroundImageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "8+", label: "Years Experience" },
                { value: "2000+", label: "Happy Clients" },
                { value: "4.9", label: "Star Rating" },
                { value: "15+", label: "Treatments" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Treatments",
              subtitle: "Services & Pricing",
              items: [
                { title: "Braids & Cornrows", desc: "Traditional and modern braid styles, neatly done", price: "R250" },
                { title: "Relaxer Treatment", desc: "Full relaxer with deep conditioning and blow-dry", price: "R350" },
                { title: "Gel Nails (Full Set)", desc: "Long-lasting gel overlay with design of your choice", price: "R400" },
                { title: "Facial & Skin Care", desc: "Deep cleanse facial with hydrating mask and massage", price: "R300" },
                { title: "Lash Extensions", desc: "Classic or volume lash extensions, natural look", price: "R450" },
                { title: "Massage Therapy", desc: "Full body relaxation massage with essential oils", price: "R500" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Work",
              subtitle: "See the transformations",
              images: [
                { url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600", caption: "Hair Styling" },
                { url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=600", caption: "Nail Art" },
                { url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600", caption: "Skincare" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Client Love",
              subtitle: "What our clients say about us",
              items: [
                { name: "Lerato N.", role: "Regular Client", text: "The best salon in my area! Always leave feeling like a queen. Professional and friendly." },
                { name: "Zanele M.", role: "Bridal Client", text: "They did my wedding hair and makeup perfectly. Everyone was asking who my stylist was!" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Book Your Visit",
              subtitle: "Walk-ins welcome, but booking guarantees your spot.",
              phone: "+27 63 456 7890",
              email: "bookings@beautystudio.co.za",
              address: "Shop 12, Eastgate Mall, Bedfordview, 2007",
              whatsapp: "+27 63 456 7890",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "construction":
      return {
        businessName: name,
        slug,
        templateId: "construction",
        theme: { primary: "#b45309", accent: "#d97706" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "bold",
              title: "Building Quality You Can Trust",
              subtitle: "From renovations to new builds, we deliver professional construction and maintenance services across Gauteng.",
              badgeText: "Licensed & Insured",
              ctaPrimaryText: "Get a Free Quote",
              ctaSecondaryText: "View Our Projects",
              backgroundImageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "12+", label: "Years in Business" },
                { value: "300+", label: "Projects Done" },
                { value: "100%", label: "Licensed" },
                { value: "Free", label: "Quotations" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Us",
              subtitle: "Our Promise to You",
              imagePosition: "right",
              items: [
                { title: "Quality Workmanship", desc: "Every project completed to the highest standards with premium materials." },
                { title: "On-Time Delivery", desc: "We stick to timelines and keep you updated every step of the way." },
                { title: "Fair Pricing", desc: "Transparent quotations with no hidden costs. Pay for what you see." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Services",
              subtitle: "What We Do",
              items: [
                { title: "Residential Building", desc: "New homes, extensions, and complete house renovations" },
                { title: "Plumbing", desc: "Installations, repairs, geyser replacements, and drain unblocking" },
                { title: "Electrical Work", desc: "Wiring, DB board upgrades, solar installations, and COC certificates" },
                { title: "Painting & Waterproofing", desc: "Interior and exterior painting, damp-proofing, and roof sealing" },
                { title: "Tiling & Flooring", desc: "Ceramic, porcelain, vinyl, and laminate floor installations" },
                { title: "Roofing", desc: "Roof repairs, replacements, gutters, and fascia boards" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Projects",
              subtitle: "Recent work we're proud of",
              images: [
                { url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=600", caption: "Home Renovation" },
                { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=600", caption: "Commercial Build" },
                { url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=600", caption: "Interior Fitout" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Client Testimonials",
              subtitle: "What homeowners say about our work",
              items: [
                { name: "Bongani T.", role: "Homeowner, Pretoria", text: "They renovated our entire kitchen and bathroom. Excellent quality and finished on time. Highly recommend!" },
                { name: "Sarah vdM.", role: "Property Developer", text: "Reliable team that delivers what they promise. We've used them on 5 projects now and counting." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Request a Quote",
              subtitle: "Get a free, no-obligation quotation for your project.",
              phone: "+27 72 890 1234",
              email: "quotes@buildright.co.za",
              address: "14 Industrial Road, Midrand, 1685",
              whatsapp: "+27 72 890 1234",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "creative":
      return {
        businessName: name,
        slug,
        templateId: "creative",
        theme: { primary: "#7c3aed", accent: "#ec4899" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "centered",
              title: "Telling Stories Through Creative Work",
              subtitle: "Photographer, designer, and visual storyteller based in South Africa. Available for commercial and personal projects.",
              badgeText: "Available for Bookings",
              ctaPrimaryText: "View Portfolio",
              ctaSecondaryText: "Get In Touch",
              backgroundImageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "6+", label: "Years Creating" },
                { value: "400+", label: "Projects" },
                { value: "50+", label: "Brand Clients" },
                { value: "Award", label: "Winning Work" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "About Me",
              quote: "I believe every brand has a story worth telling — my job is to make it unforgettable.",
              imagePosition: "left",
              items: [
                { title: "Creative Vision", desc: "I bring a unique perspective shaped by South African culture, colour, and energy." },
                { title: "End-to-End Service", desc: "From concept to final delivery, I handle every detail so you can focus on your business." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "What I Offer",
              subtitle: "Services & Packages",
              items: [
                { title: "Brand Photography", desc: "Professional product and lifestyle shoots for your brand", price: "From R2,500" },
                { title: "Event Coverage", desc: "Weddings, corporate functions, and launches captured beautifully", price: "From R4,000" },
                { title: "Logo & Brand Design", desc: "Complete brand identity including logo, colours, and guidelines", price: "From R3,000" },
                { title: "Social Media Content", desc: "Monthly content packs with photos, graphics, and reels", price: "From R1,800" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Portfolio",
              subtitle: "Selected recent work",
              images: [
                { url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=600", caption: "Portrait Session" },
                { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=600", caption: "Brand Campaign" },
                { url: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?auto=format&fit=crop&q=80&w=600", caption: "Product Photography" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Kind Words",
              subtitle: "From clients and collaborators",
              items: [
                { name: "Amahle S.", role: "Fashion Brand Owner", text: "Incredible eye for detail! The photos elevated our brand to a whole new level. Bookings doubled." },
                { name: "David K.", role: "Event Organiser", text: "Professional, creative, and so easy to work with. Delivered stunning photos within 48 hours." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Let's Create Together",
              subtitle: "Ready to bring your vision to life? Let's chat.",
              phone: "+27 82 345 6789",
              email: "hello@creativestudio.co.za",
              address: "Studio 4, Maboneng Precinct, Johannesburg, 2094",
              whatsapp: "+27 82 345 6789",
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
