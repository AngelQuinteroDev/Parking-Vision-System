export default class ParkingSession {
  constructor({
    id_parking = null,
    vehicle_plate,
    rate_id,
    payment_id = null,
    entry_time = null,
    exit_time = null,
    total_time_minutes = null,
    total_price = null,
    is_paid = false,
    active = true
  }) {
    this.id_parking = id_parking;
    this.vehicle_plate = vehicle_plate;
    this.rate_id = rate_id;
    this.payment_id = payment_id;
    this.entry_time = entry_time;
    this.exit_time = exit_time;
    this.total_time_minutes = total_time_minutes;
    this.total_price = total_price;
    this.is_paid = is_paid;
    this.active = active;
  }
}
