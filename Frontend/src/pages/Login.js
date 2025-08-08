// src/pages/Login.js
import { useContext, useState, useEffect } from "react"; // Add useEffect
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../AuthContext";

function Login({ showNotification }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  // useEffect to observe changes in user in AuthContext
  useEffect(() => {
    if (authContext.user && authContext.user.token) {
      // If the user is successfully logged in and has a token, redirect to the main page
      navigate("/");
    }
  }, [authContext.user, navigate]); // Depends on changes in authContext.user and navigate

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loginUser = async (e) => {
    e.preventDefault();

    if (form.email === "" || form.password === "") {
      showNotification("لطفاً ایمیل و رمز عبور را وارد کنید.", "error");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification("ورود با موفقیت انجام شد!", "success");
        
        // Save the entire user object (including token) in localStorage
        localStorage.setItem("user", JSON.stringify(data)); 
        
        // Call signin from AuthContext with the entire user object
        // Redirect to navigate("/") moved to the above useEffect
        authContext.signin(data, () => {}); 

      } else {
        showNotification(data.message || "اطلاعات ورود اشتباه است، لطفاً دوباره تلاش کنید.", "error");
      }
    } catch (error) {
      console.error("خطا در هنگام ورود:", error);
      showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 h-screen items-center place-items-center">
        <div className="flex justify-center order-last sm:order-first">
          <img src={require("../assets/Login.png")} alt="تصویر ورود" className="max-w-full h-auto" />
        </div>
        <div className="w-full max-w-md space-y-8 p-10 rounded-lg shadow-lg bg-white">
          <div>
            <img
              className="mx-auto h-12 w-auto"
              src={require("../assets/logo.png")}
              alt="لوگوی سامانه"
            />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              ورود به حساب کاربری
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={loginUser}> {/* onSubmit connected to loginUser */}
            <div>
              <label htmlFor="email-address" className="sr-only">
                آدرس ایمیل
              </label>
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
              <label htmlFor="password" className="sr-only">
                رمز عبور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border-0 py-1.5 px-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="رمز عبور"
                value={form.password}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  مرا به خاطر بسپار
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
                ورود
              </button>
              <p className="mt-2 text-center text-sm text-gray-600">
                یا{" "}
                <span className="font-medium text-indigo-600 hover:text-indigo-500">
                  حساب کاربری ندارید؟{" "}
                  <Link to="/register"> همین حالا ثبت نام کنید </Link>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;
