import React, { useRef } from "react";
import { DataTable, DT } from "../utils/datatables-imports";
import AddWispayCredit from "../modals/AddWispayCredit.jsx";
import { useWispayContext } from "../utils/WispayContext";

DataTable.use(DT);

const Wispay = () => {
  const { wispayData: data, lastUpdated, loading, error, fetchFreshData } = useWispayContext();
  const dataTableRef = useRef(null);

  const columns = [
    { title: "ID", data: "id", visible: false },
    { title: "First Name", data: "fname" },
    { title: "Last Name", data: "lname" },
    { title: "Position", data: "position" },
    { title: "RFID", data: "rfid" },
    {
      title: "Balance",
      data: "balance",
      render: (data) => `₱${parseFloat(data).toFixed(2)}`,
    },
  ];

  return (
    <div className="wispay-wrapper">
      <div className="wispay-header d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2>Wispay Users</h2>
          {lastUpdated && (
            <small className="text-muted">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </small>
          )}
        </div>
        <AddWispayCredit onSuccess={fetchFreshData} />
      </div>

      <div className="datatable-container">
        {loading && !data.length ? (
          <div className="text-center my-5 py-5">
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading user data...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger text-center my-5">
            Error loading data: {error}
          </div>
        ) : (
          <>
            <DataTable
              className="display cell-border"
              columns={columns}
              data={data}
              ref={dataTableRef}
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
                    className: "dt-right",
                  },
                ],
              }}
            />
            {data.length > 0 && (
              <div className="text-end mt-2 text-muted small">
                Showing {data.length} users
                {lastUpdated && ` • Updated at ${lastUpdated.toLocaleTimeString()}`}
                <span className="ms-2">(Balances update every 5 seconds)</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Wispay;