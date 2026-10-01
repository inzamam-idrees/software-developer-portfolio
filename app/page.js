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
export default function Home(){return <ExperienceShell><Hero/><SelectedWork/><About/><Expertise/><Experience/><Education/><Suspense fallback={<section className="chapter container" aria-label="Loading writing"><p className="body-copy">Loading the notebook…</p></section>}><Writing/></Suspense><ContactSection/></ExperienceShell>;}
