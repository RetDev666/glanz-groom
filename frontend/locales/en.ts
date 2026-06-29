export const en = {
  nav: {
    home: 'Home',
    services: 'Services & Prices',
    offers: 'Offers',
    tips: 'Tips',
    about: 'About Us',
    book: 'Book Appointment',
  },
  home: {
    heroTag: 'Royal Standards',
    heroTitle: 'Premium Grooming for Your Pet',
    heroDesc: 'Because they deserve the best. Experience joyful luxury for your furry family members.',
    bookBtn: 'Book Now',
    servicesBtn: 'Our Services',
    stats: {
      clients: 'Happy Clients',
      procedures: 'Procedures per Year',
      rating: 'Average Rating',
      groomers: 'Master Groomers'
    },
    processTitle: 'The Royal Process',
    processDesc: 'Our signature grooming process ensures your pet feels relaxed and looks stunning.',
    processSteps: {
      1: { title: '1. Spa Bath', desc: 'A relaxing warm bath with premium hypoallergenic shampoo tailored to your pet\'s coat.' },
      2: { title: '2. Precision Styling', desc: 'Hand scissoring and breed-specific cuts by master groomers.' },
      3: { title: '3. Finishing Touches', desc: 'Nail trimming, ear cleaning, and a spritz of pet-safe perfume.' }
    },
    allServicesBtn: 'All Services',
    reviewsTitle: 'Happy Tails',
    reviews: {
      1: { text: '"Absolutely incredible! Bella looks like a show dog. The staff is so gentle and caring. We found our forever groomer."', author: 'Sarah & Bella' },
      2: { text: '"Max used to hate baths, but now he pulls me towards Glanz & Groom! They truly understand dog behavior. Top-notch service."', author: 'James & Max' },
      3: { text: '"The Glanz & Groom team turned Fluffy into a real handsome boy. Highly recommend them to everyone!"', author: 'Elena & Fluffy' }
    },
    ctaTitle: 'Give Your Pet a Royal Experience',
    ctaDesc: 'First treatment — get a free SPA grooming upgrade!',
    ctaBtn: 'Book Now'
  },
  about: {
    title: 'About Us & Contact — Glanz & Groom',
    standardTitle: 'Our Royal Standard',
    standardDesc1: 'At Glanz & Groom, we believe every pet deserves to feel like royalty. Founded on a passion for exceptional care and joyful luxury, our salon creates a calm, premium environment.',
    standardDesc2: 'Our commitment to excellence goes beyond a simple haircut. We focus on holistic well-being, using premium products and gentle techniques tailored to each pet\'s individual needs.',
    philosophyTitle: 'Our Health Philosophy',
    philosophyDesc1: 'Health and beauty go hand in hand. We use only premium hypoallergenic cosmetics designed specifically for various coat and skin types.',
    philosophyDesc2: 'Every visit with us is an opportunity for early detection of dermatological issues or other concerns that may require veterinary attention.',
    teamTitle: 'Meet Our Experts',
    team: {
      1: { name: 'Sarah Jenkins', role: 'Master Groomer', desc: 'With 10 years of experience, Sarah specializes in breed-specific cuts and creative styling.' },
      2: { name: 'David Chen', role: 'Cat Specialist', desc: 'David brings a calm and gentle approach to our feline clients.' },
      3: { name: 'Emily Rose', role: 'SPA Therapist', desc: 'Emily manages our premium SPA treatments, from soothing baths to massages.' },
      4: { name: 'Mark Thompson', role: 'Large Breed Specialist', desc: 'An expert in handling large dogs, Mark ensures comfortable care for the giants.' },
      5: { name: 'Anna Koval', role: 'Dermatological Care', desc: 'Anna helps pets with sensitive skin using specialized products.' }
    },
    contactTitle: 'Get in Touch',
    contactDesc: 'We would love to hear from you. Contact us for appointments or any questions.',
    addressTitle: 'Address',
    address: 'Khreshchatyk Str. 1\nKyiv, Ukraine 01001',
    phoneTitle: 'Phone',
    emailTitle: 'Email',
    scheduleTitle: 'Working Hours',
    schedule: 'Mon-Fri: 9:00 – 19:00\nSat-Sun: 10:00 – 17:00',
    openMap: 'Open Map',
    formTitle: 'Send a Message',
    formName: 'Your Name',
    formEmail: 'Email',
    formSubject: 'Subject',
    formSubjectPlaceholder: 'How can we help?',
    formMessage: 'Message',
    formMessagePlaceholder: 'Write your message here...',
    formSuccess: '✅ Thank you! We will get back to you shortly.',
    formError: '❌ Error. Please try again.',
    formSend: 'Send',
    formSending: 'Sending...'
  },
  services: {
    title: 'Price List — Glanz & Groom',
    badge: 'Updated Prices',
    heroTitle1: 'Royal',
    heroTitle2: 'Care',
    heroDesc: 'Choose your pet\'s size and create the perfect care package. No hidden fees — just honest pricing.',
    forWhom: 'Who is this size for?',
    mainPackages: 'Main Packages',
    cost: 'Price',
    spaPackages: 'SPA & Care',
    popularBundles: 'Popular Bundles',
    bundlesSubtitle: 'Ready-made solutions for your pet in one click',
    bestseller: 'Bestseller',
    totalCost: 'Total Cost',
    selection: 'Your selection:',
    serviceCount: (count: number) => count === 1 ? 'service' : 'services',
    bookBtn: 'Book Appointment',
    bundles: {
      1: { name: '«Hollywood» Package', desc: 'Total relaxation and a shining smile. Perfect for photoshoots.' },
      2: { name: 'Quick Beauty', desc: 'Basic hygiene plus nail and teeth care.' }
    }
  },
  book: {
    title: 'Booking — Glanz & Groom',
    metaDesc: 'Book a grooming appointment for your pet online at Glanz & Groom.',
    headerTitle: 'Booking',
    steps: {
      services: 'Services',
      groomer: 'Groomer',
      time: 'Time',
      details: 'Details'
    },
    step0: {
      title: 'Select Services',
      desc: 'Choose the pet size and service.',
      petSize: 'Pet Size',
      sizes: { xs: 'XS (up to 3 kg)', s: 'S (3 to 5.5 kg)', m: 'M (5.5 to 13 kg)', l: 'L (13 to 25 kg)', xl: 'XL (over 25 kg)' },
      mainPackages: 'Main Packages',
      additional: 'Additional Care',
      min: 'min'
    },
    step1: {
      title: 'Choose a Groomer',
      desc: 'Who will make your pet happy?',
      any: 'Any Available',
      anyDesc: 'We will choose a free master'
    },
    step2: {
      title: 'Date and Time',
      desc: 'When is convenient for you to visit?'
    },
    step3: {
      title: 'Your Details',
      desc: 'The final step to royal care!',
      firstName: 'First Name *',
      firstNamePh: 'John',
      lastName: 'Last Name',
      lastNamePh: 'Doe',
      phone: 'Phone *',
      phonePh: '+1 555...',
      email: 'Email *',
      emailPh: 'john@example.com',
      petName: 'Pet Name *',
      petNamePh: 'Buddy',
      petBreed: 'Breed',
      petBreedPh: 'Golden Retriever',
      photoLabel: 'Pet Photo (max 5MB)',
      photoHelp: 'Click to upload a photo',
      photoTypes: 'JPEG, PNG or WebP',
      photoChange: 'Change photo',
      photoError: 'Photo too large (max 5MB)',
      notes: 'Notes',
      notesPh: 'Personality traits or grooming preferences...',
      submitError: 'Something went wrong. Please try again.',
      connError: 'Failed to connect to the server. Check your connection.',
      uploadError: 'Failed to upload photo'
    },
    footer: {
      totalToPay: 'Total to Pay',
      next: 'Next',
      book: 'Book Now',
      booking: 'Booking...'
    },
    success: {
      title: 'Booking Confirmed!',
      desc1: 'We are expecting',
      desc2: 'at our salon!',
      date: 'Date',
      duration: 'Duration',
      sum: 'Total',
      addToCalendar: 'Add to Google Calendar',
      downloadIcs: 'Download .ics (Apple/Outlook)',
      goHome: 'Back to Home'
    }
  },
  tips: {
    title: 'Grooming Tips — Glanz & Groom',
    metaDesc: 'Expert pet care tips from Glanz & Groom. Maintain royal standards at home.',
    headerTitle: 'Grooming Tips',
    headerDesc: 'Expert tips for maintaining royal standards at home.',
    searchPlaceholder: 'Search tips...',
    readTime: 'min read',
    featuredLabel: 'Featured',
    devAlert: 'This article is currently in development. Stay tuned!',
    ctaTitle: 'Need a professional touch?',
    ctaDesc: 'Book your royal grooming session today.',
    ctaBtn: 'Book Now',
    categories: {
      all: 'All Tips',
      coat: 'Coat Care',
      food: 'Nutrition',
      behavior: 'Behavior'
    },
    articles: {
      1: {
        title: 'Complete Guide to Brushing a Double Coat',
        desc: 'Prevent matting and keep the coat fluffy — our recommendations for daily care.'
      },
      2: {
        title: 'Summer Paw Protection',
        desc: 'Protect delicate paw pads from hot asphalt and rough surfaces.'
      },
      3: {
        title: 'Nail Trimming Stress',
        desc: 'Techniques for a stress-free pedicure for your anxious pup.'
      },
      4: {
        title: 'Nutrition for a Healthy Coat',
        desc: 'Find out which foods make your pet\'s coat shiny and healthy.'
      }
    }
  },
  offers: {
    title: 'Offers — Glanz & Groom',
    metaDesc: 'Special offers and discounts at Glanz & Groom. Exclusive grooming packages and seasonal promotions.',
    headerTitle: 'Special Offers',
    headerDesc: 'Exclusive grooming packages and seasonal offers for your furry family members. The royal standard at a special price.',
    hero: {
      badge: 'New Client',
      title: 'Royal Welcome',
      desc: 'First time with us? Get a free SPA upgrade with any full grooming treatment. Includes a soothing blueberry facial and paw treatment.',
      value: '€20 Gift',
      cta: 'Claim Offer'
    },
    promoCards: {
      1: {
        title: 'Winter Coat Prep',
        desc: 'Deep conditioning to protect against the cold. 15% off when booked with a standard haircut.',
        meta: 'Until Jan 31'
      },
      2: {
        title: 'Paw Points Elite',
        desc: 'Double points on all express services – nail trimming and teeth brushing this month for members.',
        cta: 'Loyalty Program'
      },
      3: {
        title: 'Refer a Friend',
        desc: 'Share the luxury! When a friend books their first full groom, you both receive a €15 credit.',
        codePrefix: 'Code:'
      }
    }
  }
};
