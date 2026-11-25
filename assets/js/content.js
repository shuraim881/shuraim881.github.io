/* =====================================================================
   SHUXBROH — SITE CONTENT
   ---------------------------------------------------------------------
   Every piece of text, image, link, service, project, testimonial and
   brand on the website comes from this one file. The future Admin Panel
   will edit exactly these fields (later stored in Supabase).

   Until then you can edit this file directly:
   - Leave an image as "" to show the styled placeholder.
   - To add a photo: put it in assets/img/ and write e.g.
       photo: "assets/img/profile.jpg"
   ===================================================================== */

window.SITE_CONTENT = {
  brand: {
    name: "Shux",
    handle: "ShuxBroh",
    logoText: "ShuxBroh",
    logoMark: "S",                 // letter shown in the round logo badge
    logoImage: ""                  // optional logo image (replaces the letter badge)
  },

  /* WEBSITE SETTINGS ------------------------------------------------ */
  seo: {
    siteTitle: "ShuxBroh",
    homeTitle: "ShuxBroh — Shux | AI, Web3 & Crypto Content Creator",
    description: "Shux (ShuxBroh) — AI, Web3, Crypto and Tech content creator: product reviews, explainers, research, videos and social media content."
  },

  /* Colors used across the whole site */
  theme: {
    navy: "#0E2A6E",
    royal: "#2D5BD3",
    peri: "#7A9BE8",
    sky: "#C9DAFB",
    cloud: "#F4F8FF"
  },

  navCta: { label: "Work With Me", href: "contact.html" },

  nav: [
    { label: "Home", href: "index.html" },
    { label: "About", href: "about.html" },
    { label: "Services", href: "services.html" },
    { label: "Portfolio", href: "portfolio.html" },
    { label: "Contact", href: "contact.html" }
  ],

  /* 1. HERO ---------------------------------------------------------- */
  hero: {
    eyebrow: "AI · Web3 · Crypto · Tech",
    label: "CONTENT CREATOR",
    greeting: "Hey, I'm Shux.",
    name: "Shux",
    handle: "ShuxBroh",
    title: "AI, Web3 & Crypto Content Creator",
    // Separate paragraphs with a blank line (\n\n)
    intro:
      "From ideas and research to videos people actually want to watch.\n\nI create engaging content around AI, Web3, Crypto and Technology, including product reviews, explainers, research-based videos and UGC content.",
    photo: "",                       // e.g. "assets/img/profile.jpg"
    photoAlt: "Shux — ShuxBroh",
    ctaLabel: "View My Work",
    ctaHref: "portfolio.html",
    tags: ["UGC Videos", "Product Reviews", "Explainers", "Video Content", "Social Media Management (SMM)", "Content Strategy"]
  },


  /* 2. SERVICES TEASER ---------------------------------------------- */
  services: {
    eyebrow: "what I do",
    heading: "Services",
    sub: "A quick look at how I help AI, Web3 and crypto projects tell their story.",
    ctaLabel: "Explore All Services",
    ctaHref: "services.html",
    items: [
      { icon: "video",    title: "Short-Form Video",           text: "Fast, punchy videos built for X, Reels and Shorts." },
      { icon: "film",     title: "Long-Form Video",            text: "In-depth videos that walk through a product or idea." },
      { icon: "pen",      title: "X Posts & Writing",          text: "Clear, engaging posts written for the crypto timeline." },
      { icon: "thread",   title: "Threads & Education",        text: "Step-by-step threads that teach, not just tell." },
      { icon: "share",    title: "Social Media Management",    text: "Consistent posting and growth for your accounts." },
      { icon: "search",   title: "AI, Web3 & Crypto Research", text: "Research-backed breakdowns of projects and trends." },
      { icon: "star",     title: "Product Reviews & Explainers", text: "Honest walkthroughs that show how a product works." },
      { icon: "target",   title: "Strategy & Campaigns",       text: "Content plans and campaign support that fit your goals." }
    ]
  },

  /* 3. FEATURED WORK ------------------------------------------------- */
  work: {
    eyebrow: "selected work",
    heading: "Featured Work",
    sub: "Placeholder cards — real projects will be added from the Admin Panel.",
    ctaLabel: "View Full Portfolio",
    ctaHref: "portfolio.html",
    items: [
      { title: "Project title placeholder", category: "Video",          thumbnail: "", link: "" },
      { title: "Project title placeholder", category: "Product Review", thumbnail: "", link: "" },
      { title: "Project title placeholder", category: "Thread",         thumbnail: "", link: "" },
      { title: "Project title placeholder", category: "Explainer",      thumbnail: "", link: "" },
      { title: "Project title placeholder", category: "Post",           thumbnail: "", link: "" },
      { title: "Project title placeholder", category: "Campaign",       thumbnail: "", link: "" }
    ]
  },

  /* SERVICES PAGE --------------------------------------------------
     showPricing: false hides every price line.
     price: "" hides the price for one service.
     features: optional bullet list ("" items are skipped).
  ------------------------------------------------------------------ */
  servicesPage: {
    eyebrow: "how I can help",
    heading: "Services",
    sub: "Placeholder — a short line introducing your services.",
    showPricing: true,
    priceLabel: "Starting from",
    ctaLabel: "Enquire Now",
    items: [
      { icon: "user",   title: "UGC Video Content",          description: "Placeholder — describe your UGC video service.",          features: ["Placeholder feature", "Placeholder feature", "Placeholder feature"], price: "Price placeholder", priceNote: "per video", hidden: false },
      { icon: "video",  title: "Short-Form Videos",          description: "Placeholder — describe your short-form video service.",   features: ["Placeholder feature", "Placeholder feature", "Placeholder feature"], price: "Price placeholder", priceNote: "per video", hidden: false },
      { icon: "film",   title: "Long-Form Videos",           description: "Placeholder — describe your long-form video service.",    features: ["Placeholder feature", "Placeholder feature", "Placeholder feature"], price: "Price placeholder", priceNote: "per video", hidden: false },
      { icon: "thread", title: "X Posts & Threads",          description: "Placeholder — describe your X posts and threads service.", features: ["Placeholder feature", "Placeholder feature", "Placeholder feature"], price: "Price placeholder", priceNote: "per post", hidden: false },
      { icon: "share",  title: "Social Media Management (SMM)", description: "Placeholder — describe your SMM service.",             features: ["Placeholder feature", "Placeholder feature", "Placeholder feature"], price: "Price placeholder", priceNote: "per month", hidden: false },
      { icon: "target", title: "Content Strategy",           description: "Placeholder — describe your content strategy service.",   features: ["Placeholder feature", "Placeholder feature", "Placeholder feature"], price: "Price placeholder", priceNote: "per project", hidden: false },
      { icon: "spark",  title: "AI, Web3 & Crypto Content",  description: "Placeholder — describe your AI, Web3 and crypto content service.", features: ["Placeholder feature", "Placeholder feature", "Placeholder feature"], price: "Price placeholder", priceNote: "per project", hidden: false }
    ]
  },

  /* CONTACT PAGE ---------------------------------------------------
     Contact details come from "socials" (bottom of this file).
     form.endpoint: "" = Netlify Forms (works automatically once hosted on Netlify).
     If sending fails (e.g. viewing the file offline), visitors are offered email instead.
  ------------------------------------------------------------------ */
  contact: {
    eyebrow: "get in touch",
    heading: "Contact",
    sub: "Placeholder — a short line inviting brands, founders and projects to reach out.",
    detailsHeading: "Contact Details",
    availability: "Placeholder — your availability or typical response time.",
    emptyLink: "Link coming soon",
    form: {
      enabled: true,
      disabledText: "The inquiry form is closed right now — please reach out by email instead.",
      heading: "Send an Inquiry",
      endpoint: "",
      nameLabel: "Your Name",
      emailLabel: "Email Address",
      companyLabel: "Brand / Project (optional)",
      serviceLabel: "Service",
      servicePlaceholder: "Choose a service",
      otherService: "Something else",
      messageLabel: "Message",
      messagePlaceholder: "Tell me about your project, goals and timeline.",
      submitLabel: "Send Inquiry",
      successTitle: "Message sent!",
      successText: "Thanks for reaching out — I'll get back to you soon.",
      errorText: "The form couldn't be sent from here. You can email me directly instead:"
    }
  },

  /* ABOUT PAGE -----------------------------------------------------
     Placeholders are marked "Placeholder" — replace them with your own words.
     Separate paragraphs with a blank line (\n\n).
  ------------------------------------------------------------------ */
  about: {
    intro: {
      label: "ABOUT ME",
      name: "Shux",
      handle: "ShuxBroh",
      role: "AI, Web3 & Crypto Content Creator",
      photo: "",                     // e.g. "assets/img/about.jpg"
      photoAlt: "Shux — ShuxBroh",
      text: "Placeholder — your introduction goes here. Write a few lines about who you are and what you create.\n\nPlaceholder — add a second paragraph if you like."
    },
    /* Creator stats — the section stays hidden until at least one value is filled in.
       value examples: "1250", "12.5K", "3.2M", "98" — numbers animate when scrolled into view. */
    stats: {
      eyebrow: "by the numbers",
      heading: "Creator Stats",
      sub: "",
      items: [
        { icon: "chart",   label: "Wallchain Score",   value: "", suffix: "", visible: true },
        { icon: "spark",   label: "Kaito Score",       value: "", suffix: "", visible: true },
        { icon: "users",   label: "Smart Followers",   value: "", suffix: "", visible: true },
        { icon: "x",       label: "X Followers",       value: "", suffix: "", visible: true },
        { icon: "eye",     label: "Total Impressions", value: "", suffix: "", visible: true }
      ]
    },
    journey: {
      eyebrow: "my story",
      heading: "My Journey",
      quote: "Placeholder — a short line or personal motto that sums up your journey.",
      chapters: [
        { title: "How It Started",     text: "Placeholder — share how you first got into content creation." },
        { title: "Background",         text: "Placeholder — add your background and what shaped you." },
        { title: "Interests",          text: "Placeholder — the topics and ideas you're most curious about." },
        { title: "Professional Story", text: "Placeholder — how your creator work has grown into what it is today." }
      ]
    },
    whatIDo: {
      eyebrow: "focus areas",
      heading: "What I Do",
      items: [
        { icon: "spark",  title: "AI",                       text: "Placeholder — describe your AI content." },
        { icon: "cube",   title: "Web3",                     text: "Placeholder — describe your Web3 content." },
        { icon: "coin",   title: "Crypto",                   text: "Placeholder — describe your crypto content." },
        { icon: "chip",   title: "Technology",               text: "Placeholder — describe your tech content." },
        { icon: "video",  title: "Content Creation",         text: "Placeholder — describe the content you create." },
        { icon: "star",   title: "Product Reviews",          text: "Placeholder — describe how you review products." },
        { icon: "share",  title: "Social Media Management",  text: "Placeholder — describe your SMM work." }
      ]
    },
    skills: {
      eyebrow: "what I bring",
      heading: "Skills & Expertise",
      items: [
        { icon: "pen",    title: "Content Creation",           text: "Placeholder — add a short note about this skill." },
        { icon: "spark",  title: "AI Research",                text: "Placeholder — add a short note about this skill." },
        { icon: "search", title: "Web3 & Crypto Research",     text: "Placeholder — add a short note about this skill." },
        { icon: "film",   title: "Video Content Production",   text: "Placeholder — add a short note about this skill." },
        { icon: "doc",    title: "Content Writing",            text: "Placeholder — add a short note about this skill." },
        { icon: "share",  title: "Social Media Management",    text: "Placeholder — add a short note about this skill." },
        { icon: "target", title: "Content Strategy",           text: "Placeholder — add a short note about this skill." },
        { icon: "star",   title: "Product Reviews",            text: "Placeholder — add a short note about this skill." }
      ]
    },
    approach: {
      eyebrow: "how I work",
      heading: "My Approach",
      sub: "Placeholder — an optional one-line summary of how you work.",
      steps: [
        { title: "Research",      text: "Placeholder — explain how you research a topic or project." },
        { title: "Create",        text: "Placeholder — explain how you turn research into content." },
        { title: "Collaborate",   text: "Placeholder — explain how you work with projects and brands." },
        { title: "Manage",        text: "Placeholder — explain how you manage collaborations from start to finish." }
      ]
    }
  },

  /* PORTFOLIO PAGE -------------------------------------------------
     categories: the filter tabs (order = tab order)
     items: each piece of work
       title, description   — text shown on the card and in the expanded view
       categories           — one or more category names from the list above
       platform             — e.g. "X", "YouTube", "Instagram", "TikTok"
       type                 — "video", "image" or "text" (how the preview is shown)
       thumbnail            — card image, e.g. "assets/img/work-1.jpg" ("" = placeholder)
       media                — larger preview: a YouTube link, an .mp4 file, or an image path
       body                 — full written content for posts / threads (optional)
       link                 — optional external link (leave "" to hide the button)
  ------------------------------------------------------------------ */
  portfolio: {
    eyebrow: "my work",
    heading: "Portfolio",
    sub: "Videos, posts, threads, reviews and campaigns across AI, Web3 and crypto. Tap any card to see more.",
    allLabel: "All Work",
    emptyText: "No items in this category yet — new work will appear here soon.",
    categories: [
      "Short-Form Videos",
      "Long-Form Videos",
      "AI Content",
      "Web3 and Crypto Content",
      "Product Reviews",
      "X Posts",
      "Threads",
      "Campaigns"
    ],
    items: [
      { title: "Short-form video placeholder", description: "Short description placeholder — what the video is about and who it was for.", categories: ["Short-Form Videos", "AI Content"], platform: "X", type: "video", thumbnail: "", media: "", body: "", link: "", featured: false },
      { title: "Long-form video placeholder", description: "Short description placeholder — a quick summary of the video and its goal.", categories: ["Long-Form Videos", "Web3 and Crypto Content"], platform: "YouTube", type: "video", thumbnail: "", media: "", body: "", link: "", featured: false },
      { title: "AI content placeholder", description: "Short description placeholder — the AI tool or topic this piece covers.", categories: ["AI Content"], platform: "X", type: "image", thumbnail: "", media: "", body: "", link: "", featured: false },
      { title: "Web3 & crypto content placeholder", description: "Short description placeholder — the project or concept explained.", categories: ["Web3 and Crypto Content"], platform: "X", type: "image", thumbnail: "", media: "", body: "", link: "", featured: false },
      { title: "Product review placeholder", description: "Short description placeholder — the product reviewed and key takeaways.", categories: ["Product Reviews", "Short-Form Videos"], platform: "X", type: "video", thumbnail: "", media: "", body: "", link: "", featured: false },
      { title: "X post placeholder", description: "Short description placeholder — what the post was about.", categories: ["X Posts"], platform: "X", type: "text", thumbnail: "", media: "", body: "Full post text placeholder. Paste the written content here from the Admin Panel so visitors can read it in the expanded view.", link: "", featured: false },
      { title: "Thread placeholder", description: "Short description placeholder — the topic the thread breaks down.", categories: ["Threads", "Web3 and Crypto Content"], platform: "X", type: "text", thumbnail: "", media: "", body: "Thread placeholder — part 1.\n\nThread placeholder — part 2.\n\nThread placeholder — part 3.", link: "", featured: false },
      { title: "Campaign placeholder", description: "Short description placeholder — the campaign goal and your role in it.", categories: ["Campaigns"], platform: "X", type: "image", thumbnail: "", media: "", body: "", link: "", featured: false },
      { title: "Short-form video placeholder", description: "Short description placeholder — what the video is about and who it was for.", categories: ["Short-Form Videos", "Web3 and Crypto Content"], platform: "Instagram", type: "video", thumbnail: "", media: "", body: "", link: "", featured: false }
    ]
  },

  /* 4. TESTIMONIALS -------------------------------------------------- */
  testimonials: {
    eyebrow: "kind words",
    heading: "Client Feedback",
    items: [
      { quote: "Placeholder — real client feedback will appear here once it's added.", name: "Client Name", role: "Role · Company", avatar: "" },
      { quote: "Placeholder — real client feedback will appear here once it's added.", name: "Client Name", role: "Role · Company", avatar: "" },
      { quote: "Placeholder — real client feedback will appear here once it's added.", name: "Client Name", role: "Role · Company", avatar: "" }
    ]
  },

  /* 5. COLLABORATIONS (marquee) ------------------------------------- */
  brands: {
    eyebrow: "collaborations",
    heading: "Brands I've Worked With",
    items: [
      { name: "Brand Name", logo: "", url: "", details: "" },
      { name: "Brand Name", logo: "", url: "", details: "" },
      { name: "Brand Name", logo: "", url: "", details: "" },
      { name: "Brand Name", logo: "", url: "", details: "" },
      { name: "Brand Name", logo: "", url: "", details: "" },
      { name: "Brand Name", logo: "", url: "", details: "" }
    ]
  },

  /* 6. CLOSING CTA --------------------------------------------------- */
  cta: {
    eyebrow: "let's create something amazing",
    headingTop: "Let's Work",
    headingBottom: "Together!",
    heading: "Let's Work Together!",
    signoff: "Thanks for visiting",
    text: "I work with brands, founders and projects in AI, Web3 and crypto. Tell me what you're building and let's make content that lands.",
    ctaLabel: "Let's Work Together",
    ctaHref: "contact.html"
  },

  /* SOCIALS (leave url "" to hide an icon) -------------------------- */
  socials: [
    { platform: "x",         label: "X",         display: "@ShuxBroh", url: "https://x.com/ShuxBroh" },
    { platform: "telegram",  label: "Telegram",  display: "Telegram", url: "" },
    { platform: "instagram", label: "Instagram", display: "Instagram", url: "" },
    { platform: "youtube",   label: "YouTube",   display: "YouTube", url: "" },
    { platform: "mail",      label: "Email",     display: "cryptoshuraim@gmail.com", url: "mailto:cryptoshuraim@gmail.com" }
  ],

  footer: {
    tagline: "AI, Web3 & Crypto content that makes complex ideas simple.",
    copyright: "ShuxBroh. All rights reserved."
  }
};
