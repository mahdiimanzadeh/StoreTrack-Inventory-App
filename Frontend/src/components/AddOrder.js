// src/components/AddOrder.js
import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function AddOrder({
  addOrderModalSetting,
  products,
  handlePageUpdate,
  authContext,
  showNotification,
}) {
  // Read userID from authContext.user and set it in the initial state
  const [order, setOrder] = useState({
    userID: authContext.user ? authContext.user._id : "",
    items: [{ productID: "", quantity: 1 }],
    shippingAddress: "",
  });
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const handleOrderInputChange = (key, value) => {
    setOrder({ ...order, [key]: value });
  };

  const handleItemChange = (index, key, value) => {
    const newItems = [...order.items];
    newItems[index] = { ...newItems[index], [key]: value };
    setOrder({ ...order, items: newItems });
  };

  const handleAddItemRow = () => {
    setOrder({ ...order, items: [...order.items, { productID: "", quantity: 1 }] });
  };

  const handleRemoveItemRow = (index) => {
    const newItems = [...order.items];
    newItems.splice(index, 1);
    setOrder({ ...order, items: newItems });
  };

  const addOrder = async () => {
    if (!order.items.length || order.items.some(item => !item.productID || item.quantity <= 0)) {
      showNotification("لطفاً حداقل یک محصول را با تعداد معتبر برای سفارش انتخاب کنید.", "error");
      return;
    }
    if (!order.shippingAddress) {
      showNotification("لطفاً آدرس ارسال را وارد کنید.", "error");
      return;
    }

    // Read token and userId directly from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    const userId = storedUser ? storedUser._id : null; // We also need userId to send in the body

    if (!userToken || !userId) {
      showNotification("برای ثبت سفارش، لطفاً وارد شوید.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/orders/add", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${userToken}` // Send token
        },
        body: JSON.stringify({ ...order, userID: userId }), // Ensure correct userID is sent
      });

      if (response.ok) {
        showNotification("سفارش با موفقیت ثبت شد!", "success");
        handlePageUpdate();
        addOrderModalSetting();
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || "خطا در ثبت سفارش. لطفاً دوباره تلاش کنید.", "error");
      }
    } catch (err) {
      console.error("خطا در ثبت سفارش:", err);
      showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 ">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl overflow-y-scroll max-h-[90vh]">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon
                        className="h-6 w-6 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left ">
                      <Dialog.Title
                        as="h3"
                        className="text-lg py-4 font-semibold leading-6 text-gray-900 "
                      >
                        ثبت سفارش جدید
                      </Dialog.Title>
                      <form action="#">
                        <div className="grid gap-4 mb-4">
                          <div>
                            <label
                              htmlFor="shippingAddress"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              آدرس ارسال
                            </label>
                            <textarea
                              id="shippingAddress"
                              rows="3"
                              name="shippingAddress"
                              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="آدرس کامل برای ارسال سفارش..."
                              value={order.shippingAddress}
                              onChange={(e) => handleOrderInputChange(e.target.name, e.target.value)}
                              required
                            ></textarea>
                          </div>

                          <h4 className="text-md font-semibold mt-4 mb-2">محصولات سفارش:</h4>
                          {order.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 border p-3 rounded-lg mb-2">
                              <div className="sm:col-span-2">
                                <label
                                  htmlFor={`productID-${index}`}
                                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                  محصول
                                </label>
                                <select
                                  id={`productID-${index}`}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                  name="productID"
                                  value={item.productID}
                                  onChange={(e) => handleItemChange(index, e.target.name, e.target.value)}
                                  required
                                >
                                  <option value="">انتخاب محصول</option>
                                  {products.map((productElement) => (
                                    <option key={productElement._id} value={productElement._id}>
                                      {productElement.name} (موجودی: {productElement.stock})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label
                                  htmlFor={`quantity-${index}`}
                                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                >
                                  تعداد
                                </label>
                                <input
                                  type="number"
                                  name="quantity"
                                  id={`quantity-${index}`}
                                  value={item.quantity}
                                  onChange={(e) => handleItemChange(index, e.target.name, parseInt(e.target.value) || 0)}
                                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                  placeholder="تعداد"
                                  required
                                  min="1"
                                />
                              </div>
                              {order.items.length > 1 && (
                                <div className="sm:col-span-3 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItemRow(index)}
                                    className="text-red-600 inline-flex items-center hover:text-white border border-red-600 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-1.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                                  >
                                    حذف محصول
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={handleAddItemRow}
                            className="bg-gray-200 text-gray-800 p-2 rounded hover:bg-gray-300 mb-4 text-sm font-medium"
                          >
                            افزودن محصول دیگر
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={addOrder}
                  >
                    ثبت سفارش
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => addOrderModalSetting()}
                    ref={cancelButtonRef}
                  >
                    لغو
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
