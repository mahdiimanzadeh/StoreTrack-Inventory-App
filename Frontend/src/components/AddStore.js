// src/components/AddStore.js
import { Fragment, useRef, useState, useContext } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import UploadImage from "./UploadImage";
import AuthContext from "../AuthContext";

export default function AddStore({ modalSetting, showNotification }) {
  // Read userId from authContext.user and set it in the initial state
  const authContext = useContext(AuthContext);
  const [form, setForm] = useState({
    userId: authContext.user ? authContext.user._id : "",
    name: "",
    category: "",
    address: "",
    city: "",
    image: "",
  });

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  const addStore = async () => {
    if (!form.name || !form.category || !form.address || !form.city || !form.image) {
      showNotification("لطفاً تمام فیلدهای نام، دسته‌بندی، آدرس، شهر و تصویر را پر کنید.", "error");
      return;
    }

    // Read token and userId directly from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    const userId = storedUser ? storedUser._id : null; // We also need userId to send in the body

    if (!userToken || !userId) {
      showNotification("برای افزودن فروشگاه، لطفاً وارد شوید.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/store/add", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "Authorization": `Bearer ${userToken}` // Send token
        },
        body: JSON.stringify({ ...form, userID: userId }), // Ensure correct userID is sent
      });

      if (response.ok) {
        showNotification("فروشگاه با موفقیت اضافه شد!", "success");
        modalSetting();
      } else {
        const errorData = await response.json();
        showNotification(errorData.message || "خطا در افزودن فروشگاه. لطفاً دوباره تلاش کنید.", "error");
      }
    } catch (err) {
      console.error("خطا در افزودن فروشگاه:", err);
      showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  const uploadImage = async (image) => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "inventoryapp");

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/ddhayhptm/image/upload", {
        method: "POST",
        body: data,
      });
      const resultData = await res.json();
      setForm({ ...form, image: resultData.url });
      showNotification("تصویر فروشگاه با موفقیت آپلود شد!", "success");
    } catch (error) {
      console.error("خطا در آپلود تصویر:", error);
      showNotification("خطا در آپلود تصویر. لطفاً دوباره تلاش کنید.", "error");
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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
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
                        className="text-lg font-semibold leading-6 text-gray-900 "
                      >
                        افزودن اطلاعات فروشگاه
                      </Dialog.Title>
                      <form action="#">
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="name"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              نام فروشگاه
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={form.name}
                              onChange={handleInputChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="مثال: فروشگاه مرکزی"
                              required
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="city"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              شهر
                            </label>
                            <input
                              type="text"
                              name="city"
                              id="city"
                              value={form.city}
                              onChange={handleInputChange}
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="مثال: تهران"
                              required
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="category"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              دسته‌بندی
                            </label>
                            <select
                              id="category"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  category: e.target.value,
                                })
                              }
                              required
                            >
                              <option value="">انتخاب دسته‌بندی</option>
                              <option value="Electronics">الکترونیک</option>
                              <option value="Groceries">خواربار</option>
                              <option value="Wholesale">عمده‌فروشی</option>
                              <option value="SuperMart">سوپرمارکت</option>
                              <option value="Phones">تلفن همراه</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label
                              htmlFor="address"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              آدرس
                            </label>
                            <textarea
                              id="address"
                              rows="5"
                              name="address"
                              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                              placeholder="آدرس کامل فروشگاه..."
                              value={form.address}
                              onChange={handleInputChange}
                              required
                            ></textarea>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div>
                            <UploadImage uploadImage={uploadImage} />
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
                    onClick={addStore}
                  >
                    افزودن فروشگاه
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => modalSetting()}
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
