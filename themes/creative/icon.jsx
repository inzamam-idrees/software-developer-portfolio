import { FiArrowRight, FiArrowUpRight, FiArrowUp, FiChevronLeft, FiMenu, FiX, FiFileText, FiMail, FiPhone, FiMapPin, FiCheck, FiCode, FiGithub, FiLinkedin, FiAward, FiBookOpen, FiSend, FiClock, FiShield, FiBook, FiBriefcase, FiStar, FiDownload } from "react-icons/fi";
import { FaDev, FaStackOverflow, FaXTwitter } from "react-icons/fa6";

const icons = {
  right: FiArrowRight, arrow: FiArrowUpRight, up: FiArrowUp, previous: FiChevronLeft,
  menu: FiMenu, close: FiX, resume: FiFileText, download: FiDownload,
  email: FiMail, phone: FiPhone, location: FiMapPin, check: FiCheck, code: FiCode,
  github: FiGithub, linkedIn: FiLinkedin, dev: FaDev, stackOverflow: FaStackOverflow, x: FaXTwitter,
  award: FiAward, writing: FiBookOpen, send: FiSend, clock: FiClock, shield: FiShield,
  education: FiBook, work: FiBriefcase, star: FiStar,
};

export default function Icon({ name, ...props }) {
  const Component = icons[name] ?? FiCode;
  return <Component aria-hidden="true" focusable="false" {...props} />;
}
