// src/pages/OrderList.js
import React, { useState, useEffect, useContext } from "react";
import AddOrder from "../components/AddOrder";
import AuthContext from "../AuthContext";

function OrderList({ showNotification, handlePageUpdate }) {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orders, setAllOrders] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true); // اضافه شدن حالت بارگذاری
  const [updatePage, setUpdatePage] = useState(true);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    console.log("OrderList: useEffect triggered for data fetch.");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    const userId = storedUser ? storedUser._id : null;

    console.log("OrderList: userToken (from localStorage):", userToken ? "Present" : "Missing");
    console.log("OrderList: userId (from localStorage):", userId);

    const fetchData = async () => {
      if (!userToken || !userId) {
        setAllOrders([]);
        setAllProducts([]);
        setLoading(false);
        showNotification("برای دسترسی به لیست سفارشات، لطفاً وارد شوید.", "error");
        return;
      }

      setLoading(true); // شروع بارگذاری
      try {
        // اجرای همزمان هر دو فراخوانی API
        const [ordersResponse, productsResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/orders/get/${userId}`, {
            headers: { "Authorization": `Bearer ${userToken}` }
          }),
          fetch(`http://localhost:5000/api/product/get/${userId}`, {
            headers: { "Authorization": `Bearer ${userToken}` }
          })
        ]);

        // پردازش پاسخ سفارشات
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setAllOrders(ordersData);
          console.log("OrderList: Orders fetched successfully.");
        } else {
          const errorData = await ordersResponse.json();
          showNotification(errorData.message || "خطا در دریافت لیست سفارشات.", "error");
          console.error("OrderList: API error for orders:", errorData.message);
        }

        // پردازش پاسخ محصولات
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setAllProducts(productsData);
          console.log("OrderList: Products fetched successfully.");
        } else {
          const errorData = await productsResponse.json();
          showNotification(errorData.message || "خطا در دریافت محصولات.", "error");
          console.error("OrderList: API error for products:", errorData.message);
        }

      } catch (err) {
        console.error("OrderList: Network error during data fetch:", err);
        showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
      } finally {
        setLoading(false); // پایان بارگذاری در هر صورت
      }
    };

    fetchData(); // فراخوانی تابع واکشی داده در useEffect
  }, [updatePage, authContext.user]); // وابستگی به updatePage و authContext.user

  const addOrderModalSetting = () => {
    setShowOrderModal(!showOrderModal);
  };

  const updateOrderStatus = async (orderID, newStatus) => {
    if (!window.confirm(`آیا از تغییر وضعیت سفارش به "${newStatus}" مطمئن هستید؟`)) {
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    if (!userToken) {
      showNotification("برای به‌روزرسانی وضعیت سفارش، لطفاً وارد شوید.", "error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/updateStatus/${orderID}`, {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification(`وضعیت سفارش ${orderID.substring(0, 8)}... به "${newStatus}" تغییر یافت.`, "success");
        setUpdatePage(prev => !prev); // به‌روزرسانی صفحه
      } else {
        showNotification(data.message || "خطا در به‌روزرسانی وضعیت سفارش.", "error");
      }
    } catch (err) {
      console.error("OrderList: Error updating order status:", err);
      showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  const deleteOrder = async (orderID) => {
    if (!window.confirm('آیا از حذف این سفارش مطمئن هستید؟')) {
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    if (!userToken) {
      showNotification("برای حذف سفارش، لطفاً وارد شوید.", "error");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/delete/${orderID}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${userToken}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        showNotification("سفارش با موفقیت حذف شد!", "success");
        setUpdatePage(prev => !prev); // به‌روزرسانی صفحه
      } else {
        showNotification(data.message || "خطا در حذف سفارش.", "error");
      }
    } catch (err) {
      console.error("OrderList: Error deleting order:", err);
      showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  if (loading) {
    return (
      <div className="col-span-12 lg:col-span-10 flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-gray-700">در حال بارگذاری لیست سفارشات...</h1>
      </div>
    );
  }

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        {showOrderModal && (
          <AddOrder
            addOrderModalSetting={addOrderModalSetting}
            products={products}
            handlePageUpdate={handlePageUpdate}
            authContext={authContext}
            showNotification={showNotification}
          />
        )}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 mt-5">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold text-lg">لیست سفارشات</span>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm rounded-lg shadow-md transition duration-300 ease-in-out"
                onClick={addOrderModalSetting}
              >
                ثبت سفارش جدید
              </button>
            </div>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  شناسه سفارش
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  محصولات
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  مبلغ کل
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  تاریخ سفارش
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  آدرس ارسال
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  وضعیت
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  عملیات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {orders.length === 0 && !loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    هیچ سفارشی یافت نشد.
                  </td>
                </tr>
              ) : (
                orders.map((element) => {
                  return (
                    <tr key={element._id}>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                        {element._id.substring(0, 8)}...
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.items.map(item => (
                          <div key={item.productID?._id || item._id}>
                            {item.productID?.name} ({item.quantity})
                          </div>
                        ))}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.totalAmount.toLocaleString('fa-IR')} ریال
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {new Date(element.orderDate).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.shippingAddress || "-"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        <select
                          value={element.status}
                          onChange={(e) => updateOrderStatus(element._id, e.target.value)}
                          className="p-1 border rounded text-sm"
                        >
                          <option value="pending">در انتظار</option>
                          <option value="shipped">ارسال شده</option>
                          <option value="cancelled">لغو شده</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        <span
                          className="text-red-600 px-2 cursor-pointer hover:text-red-800 transition duration-150 ease-in-out"
                          onClick={() => deleteOrder(element._id)}
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

export default OrderList;
