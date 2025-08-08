// src/components/SideMenu.js
import React from "react";
import { Link } from "react-router-dom";

function SideMenu() {
  const localStorageData = JSON.parse(localStorage.getItem("user"));

  // If localStorageData is empty, use default or empty values
  const userFirstName = localStorageData?.firstName || '';
  const userLastName = localStorageData?.lastName || '';
  const userEmail = localStorageData?.email || '';
  const userImageUrl = localStorageData?.imageUrl || 'https://placehold.co/40x40/cccccc/000000?text=User'; // Default image

  return (
    <div className="h-full flex-col justify-between bg-white hidden lg:flex rounded-r-lg shadow-lg"> {/* Added rounded-r-lg and shadow-lg */}
      <div className="px-4 py-6">
        <nav aria-label="Main Nav" className="mt-6 flex flex-col space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg hover:bg-gray-100 px-4 py-2 text-gray-700"
          >
            {/* Dashboard icon - You can replace with SVG or Lucide React */}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span className="text-sm font-medium"> داشبورد </span>
          </Link>

          <Link
            to="/inventory"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            {/* Inventory icon */}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7m16 0V5a2 2 0 00-2-2H6a2 2 0 00-2 2v2m8 0v10"></path></svg>
            <span className="text-sm font-medium"> موجودی کالا </span>
          </Link>

          <Link
            to="/purchase-details" // This will change to transaction history
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            {/* Purchase details icon */}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span className="text-sm font-medium"> جزئیات خرید/تراکنش </span>
          </Link>
          <Link
            to="/sales" // This will change to order list
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            {/* Sales and orders icon */}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span className="text-sm font-medium"> فروش و سفارشات </span>
          </Link>

          <Link
            to="/manage-store"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            {/* Store management icon */}
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m7-4h.01M7 16h.01"></path></svg>
            <span className="text-sm font-medium"> مدیریت فروشگاه </span>
          </Link>
        </nav>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 rounded-br-lg"> {/* Added rounded-br-lg */}
        <div className="flex items-center gap-2 bg-white p-4 hover:bg-gray-50">
          <img
            alt="Profile image"
            src={userImageUrl}
            className="h-10 w-10 rounded-full object-cover"
          />

          <div>
            <p className="text-xs">
              <strong className="block font-medium">
                {userFirstName + " " + userLastName}
              </strong>

              <span> {userEmail} </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideMenu;
