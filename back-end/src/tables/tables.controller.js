const tablesService = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const hasRequiredProperties = hasProperties("table_name", "capacity");

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const validProps = ["table_name", "capacity", "table_id", "reservation_id"];

  const invalidFields = Object.keys(data).filter(
    (field) => !validProps.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

function hasValidName(req, res, next) {
  const { data: { table_name } = {} } = req.body;

  if (table_name.length < 2) {
    return next({
      status: 400,
      message: `The 'table_name' property must be at least 2 characters.`,
    });
  }
  next();
}

function ifCapacityNAN(req, res, next) {
  const { data: { capacity } = {} } = req.body;

  if (typeof capacity !== "number") {
    return next({
      status: 400,
      message: `The 'capacity' property must be a number.`,
    });
  }
  next();
}

function ifTableHasCapacity(req, res, next) {
  const { people } = res.locals.reservation;
  const { capacity } = res.locals.table;

  if (capacity < people) {
    return next({
      status: 400,
      message: "Party size exceeds table capacity",
    });
  }
  next();
}

function ifTableOccupied(req, res, next) {
  const { reservation_id } = res.locals.table;

  if (!reservation_id) {
    return next({
      status: 400,
      message: `The table selected is not occupied.`,
    });
  }
  next();
}

function ifTableNotOccupied(req, res, next) {
  const { reservation_id } = res.locals.table;
  if (reservation_id) {
    return next({
      status: 400,
      message: "The table selected is occupied.",
    });
  }
  next();
}

function isBooked(req, res, next) {
  if (res.locals.reservation.status === "booked") {
    return next();
  }
  next({
    status: 400,
    message: `Reservation is ${res.locals.reservation.status}.`,
  });
}

async function tableExists(req, res, next) {
  const { table_id } = req.params;
  const table = await tablesService.read(Number(table_id));

  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `No such table: ${table_id}`,
  });
}

async function list(req, res) {
  const data = await tablesService.list(req.query.date);
  data.sort((a, b) => (a.table_name > b.table_name ? 1 : -1));
  res.json({ data });
}

async function create(req, res) {
  const data = await tablesService.create(req.body.data);
  res.status(201).json({ data });
}

function read(req, res) {
  const data = res.locals.reservation;
  res.status(200).json({ data });
}

async function seat(req, res) {
  const data = await tablesService.seat(
    res.locals.table.table_id,
    res.locals.reservation.reservation_id
  );
  res.json({ data });
}

async function finish(req, res) {
  const data = await tablesService.finish(res.locals.table);
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasValidName,
    ifCapacityNAN,
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(tableExists), asyncErrorBoundary(read)],
  seat: [
    asyncErrorBoundary(tableExists),
    ifTableHasCapacity,
    ifTableNotOccupied,
    isBooked,
    asyncErrorBoundary(seat),
  ],
  finish: [
    asyncErrorBoundary(tableExists),
    ifTableOccupied,
    asyncErrorBoundary(finish),
  ],
};
