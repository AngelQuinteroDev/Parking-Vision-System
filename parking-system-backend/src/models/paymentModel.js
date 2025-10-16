export default class Payment {
  constructor({
    payment_id = null,
    vehicle_plate,
    amount,
    payment_method,
    payment_status = "PENDING",
    transaction_ref = null,
    payment_date = null
  }) {
    this.payment_id = payment_id;
    this.vehicle_plate = vehicle_plate;
    this.amount = amount;
    this.payment_method = payment_method;
    this.payment_status = payment_status;
    this.transaction_ref = transaction_ref;
    this.payment_date = payment_date;
  }
}
