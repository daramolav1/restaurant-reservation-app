import React from "react";

function Tables({ onFinish, tables }) {
  function finishHandler({ target: { dataset: { tableIdFinish } } = {} }) {
    const confirmed = window.confirm(
      "Is this table ready to seat new guests?\n\nThis cannot be undone."
    );
    if (confirmed) {
      onFinish(tableIdFinish);
    }
  }

  const tablesList = tables
    .sort((a, b) => (a.table_name > b.table_name ? 1 : -1))
    .map((table) => {
      return (
        <tr key={table.table_id}>
          <td>{table.table_id}</td>
          <td>{table.table_name}</td>
          <td>{table.capacity}</td>
          <td data-table-id-status={table.table_id}>
            {table.reservation_id ? "Occupied" : "Free"}
          </td>
          <td>
            {table.reservation_id ? (
              <button
                className="btn btn-outline-secondary"
                type="button"
                data-table-id-finish={table.table_id}
                onClick={finishHandler}
              >
                Finish
              </button>
            ) : (
              ""
            )}
          </td>
        </tr>
      );
    });

  return (
    <div className="table-responsive">
      <table className="table no-wrap">
        <thead>
          <tr>
            <th className="border-top-0">#</th>
            <th className="border-top-0">TABLE NAME</th>
            <th className="border-top-0">CAPACITY</th>
            <th className="border-top-0">Free?</th>
          </tr>
        </thead>
        <tbody>
          {tablesList.length ? (
            tablesList
          ) : (
            <tr>
              <td colSpan="6">No tables found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Tables;
