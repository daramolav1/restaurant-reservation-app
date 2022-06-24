import React, { useEffect, useState } from "react";
import {
  listReservations,
  listTables,
  finishTable,
  cancelReservation,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { Link } from "react-router-dom";
import { previous, today, next } from "../utils/date-time";
import Reservations from "./Reservations";
import Tables from "./Tables";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */

function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const [tablesError, setTablesError] = useState(null);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    setTablesError(null);
    listTables().then(setTables).catch(setTablesError);
    return () => abortController.abort();
  }

  function onFinish(table_id) {
    finishTable(table_id).then(loadDashboard).catch(setTablesError);
  }

  function onCancel(reservation_id) {
    const abortController = new AbortController();
    cancelReservation(reservation_id, abortController.signal)
      .then(loadDashboard)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="row">
        <div className="col-md-6 col-lg-6 col-sm-12">
          <div className="d-md-flex mb-3">
            <h4 className="mb-0">Reservations for {date}</h4>
          </div>
          <ErrorAlert error={reservationsError} />
          <div className="btn-group" role="group" aria-label="Group for dates">
            <Link
              to={`/dashboard?date=${previous(date)}`}
              className="btn btn-secondary"
            >
              <span className="oi oi-chevron-left" /> Previous
            </Link>
            <Link
              to={`/dashboard?date=${today()}`}
              className="btn btn-secondary"
            >
              Today
            </Link>
            <Link
              to={`/dashboard?date=${next(date)}`}
              className="btn btn-secondary"
            >
              Next <span className="oi oi-chevron-right" />
            </Link>
          </div>
          <Reservations reservations={reservations} onCancel={onCancel} />
        </div>

        <div className="col-md-6 col-lg-6 col-sm-12">
          <ErrorAlert error={tablesError} />
          <Tables tables={tables} onFinish={onFinish} />
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
