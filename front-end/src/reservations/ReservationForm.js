import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { readReservation } from "../utils/api";

function ReservationForm({ onSubmit, onCancel, setError }) {
  const { reservation_id } = useParams();

  const initialState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  };

  const [reservation, setReservation] = useState(initialState);

  useEffect(loadReservation, [reservation_id]);

  function loadReservation() {
    const abortController = new AbortController();
    if (reservation_id) {
      readReservation(reservation_id).then(setReservation);
    }
    return () => abortController.abort();
  }

  function validate(reservation) {
    const errors = [];

    function isFutureDate({ reservation_date, reservation_time }) {
      const slot = new Date(`${reservation_date}T${reservation_time}`);
      if (slot < new Date()) {
        errors.push(
          new Error("Reservation date/time must occur in the future")
        );
      }
    }

    function isTuesday({ reservation_date }) {
      const day = new Date(reservation_date).getUTCDay();
      if (day === 2) {
        errors.push(new Error("The restaurant is closed on Tuesday"));
      }
    }

    function isOpenHours({ reservation_time }) {
      const hour = parseInt(reservation_time.split(":")[0]);
      const mins = parseInt(reservation_time.split(":")[1]);

      if (hour <= 10 && mins <= 30) {
        errors.push(new Error("Please select a time after 10:30 am"));
      }

      if (hour >= 22) {
        errors.push(new Error("Please select a time before 10:00 pm"));
      }
    }

    isFutureDate(reservation);
    isTuesday(reservation);
    isOpenHours(reservation);

    return errors;
  }

  function changeHandler(e) {
    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setReservation({
      ...reservation,
      [e.target.name]: value,
    });
  }

  function submitHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    const reservationErrors = validate(reservation);

    if (reservationErrors.length) {
      return setError(reservationErrors);
    }

    onSubmit(reservation);
  }

  return (
    <form onSubmit={submitHandler}>
      <div className="row">
        <div className="form-group col">
          <label htmlFor="first_name">First Name</label>
          <input
            type="text"
            name="first_name"
            id="first_name"
            className="form-control"
            placeholder="First Name"
            required
            onChange={changeHandler}
            value={reservation.first_name}
          />
        </div>

        <div className="form-group col">
          <label htmlFor="last_name">Last Name</label>
          <input
            type="text"
            name="last_name"
            id="last_name"
            className="form-control"
            placeholder="Last Name"
            required
            onChange={changeHandler}
            value={reservation.last_name}
          />
        </div>

        <div className="form-group col">
          <label htmlFor="mobile_number">Mobile Number</label>
          <input
            type="text"
            name="mobile_number"
            id="mobile_number"
            className="form-control"
            placeholder="Mobile Number"
            /* pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" */
            required
            onChange={changeHandler}
            value={reservation.mobile_number}
          />
        </div>
      </div>

      <div className="row">
        <div className="form-group col">
          <label htmlFor="reservation_date">Reservation Date</label>
          <input
            type="date"
            name="reservation_date"
            id="reservation_date"
            className="form-control"
            pattern="\d{4}-\d{2}-\d{2}"
            required
            onChange={changeHandler}
            value={reservation.reservation_date}
          />
        </div>

        <div className="form-group col">
          <label htmlFor="reservation_time">Time</label>
          <input
            type="time"
            name="reservation_time"
            id="reservation_time"
            className="form-control"
            pattern="[0-9]{2}:[0-9]{2}"
            required
            onChange={changeHandler}
            value={reservation.reservation_time}
          />
        </div>

        <div className="form-group col">
          <label htmlFor="people">People</label>
          <input
            type="number"
            name="people"
            id="people"
            min="1"
            className="form-control"
            required
            onChange={changeHandler}
            value={reservation.people}
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

export default ReservationForm;
