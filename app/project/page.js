import { canonicalMetadata } from '@/lib/site-origin.mjs';
import Link from 'next/link';
import { projectsData } from '@/utils/data/projects-data';
import ProjectSummary from '../components/portfolio/ui/project-summary';
export const metadata={...canonicalMetadata('/project'),title:'Projects | Inzamam Idrees'};
export default function ProjectsPage(){return <div className="container route-page"><p className="eyebrow accent">PROJECT ARCHIVE / 08 BUILDS</p><h1>Work, in detail.</h1>{projectsData.map((project,index)=><ProjectSummary key={project.id} project={project} index={index}/>)}<Link href="/#contact" className="button primary">Let’s talk about your project ↗</Link></div>;}
