// src/pages/Store.js
import React, { useState, useEffect, useContext } from "react";
import AddStore from "../components/AddStore";
import AuthContext from "../AuthContext";

function Store({ showNotification }) {
  const [showModal, setShowModal] = useState(false);
  const [stores, setAllStores] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    const userId = storedUser ? storedUser._id : null;

    if (userToken && userId) {
      fetchData();
    } else {
      setAllStores([]);
    }
  }, [updatePage, authContext.user]);

  const fetchData = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    const userId = storedUser ? storedUser._id : null;

    if (!userToken || !userId) {
      showNotification("برای دسترسی به فروشگاه‌ها، لطفاً وارد شوید.", "error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/store/get/${userId}`, {
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAllStores(data);
      } else {
        showNotification(data.message || "خطا در دریافت اطلاعات فروشگاه‌ها.", "error");
      }
    } catch (err) {
      console.error("خطا در واکشی فروشگاه‌ها:", err);
      showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  const modalSetting = () => {
    setShowModal(!showModal);
    setUpdatePage(!updatePage);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center ">
      <div className="flex flex-col gap-5 w-11/12 border-2">
        <div className="flex justify-between items-center py-3 px-3 rounded-lg bg-white shadow-sm">
          <span className="font-bold text-lg">مدیریت فروشگاه‌ها</span>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm rounded-lg shadow-md transition duration-300 ease-in-out"
            onClick={modalSetting}
          >
            افزودن فروشگاه جدید
          </button>
        </div>
        {showModal && <AddStore modalSetting={modalSetting} showNotification={showNotification} />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.length === 0 ? (
            <div className="col-span-full text-center py-4 text-gray-500 bg-white rounded-lg shadow-sm">
              هیچ فروشگاهی یافت نشد.
            </div>
          ) : (
            stores.map((element) => {
              return (
                <div
                  className="bg-white rounded-lg shadow-md flex flex-col gap-4 p-4 overflow-hidden"
                  key={element._id}
                >
                  <div className="h-48 w-full overflow-hidden rounded-md">
                    <img
                      alt="تصویر فروشگاه"
                      className="h-full w-full object-cover"
                      src={element.image || 'https://placehold.co/400x200/E0E0E0/000000?text=No+Store+Image'}
                    />
                  </div>
                  <div className="flex flex-col gap-2 justify-between items-start">
                    <span className="font-bold text-lg text-gray-900">{element.name}</span>
                    <span className="text-sm text-gray-600">{element.category}</span>
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      <span>{element.address + ", " + element.city}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Store;
