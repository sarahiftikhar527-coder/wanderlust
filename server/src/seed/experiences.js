const experiences = [
  {
    title: 'Explore the Magical Hunza Valley',
    slug: 'explore-the-magical-hunza-valley',
    description:
      'Discover the breathtaking beauty of Hunza Valley with majestic mountains, peaceful villages, crystal-clear rivers, and unforgettable views. Experience the local culture and explore some of the most beautiful destinations in northern Pakistan.',
    shortDescription:
      'Discover the breathtaking mountains, villages, rivers, and culture of Hunza Valley.',
    category: 'adventure',
    location: {
      city: 'Hunza',
      country: 'Pakistan',
      address: 'Hunza Valley, Gilgit-Baltistan',
      coordinates: {
        lat: 36.3167,
        lng: 74.65,
      },
    },
    price: 180,
    duration: '5 Days',
    groupSize: {
      min: 2,
      max: 12,
    },
    images: [
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Hunza_Valley_fc9vgo.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035831/Nathia_Gali_pavhqw.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035829/Skardu_Adventure_wyjwrt.jpg',
    ],
    coverImage:
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Hunza_Valley_fc9vgo.jpg',
    highlights: [
      'Visit Karimabad',
      'Explore Baltit Fort',
      'Visit Attabad Lake',
      'Enjoy mountain views',
      'Experience local Hunza culture',
    ],
    included: [
      'Professional local guide',
      'Transportation',
      'Hotel accommodation',
      'Daily breakfast',
    ],
    excluded: [
      'Personal expenses',
      'Lunch and dinner',
      'Travel insurance',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Hunza',
        description:
          'Arrive in Hunza and explore the beautiful surroundings of Karimabad.',
      },
      {
        day: 2,
        title: 'Karimabad and Baltit Fort',
        description:
          'Explore Karimabad market and visit the historic Baltit Fort.',
      },
      {
        day: 3,
        title: 'Attabad Lake',
        description:
          'Visit the spectacular Attabad Lake and enjoy the mountain scenery.',
      },
      {
        day: 4,
        title: 'Passu and Upper Hunza',
        description:
          'Explore Passu village and enjoy views of the famous Passu Cones.',
      },
      {
        day: 5,
        title: 'Departure',
        description:
          'Enjoy a final morning in Hunza before departure.',
      },
    ],
    status: 'PUBLISHED',
    featured: true,
    host: {
      name: 'Ali Khan',
      bio: 'Local travel host with extensive experience exploring northern Pakistan.',
      avatar: '',
    },
  },

  {
    title: 'Peaceful Escape to Murree Hills',
    slug: 'peaceful-escape-to-murree-hills',
    description:
      'Enjoy a relaxing escape to the beautiful hills of Murree. Walk through Mall Road, visit scenic viewpoints, enjoy the cool mountain weather, and explore the natural beauty surrounding this famous hill station.',
    shortDescription:
      'Enjoy the cool weather, mountain views, and peaceful atmosphere of Murree.',
    category: 'nature',
    location: {
      city: 'Murree',
      country: 'Pakistan',
      address: 'Murree Hills, Punjab',
      coordinates: {
        lat: 33.9073,
        lng: 73.3903,
      },
    },
    price: 95,
    duration: '2 Days',
    groupSize: {
      min: 2,
      max: 10,
    },
    images: [
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Murree_Hiking_ehjn85.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035831/Nathia_Gali_pavhqw.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Hunza_Valley_fc9vgo.jpg',
    ],
    coverImage:
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Murree_Hiking_ehjn85.jpg',
    highlights: [
      'Mall Road',
      'Pindi Point',
      'Kashmir Point',
      'Patriata Chairlift',
      'Mountain sightseeing',
    ],
    included: [
      'Transportation',
      'Hotel accommodation',
      'Local guide',
      'Breakfast',
    ],
    excluded: [
      'Personal expenses',
      'Chairlift tickets',
      'Lunch and dinner',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Murree Exploration',
        description:
          'Explore Mall Road, Kashmir Point, and nearby scenic viewpoints.',
      },
      {
        day: 2,
        title: 'Patriata and Departure',
        description:
          'Visit Patriata and enjoy the mountain scenery before departure.',
      },
    ],
    status: 'PUBLISHED',
    featured: true,
    host: {
      name: 'Hamza Ahmed',
      bio: 'Experienced local host specializing in Murree and northern Punjab tours.',
      avatar: '',
    },
  },

  {
    title: 'Discover the Beauty of Skardu',
    slug: 'discover-the-beauty-of-skardu',
    description:
      'Explore the spectacular landscapes of Skardu, surrounded by towering mountains, peaceful lakes, beautiful valleys, and unique cultural landmarks.',
    shortDescription:
      'Experience the spectacular mountains, lakes, and valleys of Skardu.',
    category: 'adventure',
    location: {
      city: 'Skardu',
      country: 'Pakistan',
      address: 'Skardu, Gilgit-Baltistan',
      coordinates: {
        lat: 35.2971,
        lng: 75.6333,
      },
    },
    price: 220,
    duration: '6 Days',
    groupSize: {
      min: 2,
      max: 12,
    },
    images: [
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035829/Skardu_Adventure_wyjwrt.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Hunza_Valley_fc9vgo.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035831/Nathia_Gali_pavhqw.jpg',
    ],
    coverImage:
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035829/Skardu_Adventure_wyjwrt.jpg',
    highlights: [
      'Shangrila Resort',
      'Upper Kachura Lake',
      'Deosai Plains',
      'Skardu Fort',
      'Local culture',
    ],
    included: [
      'Transportation',
      'Accommodation',
      'Local guide',
      'Breakfast',
    ],
    excluded: [
      'Personal expenses',
      'Entry tickets',
      'Travel insurance',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in Skardu',
        description:
          'Arrive in Skardu and relax while enjoying the surrounding mountain views.',
      },
      {
        day: 2,
        title: 'Shangrila and Kachura',
        description:
          'Visit Shangrila Resort and explore Upper Kachura Lake.',
      },
      {
        day: 3,
        title: 'Skardu City',
        description:
          'Explore Skardu Fort, local markets, and cultural attractions.',
      },
      {
        day: 4,
        title: 'Deosai Plains',
        description:
          'Explore the breathtaking landscapes of Deosai.',
      },
      {
        day: 5,
        title: 'Scenic Mountain Views',
        description:
          'Enjoy scenic mountain views and explore local areas.',
      },
      {
        day: 6,
        title: 'Departure',
        description:
          'Enjoy breakfast before departure from Skardu.',
      },
    ],
    status: 'PUBLISHED',
    featured: true,
    host: {
      name: 'Usman Raza',
      bio: 'Adventure travel host passionate about exploring Gilgit-Baltistan.',
      avatar: '',
    },
  },

  {
    title: 'Cultural Journey Through Lahore',
    slug: 'cultural-journey-through-lahore',
    description:
      'Explore the rich history, architecture, food, and culture of Lahore. Visit historic landmarks, traditional markets, and famous food streets while experiencing the heart of Punjab.',
    shortDescription:
      'Experience Lahore through its history, architecture, culture, and food.',
    category: 'culture',
    location: {
      city: 'Lahore',
      country: 'Pakistan',
      address: 'Lahore, Punjab',
      coordinates: {
        lat: 31.5204,
        lng: 74.3587,
      },
    },
    price: 75,
    duration: '1 Day',
    groupSize: {
      min: 2,
      max: 15,
    },
    images: [
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035828/Cholistan_Desert_Pakistan_krrsmv.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035831/Nathia_Gali_pavhqw.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Murree_Hiking_ehjn85.jpg',
    ],
    coverImage:
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035828/Cholistan_Desert_Pakistan_krrsmv.jpg',
    highlights: [
      'Badshahi Mosque',
      'Lahore Fort',
      'Walled City',
      'Food Street',
      'Local markets',
    ],
    included: [
      'Local guide',
      'Transportation',
      'Traditional lunch',
    ],
    excluded: [
      'Personal shopping',
      'Additional food',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Historic Lahore',
        description:
          'Visit Lahore Fort, Badshahi Mosque, Walled City, and enjoy traditional Punjabi food.',
      },
    ],
    status: 'PUBLISHED',
    featured: false,
    host: {
      name: 'Ayesha Malik',
      bio: 'Cultural tour host passionate about Lahore history and cuisine.',
      avatar: '',
    },
  },

  {
    title: 'Islamabad Nature and City Tour',
    slug: 'islamabad-nature-and-city-tour',
    description:
      'Discover Islamabad through its beautiful parks, modern architecture, scenic viewpoints, and peaceful natural surroundings.',
    shortDescription:
      'Explore Islamabad landmarks, viewpoints, parks, and natural beauty.',
    category: 'city-tours',
    location: {
      city: 'Islamabad',
      country: 'Pakistan',
      address: 'Islamabad Capital Territory',
      coordinates: {
        lat: 33.6844,
        lng: 73.0479,
      },
    },
    price: 65,
    duration: '1 Day',
    groupSize: {
      min: 2,
      max: 15,
    },
    images: [
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035831/Nathia_Gali_pavhqw.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Murree_Hiking_ehjn85.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035828/Cholistan_Desert_Pakistan_krrsmv.jpg',
    ],
    coverImage:
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035831/Nathia_Gali_pavhqw.jpg',
    highlights: [
      'Faisal Mosque',
      'Daman-e-Koh',
      'Margalla Hills',
      'Pakistan Monument',
      'Lok Virsa Museum',
    ],
    included: [
      'Local guide',
      'Transportation',
      'Bottled water',
    ],
    excluded: [
      'Entry tickets',
      'Personal expenses',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Islamabad Highlights',
        description:
          'Visit Faisal Mosque, Pakistan Monument, Daman-e-Koh, and explore the Margalla Hills.',
      },
    ],
    status: 'PUBLISHED',
    featured: true,
    host: {
      name: 'Hassan Ali',
      bio: 'Local Islamabad guide who loves sharing the city with travelers.',
      avatar: '',
    },
  },

  {
    title: 'Karachi Food and Heritage Tour',
    slug: 'karachi-food-and-heritage-tour',
    description:
      'Experience Karachi through its historic landmarks, vibrant streets, coastal views, and delicious local cuisine.',
    shortDescription:
      'Explore Karachi heritage, coastal views, markets, and famous local food.',
    category: 'food-culinary',
    location: {
      city: 'Karachi',
      country: 'Pakistan',
      address: 'Karachi, Sindh',
      coordinates: {
        lat: 24.8607,
        lng: 67.0011,
      },
    },
    price: 80,
    duration: '1 Day',
    groupSize: {
      min: 2,
      max: 12,
    },
    images: [
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035828/Cholistan_Desert_Pakistan_krrsmv.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Murree_Hiking_ehjn85.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035831/Nathia_Gali_pavhqw.jpg',
    ],
    coverImage:
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035828/Cholistan_Desert_Pakistan_krrsmv.jpg',
    highlights: [
      'Mohatta Palace',
      'Clifton Beach',
      'Empress Market',
      'Old Karachi',
      'Traditional food',
    ],
    included: [
      'Local guide',
      'Transportation',
      'Food tasting',
    ],
    excluded: [
      'Personal expenses',
      'Additional meals',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Karachi Heritage and Food',
        description:
          'Explore historic landmarks, visit local markets, enjoy coastal views, and taste traditional Karachi cuisine.',
      },
    ],
    status: 'PUBLISHED',
    featured: false,
    host: {
      name: 'Bilal Shah',
      bio: 'Karachi-based host specializing in food and heritage experiences.',
      avatar: '',
    },
  },

  {
    title: 'Fairy Meadows Mountain Adventure',
    slug: 'fairy-meadows-mountain-adventure',
    description:
      'Experience the incredible beauty of Fairy Meadows surrounded by dramatic mountain landscapes and unforgettable views of Nanga Parbat.',
    shortDescription:
      'Experience Fairy Meadows and spectacular views of Nanga Parbat.',
    category: 'adventure',
    location: {
      city: 'Fairy Meadows',
      country: 'Pakistan',
      address: 'Fairy Meadows, Gilgit-Baltistan',
      coordinates: {
        lat: 35.4211,
        lng: 74.5847,
      },
    },
    price: 195,
    duration: '4 Days',
    groupSize: {
      min: 2,
      max: 10,
    },
    images: [
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035829/Skardu_Adventure_wyjwrt.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035830/Hunza_Valley_fc9vgo.jpg',
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035831/Nathia_Gali_pavhqw.jpg',
    ],
    coverImage:
      'https://res.cloudinary.com/yefsnq3c/image/upload/v1787035829/Skardu_Adventure_wyjwrt.jpg',
    highlights: [
      'Fairy Meadows',
      'Nanga Parbat views',
      'Mountain hiking',
      'Local villages',
      'Camping experience',
    ],
    included: [
      'Local guide',
      'Transportation',
      'Accommodation',
      'Breakfast',
    ],
    excluded: [
      'Personal expenses',
      'Travel insurance',
      'Additional meals',
    ],
    itinerary: [
      {
        day: 1,
        title: 'Journey to Fairy Meadows',
        description:
          'Travel through the mountain roads and reach Fairy Meadows.',
      },
      {
        day: 2,
        title: 'Mountain Exploration',
        description:
          'Explore the surrounding trails and enjoy views of Nanga Parbat.',
      },
      {
        day: 3,
        title: 'Nature and Local Culture',
        description:
          'Enjoy the peaceful environment and explore nearby villages.',
      },
      {
        day: 4,
        title: 'Return Journey',
        description:
          'Enjoy the final mountain views before returning.',
      },
    ],
    status: 'PUBLISHED',
    featured: true,
    host: {
      name: 'Zain Ahmed',
      bio: 'Adventure guide experienced in northern Pakistan mountain tours.',
      avatar: '',
    },
  },
];

module.exports = experiences;