'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface PatoisContextType {
  isPatois: boolean
  togglePatois: () => void
  t: (key: string) => string
}

const PatoisContext = createContext<PatoisContextType | undefined>(undefined)

// Translations
const translations: Record<string, { en: string; patois: string }> = {
  heroTitle: {
    en: 'Bornfidis Portland – Restoring land, people, and purpose through food',
    patois: 'Bornfidis Portland – Restoring land, people, and purpose through food',
  },
  heroSubtitle: {
    en: 'Join our regenerative food movement in the Pacific Northwest',
    patois: 'Join we regenerative food movement in the Pacific Northwest',
  },
  welcomeToPortland: {
    en: 'Welcome to Bornfidis Portland',
    patois: 'Welcome to Bornfidis Portland',
  },
  portlandTagline: {
    en: 'Regenerating land, people, and enterprise in Portland',
    patois: 'Regenerating land, people, and enterprise in Portland',
  },
  languageLabel: {
    en: 'Language:',
    patois: 'Language:',
  },
  quickActions: {
    en: 'What would you like to do?',
    patois: 'Wha yuh waan do?',
  },
  bookEvent: {
    en: 'Book an Event',
    patois: 'Book an Event',
  },
  bookEventDesc: {
    en: 'Host a faith-anchored meal',
    patois: 'Host a faith-anchored meal',
  },
  becomeFarmer: {
    en: 'Become a Farmer',
    patois: 'Become a Farmer',
  },
  becomeFarmerDesc: {
    en: 'Join our regenerative network',
    patois: 'Join our regenerative network',
  },
  meetChefs: {
    en: 'Meet Our Chefs',
    patois: 'Meet Our Chefs',
  },
  meetChefsDesc: {
    en: 'See who\'s cooking',
    patois: 'See who\'s cooking',
  },
  readStories: {
    en: 'Read Stories',
    patois: 'Read Stories',
  },
  readStoriesDesc: {
    en: 'Hear from our community',
    patois: 'Hear from our community',
  },
  contactUs: {
    en: 'Get in Touch',
    patois: 'Get in Touch',
  },
  yourName: {
    en: 'Your Name',
    patois: 'Yuh Name',
  },
  speakName: {
    en: 'Speak',
    patois: 'Speak',
  },
  yourEmail: {
    en: 'Your Email',
    patois: 'Yuh Email',
  },
  speakEmail: {
    en: 'Speak',
    patois: 'Speak',
  },
  yourPhone: {
    en: 'Your Phone',
    patois: 'Yuh Phone',
  },
  speakPhone: {
    en: 'Speak',
    patois: 'Speak',
  },
  yourMessage: {
    en: 'Your Message',
    patois: 'Yuh Message',
  },
  speakMessage: {
    en: 'Speak',
    patois: 'Speak',
  },
  submitForm: {
    en: 'Send Message',
    patois: 'Send Message',
  },
  submitting: {
    en: 'Sending...',
    patois: 'Sending...',
  },
  formSubmittedSuccess: {
    en: 'Message sent! We\'ll get back to you soon.',
    patois: 'Message send! We\'ll get back to yuh soon.',
  },
  formSubmitError: {
    en: 'Something went wrong. Please try again.',
    patois: 'Something go wrong. Please try again.',
  },
  formSavedOffline: {
    en: 'Form saved offline. We\'ll send it when you\'re back online.',
    patois: 'Form save offline. We\'ll send it when yuh back online.',
  },
  aboutPortland: {
    en: 'About Bornfidis Portland',
    patois: 'About Bornfidis Portland',
  },
  aboutPortlandText: {
    en: 'Bornfidis Portland brings regenerative food, community, and enterprise to the Pacific Northwest. We connect local farmers, chefs, and communities through faith-anchored meals and regenerative practices.',
    patois: 'Bornfidis Portland bring regenerative food, community, and enterprise to the Pacific Northwest. We connect local farmers, chefs, and communities through faith-anchored meals and regenerative practices.',
  },
  aboutPortlandText2: {
    en: 'Join us in building a sustainable food system that honors the land, supports farmers, and nourishes communities.',
    patois: 'Join we in building a sustainable food system that honor the land, support farmers, and nourish communities.',
  },
  joinAsFarmer: {
    en: 'Join as Farmer',
    patois: 'Join as Farmer',
  },
  joinAsFarmerDesc: {
    en: 'Connect your farm to our network',
    patois: 'Connect yuh farm to we network',
  },
  joinAsChef: {
    en: 'Join as Chef',
    patois: 'Join as Chef',
  },
  joinAsChefDesc: {
    en: 'Cook with regenerative ingredients',
    patois: 'Cook with regenerative ingredients',
  },
  youthApprenticeship: {
    en: 'Youth Apprenticeship',
    patois: 'Youth Apprenticeship',
  },
  youthApprenticeshipDesc: {
    en: 'Learn regenerative farming and cooking',
    patois: 'Learn regenerative farming and cooking',
  },
  bookEvent: {
    en: 'Book Event',
    patois: 'Book Event',
  },
  bookEventDesc: {
    en: 'Host a faith-anchored meal',
    patois: 'Host a faith-anchored meal',
  },
  support: {
    en: 'Support',
    patois: 'Support',
  },
  supportDesc: {
    en: 'Support our mission',
    patois: 'Support we mission',
  },
  whatIsBornfidis: {
    en: 'What is Bornfidis?',
    patois: 'Wha is Bornfidis?',
  },
  whatIsBornfidisText: {
    en: 'Bornfidis is a regenerative food platform that connects farmers, chefs, and communities through faith-anchored meals and sustainable practices.',
    patois: 'Bornfidis is a regenerative food platform that connect farmers, chefs, and communities through faith-anchored meals and sustainable practices.',
  },
  howItWorks: {
    en: 'How it Works',
    patois: 'How it Work',
  },
  grow: {
    en: 'Grow',
    patois: 'Grow',
  },
  growDesc: {
    en: 'Farmers grow regenerative crops',
    patois: 'Farmers grow regenerative crops',
  },
  cook: {
    en: 'Cook',
    patois: 'Cook',
  },
  cookDesc: {
    en: 'Chefs prepare faith-anchored meals',
    patois: 'Chefs prepare faith-anchored meals',
  },
  serve: {
    en: 'Serve',
    patois: 'Serve',
  },
  serveDesc: {
    en: 'Communities gather and nourish',
    patois: 'Communities gather and nourish',
  },
  portlandStories: {
    en: 'Portland Stories',
    patois: 'Portland Stories',
  },
  story1Name: {
    en: 'Maria',
    patois: 'Maria',
  },
  story1Text: {
    en: 'Bornfidis helped me connect my farm to local chefs and grow my business.',
    patois: 'Bornfidis help me connect my farm to local chefs and grow my business.',
  },
  story2Name: {
    en: 'James',
    patois: 'James',
  },
  story2Text: {
    en: 'I love cooking with fresh, regenerative ingredients from local farmers.',
    patois: 'I love cooking with fresh, regenerative ingredients from local farmers.',
  },
  farmerJoinSubtitle: {
    en: 'Join our network in 60 seconds',
    patois: 'Join we network in 60 seconds',
  },
  farmerJoinSuccess: {
    en: 'Welcome! We\'ll send you a confirmation text shortly.',
    patois: 'Welcome! We\'ll send yuh a confirmation text shortly.',
  },
  farmerJoinError: {
    en: 'Something went wrong. Please try again.',
    patois: 'Something go wrong. Please try again.',
  },
  offlineMode: {
    en: 'You\'re offline. Your form will be saved and submitted when you\'re back online.',
    patois: 'Yuh offline. Yuh form will be save and submit when yuh back online.',
  },
  namePlaceholder: {
    en: 'Your name',
    patois: 'Yuh name',
  },
  phonePlaceholder: {
    en: '(503) 555-1234',
    patois: '(503) 555-1234',
  },
  acresPlaceholder: {
    en: 'Number of acres',
    patois: 'Number of acres',
  },
  cropsPlaceholder: {
    en: 'What you grow',
    patois: 'Wha yuh grow',
  },
  speakAcres: {
    en: 'Speak',
    patois: 'Speak',
  },
  speakCrops: {
    en: 'Speak',
    patois: 'Speak',
  },
  cancel: {
    en: 'Cancel',
    patois: 'Cancel',
  },
  supportMovement: {
    en: 'Support the Movement',
    patois: 'Support the Movement',
  },
  fullName: {
    en: 'Full Name',
    patois: 'Yuh Full Name',
  },
  phoneNumber: {
    en: 'Phone Number',
    patois: 'Yuh Phone #',
  },
  approxAcres: {
    en: 'Approx Acres Farmed',
    patois: 'Approx Acres Farmed',
  },
  whatDoYouGrow: {
    en: 'What do you grow?',
    patois: 'Wah yuh grow?',
  },
  thankYouMessage: {
    en: 'Thank you! We\'ll be in touch soon. Keep your phone on — Bornfidis will call you.',
    patois: 'Thank yuh! We\'ll be in touch soon. Keep yuh phone on — Bornfidis will call yuh.',
  },
  submitError: {
    en: 'Something went wrong. Please try again.',
    patois: 'Something go wrong. Please try again.',
  },
  offlineSaved: {
    en: 'Offline — your submission will be saved and sent when you\'re back online.',
    patois: 'No signal — wi save it an send it when yuh online.',
  },
  offlineIndicator: {
    en: 'Offline — your submission will be saved and sent when you\'re back online.',
    patois: 'No signal — wi save it an send it when yuh online.',
  },
  covenantLine: {
    en: 'We covenant to restore land, people, and purpose through food.',
    patois: 'We covenant to restore land, people, and purpose through food.',
  },
  scriptureReference: {
    en: 'Isaiah 58:11',
    patois: 'Isaiah 58:11',
  },
  parish: {
    en: 'Parish',
    patois: 'Parish',
  },
  parishPlaceholder: {
    en: 'Your parish',
    patois: 'Yuh parish',
  },
  speakParish: {
    en: 'Speak',
    patois: 'Speak',
  },
}

export function PatoisProvider({ children }: { children: ReactNode }) {
  const [isPatois, setIsPatois] = useState(false)

  const togglePatois = () => {
    setIsPatois(prev => !prev)
  }

  const t = (key: string): string => {
    const translation = translations[key]
    if (!translation) return key
    return isPatois ? translation.patois : translation.en
  }

  return (
    <PatoisContext.Provider value={{ isPatois, togglePatois, t }}>
      {children}
    </PatoisContext.Provider>
  )
}

export function usePatois() {
  const context = useContext(PatoisContext)
  if (!context) {
    throw new Error('usePatois must be used within PatoisProvider')
  }
  return context
}
