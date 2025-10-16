import paymentService from "../services/paymentService.js";

class PaymentController {
  async pay(req, res) {
    try {
      const { plate } = req.params;
      const result = await paymentService.processPayment(plate, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

export default new PaymentController();
