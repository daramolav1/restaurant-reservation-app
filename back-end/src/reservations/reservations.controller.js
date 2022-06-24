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

  if (!reservation_date.match(/\d{4}-\d{2}-\d{2}/)) {
    return next({
      status: 400,
      message: `Invalid reservation_date`,
    });
  }
  next();
}

function hasValidTime(req, res, next) {
  const { data: { reservation_time } = {} } = req.body;

  if (!reservation_time.match(/[0-9]{2}:[0-9]{2}/)) {
    return next({
      status: 400,
      message: `Invalid reservation_time`,
    });
  }
  next();
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
  const time = reservation_time.replace(":", "");

  if (new Date(reservation_date).getDay() + 1 === 2) {
    next({
      status: 400,
      message: `The reservation date is a Tuesday as the restaurant is closed on Tuesdays.`,
    });
  } else if (
    Date.parse(reservation_date + ":" + reservation_time) < Date.now()
  ) {
    next({
      status: 400,
      message: `The reservation date is in the past. Only future reservations are allowed.`,
    });
  } else if (time < 1030) {
    next({
      status: 400,
      message: `The reservation time is before 10:30 AM.`,
    });
  } else if (time > 2130) {
    next({
      status: 400,
      message: `The reservation time is after 9:30 PM, because the restaurant closes at 10:30 PM and the customer needs to have time to enjoy their meal.`,
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
    message: `Missing reservation_id`,
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

function unfinishedStatus(req, res, next) {
  if ("booked" !== res.locals.reservation.status) {
    return next({
      status: 400,
      message: `Reservation status: '${res.locals.reservation.status}'.`,
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

async function confirmReservation(req, res, next) {
  const reservation = await reservationsService.read(req.params.reservation_id);

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

async function status(req, res) {
  res.locals.reservation.status = req.body.data.status;
  const data = await reservationsService.status(res.locals.reservation);
  res.json({ data });
}

async function update(req, res) {
  const { reservation_id } = res.locals.reservation;
  req.body.data.reservation_id = reservation_id;
  const data = await reservationsService.status(req.body.data);
  res.json({ data });
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
  read: [hasReservationId, asyncErrorBoundary(reservationExists), read],
  reservationExists: [hasReservationId, asyncErrorBoundary(reservationExists)],
  status: [
    hasReservationId,
    asyncErrorBoundary(reservationExists),
    unfinishedStatus,
    asyncErrorBoundary(status),
  ],
  update: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    hasValidDate,
    hasValidTime,
    hasValidNumberOfPeople,
    checkStatus,
    asyncErrorBoundary(confirmReservation),
    asyncErrorBoundary(update),
  ],
};
