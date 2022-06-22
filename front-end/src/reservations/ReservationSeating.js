import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { listTables, readReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { updateTable } from "../utils/api";

function ReservationSeating() {
  const history = useHistory();
  const { reservation_id } = useParams();
  const initialState = { table_id: "" };

  const [reservation, setReservation] = useState([]);
  const [tables, setTables] = useState([]);
  const [seat, setSeat] = useState({ ...initialState });
  const [error, setError] = useState(null);

  useEffect(loadSeating, [reservation_id]);

  function loadSeating() {
    const abortController = new AbortController();
    setError(null);
    readReservation(reservation_id, abortController.signal)
      .then(setReservation)
      .catch(setError);
    listTables(abortController.signal).then(setTables).catch(setError);
    return () => abortController.abort();
  }

  function changeHandler(e) {
    const value = Number(e.target.value);
    setSeat({ ...seat, [e.target.name]: value });
  }

  function submitHandler(e) {
    e.preventDefault();
    const abortController = new AbortController();
    updateTable(reservation_id, seat, abortController.signal)
      .then(() => history.push(`/dashboard`))
      .catch(setError);
    return () => abortController.abort();
  }

  function cancelHandler() {
    history.goBack();
  }

  return (
    <main>
      <h1>Seat Reservation</h1>
      <ErrorAlert error={error} />
      <h3>
        # {reservation.reservation_id} - {reservation.first_name}{" "}
        {reservation.last_name} on {reservation.reservation_date} at{" "}
        {reservation.reservation_time} for {reservation.people}
      </h3>
      <form onSubmit={submitHandler}>
        <div className="row">
          <div className="form-group col">
            <label htmlFor="table_id">Seat at:</label>
            <select
              className="form-control"
              id="table_id"
              name="table_id"
              required
              onChange={changeHandler}
            >
              <option value="" disabled selected>
                Select a table
              </option>
              {tables.map((table) => (
                <option key={table.table_id} value={table.table_id}>
                  {table.table_name} - {table.capacity}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary mr-2"
          onClick={cancelHandler}
        >
          <span className="oi oi-x" /> Cancel
        </button>

        <button type="submit" className="btn btn-primary">
          <span className="oi oi-check" /> Submit
        </button>
      </form>
    </main>
  );
}

export default ReservationSeating;
