import React, { useState, useEffect } from "react";
import { DataTable, DT } from "../utils/datatables-imports";
import AddWispayCredit from "../modals/AddWispayCredit.jsx";

DataTable.use(DT);

const Wispay = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const URl = process.env.REACT_APP_URL || "";
        const res = await fetch(`${URl}/api/wispay/user`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const response = await res.json();
        setData(response.users || []);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error(err);
        setError(err.message); // Set error message
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const columns = [
    { title: "ID", data: "id", visible: false },
    { title: "First Name", data: "fname" },
    { title: "Last Name", data: "lname" },
    { title: "Position", data: "position" },
    { title: "RFID", data: "rfid" },
    {
      title: "Balance",
      data: "balance",
      render: (data) => `₱${parseFloat(data).toFixed(2)}`
    }
  ];

  return (
    <div className="wispay-wrapper">
      <div className="wispay-header d-flex justify-content-between align-items-center mb-3">
        <h2>Wispay Users</h2>
        <AddWispayCredit />
      </div>

      <div className="datatable-container">
        {loading ? (
          <div className="text-center my-5 py-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading user data...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center my-5">
            Error loading data: {error}
          </div>
        ) : (
          <DataTable
            className="display cell-border"
            columns={columns}
            data={data}
            options={{
              responsive: true,
              select: true,
              dom: '<"d-flex justify-content-between"lf>rt<"d-flex justify-content-between"ip>B',
              buttons: ["copy", "csv", "excel", "pdf", "print", "colvis"],
              autoWidth: false,
              pageLength: 10,
              lengthChange: true,
              order: [[1, "asc"]],
              columnDefs: [
                {
                  targets: -1,
                  className: "dt-right"
                }
              ]
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Wispay;