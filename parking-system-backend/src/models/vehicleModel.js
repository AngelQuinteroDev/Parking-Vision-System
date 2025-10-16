export default class Vehicle {
  constructor({
    plate,
    place_plate,
    is_exempt = false,
    created_at = null,
    updated_at = null,
    admins_id = null
  }) {
    this.plate = plate;
    this.place_plate = place_plate;
    this.is_exempt = is_exempt;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.admins_id = admins_id;
  }
}
