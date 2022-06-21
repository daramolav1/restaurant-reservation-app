import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ReservationForm from "./ReservationForm";
import ErrorAlert from "../layout/ErrorAlert";
import { createReservation } from "../utils/api";

function ReservationCreate() {
  const history = useHistory();

  const [error, setError] = useState(null);

  function submitHandler(reservation) {
    const abortController = new AbortController();
    createReservation(reservation, abortController.signal)
      .then(() =>
        history.push(`/dashboard?date=${reservation.reservation_date}`)
      )
      .catch(setError);
    return () => abortController.abort();
  }

  function cancelHandler() {
    history.goBack();
  }

  return (
    <main>
      <h1>Create Reservation</h1>
      <ErrorAlert error={error} />
      <ReservationForm onSubmit={submitHandler} onCancel={cancelHandler} />
    </main>
  );
}

export default ReservationCreate;
