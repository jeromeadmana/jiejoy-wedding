export const WEDDING = {
  couple: {
    partner1: "Jie",
    partner2: "Joy",
  },
  date: "Saturday, September 26, 2026",
  dateShort: "09.26.2026",
  hashtag: "#JieAndJoyForever",
  tagline: "We're getting married!",

  ceremony: {
    name: "Our Lady of Peñafrancia Parish",
    address: "Peñafrancia Ave., Brgy. Peñafrancia, Naga City 4400, Camarines Sur",
    time: "3:00 PM",
    mapUrl: "https://maps.google.com/?q=Our+Lady+of+Peñafrancia+Shrine+Naga+City",
  },
  reception: {
    name: "Royale Emelina",
    address: "J. Miranda Ave., Magsaysay, Naga City 4400, Camarines Sur",
    time: "5:30 PM",
    mapUrl: "https://maps.google.com/?q=Royale+Emelina+Naga+City",
  },
  dressCode: "Semi-formal / Cocktail Attire",

  story: [
    {
      title: "How We Met",
      date: "June 2020",
      text: "It all started at a friend's dinner party. Across a crowded room, their eyes met over a shared love of terrible puns and good wine. What began as an evening of laughter turned into a connection neither could ignore.",
      image: "/images/date-night.jpg",
    },
    {
      title: "Adventures Together",
      date: "2021",
      text: "From spontaneous road trips on a motorbike to laughing on the roadside with nowhere to be — they found joy in every detour. Every journey together became another chapter in a love story written on the open road.",
      image: "/images/road-trip.jpg",
    },
    {
      title: "The Proposal",
      date: "December 2025",
      text: "On a breathtaking clifftop overlooking the ocean at sunset, one knee touched the ground and a ring sparkled in the golden light. Through tears of joy, the answer was a resounding yes — and forever began.",
      image: "/images/proposal.jpg",
    },
  ],

  faq: [
    {
      q: "What is the dress code?",
      a: "Semi-formal or cocktail attire. Think elegant but comfortable — we want you to enjoy the celebration!",
    },
    {
      q: "Is there parking available?",
      a: "Yes! Both the ceremony and reception venues have parking available for guests.",
    },
    {
      q: "Can I bring a plus-one?",
      a: "We have a limited guest list, so please only bring a guest if your invitation indicates a plus-one. If you're unsure, feel free to reach out to us!",
    },
    {
      q: "Will there be an open bar?",
      a: "Absolutely! We'll have a full open bar at the reception with wine, beer, cocktails, and non-alcoholic beverages.",
    },
    {
      q: "What time should I arrive?",
      a: "Please arrive at the ceremony venue by 2:45 PM to be seated before the 3:00 PM start. The reception begins at 5:30 PM.",
    },
    {
      q: "Are children welcome?",
      a: "Yes, children are welcome and included in the guest count! Please indicate them in your RSVP. Babies (infants) don't need to be counted but are of course welcome too.",
    },
    {
      q: "What type of food will be served?",
      a: "The reception will feature a buffet-style dinner with a variety of dishes. If you have any dietary restrictions or allergies, please let us know in the RSVP form so we can do our best to accommodate you.",
    },
    {
      q: "How do I get from the ceremony to the reception?",
      a: "The reception venue is just a quick 5-minute ride from the church. Public transport (jeepneys and tricycles) is readily available in the area. No dedicated shuttle will be provided.",
    },
  ],

  hotels: [
    {
      name: "Avenue Plaza Hotel",
      distance: "Near Peñafrancia",
      price: "From ₱4,500/night",
      url: "#",
      note: "Walking distance to the church. One of the top hotels in Naga City.",
    },
    {
      name: "Villa Caceres Hotel",
      distance: "Central Naga City",
      price: "From ₱2,600/night",
      url: "#",
      note: "Well-known hotel with quality breakfast and comfortable rooms.",
    },
    {
      name: "Go Hotels Plus Naga",
      distance: "Near Robinsons Place",
      price: "From ₱1,200/night",
      url: "#",
      note: "Budget-friendly option with free WiFi. Close to malls and restaurants.",
    },
  ],

  registry: [
    { store: "Amazon", url: "#" },
    { store: "Crate & Barrel", url: "#" },
    { store: "Zola", url: "#" },
  ],
} as const;

export const RSVP_DEADLINE = new Date("2026-09-12T23:59:59+08:00");

export const RSVP_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jieandjoy.site";

export const NAV_LINKS = [
  { label: "Our Story", href: "#our-story" },
  { label: "Details", href: "#details" },
  { label: "RSVP", href: "#rsvp" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQ", href: "#faq" },
] as const;
