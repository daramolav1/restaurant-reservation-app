import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ReservationForm from "./ReservationForm";
import ReservationErrors from "./ReservationErrors";
import { createReservation } from "../utils/api";

function ReservationCreate() {
  const history = useHistory();

  const [error, setError] = useState(null);

  function submitHandler(reservation) {
    const abortController = new AbortController();
    setError(null);
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
      <ReservationErrors errors={error} />
      <ReservationForm
        onSubmit={submitHandler}
        onCancel={cancelHandler}
        setError={setError}
      />
    </main>
  );
}

export default ReservationCreate;
