import React from "react";

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
};

const FacebookIcon = () => (
  <svg {...iconProps}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TwitterIcon = () => (
  <svg {...iconProps}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const InstagramIcon = () => (
  <svg {...iconProps}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg {...iconProps}>
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="w-full mt-8">
      <hr className="border border-gray-300 dark:border-gray-700" />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 flex-col md:flex-row justify-between items-center">
            <h1 className="text-xl font-bold">QuickCart</h1>
            <p className="text-sm">
              Your one-stop shop for everything you need.
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end gap-4">
            <a href="" className="text-sm hover:text-underline">
              About Us
            </a>
            <a href="" className="text-sm hover:text-underline">
              Contact
            </a>
            <a href="" className="text-sm hover:text-underline">
              Privacy Policy
            </a>
            <a href="" className="text-sm hover:text-underline">
              Term and condition
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm">Follow us:</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#" className="hover:opacity-75">
              <FacebookIcon />
            </a>
            <a href="#" className="hover:opacity-75">
              <TwitterIcon />
            </a>
            <a href="#" className="hover:opacity-75">
              <InstagramIcon />
            </a>
            <a href="#" className="hover:opacity-75">
              <YoutubeIcon />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
