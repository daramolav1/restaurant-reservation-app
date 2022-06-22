import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ReservationForm from "./ReservationForm";
import ReservationErrors from "./ReservationErrors";
import { updateReservation } from "../utils/api";

function ReservationEdit() {
  const history = useHistory();

  const { reservation_id } = useParams();

  const [error, setError] = useState(null);

  function submitHandler(reservation) {
    const abortController = new AbortController();
    updateReservation(reservation, abortController.signal)
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
    <div>
      <h1>Edit Reservation #{reservation_id}</h1>
      <ReservationErrors errors={error} />
      <ReservationForm
        onSubmit={submitHandler}
        onCancel={cancelHandler}
        setError={setError}
      />
    </div>
  );
}

export default ReservationEdit;
