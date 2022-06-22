const knex = require("../db/connection");

function list(reservation_date) {
  return knex("reservations")
    .select("*")
    .where({ reservation_date: reservation_date })
    .whereNotIn("status", ["finished", "cancelled"])
    .orderBy("reservation_time");
}

function create(reservation) {
  return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function read(reservation_id) {
  return knex("reservations").select("*").where({ reservation_id }).first();
}

function update(reservation) {
  return knex("reservations")
    .where({ reservation_id: reservation.reservation_id })
    .update(reservation, "*")
    .then((updatedRecords) => updatedRecords[0]);
}

function status(reservation) {
  update(reservation);
  return validStatus(reservation);
}

function validStatus(reservation) {
  if (
    ["booked", "seated", "finished", "cancelled"].includes(reservation.status)
  ) {
    return reservation;
  }
  const error = new Error(`Invalid status:"${reservation.status}"`);
  error.status = 400;
  throw error;
}

function search(mobile_number) {
  return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

module.exports = {
  list,
  create,
  read,
  status,
  search,
};
