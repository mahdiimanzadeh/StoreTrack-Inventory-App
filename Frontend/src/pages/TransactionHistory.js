// src/pages/TransactionHistory.js
import React, { useState, useEffect, useContext } from "react";
import AddTransaction from "../components/AddTransaction";
import AuthContext from "../AuthContext";

function TransactionHistory({ showNotification }) {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactions, setAllTransactions] = useState([]);
  const [products, setAllProducts] = useState([]);
  const [updatePage, setUpdatePage] = useState(true);
  const [loading, setLoading] = useState(true); // Added loading state

  const authContext = useContext(AuthContext);

  useEffect(() => {
    console.log("TransactionHistory: useEffect triggered for data fetch.");
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userToken = storedUser ? storedUser.token : null;
    const userId = storedUser ? storedUser._id : null;

    console.log("TransactionHistory: userToken (from localStorage):", userToken ? "Present" : "Missing");
    console.log("TransactionHistory: userId (from localStorage):", userId);

    const fetchData = async () => {
      if (!userToken || !userId) {
        setAllTransactions([]);
        setAllProducts([]);
        setLoading(false);
        showNotification("To access the transaction history, please log in.", "error");
        return;
      }

      setLoading(true); // Start loading before fetching data
      try {
        // Execute both API calls simultaneously
        const [transactionsResponse, productsResponse] = await Promise.all([
          fetch(`http://localhost:5000/api/transactions/get/${userId}`, {
            headers: { "Authorization": `Bearer ${userToken}` }
          }),
          fetch(`http://localhost:5000/api/product/get/${userId}`, {
            headers: { "Authorization": `Bearer ${userToken}` }
          })
        ]);

        // Process transactions response
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setAllTransactions(transactionsData);
          console.log("TransactionHistory: Transactions fetched successfully.");
        } else {
          const errorData = await transactionsResponse.json();
          showNotification(errorData.message || "Error fetching transaction history.", "error");
          console.error("TransactionHistory: API error for transactions:", errorData.message);
        }

        // Process products response
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setAllProducts(productsData);
          console.log("TransactionHistory: Products fetched successfully.");
        } else {
          const errorData = await productsResponse.json();
          showNotification(errorData.message || "Error fetching products.", "error");
          console.error("TransactionHistory: API error for products:", errorData.message);
        }

      } catch (err) {
        console.error("TransactionHistory: Network error during data fetch:", err);
        showNotification("There was a problem connecting to the server. Please try again.", "error");
      } finally {
        setLoading(false); // End loading in any case
      }
    };

    fetchData(); // Call the fetch data function in useEffect
  }, [updatePage, authContext.user]); // Dependency on updatePage and authContext.user


  const addTransactionModalSetting = () => {
    setShowTransactionModal(!showTransactionModal);
  };
  
  const handlePageUpdate = () => {
    setUpdatePage(prev => !prev); // Toggle updatePage to trigger useEffect
  };

  if (loading) {
    return (
      <div className="col-span-12 lg:col-span-10 flex justify-center items-center h-screen">
        <h1 className="text-2xl font-bold text-gray-700">Loading transaction history...</h1>
      </div>
    );
  }

  return (
    <div className="col-span-12 lg:col-span-10 flex justify-center">
      <div className="flex flex-col gap-5 w-11/12">
        {showTransactionModal && (
          <AddTransaction
            addTransactionModalSetting={addTransactionModalSetting}
            products={products}
            handlePageUpdate={handlePageUpdate}
            authContext={authContext}
            showNotification={showNotification}
          />
        )}
        <div className="overflow-x-auto rounded-lg border bg-white border-gray-200 mt-5">
          <div className="flex justify-between pt-5 pb-3 px-3">
            <div className="flex gap-4 justify-center items-center ">
              <span className="font-bold text-lg">Transaction History</span>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm rounded-lg shadow-md transition duration-300 ease-in-out"
                onClick={addTransactionModalSetting}
              >
                Add Manual Transaction
              </button>
            </div>
          </div>
          <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Product Name
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Transaction Type
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Quantity
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Date
                </th>
                <th className="whitespace-nowrap px-4 py-2 text-left font-medium text-gray-900">
                  Description
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 && !loading ? ( // Show "No transactions found" message only when data is loaded and empty
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((element) => {
                  return (
                    <tr key={element._id}>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                        {element.productID?.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.type === 'in' ? (
                            <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-2.5 py-0.5 text-green-600">
                                In
                            </span>
                        ) : (
                            <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2.5 py-0.5 text-red-600">
                                Out
                            </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.quantity}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {new Date(element.transactionDate).toLocaleDateString('fa-IR')}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                        {element.description || "-"}
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

export default TransactionHistory;
