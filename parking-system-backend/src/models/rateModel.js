export default class Rate {
  constructor({
    id_rates = null,
    name,
    price_per_minute,
    min_charge,
    grace_minutes = 0,
    active = true,
    created_at = null,
    updated_at = null,
    admins_id = null
  }) {
    this.id_rates = id_rates;
    this.name = name;
    this.price_per_minute = price_per_minute;
    this.min_charge = min_charge;
    this.grace_minutes = grace_minutes;
    this.active = active;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.admins_id = admins_id;
  }
}
