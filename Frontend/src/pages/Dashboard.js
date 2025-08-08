// src/pages/Dashboard.js
import React, { useContext, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import AuthContext from "../AuthContext";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard({ showNotification }) {
  const [totalSaleAmount, setTotalSaleAmount] = useState(0);
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [monthlySalesData, setMonthlySalesData] = useState([]);
  const [productCategoryData, setProductCategoryData] = useState({
    labels: [],
    datasets: [{
      label: 'تعداد محصولات',
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    }],
  });

  const authContext = useContext(AuthContext);

  const [chartOptions, setChartOptions] = useState({
    chart: {
      id: "monthly-sales-bar",
    },
    xaxis: {
      categories: [
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
      ],
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
      }
    },
    title: {
      text: 'نمودار فروش ماهانه (ریال)',
      align: 'left'
    },
    dataLabels: {
        enabled: false
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return val.toLocaleString('fa-IR') + " ریال"
            }
        }
    }
  });

  const [chartSeries, setChartSeries] = useState([
    {
      name: "مبلغ فروش ماهانه",
      data: [],
    },
  ]);

  useEffect(() => {
    // این useEffect اکنون فقط وقتی authContext.user تغییر کند، اجرا می‌شود
    // توکن و userId مستقیماً در توابع fetch خوانده می‌شوند
    if (authContext.user) { // اطمینان از اینکه کاربر لاگین است
      fetchDashboardData();
    }
  }, [authContext.user]);

  const fetchDashboardData = async () => {
    // توکن و userId را مستقیماً از localStorage بخوانید
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    const userId = storedUser ? storedUser._id : null;

    if (!userToken || !userId) {
      showNotification("برای دسترسی به این بخش، لطفاً وارد شوید.", "error");
      return;
    }

    try {
      // Fetching total sales amount (from new reports API)
      const salesResponse = await fetch(
        `http://localhost:5000/api/reports/sales/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const salesData = await salesResponse.json();
      if (salesResponse.ok) {
        setTotalSaleAmount(salesData.totalSalesAmount);
      } else {
        showNotification(salesData.message || "خطا در دریافت مجموع فروش.", "error");
      }

      // Fetching total purchase amount (from new reports API)
      const purchaseResponse = await fetch(
        `http://localhost:5000/api/reports/purchases/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const purchaseData = await purchaseResponse.json();
      if (purchaseResponse.ok) {
        setTotalPurchaseAmount(purchaseData.totalPurchaseAmount);
      } else {
        showNotification(purchaseData.message || "خطا در دریافت مجموع خرید.", "error");
      }

      // Fetching all stores data
      const storesResponse = await fetch(
        `http://localhost:5000/api/store/get/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const storesData = await storesResponse.json();
      if (storesResponse.ok) {
        setStores(storesData);
      } else {
        showNotification(storesData.message || "خطا در دریافت اطلاعات فروشگاه‌ها.", "error");
      }

      // Fetching Data of All Products
      const productsResponse = await fetch(
        `http://localhost:5000/api/product/get/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const productsData = await productsResponse.json();
      if (productsResponse.ok) {
        setProducts(productsData);
        updateProductCategoryChart(productsData);
      } else {
        showNotification(productsData.message || "خطا در دریافت اطلاعات محصولات.", "error");
      }

      // Fetching Monthly Sales (from new reports API)
      const monthlySalesResponse = await fetch(
        `http://localhost:5000/api/reports/sales/${userId}?startDate=${new Date(new Date().getFullYear(), 0, 1).toISOString()}&endDate=${new Date(new Date().getFullYear(), 11, 31).toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      const monthlySalesJson = await monthlySalesResponse.json();
      if (monthlySalesResponse.ok) {
        const aggregatedSales = Array(12).fill(0);
        monthlySalesJson.salesDetails.forEach(order => {
            const monthIndex = new Date(order.orderDate).getMonth();
            aggregatedSales[monthIndex] += order.totalAmount;
        });

        setMonthlySalesData(aggregatedSales);
        setChartSeries([
          {
            name: "مبلغ فروش ماهانه",
            data: aggregatedSales,
          },
        ]);
      } else {
        showNotification(monthlySalesJson.message || "خطا در دریافت فروش ماهانه.", "error");
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showNotification("مشکلی در اتصال به سرور پیش آمد. لطفاً دوباره تلاش کنید.", "error");
    }
  };

  const updateProductCategoryChart = (productsList) => {
    const categoryMap = {};
    productsList.forEach(product => {
      categoryMap[product.category] = (categoryMap[product.category] || 0) + 1;
    });

    const labels = Object.keys(categoryMap);
    const data = Object.values(categoryMap);

    const backgroundColors = labels.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`);
    const borderColors = labels.map((color) => color.replace('0.6', '1'));

    setProductCategoryData({
      labels: labels,
      datasets: [{
        label: 'تعداد محصولات',
        data: data,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      }],
    });
  };


  return (
    <div className="grid grid-cols-1 col-span-12 lg:col-span-10 gap-6 md:grid-cols-3 lg:grid-cols-4 p-4">
        {/* کارت مجموع فروش */}
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="inline-flex gap-2 self-end rounded bg-green-100 p-1 text-green-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span className="text-xs font-medium"> فروش کل </span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">
              مجموع فروش
            </strong>
            <p>
              <span className="text-2xl font-medium text-gray-900">
                {totalSaleAmount.toLocaleString('fa-IR')} ریال
              </span>
            </p>
          </div>
        </article>

        {/* کارت مجموع خرید */}
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="inline-flex gap-2 self-end rounded bg-blue-100 p-1 text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
              />
            </svg>
            <span className="text-xs font-medium"> خرید کل </span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">
              مجموع خرید
            </strong>
            <p>
              <span className="text-2xl font-medium text-gray-900">
                {totalPurchaseAmount.toLocaleString('fa-IR')} ریال
              </span>
            </p>
          </div>
        </article>

        {/* کارت مجموع محصولات */}
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="inline-flex gap-2 self-end rounded bg-purple-100 p-1 text-purple-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354V18.646M12 4.354a8.987 8.987 0 00-8.614 8.614M12 4.354a8.987 8.987 0 018.614 8.614M12 18.646a8.987 8.987 0 008.614-8.614M12 18.646a8.987 8.987 0 01-8.614-8.614"
              />
            </svg>
            <span className="text-xs font-medium"> محصولات </span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">
              تعداد کل محصولات
            </strong>
            <p>
              <span className="text-2xl font-medium text-gray-900">
                {products.length}
              </span>
            </p>
          </div>
        </article>

        {/* کارت مجموع فروشگاه‌ها */}
        <article className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-white p-6 shadow-sm">
          <div className="inline-flex gap-2 self-end rounded bg-yellow-100 p-1 text-yellow-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2m7-4h.01M7 16h.01"
              />
            </svg>
            <span className="text-xs font-medium"> فروشگاه‌ها </span>
          </div>
          <div>
            <strong className="block text-sm font-medium text-gray-500">
              تعداد کل فروشگاه‌ها
            </strong>
            <p>
              <span className="text-2xl font-medium text-gray-900">
                {stores.length}
              </span>
            </p>
          </div>
        </article>

        {/* نمودارها */}
        <div className="flex flex-wrap justify-around bg-white rounded-lg py-8 col-span-full shadow-sm">
          <div className="w-full md:w-1/2 p-4">
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height="350"
            />
          </div>
          <div className="w-full md:w-1/2 p-4 flex justify-center items-center">
            <div className="max-w-xs w-full">
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">محصولات بر اساس دسته‌بندی</h3>
              <Doughnut data={productCategoryData} />
            </div>
          </div>
        </div>
      </div>
  );
}

export default Dashboard;
