import { SiteConfig, makeSectionId } from "@/types/site";

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  preview: string;
  premium?: boolean;
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
  {
    id: "legal",
    name: "Legal & Law Firm",
    description: "For attorneys, advocates, and legal consultancies",
    icon: "scale",
    color: "bg-slate-700",
    preview: "Authoritative layout with practice areas, team profiles, and consultation booking",
  },
  {
    id: "accounting",
    name: "Accounting & Finance",
    description: "For accountants, bookkeepers, tax practitioners, and auditors",
    icon: "calculator",
    color: "bg-emerald-700",
    preview: "Professional layout with services, credentials, and client testimonials",
  },
  {
    id: "realestate",
    name: "Real Estate & Property",
    description: "For estate agents, property managers, and developers",
    icon: "home",
    color: "bg-sky-700",
    preview: "Property-focused layout with listings showcase, about, and contact sections",
  },
  {
    id: "healthcare",
    name: "Healthcare & Medical",
    description: "For doctors, dentists, clinics, and healthcare practitioners",
    icon: "heart-pulse",
    color: "bg-teal-600",
    preview: "Clean medical layout with services, practitioner info, and appointment booking",
  },
  {
    id: "education",
    name: "Education & Tutoring",
    description: "For tutors, training centres, schools, and online educators",
    icon: "graduation-cap",
    color: "bg-indigo-600",
    preview: "Academic layout with courses, credentials, and student testimonials",
  },
  {
    id: "fitness",
    name: "Fitness & Sports",
    description: "For gyms, personal trainers, sports coaches, and wellness centres",
    icon: "dumbbell",
    color: "bg-red-600",
    preview: "Energetic layout with programs, schedules, and transformation gallery",
  },
  {
    id: "automotive",
    name: "Automotive & Mechanic",
    description: "For mechanics, auto electricians, panel beaters, and car washes",
    icon: "wrench",
    color: "bg-zinc-700",
    preview: "Industrial layout with services, pricing, and workshop gallery",
  },
  {
    id: "cleaning",
    name: "Cleaning Services",
    description: "For cleaning companies, pest control, and sanitation services",
    icon: "sparkles",
    color: "bg-cyan-600",
    preview: "Fresh layout with service packages, areas covered, and customer reviews",
  },
  {
    id: "technology",
    name: "IT & Technology",
    description: "For IT support, software developers, web designers, and tech consultants",
    icon: "monitor",
    color: "bg-violet-600",
    preview: "Modern tech layout with solutions, expertise, and case studies",
  },
  {
    id: "agriculture",
    name: "Agriculture & Farming",
    description: "For farmers, agri-businesses, nurseries, and livestock breeders",
    icon: "leaf",
    color: "bg-lime-700",
    preview: "Natural layout with products, farm gallery, and supply information",
  },
  {
    id: "transport",
    name: "Transport & Logistics",
    description: "For courier services, trucking companies, and delivery businesses",
    icon: "truck",
    color: "bg-orange-700",
    preview: "Efficient layout with services, coverage areas, and fleet gallery",
  },
  {
    id: "events",
    name: "Events & Wedding Planning",
    description: "For event planners, wedding coordinators, and venue hire",
    icon: "party-popper",
    color: "bg-rose-600",
    preview: "Elegant layout with packages, event gallery, and booking information",
  },
  {
    id: "security",
    name: "Security Services",
    description: "For security companies, armed response, and access control providers",
    icon: "shield",
    color: "bg-gray-800",
    preview: "Trustworthy layout with services, certifications, and coverage areas",
  },
  {
    id: "travel",
    name: "Travel & Tourism",
    description: "For travel agents, tour operators, lodges, and B&Bs",
    icon: "map-pin",
    color: "bg-amber-600",
    preview: "Scenic layout with packages, destination gallery, and booking information",
  },
  {
    id: "consulting",
    name: "Consulting & Advisory",
    description: "For management consultants, HR advisors, and business coaches",
    icon: "lightbulb",
    color: "bg-yellow-600",
    preview: "Strategic layout with expertise areas, methodology, and client success stories",
  },
  {
    id: "showroom",
    name: "Car Showroom",
    description: "Premium template for luxury and used car dealerships with vehicle inventory",
    icon: "car",
    color: "bg-zinc-900",
    preview: "Sleek dark luxury layout with live vehicle listings, gallery, finance options, and lead capture",
    premium: true,
  },
  {
    id: "brokerage",
    name: "Financial Brokerage",
    description: "Premium template for insurance brokers and FSP-licensed financial advisors",
    icon: "trending-up",
    color: "bg-blue-950",
    preview: "Professional navy layout with services, team profiles, credentials, and quote request forms",
    premium: true,
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
              variant: "cards",
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
              variant: "masonry",
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
              variant: "cards",
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
              variant: "bordered",
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
              variant: "featured",
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
              variant: "large-quote",
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
              variant: "light",
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
              variant: "dark",
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
              variant: "bordered",
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
              variant: "minimal",
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
              variant: "gradient",
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
              variant: "cards",
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
              variant: "compact",
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
              variant: "masonry",
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
              variant: "large-quote",
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
              variant: "light",
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

    case "legal":
      return {
        businessName: name,
        slug,
        templateId: "legal",
        theme: { primary: "#334155", accent: "#1e293b" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "minimal",
              title: "Justice, Integrity, Results",
              subtitle: "Experienced legal professionals providing trusted counsel to individuals and businesses across South Africa.",
              badgeText: "Free Initial Consultation",
              ctaPrimaryText: "Our Practice Areas",
              ctaSecondaryText: "Book a Consultation",
              backgroundImageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "15+", label: "Years in Practice" },
                { value: "2000+", label: "Cases Handled" },
                { value: "95%", label: "Success Rate" },
                { value: "24/7", label: "Availability" },
              ],
              variant: "dark",
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Our Firm",
              subtitle: "Our Commitment",
              imagePosition: "right",
              variant: "icon-grid",
              items: [
                { title: "Expert Legal Team", desc: "Our attorneys bring decades of combined experience across multiple practice areas." },
                { title: "Client-Centred Approach", desc: "We tailor our strategy to your unique situation, ensuring the best possible outcome." },
                { title: "Transparent Fees", desc: "No hidden costs. We provide clear fee structures and regular case updates." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Practice Areas",
              subtitle: "Legal Services",
              variant: "bordered",
              items: [
                { title: "Litigation", desc: "Civil and commercial dispute resolution in all courts" },
                { title: "Family Law", desc: "Divorce, custody, maintenance, and protection orders" },
                { title: "Corporate Law", desc: "Company formation, contracts, mergers, and compliance" },
                { title: "Labour Law", desc: "CCMA representation, unfair dismissal, and workplace disputes" },
                { title: "Criminal Defence", desc: "Bail applications, trial defence, and appeals" },
                { title: "Property & Conveyancing", desc: "Property transfers, bond registrations, and sectional title" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Firm",
              subtitle: "Professionalism you can trust",
              variant: "featured",
              images: [
                { url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=600", caption: "Our Offices" },
                { url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600", caption: "Legal Team" },
                { url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600", caption: "Client Meeting" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Client Testimonials",
              subtitle: "What our clients say about us",
              variant: "large-quote",
              items: [
                { name: "Mandla K.", role: "Business Owner", text: "They handled our corporate dispute with professionalism and achieved an excellent outcome. Highly recommended." },
                { name: "Fatima B.", role: "Private Client", text: "Compassionate and thorough throughout my family law matter. They made a difficult time much easier to navigate." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Schedule a Consultation",
              subtitle: "Get expert legal advice. Your first consultation is free.",
              variant: "light",
              phone: "+27 11 783 4567",
              email: "info@lawfirm.co.za",
              address: "15 Fredman Drive, Sandton, 2196",
              whatsapp: "+27 11 783 4567",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "accounting":
      return {
        businessName: name,
        slug,
        templateId: "accounting",
        theme: { primary: "#047857", accent: "#0d9488" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "corporate",
              title: "Numbers You Can Trust",
              subtitle: "Registered tax practitioners and accountants helping South African businesses stay compliant and grow profitably.",
              badgeText: "SARS Registered Tax Practitioner",
              ctaPrimaryText: "Our Services",
              ctaSecondaryText: "Get a Quote",
              backgroundImageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "10+", label: "Years Experience" },
                { value: "500+", label: "Clients Served" },
                { value: "100%", label: "SARS Compliant" },
                { value: "R50M+", label: "Tax Saved" },
              ],
              variant: "cards",
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Us",
              subtitle: "Our Expertise",
              imagePosition: "right",
              variant: "numbered",
              items: [
                { title: "SARS Compliant", desc: "We keep your tax affairs in order so you never face penalties or audits." },
                { title: "Cloud Accounting", desc: "Modern cloud-based systems for real-time financial visibility and reporting." },
                { title: "Industry Specialists", desc: "Deep experience across retail, construction, professional services, and more." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Services",
              subtitle: "Accounting & Tax Solutions",
              variant: "compact",
              items: [
                { title: "Tax Returns", desc: "Individual and company tax return preparation and submission" },
                { title: "Bookkeeping", desc: "Monthly bookkeeping, bank reconciliations, and financial statements" },
                { title: "Payroll", desc: "Payslips, UIF, PAYE, and SDL submissions" },
                { title: "Auditing", desc: "Independent reviews and audits for compliance and investor confidence" },
                { title: "CIPC Registration", desc: "Company registration, annual returns, and BEE certificates" },
                { title: "BEE Verification", desc: "B-BBEE scorecard assessment and verification services" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Practice",
              subtitle: "Professional and modern",
              images: [
                { url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600", caption: "Financial Analysis" },
                { url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600", caption: "Our Office" },
                { url: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&q=80&w=600", caption: "Team Meeting" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Client Feedback",
              subtitle: "Trusted by businesses across South Africa",
              variant: "minimal",
              items: [
                { name: "Pieter vR.", role: "Restaurant Owner, Pretoria", text: "They sorted out years of backlog tax returns and saved us thousands. Professional and reliable service." },
                { name: "Nolwazi M.", role: "Freelance Consultant", text: "Finally found an accountant who explains things in plain language. My tax affairs have never been better." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Get In Touch",
              subtitle: "Let us handle your numbers so you can focus on your business.",
              phone: "+27 12 362 4890",
              email: "info@accounting.co.za",
              address: "22 Pretorius Street, Pretoria CBD, 0002",
              whatsapp: "+27 12 362 4890",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "realestate":
      return {
        businessName: name,
        slug,
        templateId: "realestate",
        theme: { primary: "#0369a1", accent: "#0ea5e9" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "gradient",
              title: "Find Your Dream Property",
              subtitle: "Buy, sell, or rent with confidence. Expert property professionals serving the greater Cape Town area.",
              badgeText: "EAAB Registered Agency",
              ctaPrimaryText: "View Listings",
              ctaSecondaryText: "Free Valuation",
              backgroundImageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "8+", label: "Years in Property" },
                { value: "350+", label: "Properties Sold" },
                { value: "R500M+", label: "Total Sales Value" },
                { value: "98%", label: "Client Satisfaction" },
              ],
              variant: "cards",
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why List With Us",
              subtitle: "Our Advantage",
              imagePosition: "right",
              items: [
                { title: "Local Market Experts", desc: "We know every suburb, every street, and every price trend in our area." },
                { title: "Maximum Exposure", desc: "Your property listed on all major portals plus our social media network." },
                { title: "End-to-End Service", desc: "From valuation to transfer, we handle every step of the process." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Services",
              subtitle: "Property Solutions",
              variant: "bordered",
              items: [
                { title: "Residential Sales", desc: "Houses, townhouses, and apartments in sought-after areas" },
                { title: "Commercial Leasing", desc: "Office space, retail, and industrial property rentals" },
                { title: "Property Management", desc: "Full tenant management, maintenance, and rent collection" },
                { title: "Valuations", desc: "Accurate market valuations for sale, insurance, or estate purposes" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Featured Properties",
              subtitle: "Recently listed and sold",
              variant: "masonry",
              images: [
                { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=600", caption: "Modern Family Home" },
                { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600", caption: "Luxury Villa" },
                { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600", caption: "Contemporary Apartment" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Happy Homeowners",
              subtitle: "What our clients say",
              items: [
                { name: "Jacques D.", role: "First-Time Buyer", text: "They found us the perfect home in our budget within two weeks. The whole process was seamless and stress-free." },
                { name: "Thandiwe N.", role: "Property Investor", text: "Excellent market knowledge and professional service. They manage three of my rental properties flawlessly." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Get a Free Valuation",
              subtitle: "Find out what your property is worth in today's market.",
              variant: "light",
              phone: "+27 21 461 7890",
              email: "info@properties.co.za",
              address: "10 Kloof Street, Gardens, Cape Town, 8001",
              whatsapp: "+27 21 461 7890",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "healthcare":
      return {
        businessName: name,
        slug,
        templateId: "healthcare",
        theme: { primary: "#0d9488", accent: "#14b8a6" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "minimal",
              title: "Your Health, Our Priority",
              subtitle: "Compassionate, quality healthcare for you and your family. Experienced practitioners in a modern, welcoming facility.",
              badgeText: "HPCSA Registered Practice",
              ctaPrimaryText: "Our Services",
              ctaSecondaryText: "Book an Appointment",
              backgroundImageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "12+", label: "Years of Care" },
                { value: "10,000+", label: "Patients Treated" },
                { value: "6", label: "Practitioners" },
                { value: "Medical Aid", label: "Accepted" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Our Practice",
              subtitle: "Patient-Centred Care",
              imagePosition: "right",
              variant: "icon-grid",
              items: [
                { title: "Qualified Professionals", desc: "All practitioners are HPCSA registered with years of clinical experience." },
                { title: "Modern Facilities", desc: "State-of-the-art equipment and a comfortable, hygienic environment." },
                { title: "Medical Aid & Cash", desc: "We accept all major medical aids and offer affordable cash rates." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Services",
              subtitle: "Healthcare Solutions",
              items: [
                { title: "General Consultations", desc: "Comprehensive check-ups, sick visits, and referrals" },
                { title: "Dental Care", desc: "Cleanings, fillings, extractions, and cosmetic dentistry" },
                { title: "Physiotherapy", desc: "Rehabilitation, sports injuries, and chronic pain management" },
                { title: "Occupational Health", desc: "Pre-employment medicals, drug testing, and workplace assessments" },
                { title: "Chronic Disease Management", desc: "Diabetes, hypertension, asthma, and HIV care programmes" },
                { title: "Family Planning", desc: "Contraception counselling, screenings, and reproductive health" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Facility",
              subtitle: "A welcoming space for your health",
              images: [
                { url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600", caption: "Reception Area" },
                { url: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=600", caption: "Consultation Room" },
                { url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600", caption: "Modern Equipment" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Patient Reviews",
              subtitle: "What our patients say",
              variant: "large-quote",
              items: [
                { name: "Sizwe M.", role: "Patient", text: "The doctors here are thorough and genuinely care. I've been bringing my whole family for years." },
                { name: "Anita P.", role: "Patient", text: "Short waiting times and excellent service. The physiotherapy department helped me recover from surgery quickly." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Book an Appointment",
              subtitle: "Walk-ins welcome. Medical aid and cash patients accepted.",
              variant: "gradient",
              phone: "+27 31 566 7890",
              email: "reception@healthpractice.co.za",
              address: "88 Umhlanga Rocks Drive, Durban, 4320",
              whatsapp: "+27 31 566 7890",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "education":
      return {
        businessName: name,
        slug,
        templateId: "education",
        theme: { primary: "#4338ca", accent: "#6366f1" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "centered",
              title: "Learn, Grow, Succeed",
              subtitle: "Expert tutoring and training programmes designed to unlock potential and achieve academic and professional excellence.",
              badgeText: "Enrol for 2025 Now Open",
              ctaPrimaryText: "View Courses",
              ctaSecondaryText: "Register Now",
              backgroundImageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "dark",
              items: [
                { value: "7+", label: "Years Teaching" },
                { value: "3000+", label: "Students Helped" },
                { value: "92%", label: "Pass Rate" },
                { value: "20+", label: "Subjects Offered" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "Our Approach",
              quote: "Every learner deserves the chance to succeed. We provide the tools, guidance, and support to make it happen.",
              imagePosition: "left",
              items: [
                { title: "Small Class Sizes", desc: "Maximum 10 learners per class for personalised attention and better results." },
                { title: "Qualified Educators", desc: "Our tutors hold degrees and have real classroom experience in SA curriculum." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Programmes",
              subtitle: "Courses & Training",
              variant: "bordered",
              items: [
                { title: "Matric Tutoring", desc: "All subjects covered for Grade 10-12, aligned with CAPS curriculum" },
                { title: "University Prep", desc: "NBT preparation, application guidance, and bridging courses" },
                { title: "Online Courses", desc: "Self-paced digital learning for flexible schedules" },
                { title: "Corporate Training", desc: "Skills development, leadership, and workplace training programmes" },
                { title: "Computer Literacy", desc: "Microsoft Office, internet skills, and basic IT for beginners" },
                { title: "Language Classes", desc: "English, Afrikaans, isiZulu, and business communication courses" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Learning Environment",
              subtitle: "Where success begins",
              variant: "featured",
              images: [
                { url: "https://images.unsplash.com/photo-1523050854058-8df90110c476?auto=format&fit=crop&q=80&w=600", caption: "Classroom Session" },
                { url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=600", caption: "Group Learning" },
                { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600", caption: "Computer Lab" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Student Success Stories",
              subtitle: "From our learners and parents",
              variant: "minimal",
              items: [
                { name: "Kagiso L.", role: "Matric Student", text: "My maths marks went from 38% to 74% in just one term. The tutors here really care about your success." },
                { name: "Mrs Dlamini", role: "Parent", text: "Both my children attend classes here. The improvement in their confidence and results has been remarkable." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Enrol Today",
              subtitle: "Spaces are limited. Secure your spot for the next term.",
              phone: "+27 11 492 3456",
              email: "enrol@learningcentre.co.za",
              address: "45 Commissioner Street, Johannesburg CBD, 2001",
              whatsapp: "+27 11 492 3456",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "transport":
      return {
        businessName: name,
        slug,
        templateId: "transport",
        theme: { primary: "#c2410c", accent: "#ea580c" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "bold",
              title: "Reliable Transport Solutions",
              subtitle: "From last-mile delivery to long-haul logistics, we move your goods safely and on time across South Africa.",
              badgeText: "Trusted Logistics Partner",
              ctaPrimaryText: "Get a Quote",
              ctaSecondaryText: "Track Shipment",
              backgroundImageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "dark",
              items: [
                { value: "10+", label: "Years on the Road" },
                { value: "50+", label: "Vehicles" },
                { value: "99%", label: "On-Time Delivery" },
                { value: "9 Provinces", label: "Coverage" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Us",
              subtitle: "Your Cargo in Safe Hands",
              imagePosition: "right",
              items: [
                { title: "Real-Time Tracking", desc: "Monitor your shipment every step of the way with live GPS tracking." },
                { title: "Insured Cargo", desc: "All goods are fully insured during transit for your peace of mind." },
                { title: "Flexible Solutions", desc: "From single parcels to full truckloads, we scale to your needs." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              variant: "compact",
              title: "Our Services",
              subtitle: "Comprehensive Transport Solutions",
              items: [
                { title: "Courier Delivery", desc: "Same-day and next-day courier services for parcels and documents" },
                { title: "Long-Haul Transport", desc: "Reliable inter-provincial freight and cargo transport" },
                { title: "Furniture Removal", desc: "Professional household and office relocation services" },
                { title: "Fleet Management", desc: "Outsourced fleet management and vehicle tracking solutions" },
                { title: "Warehousing", desc: "Secure short-term and long-term storage facilities" },
                { title: "Last-Mile Delivery", desc: "Efficient doorstep delivery for e-commerce and retail businesses" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Fleet",
              subtitle: "Ready to move your goods",
              images: [
                { url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=600", caption: "Delivery Fleet" },
                { url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600", caption: "Long-Haul Trucks" },
                { url: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=600", caption: "Warehouse Facility" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Client Feedback",
              subtitle: "What our customers say",
              items: [
                { name: "Mandla S.", role: "E-commerce Owner", text: "They handle all our deliveries in Gauteng. Always on time and professional. Our customers love the service!" },
                { name: "Priya N.", role: "Retail Manager", text: "Reliable and affordable. We switched to them last year and haven't looked back since." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Get a Quote",
              subtitle: "Contact us for competitive transport rates.",
              phone: "+27 11 456 7890",
              email: "logistics@transport.co.za",
              address: "28 Freight Road, City Deep, Johannesburg, 2049",
              whatsapp: "+27 11 456 7890",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "events":
      return {
        businessName: name,
        slug,
        templateId: "events",
        theme: { primary: "#e11d48", accent: "#f43f5e" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "gradient",
              title: "Creating Unforgettable Moments",
              subtitle: "From dream weddings to corporate galas, we plan and execute events that leave a lasting impression.",
              badgeText: "Award-Winning Event Planners",
              ctaPrimaryText: "Plan Your Event",
              ctaSecondaryText: "View Gallery",
              backgroundImageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "500+", label: "Events Planned" },
                { value: "8+", label: "Years Experience" },
                { value: "4.9", label: "Star Rating" },
                { value: "100%", label: "Client Satisfaction" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Us",
              subtitle: "The Perfect Event, Every Time",
              imagePosition: "right",
              items: [
                { title: "Bespoke Planning", desc: "Every event is uniquely designed to match your vision and budget." },
                { title: "Trusted Vendors", desc: "We work with the best caterers, florists, and venues in South Africa." },
                { title: "Stress-Free Experience", desc: "We handle every detail so you can enjoy your special day." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              variant: "bordered",
              title: "Our Services",
              subtitle: "Full-Service Event Management",
              items: [
                { title: "Wedding Planning", desc: "Complete wedding coordination from engagement to reception" },
                { title: "Corporate Events", desc: "Conferences, team builds, product launches, and year-end functions" },
                { title: "Birthday Parties", desc: "Themed birthday celebrations for all ages and budgets" },
                { title: "Decor & Styling", desc: "Custom event decor, floral arrangements, and venue styling" },
                { title: "Catering Coordination", desc: "Menu planning and catering management for any event size" },
                { title: "Sound & Lighting", desc: "Professional AV equipment, DJs, and entertainment coordination" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              variant: "masonry",
              title: "Our Events",
              subtitle: "A glimpse into our work",
              images: [
                { url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=600", caption: "Wedding Reception" },
                { url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600", caption: "Corporate Gala" },
                { url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600", caption: "Birthday Celebration" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              variant: "large-quote",
              title: "Happy Clients",
              subtitle: "What our clients say about their events",
              items: [
                { name: "Nomvula K.", role: "Bride", text: "They made my dream wedding come true! Every detail was perfect, from the flowers to the food. I couldn't have asked for more." },
                { name: "David M.", role: "Corporate Client", text: "Our company year-end function was a massive hit. Professional, creative, and delivered beyond expectations." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              variant: "light",
              title: "Plan Your Event",
              subtitle: "Let's create something extraordinary together.",
              phone: "+27 11 567 8901",
              email: "hello@eventsbydesign.co.za",
              address: "15 Celebration Lane, Sandton, Johannesburg, 2196",
              whatsapp: "+27 11 567 8901",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "security":
      return {
        businessName: name,
        slug,
        templateId: "security",
        theme: { primary: "#1f2937", accent: "#374151" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "corporate",
              title: "Protecting What Matters Most",
              subtitle: "Comprehensive security solutions for homes, businesses, and events. Trusted by thousands across Gauteng.",
              badgeText: "PSIRA Registered",
              ctaPrimaryText: "Get Protected",
              ctaSecondaryText: "Request a Survey",
              backgroundImageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "dark",
              items: [
                { value: "15+", label: "Years Experience" },
                { value: "3000+", label: "Clients Protected" },
                { value: "24/7", label: "Monitoring" },
                { value: "< 5 min", label: "Response Time" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Us",
              subtitle: "Your Safety Is Our Priority",
              imagePosition: "right",
              items: [
                { title: "Rapid Response", desc: "Armed response teams on standby 24/7 with under 5-minute response times." },
                { title: "PSIRA Compliant", desc: "Fully registered and compliant with all South African security regulations." },
                { title: "Advanced Technology", desc: "State-of-the-art CCTV, alarm, and access control systems." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              variant: "bordered",
              title: "Our Services",
              subtitle: "Complete Security Solutions",
              items: [
                { title: "Armed Response", desc: "24/7 rapid armed response for residential and commercial properties" },
                { title: "CCTV Installation", desc: "HD camera systems with remote viewing and cloud storage" },
                { title: "Access Control", desc: "Biometric, card, and intercom access management systems" },
                { title: "Event Security", desc: "Professional security personnel for events and functions" },
                { title: "VIP Protection", desc: "Close protection officers for executives and high-profile individuals" },
                { title: "Alarm Systems", desc: "Smart alarm installation, monitoring, and maintenance" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Operations",
              subtitle: "Keeping you safe around the clock",
              images: [
                { url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&q=80&w=600", caption: "Control Room" },
                { url: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=600", caption: "Patrol Unit" },
                { url: "https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&q=80&w=600", caption: "CCTV Systems" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              variant: "minimal",
              title: "Client Testimonials",
              subtitle: "Trusted by homeowners and businesses",
              items: [
                { name: "Johan v.R.", role: "Estate Manager", text: "Since switching to their armed response, our estate has had zero incidents. Professional and always reliable." },
                { name: "Ayanda M.", role: "Business Owner", text: "They installed our CCTV and access control system. The quality is excellent and we feel much safer now." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Get Protected",
              subtitle: "Request a free security assessment for your property.",
              phone: "+27 11 678 9012",
              email: "info@securesolutions.co.za",
              address: "42 Shield Street, Randburg, Johannesburg, 2194",
              whatsapp: "+27 11 678 9012",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "travel":
      return {
        businessName: name,
        slug,
        templateId: "travel",
        theme: { primary: "#d97706", accent: "#f59e0b" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "centered",
              title: "Discover South Africa's Beauty",
              subtitle: "From safari adventures to coastal getaways, we curate unforgettable travel experiences across the Rainbow Nation.",
              badgeText: "SATSA Accredited",
              ctaPrimaryText: "Browse Packages",
              ctaSecondaryText: "Plan My Trip",
              backgroundImageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "1000+", label: "Trips Booked" },
                { value: "50+", label: "Destinations" },
                { value: "4.9", label: "Star Rating" },
                { value: "12+", label: "Years Experience" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Travel With Us",
              subtitle: "Your Adventure Starts Here",
              imagePosition: "right",
              items: [
                { title: "Local Expertise", desc: "We know South Africa inside out — hidden gems included." },
                { title: "Custom Itineraries", desc: "Every trip is tailor-made to suit your interests and budget." },
                { title: "24/7 Support", desc: "On-the-ground assistance throughout your entire journey." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              variant: "bordered",
              title: "Our Packages",
              subtitle: "Curated Travel Experiences",
              items: [
                { title: "Safari Packages", desc: "Big Five game drives in Kruger, Pilanesberg, and private reserves" },
                { title: "City Tours", desc: "Explore Cape Town, Johannesburg, Durban, and more with expert guides" },
                { title: "Beach Getaways", desc: "Relaxing coastal holidays in Umhlanga, Plettenberg Bay, and Camps Bay" },
                { title: "Adventure Activities", desc: "Bungee jumping, shark cage diving, zip-lining, and hiking trails" },
                { title: "Business Travel", desc: "Corporate travel management, flights, and accommodation booking" },
                { title: "Accommodation Booking", desc: "Hotels, lodges, B&Bs, and self-catering stays across South Africa" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              variant: "masonry",
              title: "Destinations",
              subtitle: "Explore South Africa with us",
              images: [
                { url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&q=80&w=600", caption: "Table Mountain" },
                { url: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&q=80&w=600", caption: "Safari Adventure" },
                { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600", caption: "Beach Paradise" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              variant: "large-quote",
              title: "Traveller Reviews",
              subtitle: "What our guests say",
              items: [
                { name: "Lisa T.", role: "Family Holiday", text: "The safari package was absolutely incredible! The kids loved every moment. Best family holiday we've ever had." },
                { name: "Michael O.", role: "International Visitor", text: "They planned our entire 2-week South Africa trip. Every detail was perfect. Can't wait to come back!" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              variant: "light",
              title: "Book Your Adventure",
              subtitle: "Let us plan your perfect South African experience.",
              phone: "+27 21 789 0123",
              email: "bookings@satravels.co.za",
              address: "12 Ocean View Drive, V&A Waterfront, Cape Town, 8001",
              whatsapp: "+27 21 789 0123",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "fitness":
      return {
        businessName: name,
        slug,
        templateId: "fitness",
        theme: { primary: "#dc2626", accent: "#ea580c" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "bold",
              title: "Transform Your Body",
              subtitle: "Expert personal training, group classes, and nutrition coaching to help you reach your fitness goals.",
              badgeText: "First Session Free",
              ctaPrimaryText: "View Programs",
              ctaSecondaryText: "Join Now",
              backgroundImageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "dark",
              items: [
                { value: "7+", label: "Years Experience" },
                { value: "1500+", label: "Members Trained" },
                { value: "4.9", label: "Star Rating" },
                { value: "6", label: "Programs" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Train With Us",
              subtitle: "Our Approach",
              variant: "icon-grid",
              imagePosition: "right",
              items: [
                { title: "Personalised Plans", desc: "Every program is tailored to your body, goals, and fitness level." },
                { title: "Certified Trainers", desc: "Our coaches hold nationally recognised fitness certifications." },
                { title: "Results Guaranteed", desc: "Follow the plan and see real transformation within 12 weeks." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Programs",
              subtitle: "Training & Coaching",
              variant: "compact",
              items: [
                { title: "Personal Training", desc: "One-on-one sessions tailored to your goals", price: "R450/session" },
                { title: "Group Classes", desc: "High-energy group fitness sessions for all levels", price: "R150/class" },
                { title: "Boxing", desc: "Boxing fitness and technique training for strength and cardio", price: "R200/session" },
                { title: "CrossFit", desc: "Functional fitness combining strength, agility, and endurance", price: "R250/session" },
                { title: "Nutrition Plans", desc: "Customised meal plans designed by a registered dietitian", price: "R800/plan" },
                { title: "Online Coaching", desc: "Remote training programs with weekly check-ins and support", price: "R1,200/month" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Facility",
              subtitle: "Where transformation happens",
              variant: "masonry",
              images: [
                { url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600", caption: "Gym Floor" },
                { url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=600", caption: "Group Training" },
                { url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=600", caption: "Personal Training" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Success Stories",
              subtitle: "Real results from real members",
              items: [
                { name: "Kagiso M.", role: "Lost 25kg in 6 months", text: "This gym changed my life. The trainers are motivating and the community is incredible. Best decision I ever made!" },
                { name: "Palesa R.", role: "Marathon Runner", text: "The personalised training plan got me ready for my first Comrades Marathon. Professional and dedicated team." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Start Your Journey",
              subtitle: "Book your free assessment session today.",
              variant: "gradient",
              phone: "+27 11 456 7890",
              email: "info@fitnessgym.co.za",
              address: "88 Rivonia Road, Sandton, Johannesburg, 2196",
              whatsapp: "+27 11 456 7890",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "automotive":
      return {
        businessName: name,
        slug,
        templateId: "automotive",
        theme: { primary: "#3f3f46", accent: "#52525b" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "corporate",
              title: "Expert Auto Care",
              subtitle: "Trusted mechanical repairs, servicing, and diagnostics for all vehicle makes and models.",
              badgeText: "RMI Approved Workshop",
              ctaPrimaryText: "Book a Service",
              ctaSecondaryText: "Get a Quote",
              backgroundImageUrl: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "15+", label: "Years Experience" },
                { value: "5000+", label: "Vehicles Serviced" },
                { value: "100%", label: "Satisfaction" },
                { value: "Same Day", label: "Diagnostics" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Us",
              subtitle: "Our Workshop Standards",
              variant: "numbered",
              imagePosition: "right",
              items: [
                { title: "Qualified Technicians", desc: "Our mechanics are fully certified with years of hands-on experience." },
                { title: "Genuine Parts", desc: "We use only OEM and quality aftermarket parts for all repairs." },
                { title: "Transparent Pricing", desc: "Detailed quotes before any work begins — no surprises on your bill." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Services",
              subtitle: "Complete Auto Care",
              variant: "bordered",
              items: [
                { title: "Engine Service", desc: "Full engine service including oil, filters, and plugs", price: "From R1,200" },
                { title: "Brakes & Suspension", desc: "Brake pad replacement, disc skimming, and shock absorbers", price: "From R800" },
                { title: "Auto Electrical", desc: "Alternators, starters, wiring repairs, and battery testing", price: "From R500" },
                { title: "Panel Beating", desc: "Dent removal, respray, and insurance claim repairs", price: "Quote Based" },
                { title: "Tyre Fitting", desc: "New tyres, balancing, alignment, and puncture repairs", price: "From R600" },
                { title: "Vehicle Diagnostics", desc: "Computer diagnostics for engine faults and warning lights", price: "R350" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Workshop",
              subtitle: "State-of-the-art facility",
              images: [
                { url: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&q=80&w=600", caption: "Workshop Bay" },
                { url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=600", caption: "Engine Work" },
                { url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=600", caption: "Diagnostics" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Customer Reviews",
              subtitle: "What our clients say",
              variant: "minimal",
              items: [
                { name: "Mandla S.", role: "Fleet Manager", text: "We bring all our company vehicles here. Reliable, honest, and always on time. Wouldn't go anywhere else." },
                { name: "Karen B.", role: "Regular Customer", text: "Finally found a mechanic I can trust! They explain everything clearly and the prices are fair." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Book Your Service",
              subtitle: "Drive in or book ahead — we're ready to help.",
              phone: "+27 11 873 4567",
              email: "service@autocare.co.za",
              address: "23 Meyer Street, Germiston, 1401",
              whatsapp: "+27 11 873 4567",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "cleaning":
      return {
        businessName: name,
        slug,
        templateId: "cleaning",
        theme: { primary: "#0891b2", accent: "#06b6d4" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "gradient",
              title: "Spotless Every Time",
              subtitle: "Professional cleaning services for homes, offices, and commercial spaces across Gauteng.",
              badgeText: "Trusted & Insured",
              ctaPrimaryText: "Get a Quote",
              ctaSecondaryText: "Our Services",
              backgroundImageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "10+", label: "Years Experience" },
                { value: "3000+", label: "Spaces Cleaned" },
                { value: "100%", label: "Eco-Friendly" },
                { value: "24hr", label: "Turnaround" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Us",
              subtitle: "Our Cleaning Standards",
              variant: "icon-grid",
              imagePosition: "right",
              items: [
                { title: "Eco-Friendly Products", desc: "We use biodegradable, non-toxic cleaning products safe for families and pets." },
                { title: "Trained Staff", desc: "All our cleaners are professionally trained, vetted, and insured." },
                { title: "Flexible Scheduling", desc: "Daily, weekly, or once-off deep cleans to suit your schedule." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Services",
              subtitle: "Cleaning Solutions",
              variant: "compact",
              items: [
                { title: "Office Cleaning", desc: "Daily and weekly commercial office cleaning and sanitisation", price: "From R1,500/month" },
                { title: "Residential Deep Clean", desc: "Full house deep cleaning including kitchen, bathrooms, and floors", price: "From R800" },
                { title: "Carpet & Upholstery", desc: "Professional steam cleaning for carpets, couches, and mattresses", price: "From R500" },
                { title: "Post-Construction Cleanup", desc: "Thorough cleanup after renovations and building work", price: "Quote Based" },
                { title: "Pest Control", desc: "Safe and effective pest treatment for cockroaches, rats, and termites", price: "From R600" },
                { title: "Sanitisation", desc: "Full premises sanitisation and disinfection services", price: "From R400" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Work",
              subtitle: "Before and after transformations",
              variant: "featured",
              images: [
                { url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600", caption: "Office Cleaning" },
                { url: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=600", caption: "Deep Clean" },
                { url: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&q=80&w=600", caption: "Sanitisation" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Client Feedback",
              subtitle: "What our clients say about us",
              variant: "large-quote",
              items: [
                { name: "Lindiwe P.", role: "Office Manager", text: "Our offices have never looked better. The team is punctual, thorough, and always professional." },
                { name: "Johan V.", role: "Homeowner", text: "Booked a deep clean before our housewarming. They left the place absolutely spotless. Highly recommend!" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Book a Clean",
              subtitle: "Get a free quote for your home or office today.",
              variant: "light",
              phone: "+27 12 654 3210",
              email: "bookings@cleanpro.co.za",
              address: "Unit 8, Centurion Business Park, Centurion, 0157",
              whatsapp: "+27 12 654 3210",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "technology":
      return {
        businessName: name,
        slug,
        templateId: "technology",
        theme: { primary: "#7c3aed", accent: "#8b5cf6" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "minimal",
              title: "Smart Solutions for Modern Business",
              subtitle: "IT support, cloud solutions, and cybersecurity services to keep your business running smoothly and securely.",
              badgeText: "Microsoft & AWS Certified",
              ctaPrimaryText: "Our Solutions",
              ctaSecondaryText: "Get IT Support",
              backgroundImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "dark",
              items: [
                { value: "8+", label: "Years in Tech" },
                { value: "200+", label: "Clients Supported" },
                { value: "99.9%", label: "Uptime SLA" },
                { value: "24/7", label: "Support" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Partner With Us",
              subtitle: "Our IT Advantage",
              variant: "icon-grid",
              imagePosition: "right",
              items: [
                { title: "Proactive Monitoring", desc: "We detect and resolve issues before they impact your business." },
                { title: "Certified Engineers", desc: "Our team holds top-tier certifications from Microsoft, AWS, and CompTIA." },
                { title: "Scalable Solutions", desc: "Technology that grows with your business — from startup to enterprise." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Solutions",
              subtitle: "Technology Services",
              variant: "bordered",
              items: [
                { title: "IT Support", desc: "On-site and remote IT support for businesses of all sizes", price: "From R2,500/month" },
                { title: "Web Development", desc: "Custom websites, e-commerce platforms, and web applications", price: "From R8,000" },
                { title: "Cloud Solutions", desc: "Microsoft 365, Google Workspace, and cloud migration services", price: "From R1,500/month" },
                { title: "Cybersecurity", desc: "Firewall management, threat detection, and security audits", price: "From R3,000/month" },
                { title: "Network Setup", desc: "LAN, Wi-Fi, and structured cabling for offices and warehouses", price: "From R5,000" },
                { title: "Software Training", desc: "Staff training on Microsoft Office, cloud tools, and business software", price: "R800/person" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Work",
              subtitle: "Projects and installations",
              variant: "masonry",
              images: [
                { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600", caption: "Data Centre" },
                { url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600", caption: "Network Setup" },
                { url: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=600", caption: "Development" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Client Testimonials",
              subtitle: "Trusted by businesses across South Africa",
              variant: "minimal",
              items: [
                { name: "Thabo N.", role: "CEO, Logistics Company", text: "They migrated our entire operation to the cloud seamlessly. Zero downtime and our team loves the new system." },
                { name: "Michelle F.", role: "Practice Manager", text: "Reliable IT support that actually responds fast. Our network issues are a thing of the past." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Get IT Support",
              subtitle: "Let's discuss how technology can grow your business.",
              variant: "gradient",
              phone: "+27 11 784 5678",
              email: "hello@techsolutions.co.za",
              address: "15 Alice Lane, Sandton, 2196",
              whatsapp: "+27 11 784 5678",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "agriculture":
      return {
        businessName: name,
        slug,
        templateId: "agriculture",
        theme: { primary: "#4d7c0f", accent: "#65a30d" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "centered",
              title: "From Our Land to Your Table",
              subtitle: "Quality crops, livestock, and organic produce grown with care on South African soil.",
              badgeText: "Proudly South African",
              ctaPrimaryText: "Our Products",
              ctaSecondaryText: "Contact Us",
              backgroundImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "20+", label: "Years Farming" },
                { value: "500", label: "Hectares" },
                { value: "100%", label: "Organic" },
                { value: "50+", label: "Retail Partners" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Our Farm",
              subtitle: "Our Farming Philosophy",
              imagePosition: "right",
              items: [
                { title: "Sustainable Practices", desc: "We use regenerative farming methods that protect the soil and environment." },
                { title: "Farm-Fresh Quality", desc: "From harvest to delivery within 24 hours — guaranteed freshness." },
                { title: "Community Focused", desc: "We employ locally and invest in rural development programmes." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "What We Offer",
              subtitle: "Products & Services",
              items: [
                { title: "Crop Farming", desc: "Maize, sunflower, soya beans, and seasonal vegetables" },
                { title: "Livestock", desc: "Free-range cattle, goats, and poultry for meat and dairy" },
                { title: "Organic Produce", desc: "Certified organic fruits, vegetables, and herbs" },
                { title: "Agricultural Consulting", desc: "Expert advice on farming methods, soil management, and crop planning" },
                { title: "Equipment Hire", desc: "Tractors, harvesters, and irrigation systems available for hire" },
                { title: "Farm-to-Table Supply", desc: "Direct supply to restaurants, markets, and retail stores" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Farm",
              subtitle: "Life on the land",
              variant: "masonry",
              images: [
                { url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=600", caption: "Crop Fields" },
                { url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600", caption: "Livestock" },
                { url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=600", caption: "Fresh Harvest" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "What Our Partners Say",
              subtitle: "Trusted by buyers across South Africa",
              variant: "large-quote",
              items: [
                { name: "Vusi K.", role: "Restaurant Owner, Polokwane", text: "The freshest produce we've ever sourced. Consistent quality and reliable delivery every week." },
                { name: "Annette du P.", role: "Organic Market Vendor", text: "Their organic range is outstanding. Our customers keep coming back for more. A fantastic partnership." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Get In Touch",
              subtitle: "Visit our farm or place a wholesale order today.",
              variant: "light",
              phone: "+27 15 291 3456",
              email: "info@safarm.co.za",
              address: "Farm 42, R71 Tzaneen Road, Limpopo, 0850",
              whatsapp: "+27 15 291 3456",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "consulting":
      return {
        businessName: name,
        slug,
        templateId: "consulting",
        theme: { primary: "#ca8a04", accent: "#eab308" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "minimal",
              title: "Strategic Guidance for Business Growth",
              subtitle: "Expert consulting and advisory services to help South African businesses scale, optimise, and succeed in competitive markets.",
              badgeText: "Trusted Business Advisors",
              ctaPrimaryText: "Book a Consultation",
              ctaSecondaryText: "Our Services",
              backgroundImageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "15+", label: "Years Experience" },
                { value: "200+", label: "Clients Served" },
                { value: "95%", label: "Client Retention" },
                { value: "R50M+", label: "Revenue Generated" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              variant: "numbered",
              title: "Our Approach",
              subtitle: "How We Deliver Results",
              imagePosition: "right",
              items: [
                { title: "Tailored Strategy", desc: "Every business is unique. We craft customised solutions aligned to your goals and market." },
                { title: "Data-Driven Insights", desc: "We base our recommendations on research, analytics, and proven methodologies." },
                { title: "Implementation Support", desc: "We don't just advise — we walk alongside you through execution and beyond." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              variant: "compact",
              title: "Our Services",
              subtitle: "Advisory & Consulting",
              items: [
                { title: "Business Strategy", desc: "Growth planning, market entry, and competitive positioning" },
                { title: "HR & Organisational Development", desc: "Team structuring, talent management, and culture building" },
                { title: "Financial Advisory", desc: "Cash flow optimisation, funding readiness, and investor relations" },
                { title: "Operations Consulting", desc: "Process improvement, supply chain, and efficiency audits" },
                { title: "Digital Transformation", desc: "Technology adoption, automation, and digital strategy" },
                { title: "Executive Coaching", desc: "One-on-one leadership coaching and mentorship programs" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              variant: "featured",
              title: "Our Impact",
              subtitle: "Workshops, sessions, and client engagements",
              images: [
                { url: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600", caption: "Strategy Workshop" },
                { url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600", caption: "Team Coaching" },
                { url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=80&w=600", caption: "Client Presentation" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              variant: "large-quote",
              title: "Client Success Stories",
              subtitle: "What business leaders say about working with us",
              items: [
                { name: "Mandla K.", role: "CEO, Tech Startup", text: "Their strategic input helped us double our revenue in 18 months. Best investment we've made in our business." },
                { name: "Priya N.", role: "Managing Director, Manufacturing", text: "The operational audit saved us over R2 million annually. Practical, no-nonsense consulting that actually works." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              variant: "gradient",
              title: "Let's Talk Strategy",
              subtitle: "Book a free 30-minute discovery call to discuss your business goals.",
              phone: "+27 11 567 8901",
              email: "hello@strategicadvisors.co.za",
              address: "Floor 12, Sandton City Office Tower, Sandton, 2196",
              whatsapp: "+27 11 567 8901",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "showroom":
      return {
        businessName: name,
        slug,
        templateId: "showroom",
        theme: { primary: "#c9a84c", accent: "#0a0a0a" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "cinematic",
              title: "Engineered for Those Who Demand More",
              subtitle: "A curated collection of premium vehicles. Unmatched quality, transparent pricing, and a buying experience as refined as the cars we sell.",
              badgeText: "Authorised Dealer",
              ctaPrimaryText: "Explore Inventory",
              ctaSecondaryText: "Book a Test Drive",
              backgroundImageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "dark",
              items: [
                { value: "500+", label: "Vehicles Sold" },
                { value: "98%", label: "Client Satisfaction" },
                { value: "15+", label: "Years" },
                { value: "Same Day", label: "Finance Approval" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "vehicle_listings",
            enabled: true,
            data: {
              title: "Current Inventory",
              subtitle: "Discover your next vehicle from our hand-selected collection",
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "The Showroom Standard",
              subtitle: "Why We're Different",
              variant: "icon-grid",
              items: [
                { title: "150-Point Inspection", desc: "Every vehicle undergoes rigorous mechanical and cosmetic inspection before it reaches our floor." },
                { title: "Flexible Finance", desc: "In-house finance options — balloon payments, full structured deals, and same-day approval." },
                { title: "12-Month Warranty", desc: "Drive away with full confidence. All CPO vehicles include comprehensive mechanical cover." },
                { title: "Top Trade-In Values", desc: "We offer market-leading trade-in valuations, making your upgrade seamless." },
                { title: "Delivery Nationwide", desc: "We deliver anywhere in South Africa. Your vehicle arrives ready to drive." },
                { title: "Transparent Pricing", desc: "No hidden costs, no haggling. The price you see is the price you pay." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "About Our Dealership",
              quote: "We believe buying a car should be exciting, not stressful. Every customer is treated like family.",
              imagePosition: "left",
              imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80",
              items: [
                { title: "Multi-Brand Selection", desc: "We stock vehicles from every major manufacturer — the widest selection under one roof." },
                { title: "Full Service Centre", desc: "Our on-site workshop handles routine maintenance to major repairs." },
                { title: "RMI Accredited", desc: "Registered member of the Retail Motor Industry Organisation, guaranteeing ethical standards." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Client Experiences",
              subtitle: "What our buyers say",
              variant: "minimal",
              items: [
                { name: "Kagiso M.", role: "First-Time Buyer", text: "I was nervous buying my first car but the team made it effortless. Got finance approved in under 2 hours and drove home the same day." },
                { name: "Priya N.", role: "Repeat Customer", text: "This is my third car from this dealership. The trade-in process was smooth, no haggling, and I got a fair deal every single time." },
                { name: "David S.", role: "Fleet Manager", text: "We've been sourcing our entire company fleet here for 5 years. The commercial team understands business needs and delivery is always on time." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Visit Our Showroom",
              subtitle: "Book a test drive or browse our full inventory. Our consultants are ready to help.",
              phone: "+27 11 555 0100",
              email: "sales@showroom.co.za",
              address: "1 Motor City Boulevard, Midrand, 1685",
              whatsapp: "+27 11 555 0100",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "brokerage":
      return {
        businessName: name,
        slug,
        templateId: "brokerage",
        theme: { primary: "#0f2952", accent: "#b8860b" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "gradient",
              title: "Your Partner in Financial Success",
              subtitle: "Building wealth, protecting futures, securing legacies. Independent financial and insurance advice backed by 15+ years of market expertise.",
              badgeText: "FSP Licensed · FSCA Compliant",
              ctaPrimaryText: "Get a Free Quote",
              ctaSecondaryText: "Speak to an Advisor",
              backgroundImageUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "R500M+", label: "Cover Placed" },
                { value: "1,200+", label: "Clients Served" },
                { value: "20+", label: "Insurer Partners" },
                { value: "15+", label: "Years in Industry" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Solutions",
              subtitle: "Comprehensive Financial Services",
              variant: "default",
              items: [
                { title: "Risk Solutions", desc: "Personal and commercial short-term insurance — home, vehicle, business, and liability cover across top underwriters." },
                { title: "Wealth Creation & Protection", desc: "Retirement planning, tax-efficient investments, life cover, and estate planning for long-term financial security." },
                { title: "Accounting & Tax", desc: "Full accounting services, annual tax returns, VAT registration, and SARS compliance management." },
                { title: "Employee Benefits", desc: "Group life, retirement fund administration, group risk, and comprehensive staff benefit structuring." },
                { title: "Medical Aid Consulting", desc: "Independent comparison and placement of medical aid across all major schemes — Discovery, Bonitas, Momentum, and more." },
                { title: "Legal Services", desc: "Wills, estate administration, trust formation, and legal expense insurance for individuals and businesses." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose an Independent Broker",
              subtitle: "The Brokerage Advantage",
              variant: "numbered",
              items: [
                { title: "Truly Independent Advice", desc: "We are not tied to any single insurer — every recommendation is in your best interest, always." },
                { title: "Market-Wide Access", desc: "We compare dozens of underwriters and product houses to find you the most competitive rates and terms." },
                { title: "Dedicated Claims Advocacy", desc: "When you claim, we fight for you. Our claims team handles the entire process start to finish." },
                { title: "Annual Portfolio Reviews", desc: "We review your cover annually to ensure you're never over- or under-insured as your life changes." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "Why Clients Choose Us",
              quote: "We believe every client deserves honest, expert financial guidance — not just a policy sold.",
              imagePosition: "left",
              imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80",
              items: [
                { title: "FSCA Licensed", desc: "Full FSP licence holder, compliant with the Financial Advisory and Intermediary Services Act." },
                { title: "Independent & Unbiased", desc: "Our advisors earn no product-linked commissions — your outcome is our only motivation." },
                { title: "Qualified Advisors", desc: "All brokers hold relevant NQF qualifications and maintain annual CPD accreditation." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "What Our Clients Say",
              subtitle: "Trusted by individuals and businesses across South Africa",
              variant: "large-quote",
              items: [
                { name: "Adele van R.", role: "Business Owner", text: "Our broker reviewed our entire commercial portfolio and saved us over R180,000 in premiums annually — without reducing our cover. The best financial decision we made this year." },
                { name: "Thabo M.", role: "Personal Client", text: "When I had a major claim after the floods, my broker handled everything with the insurer. I didn't stress once. That's what a real broker looks like." },
                { name: "Sarah K.", role: "CFO, Manufacturing", text: "The employee benefits restructuring saved our company over R2M per year while improving our staff medical aid cover. Exceptional strategic advice." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact_form",
            enabled: true,
            data: {
              title: "Request a Free Consultation",
              subtitle: "Let one of our qualified advisors review your current cover and financial plan — at no cost and no obligation.",
              buttonText: "Request Callback",
              successMessage: "Thank you! An advisor will contact you within 24 hours.",
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              variant: "gradient",
              title: "Get In Touch",
              subtitle: "Reach out to us directly or visit our offices.",
              phone: "+27 11 234 5678",
              email: "advice@brokerage.co.za",
              address: "Suite 14, Sandton Corporate Park, Sandton, 2196",
              whatsapp: "+27 11 234 5678",
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
