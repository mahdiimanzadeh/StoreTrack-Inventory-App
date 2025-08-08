// src/components/AddTransaction.js
import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function AddTransaction({
  addTransactionModalSetting,
  products,
  handlePageUpdate,
  authContext,
  showNotification,
}) {
  // userID را از authContext.user می‌خوانیم و در state اولیه قرار می‌دهیم
  const [transaction, setTransaction] = useState({
    userID: authContext.user ? authContext.user._id : "",
    productID: "",
    quantity: "",
    transactionDate: new Date().toISOString().split('T')[0],
    type: "in",
    description: "",
  });
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const handleInputChange = (key, value) => {
    setTransaction({ ...transaction, [key]: value });
  };

  const addTransaction = async () => {
    if (!transaction.productID || !transaction.quantity || !transaction.transactionDate || transaction.quantity <= 0) {
      showNotification("لطفاً تمام فیلدهای محصول، تعداد و تاریخ را پر کنید و تعداد مثبت باشد.", "error");
      return;
    }

    // توکن و userId را مستقیماً از localStorage بخوانید
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    const userId = storedUser ? storedUser._id : null; // userId را برای ارسال در body نیز نیاز داریم

    if (!userToken || !userId) {
      showNotification("برای افزودن تراکنش، لطفاً وارد شوید.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/transactions/addManual", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${userToken}` // ارسال توکن
        },
        body: JSON.stringify({ ...transaction, userID: userId }), // اطمینان از ارسال userID صحیح
      });

      if (response.ok) {
        showNotification("تراکنش ورود کالا با موفقیت اضافه شد!", "success");
        handlePageUpdate();
        addTransactionModalSetting();
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || "خطا در افزودن تراکنش ورود کالا. لطفاً دوباره تلاش کنید.", "error");
      }
    } catch (err) {
      console.error("خطا در افزودن تراکنش ورود کالا:", err);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg overflow-y-scroll">
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
                        className="text-lg  py-4 font-semibold leading-6 text-gray-900 "
                      >
                        افزودن تراکنش ورود کالا
                      </Dialog.Title>
                      <form action="#">
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="productID"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              نام محصول
                            </label>
                            <select
                              id="productID"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              name="productID"
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              required
                            >
                              <option value="">انتخاب محصول</option>
                              {products.map((element) => {
                                return (
                                  <option key={element._id} value={element._id}>
                                    {element.name} (موجودی: {element.stock})
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div>
                            <label
                              htmlFor="quantity"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              تعداد وارد شده
                            </label>
                            <input
                              type="number"
                              name="quantity"
                              id="quantity"
                              value={transaction.quantity}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="مثال: 100"
                              required
                              min="1"
                            />
                          </div>
                          <div>
                            <label
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              htmlFor="transactionDate"
                            >
                              تاریخ تراکنش
                            </label>
                            <input
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              type="date"
                              id="transactionDate"
                              name="transactionDate"
                              value={transaction.transactionDate}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label
                              htmlFor="description"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              توضیحات (اختیاری)
                            </label>
                            <textarea
                              id="description"
                              rows="3"
                              name="description"
                              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="توضیحات مربوط به ورود کالا..."
                              value={transaction.description}
                              onChange={(e) =>
                                handleInputChange(e.target.name, e.target.value)
                              }
                            ></textarea>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={addTransaction}
                  >
                    افزودن تراکنش
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => addTransactionModalSetting()}
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
