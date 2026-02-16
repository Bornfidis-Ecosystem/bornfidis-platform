/**
 * Phase 1 — Role welcome page content
 * 3 bullets: What you can do | What we'll contact you about | Who to message
 */

import type { InviteRole } from './invite-copy'

export type WelcomeBlock = {
  title: string
  body: string
}

export const WELCOME_CONTENT: Record<
  InviteRole,
  {
    whatYouCanDo: WelcomeBlock
    whatWeContactAbout: WelcomeBlock
    contact: string
  }
> = {
  FARMER: {
    whatYouCanDo: {
      title: 'What you can do here',
      body:
        'Connect with chefs and buyers, share what you grow, and get fair prices for your harvest. You can update your crops, see demand signals, and manage your profile.',
    },
    whatWeContactAbout: {
      title: 'What Bornfidis will contact you about',
      body:
        'Confirming your details, harvest updates, and opportunities to connect with chefs and buyers.',
    },
    contact: 'Reach out to the Bornfidis team for support or questions.',
  },
  CHEF: {
    whatYouCanDo: {
      title: 'What you can do here',
      body:
        'Source local ingredients, manage bookings, and connect with farmers. You can set availability, view earnings, and build your profile.',
    },
    whatWeContactAbout: {
      title: 'What Bornfidis will contact you about',
      body:
        'Profile setup, booking requests, and connecting you with farmers and ingredients.',
    },
    contact: 'Reach out to the Bornfidis team for support or questions.',
  },
  EDUCATOR: {
    whatYouCanDo: {
      title: 'What you can do here',
      body:
        'Access resources, share knowledge, and support the community. You can use education materials and help others learn about fair food systems.',
    },
    whatWeContactAbout: {
      title: 'What Bornfidis will contact you about',
      body:
        'Resources, ways to get involved, and opportunities to teach or mentor in the ecosystem.',
    },
    contact: 'Reach out to the Bornfidis team for support or questions.',
  },
  PARTNER: {
    whatYouCanDo: {
      title: 'What you can do here',
      body:
        'Explore opportunities, stay updated on the ecosystem, and support the mission. You can view partner content and get in touch with the team.',
    },
    whatWeContactAbout: {
      title: 'What Bornfidis will contact you about',
      body:
        'Ways to engage, support the mission, and partner opportunities.',
    },
    contact: 'Reach out to the Bornfidis team for support or questions.',
  },
}
