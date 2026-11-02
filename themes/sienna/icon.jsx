import {
  IoArrowUp, IoBriefcaseOutline, IoCall, IoCallOutline, IoChatbubbles, IoCheckmarkDoneOutline,
  IoChevronBack, IoChevronForwardOutline, IoCodeSlash, IoDocumentTextOutline, IoLocationOutline,
  IoLogoFacebook, IoLogoGithub, IoLogoLinkedin, IoLogoStackoverflow, IoMail, IoMailOutline,
  IoPersonCircle, IoRibbonOutline, IoSchoolOutline, IoTrophyOutline, IoOpenOutline, IoTimeOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { FaDev } from "react-icons/fa6";
import { SiLeetcode, SiX } from "react-icons/si";

// ── Icon map ──
// Ionicons 5 (the reference's icon family, via react-icons) plus brand marks
// for profiles Ionicons does not cover.
const icons = {
  up: IoArrowUp, chevron: IoChevronForwardOutline, back: IoChevronBack, open: IoOpenOutline,
  award: IoRibbonOutline, check: IoCheckmarkDoneOutline, work: IoBriefcaseOutline,
  location: IoLocationOutline, phone: IoCallOutline, email: IoMailOutline,
  person: IoPersonCircle, mail: IoMail, call: IoCall, chat: IoChatbubbles,
  clock: IoTimeOutline, shield: IoShieldCheckmarkOutline, resume: IoDocumentTextOutline, education: IoSchoolOutline, trophy: IoTrophyOutline, code: IoCodeSlash,
  linkedIn: IoLogoLinkedin, github: IoLogoGithub, facebook: IoLogoFacebook, x: SiX,
  dev: FaDev, stackOverflow: IoLogoStackoverflow, leetcode: SiLeetcode,
};

export default function Icon({ name, ...props }) {
  const Component = icons[name] ?? IoCodeSlash;
  return <Component aria-hidden="true" focusable="false" {...props} />;
}
