import React, { useState } from "react";

function TableForm({ onSubmit, onCancel }) {
  const initialState = {
    table_name: "",
    capacity: "",
  };
  const [table, setTable] = useState(initialState);

  function changeHandler(e) {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setTable({
      ...table,
      [e.target.name]: value,
    });
  }

  function submitHandler(e) {
    e.preventDefault();
    onSubmit(table);
  }

  return (
    <form onSubmit={submitHandler}>
      <div className="row">
        <div className="form-group col">
          <label htmlFor="table_name">Table Name</label>
          <input
            type="text"
            name="table_name"
            id="table_name"
            minLength="2"
            className="form-control"
            placeholder="Table Name"
            required
            onChange={changeHandler}
            value={table.table_name}
          />
        </div>

        <div className="form-group col">
          <label htmlFor="capacity">Capacity</label>
          <input
            type="number"
            name="capacity"
            id="capacity"
            min="1"
            className="form-control"
            required
            onChange={changeHandler}
            value={table.capacity}
          />
        </div>
      </div>

      <button
        type="button"
        className="btn btn-secondary mr-2"
        onClick={onCancel}
      >
        <span className="oi oi-x" /> Cancel
      </button>
      <button type="submit" className="btn btn-primary">
        <span className="oi oi-check" /> Submit
      </button>
    </form>
  );
}

export default TableForm;
