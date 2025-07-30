const { Order, Day, Client } = require("../models");
const {
  isOrder,
  getOrdersByStatusAndEmail,
} = require("../services/orderService");
const { findOrCreate, findAndUpdate } = require("../services/dayService");
const {
  confirmationEmail,
  cancellationEmail,
  modificationEmail,
} = require("../services/emailService");

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
      console.log("orderController.store: params", date, slot, req.body);

      //si no hay un dia con esa fecha lo crea, sino lo edita para agregar el slot
      const result = await findOrCreate(date, slot);
      if (result && result.error) {
        console.log(
          "orderController.store: error en findOrCreate",
          result.error
        );
        return res.status(400).json({ error: result.error });
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
        date,
        time: slot,
        total: newOrder.cart.total,
      });

      res.status(201).json(newOrder);
    } catch (error) {
      console.log("orderController.store: error general", error);
      res.status(400).json({ error: error.message });
    }
  },

  // POST /orders/admin - Crear nueva orden desde admin (estructura completa)
  async storeAdmin(req, res) {
    try {
      const {
        email,
        firstname,
        lastname,
        cart,
        ClientId,
        ServiceId,
        CarTypeId,
      } = req.body;

      console.log("orderController.storeAdmin: datos recibidos", req.body);

      // Validar que el cliente existe
      const client = await Client.findOne({
        where: { id: ClientId },
      });

      if (!client) {
        return res.status(400).json({ error: "Cliente no encontrado" });
      }

      // Verificar que el slot esté disponible
      const result = await findOrCreate(cart.date, cart.slot);
      if (result && result.error) {
        console.log(
          "orderController.storeAdmin: error en findOrCreate",
          result.error
        );
        return res.status(400).json({ error: result.error });
      }

      // Crear la orden con todos los datos
      const newOrder = await Order.create({
        email,
        firstname,
        lastname,
        cart,
        ClientId,
        ServiceId,
        CarTypeId,
      });

      // Enviar email de confirmación
      await confirmationEmail({
        to: email,
        date: cart.date,
        time: cart.slot,
        total: cart.total,
      });

      res.status(201).json(newOrder);
    } catch (error) {
      console.log("orderController.storeAdmin: error general", error);
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

      // Enviar email de modificación
      try {
        await modificationEmail({
          to: updatedOrder.email,
          oldDate: req.query.dateToEdit,
          oldTime: req.query.slotToEdit,
          newDate: req.body.cart.date,
          newTime: req.body.cart.slot,
          total: req.body.cart.total,
        });
        console.log("Email de modificación enviado exitosamente");
      } catch (emailError) {
        console.error("Error enviando email de modificación:", emailError);
        // No fallar la operación principal si falla el email
      }

      res.status(200).json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // DELETE /orders/:id - Eliminar orden
  async destroy(req, res) {
    try {
      // Obtener datos de la orden antes de eliminar para el email
      const orderToDelete = await Order.findByPk(req.params.id);
      if (!orderToDelete) {
        return res.status(404).json({ message: "Orden no encontrada" });
      }

      // Eliminar la orden

      const deleted = await Order.destroy({
        where: { id: req.params.id },
      });

      if (!deleted) {
        return res.status(404).json({ message: "Orden no encontrada" });
      }
      // Log para debugging - datos recibidos para liberar slot
      console.log("🗑️ BACKEND - Datos recibidos para liberar slot:", {
        orderId: req.params.id,
        date: req.params.date,
        slot: req.params.slot,
        dateType: typeof req.params.date,
        slotType: typeof req.params.slot,
      });

      // Liberar el slot
      await findAndUpdate(req.params.date, req.params.slot);

      // Enviar email de cancelación
      try {
        await cancellationEmail({
          to: orderToDelete.email,
          date: req.params.date,
          time: req.params.slot,
          total: orderToDelete.cart.total,
        });
        console.log("Email de cancelación enviado exitosamente");
      } catch (emailError) {
        console.error("Error enviando email de cancelación:", emailError);
        // No fallar la operación principal si falla el email
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
