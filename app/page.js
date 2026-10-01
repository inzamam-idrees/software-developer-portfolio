import { personalData } from '@/utils/data/personal-data';
import { getSiteOrigin } from '@/lib/site-origin.mjs';
import { canonicalMetadata } from '@/lib/site-origin.mjs';
import ExperienceShell from './components/portfolio/motion/experience-shell';
import { Suspense } from 'react';
import Writing from './components/portfolio/sections/writing';
import Hero from './components/portfolio/sections/hero';
import SelectedWork from './components/portfolio/sections/selected-work';
import About from './components/portfolio/sections/about';
import Expertise from './components/portfolio/sections/expertise';
import Experience from './components/portfolio/sections/experience';
import Education from './components/portfolio/sections/education';
import ContactSection from './components/portfolio/sections/contact';
export const metadata = canonicalMetadata('/');
const person = { '@context': 'https://schema.org', '@type': 'Person', name: 'Inzamam Idrees', jobTitle: personalData.designation, address: personalData.address, sameAs: [personalData.github, personalData.linkedIn, personalData.twitter], ...(getSiteOrigin() ? { url: getSiteOrigin() } : {}) };
export default function Home(){return <ExperienceShell><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} /><Hero/><SelectedWork/><About/><Expertise/><Experience/><Education/><Suspense fallback={<section className="chapter container" aria-label="Loading writing"><p className="body-copy">Loading the notebook…</p></section>}><Writing/></Suspense><ContactSection/></ExperienceShell>;}
