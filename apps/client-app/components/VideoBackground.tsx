import Navbar from "./Navbar";


export default function VideoBackground() {
  return (
    <div className="relative w-full overflow-hidden flex flex-col" style={{ height: "80vh" }}>
      {/* Background Video - Only show in dark mode */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/bg.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Overlay - Different for light and dark modes */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        <Navbar />
        
        {/* Centered Content */}
        <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
          <h1 className="text-white font-bold text-3xl sm:text-4xl lg:text-5xl mb-6">
            The Simplest <br /> Way to Find Property
          </h1>
          
          <div className="w-full max-w-xl">
            {/* <SearchBox /> */}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-2 w-full flex justify-center">
          <a
            href="#listing-section"
            className="flex items-center justify-center w-6 h-6 sm:w-10 sm:h-10 bg-[#FFD700] dark:bg-[#FFD700] text-black rounded-full 
            hover:bg-[#C0C0C0] dark:hover:bg-[#D4AF37] transition-all duration-300 ease-in-out animate-bounce"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-3 h-3 sm:h-5 sm:w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </a>
        </div>
      </div>

      {/* Wavy Bottom Shape - Different colors for light/dark mode */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          className="block w-full h-12 text-white dark:text-gray-900"
          viewBox="0 0 1440 120"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,96L720,64L1440,96L1440,120L0,120Z"
          ></path>
        </svg>
      </div>
    </div>
  );
}