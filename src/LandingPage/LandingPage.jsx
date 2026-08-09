import React from "react";
import { FaUserCog, FaStore, FaCashRegister, FaCoffee } from "react-icons/fa";
import WhiteLogo from "../Assets/Images/WhiteLogo";
import RedLogo from "../Assets/Images/RedLogo";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const links = [
    {
      title: "Admin",
      icon: <FaUserCog />,
      path: "/"
    },
    {
      title: "Branch",
      icon: <FaStore />,
      path: "/"
    },
    {
      title: "Cashier",
      icon: <FaCashRegister />,
      path: "/point-of-sale/login"
    },
    {
      title: "Kitchen/Barista",
      icon: <FaCoffee />,
      path: "/kitchen/login"
    }
  ];

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl p-4 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <RedLogo width={32} height={32} />
            <h1 className="text-3xl font-bold text-gray-800">Food2Go</h1>
          </div>
          <p className="text-gray-600">Select your role to continue</p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-y-6 gap-x-4 md:gap-x-12">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.path}
              className="bg-mainColor text-white p-6 rounded-xl flex items-center justify-center gap-2 hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105"
            >
              <span className="text-2xl lg:text-3xl">{link.icon}</span>
              <span className="font-semibold text-sm md:text-xl lg:text-2xl">
                {link.title}
              </span>
            </a>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">© 2024 Food2Go System</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;