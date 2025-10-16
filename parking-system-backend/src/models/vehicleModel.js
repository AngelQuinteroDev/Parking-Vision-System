export default class Vehicle {
  constructor({ plate, place_plate, admins_id, created_at, updated_at }) {
    this.plate = plate;
    this.place_plate = place_plate;
    this.admins_id = admins_id;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
