import React, { useState, useEffect } from "react";

const statusFlow = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
const dummyItems = ["Samsung", "Macbook", "iPhone", "iPad", "VR"];

export default function OrderManagement() {
  // State Management
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("ALL ORDERS");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemDetails, setItemDetails] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Data Fetching
  const fetchOrdersByStatus = async (status = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = status
        ? `http://localhost:8080/orders?status=${status}`
        : "http://localhost:8080/orders";

      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to fetch orders");

      const data = await response.json();

      setOrders(
        data.map((order) => ({
          orderId: order.orderId,
          date: order.createdAt?.split("T")[0] || "N/A",
          status: order.status || "PENDING",
          items: order.items?.map((i) => i.productName) || [],
        }))
      );
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderById = async (id) => {
    if (!id) {
      fetchOrdersByStatus();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8080/orders/${id}`);

      if (!response.ok) {
        throw new Error(`Order with ID ${id} not found`);
      }

      const data = await response.json();

      setOrders([
        {
          orderId: data.orderId,
          date: data.createdAt?.split("T")[0] || "N/A",
          status: data.status || "PENDING",
          items: data.items?.map((i) => i.productName) || [],
        },
      ]);
    } catch (error) {
      console.error("Fetch error:", error);
      setError(error.message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    if (searchId) {
      fetchOrderById(searchId);
    } else {
      fetchOrdersByStatus();
    }
  }, [refreshKey]);

  // Order Creation
  const handleCreateOrder = async () => {
    try {
      if (selectedItems.length === 0) {
        alert("Please select at least one item");
        return;
      }

      const items = selectedItems.map((itemName) => ({
        productName: itemName,
        quantity: Number(itemDetails[itemName]?.quantity) || 1,
        price: Number(itemDetails[itemName]?.price) || 0.0,
      }));

      const response = await fetch("http://localhost:8080/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const newOrder = await response.json();

      setOrders((prev) => [
        {
          orderId: newOrder.orderId,
          date: newOrder.createdAt.split("T")[0],
          status: newOrder.status,
          items: newOrder.items.map((i) => i.productName),
        },
        ...prev,
      ]);

      setIsCreateModalOpen(false);
      setSelectedItems([]);
      setItemDetails({});
      setRefreshKey((prev) => prev + 1);
      alert("Order created successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Order creation failed:", error);
      alert(`Error: ${error.message}`);
    }
  };

  // Order Actions
  const deleteOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:8080/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete order");

      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
      setIsModalOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete order");
    }
  };

  const advanceOrderStatus = async (orderId) => {
    try {
      const currentOrder = orders.find((order) => order.orderId === orderId);
      const newStatus = statusFlow[statusFlow.indexOf(currentOrder.status) + 1];

      const response = await fetch(
        `http://localhost:8080/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Status update failed");

      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId ? { ...order, status: newStatus } : order
        )
      );

      setIsModalOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update status");
    }
  };

  // Event Handlers
  const handleItemSelect = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleDetailChange = (itemName, field, value) => {
    setItemDetails((prev) => ({
      ...prev,
      [itemName]: { ...prev[itemName], [field]: value },
    }));
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
    setRefreshKey((prev) => prev + 1);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSearch = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-indigo-700 p-4 text-3xl font-bold">
        Order Management
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="bg-white text-black w-60 p-6">
          <ul className="space-y-4">
            {["ALL ORDERS", ...statusFlow].map((f) => (
              <li
                key={f}
                className={`cursor-pointer hover:underline ${
                  filter === f ? "font-bold" : ""
                }`}
                onClick={() => {
                  setFilter(f);
                  setSearchId("");
                  fetchOrdersByStatus(f === "ALL ORDERS" ? null : f);
                }}
              >
                {f}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gray-100 p-6">
          {/* Toolbar */}
          <div className="bg-white p-4 rounded-xl shadow mb-6 flex justify-between items-center">
            <input
              type="text"
              placeholder="Enter Order ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="border px-4 py-2 rounded-xl shadow placeholder-gray-400 text-black"
            />
            <div className="space-x-2">
              <button
                className="bg-blue-800 border px-4 py-2 rounded-xl shadow hover:bg-black text-white"
                onClick={handleSearch}
              >
                Search Order
              </button>
              <button
                className="bg-green-800 border px-4 py-2 rounded-xl shadow hover:bg-black text-white"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Order
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white p-4 rounded-xl shadow">
            {isLoading ? (
              <div className="text-black p-4">Loading orders...</div>
            ) : error ? (
              <div className="text-red-500 p-4">
                Error: {error}
                <button
                  onClick={() => setRefreshKey((prev) => prev + 1)}
                  className="ml-4 px-4 py-2 bg-red-100 hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            ) : (
              <table className="w-full border-collapse text-black">
                <thead>
                  <tr>
                    <th className="border p-2">ID</th>
                    <th className="border p-2">Date</th>
                    <th className="border p-2">Status</th>
                    <th className="border p-2">Items</th>
                    <th className="border p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="border p-2">{order.orderId}</td>
                      <td className="border p-2">{order.date}</td>
                      <td className="border p-2">{order.status}</td>
                      <td className="border p-2">{order.items.join(", ")}</td>
                      <td className="border p-2">
                        <button
                          className="bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                          onClick={() => handleView(order)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-11/12 max-w-md relative text-black">
            <button
              onClick={closeCreateModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Create New Order</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Items
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {dummyItems.map((item) => (
                    <div
                      key={item}
                      className="flex flex-col space-y-2 p-2 border rounded"
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={item}
                          checked={selectedItems.includes(item)}
                          onChange={() => handleItemSelect(item)}
                          className="w-4 h-4"
                        />
                        <label
                          htmlFor={item}
                          className="select-none font-medium"
                        >
                          {item}
                        </label>
                      </div>

                      {selectedItems.includes(item) && (
                        <div className="flex space-x-4 ml-6">
                          <div>
                            <label className="text-sm">Quantity:</label>
                            <input
                              type="number"
                              min="1"
                              value={itemDetails[item]?.quantity || ""}
                              onChange={(e) =>
                                handleDetailChange(
                                  item,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="w-20 border rounded p-1"
                            />
                          </div>
                          <div>
                            <label className="text-sm">Price:</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={itemDetails[item]?.price || ""}
                              onChange={(e) =>
                                handleDetailChange(
                                  item,
                                  "price",
                                  e.target.value
                                )
                              }
                              className="w-24 border rounded p-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  onClick={closeCreateModal}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleCreateOrder}
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-11/12 max-w-md relative text-black">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3">
              <p>
                <strong>ID:</strong> {selectedOrder.orderId}
              </p>
              <p>
                <strong>Date:</strong> {selectedOrder.date}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Items:</strong> {selectedOrder.items.join(", ")}
              </p>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              {selectedOrder.status !== "DELIVERED" &&
                selectedOrder.status !== "CANCELLED" && (
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => advanceOrderStatus(selectedOrder.orderId)}
                  >
                    Move to{" "}
                    {statusFlow[statusFlow.indexOf(selectedOrder.status) + 1]}
                  </button>
                )}

              {selectedOrder.status === "PENDING" && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => deleteOrder(selectedOrder.orderId)}
                >
                  Delete Order
                </button>
              )}

              <button
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
