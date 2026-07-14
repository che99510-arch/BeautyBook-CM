export interface Service {
  id: string;
  name: string;
  category: 'Hair' | 'Nails' | 'Makeup' | 'Massage';
  duration: string;
  price: number;
  description: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Salon {
  id: string;
  name: string;
  location: string;
  city: 'Bamenda' | 'Buea' | 'Douala' | 'Yaounde' | 'Bafoussam';
  description: string;
  image: string;
  coverImage: string;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  services: Service[];
  reviews: Review[];
  phone: string;
  openHours: string;
  tags: string[];
}

export interface Booking {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  price: number;
}

export const salons: Salon[] = [
  {
    id: '1',
    name: 'Glamour Studio Douala',
    location: 'Akwa, Douala',
    city: 'Douala',
    description: 'Premier beauty destination in the heart of Douala. We specialize in modern African hairstyles, luxury nail art, and professional makeup for all occasions. Our team of certified stylists brings over 15 years of combined experience.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 124,
    startingPrice: 3000,
    phone: '+237 6XX XXX XXX',
    openHours: 'Mon-Sat: 8AM - 8PM',
    tags: ['Hair', 'Nails', 'Makeup'],
    services: [
      { id: 's1', name: 'Box Braids', category: 'Hair', duration: '3-4 hours', price: 15000, description: 'Beautiful box braids with premium synthetic hair' },
      { id: 's2', name: 'Cornrows', category: 'Hair', duration: '2-3 hours', price: 8000, description: 'Classic cornrow styles' },
      { id: 's3', name: 'Gel Manicure', category: 'Nails', duration: '1 hour', price: 5000, description: 'Long-lasting gel polish manicure' },
      { id: 's4', name: 'Bridal Makeup', category: 'Makeup', duration: '2 hours', price: 25000, description: 'Full bridal makeup with airbrush finish' },
      { id: 's5', name: 'Locs Retwist', category: 'Hair', duration: '2 hours', price: 10000, description: 'Professional locs maintenance and retwist' },
      { id: 's6', name: 'Acrylic Nails', category: 'Nails', duration: '1.5 hours', price: 8000, description: 'Full set acrylic nails with design' },
    ],
    reviews: [
      { id: 'r1', author: 'Marie N.', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-02-10', comment: 'Amazing service! My braids look absolutely stunning. The team is so professional and friendly.' },
      { id: 'r2', author: 'Aisha T.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face', rating: 4, date: '2026-02-05', comment: 'Great experience overall. The salon is clean and well-organized. Will definitely come back!' },
      { id: 'r3', author: 'Carine M.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-01-28', comment: 'Best bridal makeup I have ever had. They made me feel like a queen on my special day.' },
    ],
  },
  {
    id: '2',
    name: 'Belle Afrique Spa',
    location: 'Bonapriso, Douala',
    city: 'Douala',
    description: 'A luxurious spa experience blending traditional African beauty rituals with modern techniques. Relax, rejuvenate, and rediscover your natural beauty in our serene environment.',
    image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=1200&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 89,
    startingPrice: 5000,
    phone: '+237 6XX XXX XXX',
    openHours: 'Mon-Sun: 9AM - 9PM',
    tags: ['Massage', 'Nails', 'Hair'],
    services: [
      { id: 's7', name: 'Swedish Massage', category: 'Massage', duration: '1 hour', price: 15000, description: 'Full body relaxation massage' },
      { id: 's8', name: 'Deep Tissue Massage', category: 'Massage', duration: '1 hour', price: 20000, description: 'Therapeutic deep tissue massage' },
      { id: 's9', name: 'Pedicure Deluxe', category: 'Nails', duration: '1.5 hours', price: 7000, description: 'Luxury pedicure with foot massage' },
      { id: 's10', name: 'Hot Stone Massage', category: 'Massage', duration: '1.5 hours', price: 25000, description: 'Relaxing hot stone therapy' },
      { id: 's11', name: 'Silk Press', category: 'Hair', duration: '2 hours', price: 12000, description: 'Sleek silk press for natural hair' },
    ],
    reviews: [
      { id: 'r4', author: 'Fatou D.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-02-12', comment: 'The best spa in Douala! The hot stone massage was heavenly. Highly recommend!' },
      { id: 'r5', author: 'Grace O.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-02-01', comment: 'Such a peaceful atmosphere. The staff is incredibly attentive and skilled.' },
    ],
  },
  {
    id: '3',
    name: 'Nails & Beyond',
    location: 'Bastos, Yaoundé',
    city: 'Yaoundé',
    description: 'Yaoundé\'s premier nail art studio. From classic French tips to intricate 3D nail art, we bring your nail dreams to life with premium products and expert technicians.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 156,
    startingPrice: 3000,
    phone: '+237 6XX XXX XXX',
    openHours: 'Tue-Sat: 9AM - 7PM',
    tags: ['Nails'],
    services: [
      { id: 's12', name: 'Classic Manicure', category: 'Nails', duration: '45 min', price: 3000, description: 'Basic manicure with regular polish' },
      { id: 's13', name: 'Nail Art Design', category: 'Nails', duration: '2 hours', price: 12000, description: 'Custom nail art with intricate designs' },
      { id: 's14', name: 'Gel Extensions', category: 'Nails', duration: '2 hours', price: 15000, description: 'Full set gel nail extensions' },
      { id: 's15', name: 'Dip Powder Nails', category: 'Nails', duration: '1.5 hours', price: 10000, description: 'Long-lasting dip powder application' },
    ],
    reviews: [
      { id: 'r6', author: 'Sandrine K.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-02-08', comment: 'The nail art here is incredible! They can do any design you want. Love this place!' },
    ],
  },
  {
    id: '4',
    name: 'Queen Hair Palace',
    location: 'Deido, Douala',
    city: 'Douala',
    description: 'Where queens are made! Specializing in protective styles, weaves, and natural hair care. We use only premium products to ensure your hair stays healthy and beautiful.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&h=400&fit=crop',
    rating: 4.6,
    reviewCount: 201,
    startingPrice: 5000,
    phone: '+237 6XX XXX XXX',
    openHours: 'Mon-Sat: 7AM - 9PM',
    tags: ['Hair'],
    services: [
      { id: 's16', name: 'Knotless Braids', category: 'Hair', duration: '4-5 hours', price: 20000, description: 'Trendy knotless box braids' },
      { id: 's17', name: 'Weave Install', category: 'Hair', duration: '3 hours', price: 18000, description: 'Full weave installation with closure' },
      { id: 's18', name: 'Natural Hair Treatment', category: 'Hair', duration: '1.5 hours', price: 8000, description: 'Deep conditioning and treatment for natural hair' },
      { id: 's19', name: 'Crochet Braids', category: 'Hair', duration: '2-3 hours', price: 12000, description: 'Crochet braids with premium hair' },
      { id: 's20', name: 'Twist Out Styling', category: 'Hair', duration: '1 hour', price: 5000, description: 'Beautiful twist out for natural curls' },
    ],
    reviews: [
      { id: 'r7', author: 'Nadege P.', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face', rating: 4, date: '2026-02-14', comment: 'Love my knotless braids! They are so neat and lightweight. Great salon!' },
      { id: 'r8', author: 'Diane F.', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-01-30', comment: 'The best hair salon in Deido. Professional service and amazing results every time.' },
    ],
  },
  {
    id: '5',
    name: 'Glow Up Makeup Studio',
    location: 'Messa, Yaoundé',
    city: 'Yaoundé',
    description: 'Professional makeup artistry for every occasion. From natural everyday looks to glamorous event makeup, our artists create flawless looks tailored to your skin tone and style.',
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 78,
    startingPrice: 8000,
    phone: '+237 6XX XXX XXX',
    openHours: 'Mon-Sat: 8AM - 7PM',
    tags: ['Makeup'],
    services: [
      { id: 's21', name: 'Everyday Glam', category: 'Makeup', duration: '1 hour', price: 8000, description: 'Natural everyday makeup look' },
      { id: 's22', name: 'Full Glam Makeup', category: 'Makeup', duration: '1.5 hours', price: 15000, description: 'Full glamorous makeup for events' },
      { id: 's23', name: 'Lash Extensions', category: 'Makeup', duration: '1.5 hours', price: 12000, description: 'Individual lash extensions' },
      { id: 's24', name: 'Bridal Package', category: 'Makeup', duration: '3 hours', price: 35000, description: 'Complete bridal makeup with trial session' },
    ],
    reviews: [
      { id: 'r9', author: 'Estelle B.', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-02-11', comment: 'Absolutely stunning makeup! They matched my skin tone perfectly. Best in Yaoundé!' },
    ],
  },
  {
    id: '6',
    name: 'Zen Wellness Center',
    location: 'Bonanjo, Douala',
    city: 'Douala',
    description: 'A holistic wellness center offering premium massage therapy and body treatments. Escape the city buzz and find your inner peace in our tranquil sanctuary.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 67,
    startingPrice: 10000,
    phone: '+237 6XX XXX XXX',
    openHours: 'Mon-Sun: 10AM - 10PM',
    tags: ['Massage'],
    services: [
      { id: 's25', name: 'Aromatherapy Massage', category: 'Massage', duration: '1 hour', price: 18000, description: 'Relaxing massage with essential oils' },
      { id: 's26', name: 'Couples Massage', category: 'Massage', duration: '1.5 hours', price: 35000, description: 'Side-by-side massage for two' },
      { id: 's27', name: 'Prenatal Massage', category: 'Massage', duration: '1 hour', price: 15000, description: 'Gentle massage for expecting mothers' },
      { id: 's28', name: 'Sports Massage', category: 'Massage', duration: '1 hour', price: 20000, description: 'Targeted massage for athletes' },
    ],
    reviews: [
      { id: 'r10', author: 'Pauline A.', avatar: 'https://images.unsplash.com/photo-1502767089025-6572583495f9?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-02-09', comment: 'The aromatherapy massage was divine! I felt so relaxed and rejuvenated. Will be back!' },
    ],
  },
  {
    id: '7',
    name: 'Afro Chic Salon',
    location: 'Nlongkak, Yaoundé',
    city: 'Yaoundé',
    description: 'Celebrating African beauty with modern styling techniques. We specialize in natural hair care, protective styles, and trendy looks that embrace your unique beauty.',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&h=400&fit=crop',
    rating: 4.5,
    reviewCount: 143,
    startingPrice: 4000,
    phone: '+237 6XX XXX XXX',
    openHours: 'Mon-Sat: 8AM - 8PM',
    tags: ['Hair', 'Makeup'],
    services: [
      { id: 's29', name: 'Bantu Knots', category: 'Hair', duration: '1.5 hours', price: 6000, description: 'Classic Bantu knots styling' },
      { id: 's30', name: 'Fulani Braids', category: 'Hair', duration: '3-4 hours', price: 14000, description: 'Traditional Fulani-inspired braids' },
      { id: 's31', name: 'Natural Makeup', category: 'Makeup', duration: '45 min', price: 5000, description: 'Subtle everyday makeup' },
      { id: 's32', name: 'Hair Coloring', category: 'Hair', duration: '2 hours', price: 15000, description: 'Professional hair coloring service' },
    ],
    reviews: [
      { id: 'r11', author: 'Binta S.', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&crop=face', rating: 4, date: '2026-02-06', comment: 'Love the Fulani braids they did for me! Very neat and lasted for weeks.' },
    ],
  },
  {
    id: '8',
    name: 'Diamond Nails Lounge',
    location: 'Biyem-Assi, Yaoundé',
    city: 'Yaoundé',
    description: 'Luxury nail care in a chic, modern setting. We use only premium products and our nail technicians are trained in the latest international trends.',
    image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=1200&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 92,
    startingPrice: 4000,
    phone: '+237 6XX XXX XXX',
    openHours: 'Tue-Sun: 9AM - 8PM',
    tags: ['Nails'],
    services: [
      { id: 's33', name: 'French Tips', category: 'Nails', duration: '1 hour', price: 6000, description: 'Classic French tip manicure' },
      { id: 's34', name: 'Chrome Nails', category: 'Nails', duration: '1.5 hours', price: 10000, description: 'Trendy chrome mirror finish nails' },
      { id: 's35', name: 'Nail Repair', category: 'Nails', duration: '30 min', price: 4000, description: 'Professional nail repair service' },
      { id: 's36', name: 'Luxury Pedicure', category: 'Nails', duration: '1.5 hours', price: 8000, description: 'Premium pedicure with foot spa' },
    ],
    reviews: [
      { id: 'r12', author: 'Clarisse E.', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-02-13', comment: 'The chrome nails are absolutely gorgeous! Best nail salon in Yaoundé.' },
    ],
  },
  {
    id: '9',
    name: 'Prestige Beauty Bar',
    location: 'Bonamoussadi, Douala',
    city: 'Douala',
    description: 'Your one-stop beauty destination. From hair to nails to makeup, we offer comprehensive beauty services with a touch of luxury and African elegance.',
    image: 'https://images.unsplash.com/photo-1633681122956-4a89d55e498b?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1633681122956-4a89d55e498b?w=1200&h=400&fit=crop',
    rating: 4.6,
    reviewCount: 178,
    startingPrice: 3500,
    phone: '+237 6XX XXX XXX',
    openHours: 'Mon-Sat: 7AM - 9PM',
    tags: ['Hair', 'Nails', 'Makeup'],
    services: [
      { id: 's37', name: 'Passion Twists', category: 'Hair', duration: '3-4 hours', price: 16000, description: 'Trendy passion twist hairstyle' },
      { id: 's38', name: 'Ombre Nails', category: 'Nails', duration: '1.5 hours', price: 9000, description: 'Beautiful ombre gradient nails' },
      { id: 's39', name: 'Party Makeup', category: 'Makeup', duration: '1 hour', price: 10000, description: 'Glamorous party-ready makeup' },
      { id: 's40', name: 'Flat Twists', category: 'Hair', duration: '2 hours', price: 7000, description: 'Elegant flat twist updo' },
    ],
    reviews: [
      { id: 'r13', author: 'Viviane L.', avatar: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=100&h=100&fit=crop&crop=face', rating: 4, date: '2026-02-07', comment: 'Great all-round salon. I get my hair and nails done here every month.' },
    ],
  },
  {
    id: '10',
    name: 'Royal Touch Spa',
    location: 'Omnisport, Yaoundé',
    city: 'Yaoundé',
    description: 'Experience royal treatment with our premium spa and beauty services. We combine luxury with affordability to make every woman feel like royalty.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=1200&h=400&fit=crop',
    rating: 4.8,
    reviewCount: 56,
    startingPrice: 6000,
    phone: '+237 6XX XXX XXX',
    openHours: 'Mon-Sun: 9AM - 9PM',
    tags: ['Massage', 'Nails', 'Makeup'],
    services: [
      { id: 's41', name: 'Royal Facial', category: 'Massage', duration: '1 hour', price: 12000, description: 'Luxury facial treatment with premium products' },
      { id: 's42', name: 'Body Scrub', category: 'Massage', duration: '45 min', price: 10000, description: 'Exfoliating body scrub treatment' },
      { id: 's43', name: 'Spa Manicure', category: 'Nails', duration: '1 hour', price: 6000, description: 'Relaxing spa manicure experience' },
      { id: 's44', name: 'Event Makeup', category: 'Makeup', duration: '1.5 hours', price: 12000, description: 'Professional event makeup' },
    ],
    reviews: [
      { id: 'r14', author: 'Amina Y.', avatar: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-02-15', comment: 'The Royal Facial was absolutely amazing! My skin has never looked better.' },
    ],
  },
  {
    id: '11',
    name: 'Curl Power Studio',
    location: 'Makepe, Douala',
    city: 'Douala',
    description: 'Dedicated to celebrating and caring for natural curls and coils. Our curl specialists help you embrace and enhance your natural texture with expert care.',
    image: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=1200&h=400&fit=crop',
    rating: 4.9,
    reviewCount: 112,
    startingPrice: 5000,
    phone: '+237 6XX XXX XXX',
    openHours: 'Mon-Sat: 8AM - 7PM',
    tags: ['Hair'],
    services: [
      { id: 's45', name: 'Curl Definition', category: 'Hair', duration: '1.5 hours', price: 8000, description: 'Define and enhance natural curls' },
      { id: 's46', name: 'Wash & Go', category: 'Hair', duration: '1 hour', price: 5000, description: 'Professional wash and go styling' },
      { id: 's47', name: 'Protective Style Consult', category: 'Hair', duration: '30 min', price: 3000, description: 'Expert consultation for protective styling' },
      { id: 's48', name: 'Scalp Treatment', category: 'Hair', duration: '45 min', price: 7000, description: 'Deep scalp treatment and massage' },
    ],
    reviews: [
      { id: 'r15', author: 'Josiane M.', avatar: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-02-16', comment: 'Finally a salon that understands natural hair! My curls have never looked this good.' },
    ],
  },
  {
    id: '12',
    name: 'Luxe Beauty Lounge',
    location: 'Centre Ville, Yaoundé',
    city: 'Yaoundé',
    description: 'The ultimate luxury beauty experience in the capital. From red carpet looks to everyday elegance, we deliver perfection with every appointment.',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=400&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&h=400&fit=crop',
    rating: 4.7,
    reviewCount: 134,
    startingPrice: 5000,
    phone: '+237 6XX XXX XXX',
    openHours: 'Mon-Sat: 9AM - 8PM',
    tags: ['Hair', 'Nails', 'Makeup', 'Massage'],
    services: [
      { id: 's49', name: 'Luxury Blowout', category: 'Hair', duration: '1 hour', price: 8000, description: 'Professional blowout and styling' },
      { id: 's50', name: 'Gel Pedicure', category: 'Nails', duration: '1 hour', price: 7000, description: 'Gel polish pedicure' },
      { id: 's51', name: 'Red Carpet Makeup', category: 'Makeup', duration: '2 hours', price: 20000, description: 'Full glam for special events' },
      { id: 's52', name: 'Relaxation Massage', category: 'Massage', duration: '1 hour', price: 15000, description: 'Full body relaxation massage' },
      { id: 's53', name: 'Hair Treatment', category: 'Hair', duration: '1 hour', price: 10000, description: 'Keratin treatment for smooth hair' },
    ],
    reviews: [
      { id: 'r16', author: 'Merveille T.', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face', rating: 5, date: '2026-02-17', comment: 'This is the best beauty lounge in Yaoundé. Every service is top-notch!' },
    ],
  },
];

export const dashboardBookings: Booking[] = [
  { id: 'b1', clientName: 'Marie Nguema', service: 'Box Braids', date: '2026-02-20', time: '10:00 AM', status: 'confirmed', price: 15000 },
  { id: 'b2', clientName: 'Aisha Tanko', service: 'Gel Manicure', date: '2026-02-20', time: '2:00 PM', status: 'confirmed', price: 5000 },
  { id: 'b3', clientName: 'Carine Mbarga', service: 'Bridal Makeup', date: '2026-02-21', time: '9:00 AM', status: 'pending', price: 25000 },
  { id: 'b4', clientName: 'Fatou Diallo', service: 'Cornrows', date: '2026-02-21', time: '11:00 AM', status: 'confirmed', price: 8000 },
  { id: 'b5', clientName: 'Grace Obi', service: 'Acrylic Nails', date: '2026-02-22', time: '3:00 PM', status: 'pending', price: 8000 },
  { id: 'b6', clientName: 'Sandrine Kamga', service: 'Locs Retwist', date: '2026-02-22', time: '10:00 AM', status: 'confirmed', price: 10000 },
  { id: 'b7', clientName: 'Nadege Pokam', service: 'Silk Press', date: '2026-02-23', time: '1:00 PM', status: 'pending', price: 12000 },
  { id: 'b8', clientName: 'Diane Fotso', service: 'Box Braids', date: '2026-02-18', time: '10:00 AM', status: 'completed', price: 15000 },
  { id: 'b9', clientName: 'Estelle Biya', service: 'Gel Manicure', date: '2026-02-17', time: '4:00 PM', status: 'completed', price: 5000 },
  { id: 'b10', clientName: 'Pauline Ateba', service: 'Bridal Makeup', date: '2026-02-16', time: '8:00 AM', status: 'completed', price: 25000 },
];

export const testimonials = [
  {
    id: 't1',
    name: 'Marie Nguema',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&crop=face',
    location: 'Douala',
    comment: 'BeautyBook CM made it so easy to find the perfect salon for my wedding day. I booked my bridal makeup in minutes and the results were absolutely stunning!',
    rating: 5,
  },
  {
    id: 't2',
    name: 'Aisha Tanko',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    location: 'Yaoundé',
    comment: 'I love how I can compare prices and read reviews before booking. It saves me so much time and I always find great deals on nail services.',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Carine Mbarga',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    location: 'Douala',
    comment: 'As a busy professional, BeautyBook CM is a lifesaver. I can book my weekly massage appointments in seconds. The platform is so intuitive!',
    rating: 5,
  },
];

export const formatPrice = (price: number): string => {
  return `${price.toLocaleString()} FCFA`;
};

export const serviceCategories = ['All', 'Hair', 'Nails', 'Makeup', 'Massage'] as const;
export const cities = ['All', 'Bamenda', 'Buea', 'Douala', 'Yaounde', 'Bafoussam'] as const;
