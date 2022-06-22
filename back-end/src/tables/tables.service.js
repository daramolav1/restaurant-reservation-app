const knex = require("../db/connection");

function list() {
  return knex("tables").select("*");
}

function create(table) {
  return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function read(table_id) {
  return knex("tables").select("*").where({ table_id }).first();
}

function seat(table_id, reservation_id) {
  return knex.transaction(async (transaction) => {
    await knex("reservations")
      .where({ reservation_id })
      .update({ status: "seated" })
      .transacting(transaction);

    return knex("tables")
      .where({ table_id })
      .update({ reservation_id }, "*")
      .transacting(transaction)
      .then((updatedRecords) => updatedRecords[0]);
  });
}

module.exports = {
  list,
  create,
  read,
  seat,
};
