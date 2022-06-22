import React from "react";

function ReservationErrors({ errors = [] }) {
  if (errors !== null)
    if (errors.length) {
      return (
        <div className="alert alert-danger">
          <p>Please fix the following errors:</p>
          <ul>
            {errors.map((error) => (
              <li key={error.message}>{error.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  return null;
}

export default ReservationErrors;
