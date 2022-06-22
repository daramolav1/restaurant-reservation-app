import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import TableForm from "./TableForm";
import { createTable } from "../utils/api";

function TableCreate() {
  const history = useHistory();

  const [error, setError] = useState(null);

  function submitHandler(table) {
    const abortController = new AbortController();
    createTable(table, abortController.signal)
      .then(() => history.push(`/dashboard`))
      .catch(setError);
    return () => abortController.abort();
  }

  function cancelHandler() {
    history.goBack();
  }

  return (
    <main>
      <h1>Create Table</h1>
      <ErrorAlert error={error} />
      <TableForm onSubmit={submitHandler} onCancel={cancelHandler} />
    </main>
  );
}

export default TableCreate;
