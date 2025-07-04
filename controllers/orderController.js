const { Order, Day, Client } = require("../models");
const {
  isOrder,
  getOrdersByStatusAndEmail,
} = require("../services/orderService");
const { findOrCreate, findAndUpdate } = require("../services/dayService");
const { confirmationEmail } = require("../services/emailService");

const orderController = {
  // GET /orders - Obtener todas las órdenes
  async index(req, res) {
    try {
      const orders = await Order.findAll();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /orders/:id - Obtener una orden por ID
  async show(req, res) {
    try {
      //si hay una orden con date > hoy la trae, sino devuelve false
      const order = await isOrder(req.params.id);
      res.status(200).json(order);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /orders - Crear nueva orden
  async store(req, res) {
    try {
      const { date, slot } = req.params;

      //si no hay un dia con esa fecha lo crea, sino lo edita para agregar el slot
      try {
        await findOrCreate(date, slot);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }

      // Buscar cliente por email
      const client = await Client.findOne({
        where: { email: req.params.email },
      });

      if (!client) {
        return res.status(400).json({ error: "Cliente no encontrado" });
      }

      // Crear la orden agregando el clientId
      const newOrder = await Order.create({ ...req.body });

      // Enviar email de confirmación

      await confirmationEmail({
        to: client.email,
        subject: "Confirmación de Reserva",
        html: `<h1>¡Gracias por tu reserva!</h1>
               <p>Tu reserva ha sido confirmada para el día ${date} a las ${slot}.</p>
               <p>Por favor ten en cuenta que tenemos un margen de 30 minutos de consideración, luego de ese plazo perderías tu turno.</p>`,
        date,
        time: slot,
        total: newOrder.total,
      });

      res.status(201).json(newOrder);
    } catch (error) {
      console.log(error, "error");
      res.status(400).json({ error: error.message });
    }
  },

  // PUT /orders/:id - Actualizar orden existente
  async update(req, res) {
    try {
      await findAndUpdate(req.query.dateToEdit, req.query.slotToEdit);
      await findOrCreate(req.body.cart.date, req.body.cart.slot);
      const [updated] = await Order.update(req.body, {
        where: { id: req.params.id },
      });

      if (!updated) {
        return res.status(404).json({ message: "Orden no encontrada" });
      }

      const updatedOrder = await Order.findByPk(req.params.id);
      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // DELETE /orders/:id - Eliminar orden
  async destroy(req, res) {
    findAndUpdate(req.params.date, req.params.slot);
    try {
      const deleted = await Order.destroy({
        where: { id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ message: "Orden no encontrada" });
      }

      res.status(204).json(deleted);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /orders/status/:status/email/:email - Obtener órdenes por status y email
  async getByStatusAndEmail(req, res) {
    try {
      const { status, email } = req.params;
      const orders = await getOrdersByStatusAndEmail(status, email);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = orderController;
