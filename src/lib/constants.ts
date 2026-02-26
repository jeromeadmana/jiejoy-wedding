export const WEDDING = {
  couple: {
    partner1: "Jie",
    partner2: "Joy",
  },
  date: "Saturday, October 18, 2026",
  dateShort: "10.18.2026",
  hashtag: "#JieAndJoyForever",
  tagline: "We're getting married!",

  ceremony: {
    name: "St. Margaret's Chapel",
    address: "123 Garden Lane, Maplewood, NJ 07040",
    time: "3:00 PM",
    mapUrl: "#",
  },
  reception: {
    name: "The Grand Ballroom at Oakwood Estate",
    address: "456 Oak Drive, Maplewood, NJ 07040",
    time: "5:30 PM",
    mapUrl: "#",
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
      title: "The First Date",
      date: "August 2020",
      text: "A cozy little cafe became their world for an evening. Hours passed like minutes as they discovered how much they had in common — and how wonderfully different they were. By the end of the night, they both knew this was something special.",
      image: "/images/date-night.jpg",
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
      a: "Yes! Both the ceremony and reception venues have complimentary parking. Valet service will also be available at the reception.",
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
      a: "While we love your little ones, this will be an adults-only celebration. We hope you can enjoy a night out!",
    },
    {
      q: "What if I have dietary restrictions?",
      a: "Please let us know about any dietary needs in the RSVP form. Our caterer is happy to accommodate allergies and dietary preferences.",
    },
    {
      q: "Will there be transportation between the ceremony and reception?",
      a: "A shuttle service will run between the chapel and the reception venue. Details will be shared closer to the date.",
    },
  ],

  hotels: [
    {
      name: "The Maplewood Inn",
      distance: "0.5 miles from venue",
      price: "From $150/night",
      url: "#",
      note: "Ask for the Jie & Joy wedding block for a discounted rate.",
    },
    {
      name: "Hilton Garden Inn",
      distance: "2 miles from venue",
      price: "From $130/night",
      url: "#",
      note: "Complimentary breakfast included.",
    },
    {
      name: "The Oakwood Boutique Hotel",
      distance: "0.3 miles from venue",
      price: "From $200/night",
      url: "#",
      note: "Walking distance to the reception. Perfect for a special stay.",
    },
  ],

  registry: [
    { store: "Amazon", url: "#" },
    { store: "Crate & Barrel", url: "#" },
    { store: "Zola", url: "#" },
  ],
} as const;

export const NAV_LINKS = [
  { label: "Our Story", href: "#our-story" },
  { label: "Details", href: "#details" },
  { label: "RSVP", href: "#rsvp" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQ", href: "#faq" },
] as const;
