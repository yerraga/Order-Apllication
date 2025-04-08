import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const initialOrders = [
  { id: uuidv4(), date: "2025-04-08", status: "Pending", items: ["Item A"] },
  { id: uuidv4(), date: "2025-04-07", status: "Processing", items: ["Item B"] },
  { id: uuidv4(), date: "2025-04-06", status: "Shipped", items: ["Item C"] },
  { id: uuidv4(), date: "2025-04-05", status: "Dispatched", items: ["Item D"] },
];

const statusFlow = ["Pending", "Processing", "Shipped", "Dispatched"]; // Now lowercase
const dummyItems = ["Item A", "Item B", "Item C", "Item D", "Item E"];

export default function OrderManagement() {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("All Orders");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newOrderDate, setNewOrderDate] = useState("");
  const [searchId, setSearchId] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  // Fixed filter logic for lowercase statuses
  const filteredOrders = orders.filter((order) => {
    if (filter !== "All Orders" && order.status !== filter) return false;
    if (searchId && !order.id.includes(searchId)) return false;
    return true;
  });

  const handleView = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const advanceOrderStatus = (orderId) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const currentIndex = statusFlow.indexOf(order.status);
          if (currentIndex < statusFlow.length - 1) {
            return { ...order, status: statusFlow[currentIndex + 1] };
          }
        }
        return order;
      })
    );
    closeModal();
  };

  const deleteOrder = (orderId) => {
    setOrders((prev) =>
      prev.filter(
        (order) => !(order.id === orderId && order.status === "Pending")
      )
    );
    closeModal();
  };

  const handleCreateOrder = () => {
    if (selectedItems.length === 0)
      return alert("Please select at least one item");

    const newOrder = {
      id: uuidv4(),
      date: newOrderDate || new Date().toISOString().split("T")[0],
      status: "Pending",
      items: selectedItems,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setIsCreateModalOpen(false);
    setNewOrderDate("");
    setSelectedItems([]);
  };

  const handleItemSelect = (item) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-indigo-700 p-4 text-3xl font-bold">
        PeerIslands
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <aside className="bg-white text-black w-60 p-6">
          <ul className="space-y-4">
            {[
              "All Orders",
              "Pending",
              "Processing",
              "Shipped",
              "Dispatched",
            ].map((f) => (
              <li
                key={f}
                className={`cursor-pointer hover:underline ${
                  filter === f ? "font-bold" : ""
                }`}
                onClick={() => setFilter(f)}
              >
                {f}
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 bg-gray-100 p-6">
          <div className="bg-white p-4 rounded-xl shadow mb-6 flex justify-between items-center">
            <input
              type="text"
              placeholder="Enter Order ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="border px-4 py-2 rounded-xl shadow placeholder-gray-400 text-black"
            />
            <button
              className="bg-blue-800 border px-4 py-2 rounded-xl shadow hover:bg-black text-white"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Order
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
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
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="border p-2">{order.id.slice(0, 8)}...</td>
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
          </div>
        </main>
      </div>

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-11/12 max-w-md relative text-black">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setIsCreateModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Create New Order</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newOrderDate}
                  onChange={(e) => setNewOrderDate(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Items
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {dummyItems.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={item}
                        checked={selectedItems.includes(item)}
                        onChange={() => handleItemSelect(item)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={item} className="select-none">
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  onClick={() => setIsCreateModalOpen(false)}
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
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={closeModal}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <p>
              <strong>ID:</strong> {selectedOrder.id}
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
            <div className="mt-4 flex justify-end space-x-2">
              {selectedOrder.status !== "Dispatched" && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => advanceOrderStatus(selectedOrder.id)}
                >
                  Move Order to{" "}
                  {statusFlow[statusFlow.indexOf(selectedOrder.status) + 1]}{" "}
                  stage
                </button>
              )}
              {selectedOrder.status === "Pending" && (
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => deleteOrder(selectedOrder.id)}
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
