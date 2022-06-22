const reservationsService = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasProperties = require("../errors/hasProperties");
const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const validProps = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
    "status",
    "created_at",
    "updated_at",
    "reservation_id",
  ];

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

function hasValidDate(req, res, next) {
  const { data: { reservation_date } = {} } = req.body;
  const date = new Date(reservation_date);
  const day = date.getUTCDay();

  if (isNaN(Date.parse(reservation_date))) {
    return next({
      status: 400,
      message: `Invalid reservation_date`,
    });
  }
  if (day === 2) {
    return next({
      status: 400,
      message: `Restaurant is closed on Tuesdays`,
    });
  }
  if (date < new Date()) {
    return next({
      status: 400,
      message: `Reservation must be set in the future`,
    });
  }
  next();
}

function hasValidTime(req, res, next) {
  const { data: { reservation_time } = {} } = req.body;

  if (
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(reservation_time) ||
    /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(reservation_time)
  ) {
    return next();
  }
  next({
    status: 400,
    message: `Invalid reservation_time`,
  });
}

function hasValidNumberOfPeople(req, res, next) {
  const { data: { people } = {} } = req.body;

  if (people === 0 || typeof people !== "number") {
    return next({
      status: 400,
      message: `Invalid number of people: ${people}`,
    });
  }
  next();
}

function hasEligibleTime(req, res, next) {
  const { data: { reservation_date, reservation_time } = {} } = req.body;

  const date = new Date(`${reservation_date}, ${reservation_time}`);
  const minutes = date.getHours() * 60 + date.getMinutes();

  if (minutes < 630 || minutes > 1290) {
    return next({
      status: 400,
      message: `Please select a time between 10:30 and 21:30`,
    });
  }
  next();
}

function hasReservationId(req, res, next) {
  const reservation =
    req.params.reservation_id || req.body?.data?.reservation_id;

  if (reservation) {
    res.locals.reservation_id = reservation;
    return next();
  }
  next({
    status: 400,
    message: `missing reservation_id`,
  });
}

function checkStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status === "seated" || status === "finished") {
    return next({
      status: 400,
      message: `status is ${status}`,
    });
  }
  next();
}

async function reservationExists(req, res, next) {
  const reservation = await reservationsService.read(res.locals.reservation_id);

  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `reservation_id ${res.locals.reservation_id} cannot be found.`,
  });
}

async function list(req, res) {
  const mobile_number = req.query.mobile_number;
  const data = await (mobile_number
    ? reservationsService.search(mobile_number)
    : reservationsService.list(req.query.date));
  res.json({ data });
}

async function create(req, res) {
  const data = await reservationsService.create(req.body.data);
  res.status(201).json({ data });
}

function read(req, res) {
  const data = res.locals.reservation;
  res.status(200).json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasValidDate,
    hasValidTime,
    hasValidNumberOfPeople,
    hasEligibleTime,
    checkStatus,
    asyncErrorBoundary(create),
  ],
  read: [hasReservationId, reservationExists, asyncErrorBoundary(read)],
};
