import Link from "next/link";
import { CgGitFork } from "react-icons/cg";
import { IoStar } from "react-icons/io5";

export default function CodingFooter({ profile, site, copy }) {
  return (
    <footer className="relative border-t bg-[#0d1224] border-[#353951] text-white">
      <div className="mx-auto px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] py-6 lg:py-10">
        <div className="flex justify-center -z-40">
          <div className="absolute top-0 h-[1px] w-1/2 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            {copy.credit}{" "}
            <Link href="/#about" className="text-[#16f2b3] underline underline-offset-2">
              {profile.name}
            </Link>
          </p>
          <div className="flex items-center gap-5">
            <a
              target="_blank"
              rel="noreferrer"
              href={site.repositoryUrl}
              className="flex items-center gap-2 uppercase hover:text-[#16f2b3]"
            >
              <IoStar /> <span>{copy.star}</span>
            </a>
            <a
              target="_blank"
              rel="noreferrer"
              href={`${site.repositoryUrl}/fork`}
              className="flex items-center gap-2 uppercase hover:text-[#16f2b3]"
            >
              <CgGitFork /> <span>{copy.fork}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
