function SectionHeading({ id, children }) {
  return (
    <div className="flex justify-center my-5 lg:py-8">
      <div className="flex items-center">
        <span className="w-12 sm:w-24 h-[2px] bg-[#1a1443]" aria-hidden="true" />
        <h2
          id={id}
          className="bg-[#1a1443] w-fit text-white p-2 px-5 text-xl rounded-md"
        >
          {children}
        </h2>
        <span className="w-12 sm:w-24 h-[2px] bg-[#1a1443]" aria-hidden="true" />
      </div>
    </div>
  );
}

export default SectionHeading;
