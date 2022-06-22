import React, { useState } from "react";
import { listReservations } from "../utils/api";
import Reservations from "../dashboard/Reservations";

function Search() {
  const [reservations, setReservations] = useState([]);
  const [mobileNumber, setMobileNumber] = useState("");
  const [showResults, setShowResults] = useState(false);

  function changeHandler({ target: { value } }) {
    setMobileNumber(value);
  }

  function submitHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    search();
  }

  function search() {
    setShowResults(false);
    listReservations({ mobile_number: mobileNumber })
      .then(setReservations)
      .then(() => setShowResults(true));
  }

  return (
    <main>
      <h1>Search reservations</h1>
      <form onSubmit={submitHandler}>
        <div className="row">
          <div className="form-group col">
            <label htmlFor="mobile_number">Mobile Number:</label>
            <div className="input-group">
              <input
                type="text"
                name="mobile_number"
                id="mobile_number"
                className="form-control"
                placeholder="Enter a customer's phone number"
                value={mobileNumber}
                onChange={changeHandler}
              ></input>
              <div className="input-group-append">
                <button type="submit" className="btn btn-primary">
                  <span className="oi oi-magnifying-glass" /> Find
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
      {showResults && <Reservations reservations={reservations} />}
    </main>
  );
}

export default Search;
