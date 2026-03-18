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
    id: "funeral",
    name: "Funeral Services",
    description: "For funeral parlours, undertakers, and memorial service providers",
    icon: "flower-2",
    color: "bg-stone-700",
    preview: "Dignified, compassionate layout with services, packages, and 24/7 contact",
  },
  {
    id: "bakery",
    name: "Bakery & Confectionery",
    description: "For bakeries, cake shops, confectioners, and pastry businesses",
    icon: "cookie",
    color: "bg-amber-700",
    preview: "Warm golden layout with product showcase, menu, gallery, and order info",
  },
  {
    id: "childcare",
    name: "Childcare & Crèche",
    description: "For crèches, nursery schools, after-care centres, and ECD practitioners",
    icon: "baby",
    color: "bg-yellow-500",
    preview: "Bright, welcoming layout with programmes, staff, facilities, and enrolment info",
  },
  {
    id: "solar",
    name: "Solar & Renewable Energy",
    description: "For solar installers, inverter suppliers, and load-shedding solution providers",
    icon: "sun",
    color: "bg-orange-500",
    preview: "Modern, clean layout with solutions, savings calculator stats, and quote request",
  },
  {
    id: "printing",
    name: "Printing & Signage",
    description: "For print shops, sign makers, branding companies, and marketing printers",
    icon: "printer",
    color: "bg-blue-700",
    preview: "Vibrant layout with product categories, turnaround stats, and order contact",
  },
  {
    id: "staffing",
    name: "Staffing & Recruitment",
    description: "For recruitment agencies, HR consultancies, and labour brokers",
    icon: "users",
    color: "bg-slate-700",
    preview: "Professional layout with placement sectors, methodology, and candidate/employer contact",
  },
  {
    id: "petcare",
    name: "Pet Services & Veterinary",
    description: "For vets, pet groomers, kennels, dog trainers, and pet supply stores",
    icon: "paw-print",
    color: "bg-green-700",
    preview: "Friendly, warm layout with services, gallery, testimonials, and booking info",
  },
  {
    id: "church",
    name: "Church & Ministry",
    description: "For churches, ministries, faith organisations, and community outreach programmes",
    icon: "church",
    color: "bg-purple-700",
    preview: "Welcoming layout with service times, ministries, about the pastor, and location",
  },
  {
    id: "guesthouse",
    name: "Lodge & Guest House",
    description: "For guest houses, B&Bs, lodges, self-catering units, and boutique hotels",
    icon: "bed-double",
    color: "bg-teal-700",
    preview: "Warm, scenic layout with room types, amenities, gallery, and booking contact",
  },
  {
    id: "fashion",
    name: "Fashion & Clothing Brand",
    description: "For fashion designers, clothing labels, boutiques, and custom apparel makers",
    icon: "shirt",
    color: "bg-rose-700",
    preview: "Bold, editorial layout with collections, brand story, lookbook gallery, and shop info",
  },
  {
    id: "plumbing",
    name: "Plumbing & HVAC",
    description: "For plumbers, geyser installers, air conditioning technicians, and drainage specialists",
    icon: "hammer",
    color: "bg-blue-800",
    preview: "Bold layout with 24/7 emergency callout, services, certifications, and contact",
  },
  {
    id: "photography",
    name: "Photography & Videography",
    description: "For photographers, videographers, film studios, and content creators",
    icon: "camera",
    color: "bg-neutral-800",
    preview: "Cinematic dark portfolio layout with packages, gallery showcase, and booking contact",
  },
  {
    id: "catering",
    name: "Catering & Corporate Events",
    description: "For corporate caterers, private chefs, event catering, and food service companies",
    icon: "chef-hat",
    color: "bg-orange-800",
    preview: "Elegant layout with menus, catering packages, gallery, and quote request",
  },
  {
    id: "drivingschool",
    name: "Driving School",
    description: "For driving schools, traffic colleges, and learner licence training providers",
    icon: "navigation",
    color: "bg-yellow-700",
    preview: "Clear layout with licence types, packages, pass rate stats, and enrolment",
  },
  {
    id: "pharmacy",
    name: "Pharmacy & Chemist",
    description: "For pharmacies, dispensaries, health supplement stores, and medical suppliers",
    icon: "pill",
    color: "bg-teal-800",
    preview: "Clean medical layout with services, health products, screening, and contact",
  },
  {
    id: "nonprofit",
    name: "NGO & Non-Profit",
    description: "For charities, foundations, community organisations, and social enterprises",
    icon: "heart",
    color: "bg-rose-800",
    preview: "Warm layout with mission, programmes, impact stats, and donation contact",
  },
  {
    id: "mining",
    name: "Mining & Resources",
    description: "For mining consultants, geological surveyors, and resource extraction companies",
    icon: "pickaxe",
    color: "bg-stone-800",
    preview: "Industrial layout with services, accreditations, project portfolio, and contact",
  },
  {
    id: "hairsalon",
    name: "Hair Salon & Barber",
    description: "For hair salons, barber shops, locticians, braiding specialists, and stylists",
    icon: "scissors",
    color: "bg-fuchsia-700",
    preview: "Stylish layout with services menu, gallery, pricing, and booking info",
  },
  {
    id: "insurance",
    name: "Insurance Broker",
    description: "For short-term insurance brokers, life cover advisors, and independent FSPs",
    icon: "file-check",
    color: "bg-blue-900",
    preview: "Professional layout with cover types, claim support, credentials, and quote form",
  },
  {
    id: "homeimprovement",
    name: "Home Improvement",
    description: "For renovation companies, tilers, painters, waterproofers, and handyman services",
    icon: "hammer",
    color: "bg-amber-800",
    preview: "Bold portfolio layout with before/after gallery, services, quote request, and contact",
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
  {
    id: "luxury_estate",
    name: "Luxury Real Estate",
    description: "Premium template for high-end property agents, estate agencies, and property developers",
    icon: "building-2",
    color: "bg-stone-900",
    preview: "Sophisticated dark charcoal & gold layout with carousel hero, featured listings, agent profile, and lead capture",
    premium: true,
  },
  {
    id: "corporate_group",
    name: "Corporate Group",
    description: "Premium template for holding companies, corporate groups, and multi-division enterprises",
    icon: "briefcase",
    color: "bg-blue-950",
    preview: "Commanding navy & gold layout with group subsidiaries, leadership team, governance, and investor relations",
    premium: true,
  },
  {
    id: "luxury_spa",
    name: "Luxury Spa & Retreat",
    description: "Premium template for high-end spas, wellness retreats, and boutique wellbeing centres",
    icon: "sparkles",
    color: "bg-rose-950",
    preview: "Lavish rose & champagne layout with signature treatments, day packages, gallery, and online booking",
    premium: true,
  },
  {
    id: "investment",
    name: "Investment & Wealth Advisory",
    description: "Premium template for investment managers, wealth advisors, and private equity firms",
    icon: "trending-up",
    color: "bg-emerald-950",
    preview: "Sophisticated charcoal & emerald layout with fund overview, investment philosophy, team, and client portal CTA",
    premium: true,
  },
  {
    id: "boutique_hotel",
    name: "Boutique Hotel & Resort",
    description: "Premium template for boutique hotels, lodges, resorts, and exclusive guest experiences",
    icon: "bed-double",
    color: "bg-amber-950",
    preview: "Cinematic dark-gold layout with room types, resort amenities, gallery, and direct booking CTA",
    premium: true,
  },
  {
    id: "saas_tech",
    name: "Tech Startup & SaaS",
    description: "Premium template for software companies, SaaS products, and technology startups",
    icon: "monitor",
    color: "bg-violet-950",
    preview: "Modern dark violet layout with product features, pricing tiers, integrations, and get started CTA",
    premium: true,
  },
  {
    id: "franchise",
    name: "Franchise & Multi-Branch",
    description: "Premium template for franchise owners, multi-location retailers, and brand licensees",
    icon: "map-pin",
    color: "bg-orange-950",
    preview: "Professional brand-forward layout with franchise model, branch locator, testimonials, and application CTA",
    premium: true,
  },
  {
    id: "wedding_venue",
    name: "Luxury Wedding Venue",
    description: "Premium template for exclusive wedding venues, function halls, and event estates",
    icon: "heart",
    color: "bg-pink-950",
    preview: "Romantic champagne & blush layout with venue spaces, wedding packages, gallery, and availability enquiry",
    premium: true,
  },
  {
    id: "private_school",
    name: "Private School & Academy",
    description: "Premium template for private schools, academies, colleges, and elite educational institutions",
    icon: "graduation-cap",
    color: "bg-indigo-950",
    preview: "Prestigious navy layout with academic programmes, facilities gallery, leadership, and enrolment CTA",
    premium: true,
  },
  {
    id: "eco_brand",
    name: "Sustainable & Eco Brand",
    description: "Premium template for green businesses, eco-conscious brands, and sustainability-focused SMMEs",
    icon: "leaf",
    color: "bg-green-950",
    preview: "Earthy dark-green layout with sustainability story, certified products, impact stats, and ethical sourcing",
    premium: true,
  },
  {
    id: "medical_premium",
    name: "Specialist Medical Practice",
    description: "Premium template for specialist doctors, private clinics, and multi-practitioner medical centres",
    icon: "heart-pulse",
    color: "bg-teal-950",
    preview: "Clean premium teal layout with specialisations, practitioner profiles, patient testimonials, and appointment booking",
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
              heroStyle: "carousel",
              title: "Your Partner in Financial Success",
              subtitle: "Building wealth, protecting futures, securing legacies. Independent financial and insurance advice backed by 15+ years of market expertise.",
              badgeText: "FSP Licensed · FSCA Compliant",
              ctaPrimaryText: "Get a Free Quote",
              ctaSecondaryText: "Speak to an Advisor",
              carouselSlides: [
                {
                  image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&q=80",
                  headline: "Protect What Matters Most",
                  subtext: "Comprehensive Insurance Solutions",
                },
                {
                  image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80",
                  headline: "Grow Your Wealth",
                  subtext: "Expert Financial Planning",
                },
                {
                  image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80",
                  headline: "Secure Your Legacy",
                  subtext: "Estate & Retirement Solutions",
                },
              ],
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

    case "luxury_estate":
      return {
        businessName: name,
        slug,
        templateId: "luxury_estate",
        theme: { primary: "#1c1917", accent: "#c9a84c" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "carousel",
              title: "Extraordinary Properties. Exceptional Service.",
              subtitle: "South Africa's finest homes deserve an agent who understands their true value. Discreet, expert, and dedicated to achieving the best possible outcome for every client.",
              badgeText: "Luxury Property Specialists · EAAB Registered",
              ctaPrimaryText: "View Our Listings",
              ctaSecondaryText: "Book a Private Viewing",
              carouselSlides: [
                {
                  image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80",
                  headline: "Clifton & Atlantic Seaboard",
                  subtext: "Iconic oceanfront estates from R12M",
                },
                {
                  image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80",
                  headline: "Constantia & Southern Suburbs",
                  subtext: "Vineyard estates and grand family homes",
                },
                {
                  image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80",
                  headline: "Sandton & Waterfall Estate",
                  subtext: "Contemporary luxury in prime Gauteng locations",
                },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "R2.4B+", label: "Property Sold" },
                { value: "650+", label: "Luxury Homes Placed" },
                { value: "18+", label: "Years of Excellence" },
                { value: "R18M", label: "Average Sale Price" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Property Specialisations",
              subtitle: "Premium Services",
              variant: "default",
              items: [
                { title: "Residential Sales", desc: "Luxury homes, estates, and high-value apartments in Cape Town, Johannesburg, and the Garden Route's most sought-after addresses." },
                { title: "Private Off-Market Listings", desc: "Exclusive access to discreet off-market properties — high-value homes not publicly advertised, matched to qualified buyers only." },
                { title: "Buy-to-Let Investment", desc: "Strategic investment property acquisition with rental yield analysis, tenant placement, and portfolio growth advisory." },
                { title: "Development Sales", desc: "Marketing and sales of new luxury residential developments, sectional title launches, and preconstruction off-plans." },
                { title: "Property Valuations", desc: "Independent market valuations for sale, insurance, estate planning, and divorce proceedings — accurate, fast, and bank-ready." },
                { title: "Relocation Services", desc: "A seamless relocation experience for executives and families moving to South Africa or between cities — from area tours to school placements." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "The Difference an Exceptional Agent Makes",
              subtitle: "Our Approach",
              variant: "numbered",
              items: [
                { title: "Precision Pricing Strategy", desc: "We use advanced comparable data, absorption rate analysis, and current buyer demand to price your property for maximum value — not just a quick sale." },
                { title: "Luxury Marketing Campaigns", desc: "Professional photography, architectural video tours, lifestyle staging, and targeted digital campaigns that present your home at its finest." },
                { title: "Qualified Buyer Network", desc: "Our private database of vetted, pre-qualified buyers means your property is shown to serious purchasers — saving you time and protecting your privacy." },
                { title: "Seamless Transfer Coordination", desc: "From offer to keys, we coordinate with attorneys, banks, and surveyors to ensure a smooth, on-time transfer every time." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Featured Listings",
              subtitle: "Handpicked properties currently on the market",
              variant: "masonry",
              images: [
                { url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800", caption: "Atlantic Seaboard Villa — R24.5M" },
                { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800", caption: "Constantia Wine Estate — R18.9M" },
                { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800", caption: "Waterfall Eco Estate — R12.2M" },
                { url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=800", caption: "Fresnaye Contemporary — R9.8M" },
                { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800", caption: "De Waterkant Penthouse — R7.5M" },
                { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800", caption: "Camps Bay Family Home — R22.0M" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "Meet Your Agent",
              quote: "Every property has a story. My role is to tell that story to the right buyer at the right price — with complete integrity.",
              imagePosition: "left",
              imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80",
              items: [
                { title: "EAAB Registered", desc: "Fully registered with the Estate Agency Affairs Board and compliant with the Property Practitioners Act (PPA)." },
                { title: "18 Years in Luxury Property", desc: "Specialising exclusively in the R5M+ segment — residential estates, coastal properties, and urban luxury apartments." },
                { title: "Award-Winning Performance", desc: "Consistent top 5 performer nationally by sales volume, recognised by Seeff, Pam Golding, and Chas Everitt network awards." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "What Clients Say",
              subtitle: "Trusted by discerning buyers and sellers across South Africa",
              variant: "large-quote",
              items: [
                { name: "Catherine B.", role: "Seller — Clifton", text: "We had two previous agents fail to sell our home. Within six weeks of listing with this agency, we had a full-price offer from a cash buyer. The marketing was on another level — professional, elegant, and targeted." },
                { name: "Jonathan & Priya S.", role: "Buyers — Constantia", text: "We relocated from London and needed someone who understood exactly what we were looking for. Within three viewings we had found our dream home. The off-market access was extraordinary." },
                { name: "Dev Naidoo", role: "Investor — Sandton", text: "I've bought four investment properties through this agency over six years. The market knowledge is unmatched and the post-sale support keeps me coming back. These are true professionals." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact_form",
            enabled: true,
            data: {
              title: "Arrange a Private Consultation",
              subtitle: "Whether you're selling, buying, or simply exploring the market — reach out for a confidential, no-obligation conversation with one of our senior agents.",
              buttonText: "Request Consultation",
              successMessage: "Thank you. A senior agent will be in touch within 24 hours to arrange your private consultation.",
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              variant: "gradient",
              title: "Get In Touch",
              subtitle: "Our offices are open Monday to Saturday. Private viewings available by appointment.",
              phone: "+27 21 555 8800",
              email: "hello@luxuryestates.co.za",
              address: "15 Portside Tower, Buitenkant Street, Cape Town City Bowl, 8001",
              whatsapp: "+27 83 000 0000",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "funeral":
      return {
        businessName: name,
        slug,
        templateId: "funeral",
        theme: { primary: "#44403c", accent: "#78716c" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "minimal",
              title: "Compassionate Care When It Matters Most",
              subtitle: "We provide dignified, professional funeral services to support families through their most difficult moments. Available 24 hours a day, 7 days a week.",
              badgeText: "24/7 Emergency Line Available",
              ctaPrimaryText: "Our Services",
              ctaSecondaryText: "Contact Us Now",
              backgroundImageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "25+", label: "Years of Service" },
                { value: "5,000+", label: "Families Served" },
                { value: "24/7", label: "Always Available" },
                { value: "NFDA", label: "Registered" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Families Choose Us",
              subtitle: "Our Commitment to You",
              imagePosition: "right",
              items: [
                { title: "24/7 Immediate Response", desc: "Our team is available around the clock to assist with collections and arrangements at any time." },
                { title: "Dignified & Respectful", desc: "We treat every person in our care with the utmost respect and dignity throughout the entire process." },
                { title: "Transparent Pricing", desc: "No hidden costs. We provide clear, written quotations so families can plan without financial surprises." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Services",
              subtitle: "Full Funeral Solutions",
              variant: "bordered",
              items: [
                { title: "Basic Funeral Package", desc: "Essential services including transport, preparation, coffin, and graveside service", price: "R8,500" },
                { title: "Standard Funeral Package", desc: "Complete funeral service with chapel use, hearse, flowers, and order of service booklets", price: "R15,000" },
                { title: "Premium Funeral Package", desc: "Premium casket, full chapel service, catering coordination, and memorial video tribute", price: "R28,000" },
                { title: "Cremation Service", desc: "Direct cremation or memorial cremation service with urn and certificate of cremation", price: "R6,500" },
                { title: "Repatriation", desc: "Full repatriation services for burial in home provinces or neighbouring countries", price: "From R4,500" },
                { title: "Tombstone Unveiling", desc: "Coordination of tombstone unveiling ceremonies including marquee and catering support", price: "From R3,000" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "About Our Funeral Home",
              quote: "We carry the burden so your family can focus on healing, honouring, and celebrating a life well-lived.",
              imagePosition: "left",
              imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80",
              items: [
                { title: "Family-Owned Business", desc: "Established in 1998 and proudly family-run, we bring a personal touch to every arrangement we make." },
                { title: "Fully Licensed & Insured", desc: "Registered with the National Funeral Directors Association (NFDA) and fully compliant with Department of Health regulations." },
                { title: "Cultural Sensitivity", desc: "We respect and accommodate all cultural, religious, and traditional requirements with care and without judgment." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "What Families Say",
              subtitle: "Words from those we have served",
              variant: "large-quote",
              items: [
                { name: "Ntombi S.", role: "Bereaved Family", text: "During the most painful time of our lives, they handled everything with such grace and professionalism. We will always be grateful." },
                { name: "Pastor David M.", role: "Community Leader", text: "I have referred many families to this funeral home over the years. Their compassion and attention to detail is unmatched in the region." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "We Are Here For You",
              subtitle: "Our team is available 24 hours a day, 7 days a week. Please do not hesitate to call us at any time.",
              phone: "+27 11 987 6543",
              email: "care@funeralhome.co.za",
              address: "15 Serenity Drive, Boksburg, Ekurhuleni, 1460",
              whatsapp: "+27 11 987 6543",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "bakery":
      return {
        businessName: name,
        slug,
        templateId: "bakery",
        theme: { primary: "#b45309", accent: "#d97706" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "centered",
              title: "Baked with Love, Delivered with Joy",
              subtitle: "Handcrafted cakes, fresh breads, and irresistible treats made fresh daily. Custom orders welcome for any occasion.",
              badgeText: "Order Online or In-Store",
              ctaPrimaryText: "View Our Menu",
              ctaSecondaryText: "Order a Custom Cake",
              backgroundImageUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "Daily", label: "Fresh Bakes" },
                { value: "200+", label: "Menu Items" },
                { value: "4.9★", label: "Customer Rating" },
                { value: "Custom", label: "Orders Welcome" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Specialities",
              subtitle: "Made Fresh Every Day",
              variant: "bordered",
              items: [
                { title: "Custom Celebration Cakes", desc: "Birthday, wedding, and corporate cakes designed to your brief", price: "From R350" },
                { title: "Fresh Bread & Rolls", desc: "White, brown, whole wheat, and seeded loaves baked every morning", price: "From R18" },
                { title: "Cupcakes & Muffins", desc: "Assorted flavours available daily — perfect for events and gifting", price: "From R20 each" },
                { title: "Croissants & Pastries", desc: "Buttery, flaky pastries and filled croissants ready from 6:30am", price: "From R25" },
                { title: "Cookies & Biscuits", desc: "Shortbread, choc chip, and decorated iced cookies for all occasions", price: "From R15 each" },
                { title: "Catering Platters", desc: "Mixed pastry and savoury platters for corporate breakfasts and events", price: "From R350" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              variant: "masonry",
              title: "Our Creations",
              subtitle: "A taste of what we bake",
              images: [
                { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600", caption: "Custom Birthday Cake" },
                { url: "https://images.unsplash.com/photo-1464195244916-405fa0a82545?auto=format&fit=crop&q=80&w=600", caption: "Artisan Breads" },
                { url: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&q=80&w=600", caption: "Cupcakes & Treats" },
                { url: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&q=80&w=600", caption: "Wedding Cake" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Happy Customers",
              subtitle: "What our regulars say",
              items: [
                { name: "Priya N.", role: "Regular Customer", text: "The wedding cake was absolutely stunning and tasted incredible. Every guest was asking where it came from!" },
                { name: "Marcus T.", role: "Office Manager", text: "We order pastry platters for our Monday meetings every week. Consistent quality and always delivered on time." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Place Your Order",
              subtitle: "Custom orders need 48 hours notice. WhatsApp us your requirements and we'll get back to you with a quote.",
              phone: "+27 82 345 6789",
              email: "orders@bakery.co.za",
              address: "23 Biscuit Lane, Bryanston, Sandton, 2191",
              whatsapp: "+27 82 345 6789",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "childcare":
      return {
        businessName: name,
        slug,
        templateId: "childcare",
        theme: { primary: "#ca8a04", accent: "#16a34a" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "centered",
              title: "A Safe, Nurturing Place to Grow",
              subtitle: "We provide quality early childhood education and after-care in a safe, stimulating environment. Registered with the Department of Social Development.",
              badgeText: "DSD Registered ECD Centre",
              ctaPrimaryText: "Our Programmes",
              ctaSecondaryText: "Enrol Your Child",
              backgroundImageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "Ages 0–6", label: "Age Groups" },
                { value: "1:6", label: "Carer Ratio" },
                { value: "15+", label: "Years Operating" },
                { value: "SACE", label: "Qualified Staff" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Parents Choose Us",
              subtitle: "Our Commitment",
              imagePosition: "right",
              items: [
                { title: "Safe & Secure Environment", desc: "Fully enclosed premises with CCTV, controlled access, and emergency protocols." },
                { title: "Qualified Educators", desc: "All carers hold ECD qualifications and are background-checked and First Aid certified." },
                { title: "Nutritious Meals Included", desc: "Healthy breakfast, lunch, and snacks prepared fresh daily by our in-house cook." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Programmes",
              subtitle: "Learning Through Play",
              variant: "bordered",
              items: [
                { title: "Baby & Toddler Care (0–2 yrs)", desc: "Gentle, nurturing care with age-appropriate stimulation and development activities", price: "R3,200/month" },
                { title: "Pre-School Programme (3–5 yrs)", desc: "Structured early learning curriculum including phonics, numeracy, and creative arts", price: "R2,800/month" },
                { title: "Grade R Preparation (5–6 yrs)", desc: "School-readiness programme aligned to the CAPS curriculum", price: "R2,500/month" },
                { title: "After-Care (6–13 yrs)", desc: "Safe supervised after-school care with homework help and afternoon activities", price: "R1,400/month" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Centre",
              subtitle: "A bright, welcoming space for learning",
              images: [
                { url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=600", caption: "Learning Area" },
                { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600", caption: "Outdoor Play" },
                { url: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?auto=format&fit=crop&q=80&w=600", caption: "Art & Craft Activities" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Parent Feedback",
              subtitle: "What our families say",
              variant: "large-quote",
              items: [
                { name: "Lindiwe K.", role: "Parent of 2", text: "My children have been here for four years. The teachers are patient, loving, and professional. I wouldn't send them anywhere else." },
                { name: "Riaan & Elsa B.", role: "Parents", text: "Our daughter went from shy and anxious to confident and excited about school. The team here is exceptional." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Book a Visit",
              subtitle: "Come and see our centre for yourself. We welcome parents for a guided tour any weekday morning.",
              phone: "+27 11 678 9012",
              email: "enrol@creche.co.za",
              address: "44 Sunflower Road, Fourways, 2055",
              whatsapp: "+27 11 678 9012",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "solar":
      return {
        businessName: name,
        slug,
        templateId: "solar",
        theme: { primary: "#ea580c", accent: "#f59e0b" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "bold",
              title: "Take Back Control of Your Power",
              subtitle: "Solar and backup power solutions that eliminate load-shedding and slash your Eskom bill. Free site assessments, turnkey installation, and guaranteed performance.",
              badgeText: "SAPVIA Accredited Installer",
              ctaPrimaryText: "Get a Free Quote",
              ctaSecondaryText: "View Solutions",
              backgroundImageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "dark",
              items: [
                { value: "800+", label: "Installations Done" },
                { value: "Up to 90%", label: "Bill Reduction" },
                { value: "10 Year", label: "Panel Warranty" },
                { value: "24h", label: "Quote Turnaround" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Solutions",
              subtitle: "Power for Every Need",
              variant: "bordered",
              items: [
                { title: "Residential Solar + Battery", desc: "Full home solar system with lithium battery backup to keep your lights on during load-shedding", price: "From R65,000" },
                { title: "Commercial Solar Systems", desc: "Large-scale rooftop solar for offices, warehouses, and retail — reduce overheads significantly", price: "Get a Quote" },
                { title: "Inverter & Battery Only", desc: "Backup power without solar — ideal for load-shedding protection without the full solar setup", price: "From R22,000" },
                { title: "Solar Water Heating", desc: "Replace your electric geyser with an efficient solar water heater and cut your geyser costs by 80%", price: "From R9,500" },
                { title: "Maintenance & Monitoring", desc: "Annual panel cleaning, inverter health checks, and remote system monitoring for peace of mind", price: "From R1,200/yr" },
                { title: "Finance & Tax Incentives", desc: "We help you access Section 12B tax incentives and solar financing plans to reduce upfront costs", price: "Ask Us" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Us",
              subtitle: "The Smart Choice",
              imagePosition: "left",
              items: [
                { title: "SAPVIA Accredited", desc: "Certified installers compliant with NRS 097 standards — your installation is safe and warrantable." },
                { title: "Top-Tier Equipment", desc: "We only install Tier-1 panels, Sunsynk/Victron inverters, and lithium batteries — no cheap substitutes." },
                { title: "Full Turnkey Service", desc: "From design to COC certificate, we handle the entire installation so you don't have to worry." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Installations",
              subtitle: "Recent projects across South Africa",
              variant: "masonry",
              images: [
                { url: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=600", caption: "Residential Rooftop System" },
                { url: "https://images.unsplash.com/photo-1555636222-cae831e670b3?auto=format&fit=crop&q=80&w=600", caption: "Commercial Installation" },
                { url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=600", caption: "Solar Farm Project" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Customer Stories",
              subtitle: "Real results from real customers",
              items: [
                { name: "Gareth F.", role: "Homeowner, Pretoria", text: "Our Eskom bill went from R4,200 a month to under R400. The installation team was professional and finished in one day." },
                { name: "Samantha V.", role: "Business Owner, Cape Town", text: "Load-shedding was costing us thousands in lost productivity. Since going solar we haven't been affected once. Best investment we made." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Get Your Free Quote",
              subtitle: "Send us your latest Eskom bill and we'll show you exactly how much you can save. No obligation.",
              phone: "+27 87 654 3210",
              email: "quotes@solar.co.za",
              address: "Unit 7, Renewable Park, Centurion, 0157",
              whatsapp: "+27 87 654 3210",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "printing":
      return {
        businessName: name,
        slug,
        templateId: "printing",
        theme: { primary: "#1d4ed8", accent: "#7c3aed" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "bold",
              title: "Print That Makes Your Brand Stand Out",
              subtitle: "From business cards to billboards, we deliver high-quality printing and signage for businesses of all sizes. Fast turnaround, competitive prices.",
              badgeText: "Same-Day Printing Available",
              ctaPrimaryText: "Get a Quote",
              ctaSecondaryText: "View Products",
              backgroundImageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "Same Day", label: "Rush Orders" },
                { value: "500+", label: "Happy Clients" },
                { value: "100+", label: "Products" },
                { value: "10+", label: "Years Printing" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Products",
              subtitle: "Everything You Need to Brand Your Business",
              variant: "bordered",
              items: [
                { title: "Business Cards", desc: "Full colour, matte or gloss laminate, standard or premium stock — minimum 100 units", price: "From R250" },
                { title: "Banners & Pull-Up Stands", desc: "PVC banners, X-banners, and retractable pull-up stands for exhibitions and events", price: "From R350" },
                { title: "Flyers & Leaflets", desc: "A4, A5, or DL flyers — single or double-sided, digitally or offset printed", price: "From R180" },
                { title: "Branded Clothing", desc: "T-shirts, golfers, and workwear with embroidery or screen printing", price: "From R120" },
                { title: "Vehicle Branding", desc: "Cut vinyl, full or partial vehicle wraps for cars, bakkies, and trucks", price: "From R1,200" },
                { title: "Outdoor Signage", desc: "Aluminium composite, LED-lit, and pylon signs for shops and offices", price: "Get a Quote" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Print With Us",
              subtitle: "Our Promise",
              imagePosition: "right",
              items: [
                { title: "Fast Turnaround", desc: "Same-day printing for urgent orders. Standard orders ready within 2–3 business days." },
                { title: "Free Design Service", desc: "Our in-house designers will create or refine your artwork at no extra cost for orders over R500." },
                { title: "Free Delivery", desc: "Free delivery within 15km of our shop. Nationwide courier available for larger orders." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Recent Work",
              subtitle: "Printed, branded, and delivered",
              variant: "masonry",
              images: [
                { url: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&q=80&w=600", caption: "Branded Clothing" },
                { url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=600", caption: "Outdoor Signage" },
                { url: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=600", caption: "Business Collateral" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Client Reviews",
              subtitle: "What our customers say",
              items: [
                { name: "Mpho L.", role: "Small Business Owner", text: "Ordered 500 flyers on a Wednesday and they were delivered the same afternoon. Quality was excellent and the price was unbeatable." },
                { name: "Carla J.", role: "Events Coordinator", text: "We trust them with all our event branding. Pull-up stands, t-shirts, banners — everything is always spot on." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Get a Quote Today",
              subtitle: "Send us your artwork or brief and we'll give you a competitive quote within the hour.",
              phone: "+27 11 456 7890",
              email: "quotes@printshop.co.za",
              address: "14 Printers Row, Midrand, 1685",
              whatsapp: "+27 11 456 7890",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "staffing":
      return {
        businessName: name,
        slug,
        templateId: "staffing",
        theme: { primary: "#334155", accent: "#0ea5e9" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "corporate",
              title: "The Right People, in the Right Roles",
              subtitle: "We connect South African businesses with skilled, vetted candidates across all industries and skill levels. Permanent, contract, and temporary placements.",
              badgeText: "APSO Registered Agency",
              ctaPrimaryText: "Find Staff",
              ctaSecondaryText: "Submit Your CV",
              backgroundImageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "2,500+", label: "Placements Made" },
                { value: "15+", label: "Years Operating" },
                { value: "48hrs", label: "Average Fill Time" },
                { value: "92%", label: "Retention Rate" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Our Approach",
              subtitle: "Why Clients Trust Us",
              imagePosition: "right",
              items: [
                { title: "Rigorous Screening", desc: "Every candidate is background-checked, reference-verified, and skills-assessed before we present them to you." },
                { title: "Industry Expertise", desc: "Our consultants specialise in specific sectors — we understand your industry's unique requirements." },
                { title: "30-Day Replacement Guarantee", desc: "If a placement doesn't work out in the first 30 days, we replace them at no additional cost." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Services",
              subtitle: "Staffing Solutions",
              variant: "bordered",
              items: [
                { title: "Permanent Placements", desc: "Sourcing top talent for permanent positions across all levels and industries" },
                { title: "Temporary & Contract Staffing", desc: "Flexible workforce solutions for seasonal peaks, project work, and maternity cover" },
                { title: "Executive Search", desc: "Headhunting senior management and C-suite candidates with deep industry networks" },
                { title: "Bulk Recruitment", desc: "High-volume hiring projects for call centres, warehouses, and retail operations" },
                { title: "Skills Assessments", desc: "Psychometric testing, competency assessments, and technical skills verification" },
                { title: "HR Consulting", desc: "Onboarding processes, employment contracts, disciplinary procedures, and LRA compliance" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "About Our Agency",
              quote: "Great businesses are built by great people. Our job is to help you find them.",
              imagePosition: "left",
              imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80",
              items: [
                { title: "APSO Members", desc: "Registered with the Association of Personnel Service Organisations — held to the highest professional and ethical standards." },
                { title: "BEE Level 2 Contributor", desc: "Proudly South African and committed to transformation through targeted recruitment and placement practices." },
                { title: "National Coverage", desc: "With offices in Johannesburg, Cape Town, and Durban, we place candidates across all nine provinces." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Client Feedback",
              subtitle: "What our clients and candidates say",
              items: [
                { name: "Hannes V.", role: "Operations Director, Manufacturing", text: "We filled 12 engineering positions within three weeks. The quality of candidates was exceptional and the consultants really understood our technical requirements." },
                { name: "Akhona Z.", role: "Placed Candidate", text: "They found me a permanent position that matched my skills and career goals exactly. The whole process was professional and they supported me every step of the way." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Let's Talk Talent",
              subtitle: "Whether you need to hire or find a job, our team is ready to help. Get in touch for a no-obligation consultation.",
              phone: "+27 11 889 0123",
              email: "info@staffingagency.co.za",
              address: "4th Floor, 14 Fredman Drive, Sandton, 2196",
              whatsapp: "+27 11 889 0123",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "petcare":
      return {
        businessName: name,
        slug,
        templateId: "petcare",
        theme: { primary: "#15803d", accent: "#0891b2" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "centered",
              title: "Professional Care for Your Beloved Pets",
              subtitle: "Veterinary services, grooming, boarding, and training — everything your pet needs under one roof. Treating every animal like our own.",
              badgeText: "SAVC Registered Practice",
              ctaPrimaryText: "Our Services",
              ctaSecondaryText: "Book an Appointment",
              backgroundImageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "5,000+", label: "Happy Pets" },
                { value: "3", label: "Qualified Vets" },
                { value: "4.9★", label: "Pet Owner Rating" },
                { value: "7 Days", label: "Open Every Week" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Services",
              subtitle: "Complete Pet Care",
              variant: "bordered",
              items: [
                { title: "Veterinary Consultations", desc: "Health check-ups, vaccinations, illness diagnosis, and treatment", price: "From R350" },
                { title: "Grooming & Bathing", desc: "Full groom, bath, blow-dry, nail clipping, ear cleaning, and de-shedding", price: "From R250" },
                { title: "Boarding & Overnight Care", desc: "Safe, comfortable overnight and extended boarding for dogs and cats", price: "From R200/night" },
                { title: "Puppy & Dog Training", desc: "Obedience classes, problem behaviour correction, and puppy socialisation", price: "From R800" },
                { title: "Pet Dentistry", desc: "Dental scaling, extractions, and oral health assessments under anaesthetic", price: "From R1,200" },
                { title: "Pet Shop & Supplies", desc: "Premium foods, supplements, toys, leads, beds, and accessories in-store", price: "Various" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Pet Owners Trust Us",
              subtitle: "Our Difference",
              imagePosition: "right",
              items: [
                { title: "Qualified & Caring Team", desc: "All our vets are SAVC-registered and our groomers are certified with years of hands-on experience." },
                { title: "Modern Facilities", desc: "Digital X-ray, in-house blood lab, separate cat and dog wards, and a stress-free environment." },
                { title: "Emergency Services", desc: "After-hours emergency line available 24/7 for urgent situations — your pet is never left without help." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Meet Our Patients",
              subtitle: "Happy, healthy animals in our care",
              images: [
                { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=600", caption: "Dog Grooming" },
                { url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600", caption: "Happy Dogs" },
                { url: "https://images.unsplash.com/photo-1559715745-e1b33a271c8f?auto=format&fit=crop&q=80&w=600", caption: "Cat Care" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Pet Owner Reviews",
              subtitle: "What our clients say about us",
              variant: "large-quote",
              items: [
                { name: "Claire M.", role: "Dog Owner", text: "Dr Nkosi is absolutely wonderful with my anxious rescue dog. She comes out of her shell every time we visit. Truly a special team." },
                { name: "Pieter V.", role: "Cat Owner", text: "My cat had emergency surgery and they were incredible under pressure. Transparent about costs and the aftercare was superb." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Book an Appointment",
              subtitle: "Walk-ins welcome but booking ensures shorter waiting times. Emergency line available 24/7.",
              phone: "+27 11 567 8901",
              email: "hello@petcare.co.za",
              address: "22 Pets Corner, Roodepoort, 1724",
              whatsapp: "+27 11 567 8901",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "church":
      return {
        businessName: name,
        slug,
        templateId: "church",
        theme: { primary: "#7c3aed", accent: "#a855f7" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "gradient",
              title: "Welcome to Our Family",
              subtitle: "A vibrant, welcoming community of faith where everyone belongs. Join us for Sunday worship, midweek services, and life-changing community programmes.",
              badgeText: "All Are Welcome Here",
              ctaPrimaryText: "Service Times",
              ctaSecondaryText: "Find Us",
              backgroundImageUrl: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "1,200+", label: "Members" },
                { value: "35+", label: "Years Established" },
                { value: "Sunday", label: "08:00 & 10:00" },
                { value: "15+", label: "Ministries" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Ministries",
              subtitle: "A Place for Everyone",
              items: [
                { title: "Sunday Worship", desc: "Inspiring praise, worship, and teaching every Sunday at 08:00 and 10:00am" },
                { title: "Children's Church", desc: "Age-appropriate teaching and fun for children aged 3–12 during Sunday services" },
                { title: "Youth Ministry (Teens)", desc: "Friday night youth meetings, camps, and mentorship programmes for ages 13–25" },
                { title: "Men's & Women's Ministry", desc: "Monthly gatherings, prayer meetings, and community outreach for men and women" },
                { title: "Small Groups / Cell Groups", desc: "Midweek home-based groups for deeper community, prayer, and Bible study" },
                { title: "Community Outreach", desc: "Feeding schemes, skills development, and township ministry reaching thousands monthly" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "Meet Our Pastor",
              quote: "Our vision is to build a church that transforms individuals, families, and communities with the love of God.",
              imagePosition: "left",
              imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80",
              items: [
                { title: "Pastor & Congregation", desc: "Serving our community faithfully since 1988 with a heart for the broken, the searching, and the growing." },
                { title: "Vision Statement", desc: "To be a church that brings hope, healing, and purpose to every person who walks through our doors." },
                { title: "Partnerships", desc: "Affiliated with the Apostolic Faith Mission (AFM) and partnered with international missions in six countries." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Community Life",
              subtitle: "Moments from our congregation",
              images: [
                { url: "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&q=80&w=600", caption: "Sunday Worship" },
                { url: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=600", caption: "Community Outreach" },
                { url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=600", caption: "Youth Camp" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Come and Visit",
              subtitle: "We'd love to meet you. Join us this Sunday or reach out with any questions — our doors are always open.",
              phone: "+27 11 234 9876",
              email: "info@church.co.za",
              address: "Corner of Hope & Grace Street, Kempton Park, 1619",
              whatsapp: "+27 11 234 9876",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "guesthouse":
      return {
        businessName: name,
        slug,
        templateId: "guesthouse",
        theme: { primary: "#0f766e", accent: "#ca8a04" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "cinematic",
              title: "Your Home Away from Home",
              subtitle: "Beautifully appointed rooms, warm hospitality, and a tranquil setting make our guest house the perfect base for business or leisure travel.",
              badgeText: "TripAdvisor Certificate of Excellence",
              ctaPrimaryText: "View Rooms",
              ctaSecondaryText: "Book Now",
              backgroundImageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "4.8★", label: "Guest Rating" },
                { value: "12", label: "Luxury Rooms" },
                { value: "Free", label: "WiFi & Parking" },
                { value: "Daily", label: "Breakfast Served" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Accommodation Options",
              subtitle: "Rooms & Rates",
              variant: "bordered",
              items: [
                { title: "Standard Room", desc: "Comfortable queen room with en-suite bathroom, aircon, DSTV, and WiFi", price: "R850/night" },
                { title: "Deluxe Room", desc: "Spacious deluxe room with king bed, private patio, and garden views", price: "R1,150/night" },
                { title: "Family Suite", desc: "Two-bedroom suite with kitchenette, lounge area, and private entrance", price: "R1,800/night" },
                { title: "Self-Catering Cottage", desc: "Fully equipped standalone cottage — ideal for longer stays or families", price: "R1,400/night" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Stay With Us",
              subtitle: "What We Offer",
              imagePosition: "right",
              items: [
                { title: "Full Breakfast Included", desc: "Start your day right with a hearty home-cooked breakfast included with every room from 07:00–09:30." },
                { title: "Pool & Garden", desc: "Relax by our sparkling outdoor pool surrounded by manicured gardens and a peaceful outdoor lounge." },
                { title: "Secure & Central", desc: "24-hour security, secure parking, and a central location close to major attractions and business hubs." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              variant: "masonry",
              title: "Our Property",
              subtitle: "Where relaxation meets comfort",
              images: [
                { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600", caption: "Pool & Garden" },
                { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600", caption: "Deluxe Room" },
                { url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=600", caption: "En-Suite Bathroom" },
                { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600", caption: "Breakfast Dining" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Guest Reviews",
              subtitle: "What our guests say",
              variant: "large-quote",
              items: [
                { name: "Sarah & Tom W.", role: "Holiday Guests", text: "Absolutely stunning property. The hosts were incredibly warm and the breakfast was the best we had on our entire road trip. Will definitely be back!" },
                { name: "Mr. Dlamini", role: "Business Traveller", text: "I stay here every time I'm in town for work. The WiFi is excellent, rooms are spotless, and the check-in process is always effortless." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Make a Reservation",
              subtitle: "Contact us directly to check availability and book your stay. We respond to all enquiries within 2 hours.",
              phone: "+27 44 874 5678",
              email: "bookings@guesthouse.co.za",
              address: "16 Garden Route Drive, George, Western Cape, 6529",
              whatsapp: "+27 44 874 5678",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "fashion":
      return {
        businessName: name,
        slug,
        templateId: "fashion",
        theme: { primary: "#be123c", accent: "#1c1917" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "bold",
              title: "Wear Your Story",
              subtitle: "Bold, authentic South African fashion designed for the confident and the creative. Locally made, globally inspired.",
              badgeText: "100% Proudly South African",
              ctaPrimaryText: "Shop the Collection",
              ctaSecondaryText: "Our Story",
              backgroundImageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              variant: "cards",
              items: [
                { value: "Locally Made", label: "In South Africa" },
                { value: "5,000+", label: "Happy Customers" },
                { value: "Ethical", label: "Production" },
                { value: "SA+Global", label: "Shipping" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Collections",
              subtitle: "What We Design",
              variant: "bordered",
              items: [
                { title: "Ready-to-Wear", desc: "Seasonal collections of everyday and occasion wear for men and women", price: "From R350" },
                { title: "Custom Formal Wear", desc: "Tailored suits, dresses, and traditional formal pieces made to your measurements", price: "From R1,800" },
                { title: "African Print & Heritage", desc: "Vibrant Ankara and traditional-print garments celebrating South African heritage", price: "From R450" },
                { title: "Corporate Branded Wear", desc: "Custom uniform and branded clothing orders for businesses and events", price: "Get a Quote" },
                { title: "Accessories", desc: "Bags, belts, jewellery, and headpieces to complete your look", price: "From R150" },
                { title: "Custom Bridal & Events", desc: "Bespoke bridal gowns, bridesmaids, and full wedding party coordination", price: "From R5,000" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "Our Brand Story",
              quote: "Fashion is how you present yourself to the world. We make sure your story is worth telling.",
              imagePosition: "left",
              imageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80",
              items: [
                { title: "Founded in 2016", desc: "Born out of a desire to make high-quality, proudly South African fashion accessible and wearable." },
                { title: "Ethical Manufacturing", desc: "Every piece is designed and sewn in our Johannesburg studio by skilled local machinists paid fair wages." },
                { title: "Stocked in 12 Boutiques", desc: "Available in select boutiques across Gauteng, Cape Town, and Durban — and online nationwide." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              variant: "masonry",
              title: "Lookbook",
              subtitle: "The latest collection",
              images: [
                { url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=600", caption: "Summer Collection" },
                { url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=600", caption: "Heritage Edit" },
                { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600", caption: "Formal Range" },
                { url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600", caption: "Accessories" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Style Reviews",
              subtitle: "What our customers say",
              variant: "large-quote",
              items: [
                { name: "Ayanda M.", role: "Loyal Customer", text: "I wore a custom dress to my sister's wedding and every person at the event was asking who designed it. I felt like a queen!" },
                { name: "Bongani T.", role: "Corporate Client", text: "We ordered branded staff uniforms for 35 people and the quality, fit, and turnaround was outstanding. Our team looks incredibly professional." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Get in Touch",
              subtitle: "Custom orders, wholesale enquiries, and styling consultations — reach out and let's create something beautiful.",
              phone: "+27 76 789 0123",
              email: "hello@fashionbrand.co.za",
              address: "Studio 8, 44 Maboneng Precinct, Johannesburg, 2094",
              whatsapp: "+27 76 789 0123",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "plumbing":
      return {
        businessName: name,
        slug,
        templateId: "plumbing",
        theme: { primary: "#1d4ed8", accent: "#f59e0b" },
        social: {},
        sections: [
          {
            id: makeSectionId(), type: "hero", enabled: true,
            data: {
              heroStyle: "bold",
              title: "Fast, Reliable Plumbing & HVAC Services",
              subtitle: "24/7 emergency call-out. Certified plumbers and HVAC technicians ready across Gauteng. No call-out fee on accepted jobs.",
              badgeText: "24/7 Emergency Call-Out",
              ctaPrimaryText: "Call Now",
              ctaSecondaryText: "Get a Quote",
              backgroundImageUrl: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(), type: "stats", enabled: true,
            data: {
              items: [
                { value: "24/7", label: "Emergency Service" },
                { value: "500+", label: "Jobs Completed" },
                { value: "< 1h", label: "Avg. Response Time" },
                { value: "PIRB", label: "Registered" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "services", enabled: true,
            data: {
              title: "Our Services",
              subtitle: "Licensed & Insured",
              items: [
                { title: "Burst Pipe Repairs", desc: "Emergency burst pipe response and full pipe replacement with warranty", price: "Call for Quote" },
                { title: "Geyser Installation & Repairs", desc: "All geyser brands — install, repair, or replace with parts and labour warranty", price: "From R1 800" },
                { title: "Drain Unblocking", desc: "High-pressure hydro jetting for blocked drains, toilets, and sewer lines", price: "From R650" },
                { title: "Air Conditioning", desc: "Split unit installation, servicing, gas top-up, and repairs for all brands", price: "From R1 200" },
                { title: "Leak Detection", desc: "Non-invasive electronic leak detection for walls, slabs, and underground pipes", price: "From R800" },
                { title: "CCTV Drain Inspection", desc: "Camera inspection to diagnose hidden pipe blockages and root intrusion", price: "From R900" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "features", enabled: true,
            data: {
              title: "Why Choose Us",
              subtitle: "Certified Professionals",
              imagePosition: "right",
              items: [
                { title: "PIRB Registered", desc: "All plumbers are registered with the Plumbing Industry Registration Board." },
                { title: "Fully Insured", desc: "We carry full liability insurance on every job for your peace of mind." },
                { title: "Workmanship Guarantee", desc: "All repairs carry a minimum 12-month workmanship guarantee." },
              ],
            },
          },
          {
            id: makeSectionId(), type: "testimonials", enabled: true,
            data: {
              title: "What Our Clients Say",
              subtitle: "Trusted by homeowners & businesses",
              items: [
                { name: "Sandra M.", role: "Homeowner, Centurion", text: "Called at 11pm for a burst pipe and they arrived within 45 minutes. Fixed it quickly and left everything clean. Highly recommended!" },
                { name: "Dave H.", role: "Facilities Manager", text: "We use them for all our commercial properties. Reliable, professional, and their invoices are always detailed and clear." },
              ],
            },
          },
          {
            id: makeSectionId(), type: "contact", enabled: true,
            data: {
              title: "Contact Us Anytime",
              subtitle: "Emergency or planned work — call us or send a WhatsApp quote request.",
              phone: "+27 82 000 1234",
              email: "service@plumbing.co.za",
              address: "Based in Pretoria, serving all of Gauteng",
              whatsapp: "+27 82 000 1234",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "photography":
      return {
        businessName: name,
        slug,
        templateId: "photography",
        theme: { primary: "#0f172a", accent: "#f59e0b" },
        social: {},
        sections: [
          {
            id: makeSectionId(), type: "hero", enabled: true,
            data: {
              heroStyle: "cinematic",
              title: "Telling Your Story Through the Lens",
              subtitle: "Award-winning photography and videography for weddings, corporates, events, and brand campaigns across South Africa.",
              badgeText: "Professional Photography Studio",
              ctaPrimaryText: "View Portfolio",
              ctaSecondaryText: "Book a Session",
              backgroundImageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(), type: "stats", enabled: true,
            data: {
              items: [
                { value: "800+", label: "Shoots Completed" },
                { value: "12+", label: "Years Experience" },
                { value: "4.9★", label: "Client Rating" },
                { value: "50+", label: "Brands Served" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "services", enabled: true,
            data: {
              title: "What We Shoot",
              subtitle: "Full-Service Creative Studio",
              items: [
                { title: "Wedding Photography", desc: "Full-day coverage with edited gallery, prints, and album options.", price: "From R12 000" },
                { title: "Corporate Events", desc: "Conferences, product launches, award ceremonies, and team days.", price: "From R4 500" },
                { title: "Brand & Product Photography", desc: "Studio or location shoots for e-commerce, catalogues, and marketing.", price: "From R3 500" },
                { title: "Portrait Sessions", desc: "Professional headshots, family portraits, and maternity sessions.", price: "From R1 800" },
                { title: "Video Production", desc: "Brand films, testimonials, event highlights, and social media content.", price: "From R6 000" },
                { title: "Real Estate Photography", desc: "Interior and exterior shoots with drone add-on available.", price: "From R1 500" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "gallery", enabled: true,
            data: {
              variant: "masonry",
              title: "Our Portfolio",
              subtitle: "A selection of recent work",
              images: [
                { url: "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?auto=format&fit=crop&q=80&w=600", caption: "Wedding Photography" },
                { url: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&q=80&w=600", caption: "Corporate Event" },
                { url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600", caption: "Fashion Shoot" },
                { url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=600", caption: "Product Photography" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "contact", enabled: true,
            data: {
              title: "Let's Create Something Beautiful",
              subtitle: "Book a free discovery call or send us your project brief and we'll put together a custom proposal.",
              phone: "+27 83 000 2345",
              email: "hello@studio.co.za",
              address: "1 Creative Hub Lane, Rosebank, Johannesburg, 2196",
              whatsapp: "+27 83 000 2345",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "catering":
      return {
        businessName: name,
        slug,
        templateId: "catering",
        theme: { primary: "#92400e", accent: "#f59e0b" },
        social: {},
        sections: [
          {
            id: makeSectionId(), type: "hero", enabled: true,
            data: {
              heroStyle: "gradient",
              title: "Exceptional Catering for Every Occasion",
              subtitle: "Corporate lunches, gala dinners, team events, and private functions. Freshly prepared with premium ingredients — Halaal certified.",
              badgeText: "Corporate & Private Catering",
              ctaPrimaryText: "Get a Quote",
              ctaSecondaryText: "View Menus",
              backgroundImageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(), type: "stats", enabled: true,
            data: {
              items: [
                { value: "5 000+", label: "Events Catered" },
                { value: "300+", label: "Corporate Clients" },
                { value: "50+", label: "Menu Options" },
                { value: "Halaal", label: "Certified" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "services", enabled: true,
            data: {
              title: "Our Catering Packages",
              subtitle: "Tailored to Your Event",
              items: [
                { title: "Corporate Lunch Boxes", desc: "Daily or weekly meal delivery for office teams. Minimum 20 pax.", price: "From R95/person" },
                { title: "Boardroom Breakfast", desc: "Continental or hot breakfast service with crockery and setup.", price: "From R120/person" },
                { title: "Gala Dinner Service", desc: "Full 3-course sit-down dinner with waitstaff and décor options.", price: "From R380/person" },
                { title: "Cocktail & Canapes", desc: "Standing cocktail functions with premium canapé selections.", price: "From R220/person" },
                { title: "Traditional Braai Package", desc: "South African braai with all trimmings, salads, and sides.", price: "From R165/person" },
                { title: "Private Chef Service", desc: "Dedicated chef for intimate dinner parties or special occasions.", price: "From R2 500" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "gallery", enabled: true,
            data: {
              title: "Our Events",
              subtitle: "Recent events we've catered",
              images: [
                { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600", caption: "Gala Dinner Setup" },
                { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600", caption: "Corporate Lunch" },
                { url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=600", caption: "Cocktail Function" },
                { url: "https://images.unsplash.com/photo-1530554764233-e79e16c91d08?auto=format&fit=crop&q=80&w=600", caption: "Festive Braai" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "contact", enabled: true,
            data: {
              title: "Request a Quote",
              subtitle: "Tell us your event date, number of guests, and budget — we'll send a tailored menu proposal within 24 hours.",
              phone: "+27 81 000 3456",
              email: "events@catering.co.za",
              address: "Serving Johannesburg, Pretoria & Surrounds",
              whatsapp: "+27 81 000 3456",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "drivingschool":
      return {
        businessName: name,
        slug,
        templateId: "drivingschool",
        theme: { primary: "#a16207", accent: "#facc15" },
        social: {},
        sections: [
          {
            id: makeSectionId(), type: "hero", enabled: true,
            data: {
              heroStyle: "corporate",
              title: "Get Your Licence the Right Way",
              subtitle: "Professional driving instruction for Code 8, Code 10, and Code 14 licences. Theory classes, yard practice, and road test preparation.",
              badgeText: "DLTC Accredited Driving School",
              ctaPrimaryText: "Enrol Now",
              ctaSecondaryText: "View Packages",
              backgroundImageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(), type: "stats", enabled: true,
            data: {
              items: [
                { value: "92%", label: "First-Time Pass Rate" },
                { value: "2 000+", label: "Students Trained" },
                { value: "15+", label: "Years Operating" },
                { value: "Code 8-14", label: "All Licences" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "services", enabled: true,
            data: {
              title: "Our Packages",
              subtitle: "From Learner's Licence to Road Test",
              items: [
                { title: "Learner's Licence Package", desc: "Full theory prep with K53 manual and 3 practice tests to pass your learner exam.", price: "R450" },
                { title: "Code 8 — 10 Lessons", desc: "Manual or automatic. Yard manoeuvres, road driving, and test preparation.", price: "R2 800" },
                { title: "Code 8 — 20 Lessons", desc: "Ideal for complete beginners. Full instruction from basics to road-test ready.", price: "R4 500" },
                { title: "Code 10 — Light Truck", desc: "Professional light delivery vehicle training with yard and road components.", price: "R5 500" },
                { title: "Code 14 — Heavy Motor", desc: "Articulated truck licence training with experienced professional instructors.", price: "R12 000" },
                { title: "Refresher Lessons", desc: "2–5 lesson refresher for licensed drivers returning after a break.", price: "From R400/lesson" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "features", enabled: true,
            data: {
              title: "Why Train With Us",
              subtitle: "Your Confidence on the Road",
              imagePosition: "left",
              items: [
                { title: "DLTC Accredited", desc: "Our school is accredited and instructors are registered with relevant transport authorities." },
                { title: "Dual-Control Vehicles", desc: "All training vehicles have dual controls for the safety of every learner driver." },
                { title: "Flexible Scheduling", desc: "Morning, afternoon, and Saturday lessons to fit around your work schedule." },
              ],
            },
          },
          {
            id: makeSectionId(), type: "contact", enabled: true,
            data: {
              title: "Enrol Today",
              subtitle: "Call or WhatsApp to book your first lesson or ask about our licence packages.",
              phone: "+27 79 000 4567",
              email: "info@drivingschool.co.za",
              address: "15 Licence Avenue, Soweto, Johannesburg, 1804",
              whatsapp: "+27 79 000 4567",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "pharmacy":
      return {
        businessName: name,
        slug,
        templateId: "pharmacy",
        theme: { primary: "#0f766e", accent: "#0ea5e9" },
        social: {},
        sections: [
          {
            id: makeSectionId(), type: "hero", enabled: true,
            data: {
              heroStyle: "centered",
              title: "Your Health, Our Priority",
              subtitle: "Community pharmacy offering prescription dispensing, chronic medication management, health screening, and a full range of wellness products.",
              badgeText: "SAPC Registered Pharmacy",
              ctaPrimaryText: "Visit Us",
              ctaSecondaryText: "Chronic Meds Enquiry",
              backgroundImageUrl: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(), type: "stats", enabled: true,
            data: {
              items: [
                { value: "5 000+", label: "Patients Served" },
                { value: "20+", label: "Years Dispensing" },
                { value: "48h", label: "Chronic Script Turnaround" },
                { value: "SAPC", label: "Registered" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "services", enabled: true,
            data: {
              title: "Our Services",
              subtitle: "Full-Service Community Pharmacy",
              items: [
                { title: "Prescription Dispensing", desc: "Acute and chronic prescriptions dispensed accurately and timeously.", price: "" },
                { title: "Chronic Medication Management", desc: "Repeat script management, compliance counselling, and optional delivery.", price: "" },
                { title: "Health Screening", desc: "Blood pressure, blood glucose, cholesterol, and BMI checks in-store.", price: "From R50" },
                { title: "Vaccinations", desc: "Flu, travel, and lifestyle vaccines administered by our pharmacist.", price: "Call for pricing" },
                { title: "Vitamins & Supplements", desc: "Wide range of supplements, herbal remedies, and health foods in stock.", price: "" },
                { title: "Medical Aid Claims", desc: "We process all major medical aid schemes directly at point of dispensing.", price: "" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "about", enabled: true,
            data: {
              title: "About Our Pharmacy",
              quote: "We believe every patient deserves personalised, compassionate pharmaceutical care.",
              imagePosition: "right",
              items: [
                { title: "Community Focused", desc: "Serving our local community with affordable and accessible healthcare since 2003." },
                { title: "Expert Pharmacists", desc: "Our registered pharmacists provide counselling and guidance on every prescription." },
              ],
            },
          },
          {
            id: makeSectionId(), type: "contact", enabled: true,
            data: {
              title: "Contact Us",
              subtitle: "Visit us in-store or call to check medication stock, pricing, and medical aid queries.",
              phone: "+27 11 000 5678",
              email: "info@pharmacy.co.za",
              address: "45 Health Street, Polokwane, Limpopo, 0700",
              whatsapp: "+27 11 000 5678",
              enableWhatsApp: false,
            },
          },
        ],
      };

    case "nonprofit":
      return {
        businessName: name,
        slug,
        templateId: "nonprofit",
        theme: { primary: "#be123c", accent: "#f97316" },
        social: {},
        sections: [
          {
            id: makeSectionId(), type: "hero", enabled: true,
            data: {
              heroStyle: "gradient",
              title: "Together We Build Stronger Communities",
              subtitle: "Working to empower vulnerable South Africans through education, skills development, and community upliftment programmes.",
              badgeText: "NPO Registered",
              ctaPrimaryText: "Donate Now",
              ctaSecondaryText: "Get Involved",
              backgroundImageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(), type: "stats", enabled: true,
            data: {
              items: [
                { value: "5 000+", label: "Lives Impacted" },
                { value: "12", label: "Active Programmes" },
                { value: "R2M+", label: "Funding Raised" },
                { value: "8 Years", label: "of Service" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "services", enabled: true,
            data: {
              title: "Our Programmes",
              subtitle: "Where Your Donation Goes",
              items: [
                { title: "Youth Skills Development", desc: "Vocational training and mentorship for unemployed youth aged 18–35.", price: "" },
                { title: "Early Childhood Development", desc: "ECD support, training, and resources for crèches in underserved communities.", price: "" },
                { title: "Food Security", desc: "Weekly food parcels for 500+ households in our programme areas.", price: "" },
                { title: "Women in Business", desc: "Business skills and micro-grant programme for women entrepreneurs.", price: "" },
                { title: "Community Health Clinics", desc: "Monthly mobile health screenings in rural and peri-urban areas.", price: "" },
                { title: "School Support Programme", desc: "Stationery, uniforms, and after-school tutoring for learners in need.", price: "" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "about", enabled: true,
            data: {
              title: "Our Mission",
              quote: "We believe that poverty is not destiny — with the right support, every South African can thrive.",
              imagePosition: "left",
              items: [
                { title: "Transparency", desc: "Annual reports and audited financials are published on our website." },
                { title: "Community-Led", desc: "Our programmes are designed with, and not just for, the communities we serve." },
              ],
            },
          },
          {
            id: makeSectionId(), type: "contact", enabled: true,
            data: {
              title: "Get in Touch",
              subtitle: "Whether you'd like to donate, partner, or volunteer — we'd love to hear from you.",
              phone: "+27 21 000 6789",
              email: "hello@npo.org.za",
              address: "Community House, Khayelitsha, Cape Town, 7784",
              whatsapp: "+27 21 000 6789",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "mining":
      return {
        businessName: name,
        slug,
        templateId: "mining",
        theme: { primary: "#292524", accent: "#f59e0b" },
        social: {},
        sections: [
          {
            id: makeSectionId(), type: "hero", enabled: true,
            data: {
              heroStyle: "bold",
              title: "Expert Mining & Resources Consulting",
              subtitle: "Geological surveys, feasibility studies, environmental compliance, and project management for the South African extractive industries.",
              badgeText: "SAMREC Compliant Consultants",
              ctaPrimaryText: "Request Consultation",
              ctaSecondaryText: "Our Services",
              backgroundImageUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(), type: "stats", enabled: true,
            data: {
              items: [
                { value: "30+", label: "Projects Delivered" },
                { value: "15+", label: "Years Experience" },
                { value: "8", label: "Provinces Active" },
                { value: "DMRE", label: "Compliant" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "services", enabled: true,
            data: {
              title: "Our Services",
              subtitle: "End-to-End Mining Consulting",
              items: [
                { title: "Geological Surveys & Mapping", desc: "Detailed geological surveys, borehole logging, and SAMREC-compliant resource estimation.", price: "" },
                { title: "Feasibility Studies", desc: "Pre-feasibility and bankable feasibility studies for mineral projects.", price: "" },
                { title: "Mining Rights Applications", desc: "DMRE mining rights, prospecting rights, and environmental authorisation support.", price: "" },
                { title: "Environmental Compliance", desc: "EMP, EMPR, and Section 24G applications for all mining operations.", price: "" },
                { title: "Project Management", desc: "Full mine development, commissioning, and operational project management.", price: "" },
                { title: "Mine Closure Planning", desc: "Closure cost quantification, rehabilitation planning, and trust fund compliance.", price: "" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "features", enabled: true,
            data: {
              title: "Our Expertise",
              subtitle: "Industry Accreditations",
              imagePosition: "right",
              items: [
                { title: "SAMREC & SAMVAL Compliant", desc: "All resource estimations and valuations adhere to South African Mineral Resource Committee codes." },
                { title: "Multi-Commodity Experience", desc: "Gold, platinum, chrome, coal, manganese, iron ore, and base metals." },
                { title: "B-BBEE Compliant", desc: "Level 2 B-BBEE contributor with transformation commitments across all projects." },
              ],
            },
          },
          {
            id: makeSectionId(), type: "contact", enabled: true,
            data: {
              title: "Contact Our Team",
              subtitle: "For project inquiries or consultation requests, get in touch with our principal consultants.",
              phone: "+27 12 000 7890",
              email: "consulting@miningco.co.za",
              address: "400 Mining House, eMalahleni (Witbank), Mpumalanga, 1035",
              whatsapp: "+27 12 000 7890",
              enableWhatsApp: false,
            },
          },
        ],
      };

    case "hairsalon":
      return {
        businessName: name,
        slug,
        templateId: "hairsalon",
        theme: { primary: "#7e22ce", accent: "#ec4899" },
        social: {},
        sections: [
          {
            id: makeSectionId(), type: "hero", enabled: true,
            data: {
              heroStyle: "centered",
              title: "Where Great Hair Happens",
              subtitle: "Precision cuts, colour, braids, locs, and relaxers by expert stylists. Walk-ins welcome — appointments preferred.",
              badgeText: "Professional Hair Studio",
              ctaPrimaryText: "Book Appointment",
              ctaSecondaryText: "View Services & Prices",
              backgroundImageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(), type: "stats", enabled: true,
            data: {
              items: [
                { value: "3 000+", label: "Happy Clients" },
                { value: "10+", label: "Expert Stylists" },
                { value: "8+", label: "Years in Business" },
                { value: "4.8★", label: "Google Rating" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "services", enabled: true,
            data: {
              title: "Our Services",
              subtitle: "For All Hair Types",
              variant: "bordered",
              items: [
                { title: "Ladies Cut & Style", desc: "Shampoo, cut, blow-dry, and style by a skilled stylist.", price: "From R180" },
                { title: "Gents Fade & Cut", desc: "Classic and modern fades, tapers, and beard grooming.", price: "From R80" },
                { title: "Colour & Highlights", desc: "Full colour, highlights, balayage, and toners for all hair types.", price: "From R350" },
                { title: "Braids & Weaves", desc: "Box braids, knotless braids, cornrows, sew-ins, and quick weaves.", price: "From R300" },
                { title: "Dreadlocks & Locs", desc: "New loc installation, maintenance retwisting, and loc extensions.", price: "From R250" },
                { title: "Relaxer & Keratin", desc: "Chemical relaxers and keratin smoothing treatments.", price: "From R350" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "gallery", enabled: true,
            data: {
              variant: "masonry",
              title: "Our Work",
              subtitle: "Fresh styles every day",
              images: [
                { url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=600", caption: "Colour & Highlights" },
                { url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&q=80&w=600", caption: "Box Braids" },
                { url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&q=80&w=600", caption: "Gents Fade" },
                { url: "https://images.unsplash.com/photo-1554519515-242161756769?auto=format&fit=crop&q=80&w=600", caption: "Natural Styles" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "contact", enabled: true,
            data: {
              title: "Book Your Appointment",
              subtitle: "WhatsApp to book your slot, or walk in — we'll do our best to accommodate you on the day.",
              phone: "+27 73 000 8901",
              email: "bookings@hairsalon.co.za",
              address: "88 Style Street, Sandton, Johannesburg, 2196",
              whatsapp: "+27 73 000 8901",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "insurance":
      return {
        businessName: name,
        slug,
        templateId: "insurance",
        theme: { primary: "#1e3a5f", accent: "#3b82f6" },
        social: {},
        sections: [
          {
            id: makeSectionId(), type: "hero", enabled: true,
            data: {
              heroStyle: "corporate",
              title: "Protecting What Matters Most",
              subtitle: "Independent insurance brokers specialising in short-term, life, and commercial insurance. We compare insurers to find you the right cover.",
              badgeText: "FSP Licensed | FSCA Registered",
              ctaPrimaryText: "Get a Free Quote",
              ctaSecondaryText: "Our Cover Types",
              backgroundImageUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(), type: "stats", enabled: true,
            data: {
              items: [
                { value: "1 200+", label: "Policyholders" },
                { value: "15+", label: "Years Licensed" },
                { value: "10+", label: "Insurer Partners" },
                { value: "FSCA", label: "Registered" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "services", enabled: true,
            data: {
              title: "Insurance Solutions",
              subtitle: "Independent Advice. Best Cover.",
              items: [
                { title: "Personal Lines", desc: "Home, car, valuables, and personal liability — structured to your specific needs.", price: "Free Quote" },
                { title: "Commercial Insurance", desc: "Business assets, liability, business interruption, and engineering cover.", price: "Free Quote" },
                { title: "Life & Disability Cover", desc: "Life assurance, income protection, and critical illness cover.", price: "Free Quote" },
                { title: "Fleet Insurance", desc: "Multi-vehicle policies for commercial and personal fleets with fleet discounts.", price: "Free Quote" },
                { title: "Professional Indemnity", desc: "PI and D&O cover for professionals, directors, and service businesses.", price: "Free Quote" },
                { title: "Claims Assistance", desc: "We manage your claims from submission to settlement — no dealing with insurers alone.", price: "" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "features", enabled: true,
            data: {
              title: "Why Use a Broker",
              subtitle: "Independent. Objective. On Your Side.",
              imagePosition: "right",
              items: [
                { title: "We Work for You", desc: "As an independent broker, our loyalty is to you — not to any single insurer." },
                { title: "Annual Policy Reviews", desc: "We review your cover annually to ensure you're adequately covered and not overpaying." },
                { title: "Claims Advocacy", desc: "When you claim, we fight your corner to ensure fair and fast settlement." },
              ],
            },
          },
          {
            id: makeSectionId(), type: "contact", enabled: true,
            data: {
              title: "Get Your Free Quote",
              subtitle: "Call or WhatsApp us with your cover requirements and we'll compare options from our insurer panel.",
              phone: "+27 11 000 9012",
              email: "advice@insurebroker.co.za",
              address: "Suite 4, Westgate Business Park, Roodepoort, 1724",
              whatsapp: "+27 11 000 9012",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "homeimprovement":
      return {
        businessName: name,
        slug,
        templateId: "homeimprovement",
        theme: { primary: "#92400e", accent: "#dc2626" },
        social: {},
        sections: [
          {
            id: makeSectionId(), type: "hero", enabled: true,
            data: {
              heroStyle: "bold",
              title: "Transform Your Home with Expert Renovations",
              subtitle: "Trusted home improvement specialists for tiling, painting, waterproofing, paving, and full renovation projects. NHBRC registered.",
              badgeText: "NHBRC Registered Builders",
              ctaPrimaryText: "Get a Free Quote",
              ctaSecondaryText: "View Our Work",
              backgroundImageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(), type: "stats", enabled: true,
            data: {
              items: [
                { value: "350+", label: "Projects Completed" },
                { value: "10+", label: "Years Experience" },
                { value: "NHBRC", label: "Registered" },
                { value: "5★", label: "Rated Workmanship" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "services", enabled: true,
            data: {
              title: "Our Services",
              subtitle: "Quality Workmanship, Every Time",
              items: [
                { title: "Tiling & Flooring", desc: "Floor and wall tiling, laminate, vinyl, and wooden flooring installation.", price: "From R85/m²" },
                { title: "Painting & Waterproofing", desc: "Interior/exterior painting, roof waterproofing, and rising damp treatment.", price: "From R22/m²" },
                { title: "Kitchen & Bathroom Renovations", desc: "Full makeovers — plumbing, tiling, fitting, and finishing included.", price: "From R25 000" },
                { title: "Paving & Driveways", desc: "Concrete, brick, and cobble paving for driveways, patios, and walkways.", price: "From R280/m²" },
                { title: "Plastering & Screeding", desc: "External and internal plastering, skimming, and floor screeding.", price: "From R55/m²" },
                { title: "Alterations & Additions", desc: "Room additions, boundary walls, carports, and structural alterations.", price: "Call for Quote" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "gallery", enabled: true,
            data: {
              variant: "grid",
              title: "Before & After",
              subtitle: "Our recent completed projects",
              images: [
                { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=600", caption: "Kitchen Renovation" },
                { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600", caption: "Bathroom Remodel" },
                { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600", caption: "Paving Installation" },
                { url: "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&q=80&w=600", caption: "Exterior Painting" },
              ],
            },
          },
          {
            id: makeSectionId(), type: "contact", enabled: true,
            data: {
              title: "Request Your Free Quote",
              subtitle: "Send photos of your project via WhatsApp and we'll provide a detailed quote within 24 hours.",
              phone: "+27 83 000 0123",
              email: "quote@homerenovations.co.za",
              address: "Serving Johannesburg, Ekurhuleni & East Rand",
              whatsapp: "+27 83 000 0123",
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

    case "corporate_group":
      return {
        businessName: name,
        slug,
        templateId: "corporate_group",
        theme: { primary: "#1e3a8a", accent: "#b45309" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "corporate",
              title: "Building South Africa's Future, Together",
              subtitle: "A diversified group of companies committed to excellence, transformation, and sustainable growth across key sectors.",
              badgeText: "JSE-Listed · Level 1 B-BBEE",
              ctaPrimaryText: "Our Portfolio",
              ctaSecondaryText: "Investor Relations",
              backgroundImageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "R2.4B", label: "Group Revenue" },
                { value: "12", label: "Subsidiaries" },
                { value: "4,200+", label: "Employees" },
                { value: "25+", label: "Years Operating" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Our Business Pillars",
              subtitle: "Diversified Across Key Sectors",
              imagePosition: "right",
              imageUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80",
              items: [
                { title: "Property & Infrastructure", desc: "Developing commercial and residential properties across South Africa." },
                { title: "Financial Services", desc: "Providing innovative insurance, lending, and investment solutions." },
                { title: "Technology & Innovation", desc: "Driving digital transformation through proprietary platforms." },
                { title: "Mining & Resources", desc: "Responsible extraction and beneficiation of South Africa's natural wealth." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "Group Leadership",
              quote: "Our commitment is to create lasting value for shareholders, employees, and the communities we serve.",
              imagePosition: "left",
              imageUrl: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&q=80",
              items: [
                { title: "Transformation Commitment", desc: "Level 1 B-BBEE rating and 60%+ black ownership across key subsidiaries." },
                { title: "Governance", desc: "King IV compliant board with independent non-executive directors." },
                { title: "ESG Strategy", desc: "Embedded environmental, social and governance principles in all operations." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Group Companies",
              subtitle: "Our Portfolio",
              items: [
                { title: "Capital Properties", desc: "Award-winning property development and asset management." },
                { title: "Shield Financial", desc: "Short-term insurance, life cover, and employee benefits." },
                { title: "Nexus Technology Solutions", desc: "Enterprise software, cloud infrastructure, and IT consulting." },
                { title: "Terra Mining Resources", desc: "Iron ore, chrome, and manganese extraction and processing." },
                { title: "Horizon Logistics", desc: "Pan-African supply chain, transport, and warehousing." },
                { title: "Edubridge Academy", desc: "Corporate training, learnerships, and skills development." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Corporate Head Office",
              subtitle: "For investor relations, media enquiries, and group partnerships.",
              email: "ir@corporategroup.co.za",
              phone: "+27 11 700 8000",
              address: "1 Corporate Drive, Sandton, 2196",
              whatsapp: "",
              enableWhatsApp: false,
            },
          },
        ],
      };

    case "luxury_spa":
      return {
        businessName: name,
        slug,
        templateId: "luxury_spa",
        theme: { primary: "#9f1239", accent: "#b45309" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "centered",
              title: "Surrender to Serenity",
              subtitle: "A sanctuary of pure indulgence — where ancient healing meets modern luxury in the heart of South Africa.",
              badgeText: "Award-Winning Wellness Retreat",
              ctaPrimaryText: "Book Your Retreat",
              ctaSecondaryText: "View Treatments",
              backgroundImageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "50+", label: "Treatments" },
                { value: "4.9★", label: "Guest Rating" },
                { value: "12", label: "Treatment Rooms" },
                { value: "10+", label: "Years of Bliss" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Signature Experiences",
              subtitle: "Our Curated Menu",
              imageUrl: "https://images.unsplash.com/photo-1611073615830-9578bf5e5b9f?auto=format&fit=crop&q=80",
              items: [
                { title: "Ubuntu Ritual", desc: "A 90-minute full-body ceremony using indigenous Rooibos and Marula oils.", price: "R1,850" },
                { title: "Fynbos Deep Tissue", desc: "Targeted muscle therapy infused with Cape Floral Kingdom botanicals.", price: "R1,250" },
                { title: "Gold Radiance Facial", desc: "24K gold leaf and collagen facial for luminous, ageless skin.", price: "R1,600" },
                { title: "Couples Sanctuary Package", desc: "3-hour private suite experience — massage, soak, and champagne.", price: "R4,200" },
                { title: "African Mud Wrap", desc: "Detoxifying full-body wrap using therapeutic Mpumalanga volcanic clay.", price: "R1,100" },
                { title: "Day Retreat", desc: "Full day of wellness — breakfast, 2 treatments, pool access & lunch.", price: "R3,500" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "The Sanctuary",
              subtitle: "Step into your escape",
              images: [
                { url: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=600", caption: "Relaxation Pool" },
                { url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=600", caption: "Treatment Room" },
                { url: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&q=80&w=600", caption: "Outdoor Terrace" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Guest Experiences",
              subtitle: "Words from our sanctuary family",
              items: [
                { name: "Naledi K.", role: "Johannesburg", text: "I left feeling reborn. The Ubuntu Ritual was unlike anything I've experienced. Pure magic." },
                { name: "Sarah & Mark T.", role: "Cape Town", text: "Our couples retreat was the most romantic day of our lives. Every detail was perfection." },
                { name: "Dr. Priya N.", role: "Durban", text: "I book the Day Retreat quarterly. It's my non-negotiable investment in myself." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Reserve Your Experience",
              subtitle: "Our wellness concierge is available 7 days a week to curate your perfect escape.",
              email: "reservations@luxuryspa.co.za",
              phone: "+27 21 555 9000",
              address: "44 Vineyard Estate, Stellenbosch, 7600",
              whatsapp: "+27 21 555 9000",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "investment":
      return {
        businessName: name,
        slug,
        templateId: "investment",
        theme: { primary: "#065f46", accent: "#1e3a8a" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "corporate",
              title: "Preserving and Growing Generational Wealth",
              subtitle: "Independent, conflict-free wealth management for South Africa's high-net-worth families and institutions.",
              badgeText: "FSP Authorised · FSCA Regulated",
              ctaPrimaryText: "Schedule a Consultation",
              ctaSecondaryText: "View Our Approach",
              backgroundImageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "R4.8B", label: "Assets Under Management" },
                { value: "320+", label: "Client Families" },
                { value: "18yr", label: "Track Record" },
                { value: "11.2%", label: "Avg Annual Return" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Our Investment Philosophy",
              subtitle: "Principled. Patient. Proven.",
              imagePosition: "right",
              imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80",
              items: [
                { title: "Long-Term Value", desc: "We invest in fundamentally strong businesses and assets, not short-term speculation." },
                { title: "Capital Preservation First", desc: "Protecting your wealth from inflation and volatility before seeking growth." },
                { title: "Transparent Fees", desc: "No hidden commissions. Our only incentive is your portfolio's success." },
                { title: "SA & Global Exposure", desc: "Diversified across local equities, offshore assets, and alternative investments." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Wealth Solutions",
              subtitle: "Comprehensive Private Client Services",
              items: [
                { title: "Discretionary Portfolio Management", desc: "Bespoke portfolios tailored to your risk profile and life goals.", price: "From R2M AUM" },
                { title: "Retirement & Pension Planning", desc: "RA, living annuity, and corporate pension fund structuring.", price: "" },
                { title: "Offshore Investment", desc: "Section 10(1)(o) exemptions, forex allowances, and global fund placement.", price: "" },
                { title: "Estate & Trust Planning", desc: "Succession planning, testamentary trusts, and executor services.", price: "" },
                { title: "Tax-Efficient Structuring", desc: "SARS-compliant investment wrappers minimising your effective tax rate.", price: "" },
                { title: "Family Office Services", desc: "Consolidated reporting, bill payment, and multi-generational wealth oversight.", price: "" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Client Perspectives",
              subtitle: "Long-term partnerships built on trust",
              items: [
                { name: "M. Dlamini", role: "Business Owner, KZN", text: "They restructured my entire estate and offshore exposure in 90 days. I sleep better knowing my family is protected." },
                { name: "The Botha Family", role: "Generational Clients", text: "We've been clients for 14 years. Three generations, one advisor we trust completely." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Begin Your Wealth Journey",
              subtitle: "Minimum portfolio R2 million. Consultations by appointment only.",
              email: "private@wealthadvisory.co.za",
              phone: "+27 11 880 4400",
              address: "The Zone, Rosebank, Johannesburg, 2196",
              whatsapp: "",
              enableWhatsApp: false,
            },
          },
        ],
      };

    case "boutique_hotel":
      return {
        businessName: name,
        slug,
        templateId: "boutique_hotel",
        theme: { primary: "#92400e", accent: "#1e3a8a" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "cinematic",
              title: "Where Africa's Soul Meets Timeless Luxury",
              subtitle: "A boutique sanctuary of handcrafted rooms, curated experiences, and warm South African hospitality.",
              badgeText: "AA Travel Award Winner · 5-Star Graded",
              ctaPrimaryText: "Check Availability",
              ctaSecondaryText: "Explore Rooms",
              backgroundImageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "28", label: "Luxury Rooms" },
                { value: "4.9★", label: "TripAdvisor" },
                { value: "5-Star", label: "AA Grading" },
                { value: "15yr", label: "Established" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Rooms & Suites",
              subtitle: "A Home Beyond Home",
              imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80",
              items: [
                { title: "Garden Room", desc: "Private patio with garden views, king bed, and handcrafted amenities.", price: "From R2,800/night" },
                { title: "Heritage Suite", desc: "Spacious suite with lounge, colonial artwork, and mountain panorama.", price: "From R4,500/night" },
                { title: "Presidential Villa", desc: "Private plunge pool, butler service, chef's breakfast, and 180° views.", price: "From R12,000/night" },
                { title: "Honeymoon Suite", desc: "Draped four-poster, rose petal turndown, and private terrace jacuzzi.", price: "From R6,200/night" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "The Full Experience",
              subtitle: "Every Detail Considered",
              imagePosition: "left",
              imageUrl: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80",
              items: [
                { title: "Farm-to-Table Restaurant", desc: "Seasonal menus celebrating Karoo lamb, Boland wines, and local producers." },
                { title: "Infinity Pool & Spa", desc: "Solar-heated pool and full spa treatments overlooking the valley." },
                { title: "Safari & Tours", desc: "Guided game drives, wine routes, cultural village visits, and stargazing." },
                { title: "Corporate Retreats", desc: "Private conference facilities for executive offsites and team experiences." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "The Property",
              subtitle: "Captured in every season",
              images: [
                { url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=600", caption: "Pool Terrace" },
                { url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600", caption: "Heritage Suite" },
                { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600", caption: "Restaurant" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Reservations",
              subtitle: "Our concierge team is available 24/7 to craft your perfect stay.",
              email: "reservations@boutiquehotel.co.za",
              phone: "+27 23 614 1000",
              address: "Wine Valley Road, Robertson, 6705",
              whatsapp: "+27 23 614 1000",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "saas_tech":
      return {
        businessName: name,
        slug,
        templateId: "saas_tech",
        theme: { primary: "#7c3aed", accent: "#0891b2" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "gradient",
              title: "The Platform That Powers Your Business",
              subtitle: "All-in-one software built for African businesses — fast, affordable, and designed for scale.",
              badgeText: "Trusted by 8,000+ Businesses",
              ctaPrimaryText: "Get Started",
              ctaSecondaryText: "Watch Demo",
              backgroundImageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "8,000+", label: "Active Users" },
                { value: "99.9%", label: "Uptime SLA" },
                { value: "2min", label: "Setup Time" },
                { value: "4.8★", label: "App Rating" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Everything You Need. Nothing You Don't.",
              subtitle: "Built for South African Businesses",
              imagePosition: "right",
              imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80",
              items: [
                { title: "Cloud-Based & Mobile-Ready", desc: "Access your data from any device, anywhere in South Africa — even with load shedding via offline mode." },
                { title: "SARS & CIPC Compliant", desc: "Built-in VAT calculations, compliant invoicing, and CIPC integration." },
                { title: "Secure Local Data Hosting", desc: "All data hosted in South African data centres — POPIA compliant by design." },
                { title: "Integrates with Everything", desc: "Xero, Sage, Standard Bank, FNB, and 40+ local integrations out of the box." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Pricing Plans",
              subtitle: "Simple, Transparent Pricing",
              items: [
                { title: "Starter", desc: "Perfect for sole proprietors and micro businesses. Up to 2 users.", price: "R299/month" },
                { title: "Growth", desc: "For growing SMEs. Up to 10 users, advanced reports, and API access.", price: "R799/month" },
                { title: "Enterprise", desc: "Unlimited users, custom modules, dedicated account manager, and SLA.", price: "Custom" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "What Our Customers Say",
              subtitle: "Real results from real businesses",
              items: [
                { name: "Sipho M.", role: "CEO, Joburg Logistics", text: "We cut invoicing time by 80% in the first month. The SARS integration alone paid for a year's subscription." },
                { name: "Priya S.", role: "Founder, Durban Retail Group", text: "Finally a platform that understands South Africa. The load-shedding offline mode is a game-changer." },
                { name: "Andre V.", role: "CFO, Cape Property Group", text: "The multi-branch reporting saves us 3 days a month. Our accountants are delighted." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Get Started Today",
              subtitle: "Set up in minutes. Choose a plan that fits your business. Cancel anytime.",
              email: "hello@saasplatform.co.za",
              phone: "+27 11 000 1234",
              address: "The Innovation Hub, Tshwane, 0001",
              whatsapp: "+27 11 000 1234",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "franchise":
      return {
        businessName: name,
        slug,
        templateId: "franchise",
        theme: { primary: "#c2410c", accent: "#1d4ed8" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "bold",
              title: "Own a Proven Business. Build Your Legacy.",
              subtitle: "Join South Africa's fastest-growing franchise network — backed by a system that works and a team that supports you.",
              badgeText: "50+ Locations Nationwide",
              ctaPrimaryText: "Apply for a Franchise",
              ctaSecondaryText: "Find a Branch Near You",
              backgroundImageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "50+", label: "Franchise Locations" },
                { value: "R800K", label: "Avg First-Year Revenue" },
                { value: "94%", label: "Franchisee Satisfaction" },
                { value: "8yr", label: "Brand History" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Our Franchise Works",
              subtitle: "A Proven System Behind You",
              imagePosition: "right",
              imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80",
              items: [
                { title: "Comprehensive Training", desc: "4-week intensive training programme covering operations, marketing, and financial management." },
                { title: "Turnkey Setup", desc: "We handle site selection, fit-out, equipment supply, and staff recruitment." },
                { title: "Centralised Marketing", desc: "National campaigns, social media management, and branded collateral at no extra cost." },
                { title: "Ongoing Support", desc: "Dedicated franchise support manager visits monthly and is always a call away." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Franchise Packages",
              subtitle: "Find Your Fit",
              items: [
                { title: "Kiosk Franchise", desc: "Compact format for malls and high-traffic locations. Ideal for first-time franchisees.", price: "From R380,000" },
                { title: "Standard Store", desc: "Full-format store with complete product range and seating. Best ROI format.", price: "From R750,000" },
                { title: "Master Franchise", desc: "Own the rights to develop multiple units in an exclusive territory.", price: "From R2,500,000" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Franchisee Stories",
              subtitle: "Real people, real businesses",
              items: [
                { name: "Thabo M.", role: "Franchise Owner, Soweto", text: "I opened my first store 3 years ago. I just signed for my third location. The system really works." },
                { name: "Fatima A.", role: "Franchise Owner, Cape Town", text: "The training was exceptional. I had no business experience and now I run a R1.2M operation." },
                { name: "Craig P.", role: "Master Franchisee, KZN", text: "I own 6 units. The support from head office makes the whole network feel like family." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Start Your Franchise Journey",
              subtitle: "Complete our brief application and our franchise development team will be in touch within 48 hours.",
              email: "franchise@brandgroup.co.za",
              phone: "+27 11 450 7000",
              address: "Franchise Head Office, Midrand, 1685",
              whatsapp: "+27 11 450 7000",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "wedding_venue":
      return {
        businessName: name,
        slug,
        templateId: "wedding_venue",
        theme: { primary: "#9d174d", accent: "#92400e" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "centered",
              title: "Where Love Stories Come to Life",
              subtitle: "A breathtaking estate nestled in the winelands, offering an unforgettable backdrop for the most important day of your life.",
              badgeText: "SA Wedding Awards Finalist",
              ctaPrimaryText: "Check Availability",
              ctaSecondaryText: "View Packages",
              backgroundImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "500+", label: "Weddings Hosted" },
                { value: "250", label: "Guest Capacity" },
                { value: "4.9★", label: "Couple Rating" },
                { value: "15ha", label: "Estate Grounds" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Wedding Packages",
              subtitle: "Every Detail, Perfectly Planned",
              imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80",
              items: [
                { title: "Intimate Ceremony", desc: "Up to 50 guests. Chapel, florals, sound system, and champagne toast included.", price: "From R28,000" },
                { title: "Classic Wedding", desc: "Up to 120 guests. Full venue exclusive use, wedding coordinator, and décor package.", price: "From R65,000" },
                { title: "Grand Celebration", desc: "Up to 250 guests. Full estate buyout, 2-night honeymoon suite, and catering included.", price: "From R150,000" },
                { title: "Micro Wedding", desc: "Intimate elopement for up to 20 guests — beautiful, meaningful, stress-free.", price: "From R15,000" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Our Venue Spaces",
              subtitle: "A Stage for Every Moment",
              imagePosition: "left",
              imageUrl: "https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&q=80",
              items: [
                { title: "Garden Chapel", desc: "A fern-draped open-air chapel with mountain views for intimate ceremonies." },
                { title: "The Grande Hall", desc: "Elegant chandeliered reception hall seating 250 with dance floor and stage." },
                { title: "Vineyard Terrace", desc: "Al fresco cocktail hour space among the vines with sunset panorama." },
                { title: "Honeymoon Cottage", desc: "Private rose-garden cottage with fireplace, jacuzzi, and chef's breakfast." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Captured Moments",
              subtitle: "Every wedding tells a unique story",
              images: [
                { url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=600", caption: "Chapel Ceremony" },
                { url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=600", caption: "Reception Evening" },
                { url: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&q=80&w=600", caption: "Garden Portraits" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Begin Your Love Story Here",
              subtitle: "Contact our wedding coordinator for a private tour and availability check.",
              email: "weddings@estateventure.co.za",
              phone: "+27 21 876 5400",
              address: "Vineyard Estate, Franschhoek, 7690",
              whatsapp: "+27 21 876 5400",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "private_school":
      return {
        businessName: name,
        slug,
        templateId: "private_school",
        theme: { primary: "#1e3a8a", accent: "#166534" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "corporate",
              title: "Shaping Tomorrow's Leaders Today",
              subtitle: "A world-class independent school committed to academic excellence, character formation, and servant leadership in South Africa.",
              badgeText: "IEB Accredited · 100% Matric Pass Rate",
              ctaPrimaryText: "Apply for Enrolment",
              ctaSecondaryText: "Tour Our Campus",
              backgroundImageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "100%", label: "Matric Pass Rate" },
                { value: "850", label: "Enrolled Learners" },
                { value: "12:1", label: "Learner-Teacher Ratio" },
                { value: "65+", label: "Co-Curricular Activities" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Academic Excellence",
              subtitle: "Our Educational Approach",
              imagePosition: "right",
              imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80",
              items: [
                { title: "IEB Curriculum", desc: "Independent Examinations Board curriculum with consistent above-national-average results." },
                { title: "STEM Academy", desc: "Dedicated science, technology, engineering, and mathematics centre with lab facilities." },
                { title: "Arts & Culture", desc: "Full-time music, drama, and visual arts programmes with dedicated performance venues." },
                { title: "Sport Programme", desc: "40+ sporting codes, professional coaching, and provincial representation pathways." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "School Phases",
              subtitle: "A Journey from Foundation to Matric",
              items: [
                { title: "Pre-Primary (Gr R)", desc: "Play-based learning in a nurturing, language-rich environment.", price: "R4,200/month" },
                { title: "Primary School (Gr 1–7)", desc: "Strong academic foundation with sport, art, and music integration.", price: "R5,800/month" },
                { title: "High School (Gr 8–12)", desc: "IEB curriculum, subject specialisation, and university preparation.", price: "R7,500/month" },
                { title: "Boarding School", desc: "Safe, structured boarding facility with academic support and house parents.", price: "R9,800/month" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "Our Heritage & Values",
              quote: "We don't just teach — we inspire a love of learning that lasts a lifetime.",
              imagePosition: "left",
              imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80",
              items: [
                { title: "Founded 1968", desc: "Over 55 years of shaping South Africa's finest minds and leaders." },
                { title: "Bursary Programme", desc: "R2.4M in merit and need-based bursaries awarded annually." },
                { title: "Alumni Network", desc: "8,000+ alumni in leadership positions across industry, academia, and government." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Enrolment Enquiries",
              subtitle: "Applications for 2025 are open. Book a campus tour to experience our community first-hand.",
              email: "admissions@privateschool.co.za",
              phone: "+27 12 345 8900",
              address: "Academy Road, Pretoria East, 0181",
              whatsapp: "+27 12 345 8900",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "eco_brand":
      return {
        businessName: name,
        slug,
        templateId: "eco_brand",
        theme: { primary: "#14532d", accent: "#92400e" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "gradient",
              title: "Good for You. Good for the Planet.",
              subtitle: "Proudly South African sustainable products — crafted with purpose, packaged without guilt, and delivered with love for our earth.",
              badgeText: "Certified Carbon Neutral · Fair Trade",
              ctaPrimaryText: "Shop Our Range",
              ctaSecondaryText: "Our Story",
              backgroundImageUrl: "https://images.unsplash.com/photo-1542601906897-58b25793aea0?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "100%", label: "Plastic-Free Packaging" },
                { value: "2,400", label: "Trees Planted" },
                { value: "Zero", label: "Carbon Footprint" },
                { value: "40+", label: "Ethical Products" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "about",
            enabled: true,
            data: {
              title: "Why We Exist",
              quote: "South Africa's biodiversity is our greatest inheritance. We're building a business that protects it.",
              imagePosition: "right",
              imageUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80",
              items: [
                { title: "Indigenous Ingredients", desc: "Rooibos, Baobab, Marula, and Moringa sourced directly from smallholder farmers." },
                { title: "Women-Led Supply Chain", desc: "75% of our suppliers are women-owned cooperatives in rural communities." },
                { title: "B Corp Certified", desc: "Independently verified to meet the highest standards of social and environmental performance." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Product Range",
              subtitle: "Ethically Crafted. Consciously Packaged.",
              imageUrl: "https://images.unsplash.com/photo-1599056407108-da7bf2cd1e38?auto=format&fit=crop&q=80",
              items: [
                { title: "Rooibos Skincare", desc: "Antioxidant-rich face and body range in 100% compostable packaging.", price: "From R189" },
                { title: "Baobab Superfood", desc: "Certified organic baobab powder sourced from Limpopo community growers.", price: "From R149" },
                { title: "Eco Cleaning Range", desc: "Plant-based cleaning concentrates in refillable aluminium bottles.", price: "From R89" },
                { title: "Beeswax Wraps", desc: "Handmade food storage wraps replacing single-use plastic in your kitchen.", price: "From R120" },
                { title: "Corporate Gifting", desc: "Branded sustainable gift sets for corporates — zero waste, maximum impact.", price: "From R350" },
                { title: "Monthly Eco Box", desc: "Curated subscription box of 5 sustainable SA products delivered to your door.", price: "R499/month" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "gallery",
            enabled: true,
            data: {
              title: "Our Impact",
              subtitle: "Every purchase makes a difference",
              images: [
                { url: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=600", caption: "Community Farmers" },
                { url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=600", caption: "Our Products" },
                { url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=600", caption: "South African Nature" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Join the Movement",
              subtitle: "Shop online, partner with us, or enquire about wholesale and corporate orders.",
              email: "hello@ecobrand.co.za",
              phone: "+27 21 433 7800",
              address: "Green Quarter, Cape Town, 8001",
              whatsapp: "+27 21 433 7800",
              enableWhatsApp: true,
            },
          },
        ],
      };

    case "medical_premium":
      return {
        businessName: name,
        slug,
        templateId: "medical_premium",
        theme: { primary: "#0f766e", accent: "#1e3a8a" },
        social: {},
        sections: [
          {
            id: makeSectionId(),
            type: "hero",
            enabled: true,
            data: {
              heroStyle: "minimal",
              title: "Specialist Care. Personalised Medicine.",
              subtitle: "A multi-disciplinary private practice delivering world-class specialist healthcare to the people of South Africa.",
              badgeText: "HPCSA Registered · Medical Aid Accredited",
              ctaPrimaryText: "Book an Appointment",
              ctaSecondaryText: "Meet Our Specialists",
              backgroundImageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80",
            },
          },
          {
            id: makeSectionId(),
            type: "stats",
            enabled: true,
            data: {
              items: [
                { value: "12", label: "Specialist Doctors" },
                { value: "20,000+", label: "Patients Treated" },
                { value: "8", label: "Medical Aids Accepted" },
                { value: "Same Day", label: "Urgent Appointments" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "services",
            enabled: true,
            data: {
              title: "Our Specialisations",
              subtitle: "Comprehensive Private Medical Care",
              imageUrl: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&q=80",
              items: [
                { title: "Cardiology", desc: "ECG, echocardiography, stress testing, and cardiac risk management.", price: "" },
                { title: "Orthopaedic Surgery", desc: "Joint replacement, sports injuries, spinal surgery, and fracture management.", price: "" },
                { title: "Oncology", desc: "Chemotherapy, targeted therapy, palliative care, and cancer screening.", price: "" },
                { title: "Radiology & Imaging", desc: "MRI, CT, ultrasound, and digital X-ray services with same-day reporting.", price: "" },
                { title: "Paediatrics", desc: "Child health, developmental assessments, vaccination, and allergy testing.", price: "" },
                { title: "Dermatology", desc: "Skin cancer screening, cosmetic dermatology, and chronic skin conditions.", price: "" },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "features",
            enabled: true,
            data: {
              title: "Why Choose Our Practice",
              subtitle: "Patient-First at Every Step",
              imagePosition: "right",
              imageUrl: "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80",
              items: [
                { title: "State-of-the-Art Facilities", desc: "Fully equipped theatre, ICU, diagnostic imaging, and on-site pathology lab." },
                { title: "Medical Aid Compliant", desc: "We accept Discovery, Momentum, Bonitas, Medihelp, and 4 more major schemes." },
                { title: "Multilingual Care", desc: "Practitioners speak English, Zulu, Afrikaans, Xhosa, and Sepedi." },
                { title: "Digital Patient Portal", desc: "Book, consult, and access your results online or via our mobile app." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "testimonials",
            enabled: true,
            data: {
              title: "Patient Testimonials",
              subtitle: "Health restored. Lives changed.",
              items: [
                { name: "Mrs. Dlamini", role: "Cardiology Patient", text: "Dr. Nkosi identified my condition before it became critical. His thoroughness saved my life. I am eternally grateful." },
                { name: "Mr. van der Berg", role: "Orthopaedic Patient", text: "I was back on the golf course 8 weeks after my knee replacement. The surgical team and physio were world class." },
                { name: "Lindiwe M.", role: "Parent, Paediatric Patient", text: "The doctors here explained everything so clearly. My daughter was comfortable and well-cared for throughout." },
              ],
            },
          },
          {
            id: makeSectionId(),
            type: "contact",
            enabled: true,
            data: {
              title: "Book an Appointment",
              subtitle: "For medical emergencies please call 10177. For appointments and enquiries use the details below.",
              email: "appointments@medicalpractice.co.za",
              phone: "+27 11 555 2200",
              address: "Medical Centre, Rosebank, Johannesburg, 2196",
              whatsapp: "+27 11 555 2200",
              enableWhatsApp: true,
            },
          },
        ],
      };
  }
}
