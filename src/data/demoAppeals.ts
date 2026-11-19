import { Appeal, WorkspaceSettings } from '../types/appeal';

export const DEFAULT_SETTINGS: WorkspaceSettings = {
  universityName: 'Toshkent Axborot Texnologiyalari Universiteti',
  departmentName: 'Talabalar murojaatlari bilan ishlash markazi',
  defaultStatusOnCreate: 'Yangi',
};

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000);

export const INITIAL_DEMO_APPEALS: Appeal[] = [
  {
    id: 'demo-1001',
    studentName: 'Aziza Karimova',
    group: 'DI-21',
    type: 'Akademik masala',
    description:
      "Kuzgi semestr bo'yicha 'Ma'lumotlar bazasi' fanidan oraliq nazorat qayta topshirish jadvalini aniqlashtirish hamda akademik qarzdorlikni yopish uchun ruxsatnoma rasmiylashtirishda amaliy yordam so'rayman.",
    status: 'Yangi',
    responseNote: '',
    ownerId: 'demo-user',
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'demo-1002',
    studentName: 'Javohir Tursunov',
    group: 'ATT-304',
    type: 'Stipendiya va moliya',
    description:
      "O'tgan oydagi a'lo baholar natijasiga ko'ra oshirilgan stipendiya to'lovi bank kartamga hali kelib tushmadi. Buhalteriya bo'limi bilan bog'lanib holatga aniqlik kiritib berishingizni so'rayman.",
    status: "Ko'rib chiqilmoqda",
    responseNote: "Buxgalteriya bo'limiga so'rov yuborildi, qaydnoma tekshirilmoqda.",
    ownerId: 'demo-user',
    createdAt: hoursAgo(9),
    updatedAt: hoursAgo(4),
  },
  {
    id: 'demo-1003',
    studentName: 'Madina Abdullayeva',
    group: 'KI-205',
    type: 'Yotoqxona',
    description:
      "3-sonli talabalar turar joyi 412-xonasida isitish tizimi yetarli darajada ishlamayapti. Texnik xizmat xodimlarini yuborib, muammoni bartaraf etishni iltimos qilaman.",
    status: 'Yakunlandi',
    responseNote: 'TTJ texnik guruhi tomonidan xona radiatori sozlandi va tekshirildi.',
    ownerId: 'demo-user',
    createdAt: hoursAgo(28),
    updatedAt: hoursAgo(12),
  },
  {
    id: 'demo-1004',
    studentName: 'Sardorbek Xolmatov',
    group: 'IQT-102',
    type: "Hujjat va ma'lumotnoma",
    description:
      "Harbiy hisob bo'limiga taqdim etish uchun universitetda kunduzgi bo'limda tahsil olayotganim haqida QR-kodli rasmiy ma'lumotnoma zarur edi.",
    status: 'Yangi',
    responseNote: '',
    ownerId: 'demo-user',
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
  },
  {
    id: 'demo-1005',
    studentName: 'Dilnoza Rustamova',
    group: 'MT-401',
    type: 'Texnik yordam',
    description:
      "HEMIS talaba portaliga kirishda parolni tiklash SMS kodi kelmayapti. Mening shaxsiy telefon raqamim yangilangani sababli profil ma'lumotlarini tahrirlashda yordam kerak.",
    status: "Ko'rib chiqilmoqda",
    responseNote: 'Raqamli ta’lim texnologiyalari markazi operatori tomonidan ko‘rilmoqda.',
    ownerId: 'demo-user',
    createdAt: hoursAgo(19),
    updatedAt: hoursAgo(6),
  },
  {
    id: 'demo-1006',
    studentName: 'Bekzod Qodirov',
    group: 'DI-21',
    type: 'Akademik masala',
    description:
      "Bitiruv malakaviy ishi mavzusini o'zgartirish va ilmiy rahbar biriktirish bo'yicha kafedra yig'ilishi qarorini dekanatga taqdim etish bo'yicha maslahat so'rayman.",
    status: 'Yakunlandi',
    responseNote: 'Kafedra taqdimnomasi asosida ariza tasdiqlandi va buyruqqa kiritildi.',
    ownerId: 'demo-user',
    createdAt: hoursAgo(52),
    updatedAt: hoursAgo(24),
  },
  {
    id: 'demo-1007',
    studentName: 'Zuhra Yusupova',
    group: 'YX-108',
    type: 'Stipendiya va moliya',
    description:
      "Kontrakt to'lovini bo'lib to'lash jadvaliga muvofiq ikkinchi qism muddatini 15 kunga uzaytirish bo'yicha ariza topshirmoqchiman.",
    status: 'Yangi',
    responseNote: '',
    ownerId: 'demo-user',
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
  },
  {
    id: 'demo-1008',
    studentName: 'Umidjon Rahimov',
    group: 'ATT-304',
    type: 'Boshqa',
    description:
      "Talabalar ilmiy jamiyati doirasida shanba kuni bo'lib o'tadigan hackathon uchun B-korpus 204-auditoriyani band qilishga ruxsat berishingizni so'rayman.",
    status: 'Yakunlandi',
    responseNote: 'Auditoriya shanba kuni soat 10:00 dan 17:00 gacha ajratildi.',
    ownerId: 'demo-user',
    createdAt: hoursAgo(72),
    updatedAt: hoursAgo(40),
  },
];
