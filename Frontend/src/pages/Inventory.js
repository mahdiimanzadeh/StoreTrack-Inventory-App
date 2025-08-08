// src/pages/Inventory.js
import React, { useState, useEffect, useContext } from "react";
import AddProduct from "../components/AddProduct";
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";

function Inventory({ showNotification }) {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateProductData, setUpdateProductData] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatePage, setUpdatePage] = useState(true);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    // Read token and userId directly from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    const userId = storedUser ? storedUser._id : null;

    if (userToken && userId) { // Only fetch data if token and userId are valid
      fetchProductsData();
    } else {
      setAllProducts([]); // If not logged in, empty the list
      // showNotification("برای مشاهده محصولات، لطفاً وارد شوید.", "error"); // This message is handled by PrivateRoute
    }
  }, [updatePage, authContext.user]); // Added authContext.user to dependencies

  const fetchProductsData = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    const userId = storedUser ? storedUser._id : null;

    if (!userToken || !userId) {
      showNotification("برای دسترسی به این بخش، لطفاً وارد شوید.", "error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/product/get/${userId}`, {
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAllProducts(data);
      } else {
        showNotification(data.message || "خطا در دریافت محصولات.", "error");
      }
    } catch (err) {
      console.error("خطا در واکشی محصولات:", err);
      showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  const fetchSearchData = async (term) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    const userId = storedUser ? storedUser._id : null;

    if (!userToken || !userId) {
      showNotification("برای جستجو، لطفاً وارد شوید.", "error");
      return;
    }

    if (!term.trim()) {
      fetchProductsData();
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/product/search?searchTerm=${term}`, {
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAllProducts(data);
      } else {
        showNotification(data.message || "خطا در جستجوی محصولات.", "error");
      }
    } catch (err) {
      console.error("خطا در جستجوی محصولات:", err);
      showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSearchData(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, authContext.user]);

  const deleteItem = async (id) => {
    if (!window.confirm('آیا از حذف این محصول مطمئن هستید؟')) {
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    if (!userToken) {
      showNotification("برای حذف محصول، لطفاً وارد شوید.", "error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/product/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("محصول با موفقیت حذف شد!", "success");
        setUpdatePage(!updatePage);
      } else {
        showNotification(data.message || "خطا در حذف محصول. لطفاً دوباره تلاش کنید.", "error");
      }
    } catch (err) {
      console.error("خطا در حذف محصول:", err);
      showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  const addProductModalSetting = () => {
    setShowProductModal(!showProductModal);
  };

  const updateProductModalSetting = (selectedProductData) => {
    setUpdateProductData(selectedProductData);
    setShowUpdateModal(!showUpdateModal);
  };

  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        {showProductModal && (
          <AddProduct
            addProductModalSetting={addProductModalSetting}
            handlePageUpdate={handlePageUpdate}
            showNotification={showNotification}
          />
        )}
        {showUpdateModal && (
          <UpdateProduct
            updateProductData={updateProductData}
            updateModalSetting={updateProductModalSetting}
            handlePageUpdate={handlePageUpdate}
            showNotification={showNotification}
          />
        )}

        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 mt-5">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold text-lg">لیست محصولات</span>
              <div className="flex justify-center items-center px-2 border-2 rounded-md ">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input
                  className="border-none outline-none focus:border-none text-sm p-1"
                  type="text"
                  placeholder="جستجو بر اساس نام محصول..."
                  value={searchTerm}
                  onChange={handleSearchTerm}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm rounded-lg shadow-md transition duration-300 ease-in-out"
                onClick={addProductModalSetting}
              >
                افزودن محصول جدید
              </button>
            </div>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  نام محصول
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  سازنده
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  دسته‌بندی
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  موجودی
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  قیمت (ریال)
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  وضعیت موجودی
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    محصولی یافت نشد.
                  </td>
                </tr>
              ) : (
                products.map((element, index) => {
                  return (
                    <tr key={element._id}>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                        {element.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.manufacturer}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.category}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.stock}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.price.toLocaleString('fa-IR')}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.stock > 0 ? (
                          <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-2.5 py-0.5 text-green-600">
                            در انبار
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-red-600">
                            ناموجود
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        <span
                          className="text-green-700 cursor-pointer hover:text-green-900 transition duration-150 ease-in-out"
                          onClick={() => updateProductModalSetting(element)}
                        >
                          ویرایش{" "}
                        </span>
                        <span
                          className="text-red-600 px-2 cursor-pointer hover:text-red-800 transition duration-150 ease-in-out"
                          onClick={() => deleteItem(element._id)}
                        >
                          حذف
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Inventory;
