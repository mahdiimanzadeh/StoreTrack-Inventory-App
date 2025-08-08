// src/pages/Register.js
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UploadImage from "../components/UploadImage"; // فرض می‌کنیم این کامپوننت وجود دارد

function Register({ showNotification }) { // دریافت showNotification به عنوان prop
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    imageUrl: "",
  });

  const navigate = useNavigate();

  // Handling Input change for registration form.
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Register User
  const registerUser = async (e) => {
    e.preventDefault(); // جلوگیری از رفرش صفحه

    // اعتبارسنجی اولیه فرم
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.phoneNumber) {
      showNotification("لطفاً تمام فیلدهای الزامی را پر کنید.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", { // مسیر API به روز شده
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification("ثبت نام با موفقیت انجام شد! حالا می‌توانید وارد شوید.", "success");
        navigate('/login'); // هدایت به صفحه ورود
      } else {
        showNotification(data.message || "خطا در ثبت نام. لطفاً دوباره تلاش کنید.", "error");
      }
    } catch (err) {
      console.error("خطا در ثبت نام:", err);
      showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  // Uploading image to cloudinary (بدون تغییر)
  const uploadImage = async (image) => {
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "inventoryapp"); // این 'inventoryapp' باید در تنظیمات Cloudinary شما باشد

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/ddhayhptm/image/upload", { // 'ddhayhptm' باید Cloud Name شما باشد
        method: "POST",
        body: data,
      });
      const resultData = await res.json();
      setForm({ ...form, imageUrl: resultData.url });
      showNotification("تصویر با موفقیت آپلود شد!", "success");
    } catch (error) {
      console.error("خطا در آپلود تصویر:", error);
      showNotification("خطا در آپلود تصویر. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 h-screen items-center place-items-center">
        <div className="flex justify-center order-first sm:order-last"> {/* ترتیب تصویر و فرم برای موبایل */}
          <img src={require("../assets/signup.jpg")} alt="تصویر ثبت نام" className="max-w-full h-auto" /> {/* اضافه شدن کلاس‌های ریسپانسیو */}
        </div>
        <div className="w-full max-w-md space-y-8 p-10 rounded-lg shadow-lg bg-white"> {/* اضافه شدن shadow-lg و bg-white */}
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src={require("../assets/logo.png")}
              alt="لوگوی سامانه"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              ثبت نام حساب کاربری
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={registerUser}> {/* onSubmit به registerUser تغییر یافت */}
            <div className="flex flex-col gap-4"> {/* حذف -space-y-px rounded-md shadow-sm */}
              <div className="flex gap-4">
                <input
                  name="firstName"
                  type="text"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="نام"
                  value={form.firstName}
                  onChange={handleInputChange}
                />
                <input
                  name="lastName"
                  type="text"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="نام خانوادگی"
                  value={form.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="آدرس ایمیل"
                  value={form.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password" // تغییر به new-password برای مرورگرها
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="رمز عبور"
                  value={form.password}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  name="phoneNumber"
                  type="number" // تغییر به number
                  autoComplete="tel" // تغییر به tel
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="شماره تلفن"
                  value={form.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <UploadImage uploadImage={uploadImage} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="agree-terms" // تغییر id برای وضوح بیشتر
                  name="agree-terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  required // الزامی کردن پذیرش شرایط
                />
                <label
                  htmlFor="agree-terms"
                  className="ml-2 block text-sm text-gray-900"
                >
                  با شرایط و ضوابط موافقم
                </label>
              </div>

              <div className="text-sm">
                <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                  رمز عبور را فراموش کرده‌اید؟
                </span>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                </span>
                ثبت نام
              </button>
              <p className="mt-2 text-center text-sm text-gray-600">
                یا{" "}
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  قبلاً حساب کاربری دارید؟
                  <Link to="/login"> همین حالا وارد شوید </Link>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;
