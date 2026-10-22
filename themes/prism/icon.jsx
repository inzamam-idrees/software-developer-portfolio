import { FiArrowUpRight, FiArrowRight, FiChevronLeft, FiChevronRight, FiSun, FiMoon, FiMenu, FiX, FiFileText, FiMail, FiPhone, FiMapPin, FiCopy, FiCheckCircle, FiLayers, FiCode, FiGithub, FiLinkedin, FiAward, FiBookOpen, FiPause, FiPlay, FiArrowUp, FiSend, FiDatabase, FiCpu, FiCloud, FiBook, FiServer, FiClock, FiShield } from "react-icons/fi";
import { FaDev, FaStackOverflow } from "react-icons/fa";

const icons = {
  frontend: FiCode, backend: FiDatabase, delivery: FiCloud, ai: FiCpu, additional: FiServer, education: FiBook,
  dev: FaDev, stackOverflow: FaStackOverflow,
  clock: FiClock, shield: FiShield,
  send: FiSend, up: FiArrowUp, arrow: FiArrowUpRight, right: FiArrowRight, previous: FiChevronLeft, next: FiChevronRight,
  sun: FiSun, moon: FiMoon, menu: FiMenu, close: FiX, resume: FiFileText,
  email: FiMail, phone: FiPhone, location: FiMapPin, copy: FiCopy, check: FiCheckCircle,
  layers: FiLayers, code: FiCode, github: FiGithub, linkedIn: FiLinkedin,
  certificates: FiAward, writing: FiBookOpen, pause: FiPause, play: FiPlay,
};
export default function Icon({ name, ...props }) {
  const Component = icons[name] ?? FiCode;
  return <Component aria-hidden="true" focusable="false" {...props} />;
}
