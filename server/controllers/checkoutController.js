import dotenv from "dotenv";
import stripe from "stripe";
import User from "../models/Users.js";
import Cart from "../models/Cart.js";
import emailController from "../controllers/emailController.js";
dotenv.config();

const stripeKey = stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  //console.log("accediste....");

  // 1. OBTENER EL USUARIO Y SU ID CON CORREO

  const userID = req.user.id;
  const foundUser = await User.findById(userID).lean();
  //console.log("foundUser in checkoutcontroller", foundUser);
  const foudCart = await Cart.findById(foundUser.cart).lean().populate();

  //acomodar los datos para stripe
  const line_items = foudCart.products.map((productToBuy) => {
    return {
      price: productToBuy.priceID,
      quantity: productToBuy.quantity,
    };
  });

  //CREACIÓN DE CHECKOUT EN STRIPE
  try {
    const session = await stripeKey.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/?status=successful`,
      cancel_url: `${process.env.FRONTEND_URL}/products?status=unsuccessful`,
      customer_email: foundUser.email,
    });

    res.status(200).json({
      msg: "Accede a este link para la sesión de pago",
      session_url: session.url,
      session,
    });
  } catch (error) {
    console.log("error:", error);
    res.status(400).json({
      msg: "Hubo un problema",
      error,
    });
  }
};

//se va a recibir una peticion por stripe, el cual va a incluir todos los datos de la orden que hizo el usuario
//generando el bd el recibo

const createOrder = async (req, res) => {
  try {
    // 1. OBTENER LA FIRMA DE STRIPE SECRETA WEBHOOKS
    // (SIEMPRE ES ASÍ)
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WH_SIGNING_SECRET;

    // 2. CONSTRUIR EL EVENTO CON TODOS LOS DATOS SENSIBLES DE STRIPE
    // EL EVENTO ES EL OBJETO QUE INCLUYE LOS RECIBOS Y LAS CONFIRMACIONES DE PAGO DEL USUARIO (DE SU ÚLTIMO STRIPE CHECKOUT)
    let event = stripeKey.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );

    // 3. EVALUAMOS EL EVENTO DE STRIPE
    switch (event.type) {
      // A. SI EL EVENTO FUE UN CARGO EXITOSO AL USUARIO
      case "charge.succeeded":
        // GENERAR VARIABLES PARA ARMAR NUESTRO GUARDADO EN BASE DE DATOS
        const paymentIntent = event.data.object;
        //console.log("paymentIntent", paymentIntent);

        const email = paymentIntent.billing_details.email;
        const receiptURL = paymentIntent.receipt_url;
        const receiptID = receiptURL
          .split("/")
          .filter((item) => item)
          .pop();

        const amount = paymentIntent.amount;
        const dateCreated = paymentIntent.created;

        const paymentDB = await User.findOneAndUpdate(
          { email },
          {
            $push: {
              receipts: {
                receiptURL,
                receiptID,
                dateCreated,
                amount,
              },
            },
          },
          { new: true }
        ).lean();

        console.log("paymentDB", paymentDB);

        try {
          await emailController.sendEmail({
            email,
            amount,
            dateCreated,
            receiptID,
            receiptURL,
          });
          console.log("enviando datos a sendEmail");
        } catch (error) {
          console.error("Error al enviar el correo electrónico:", error);
          // Manejar el error y enviar una respuesta adecuada al cliente
          return res.status(500).json({
            msg: "Hubo un error al enviar el correo electrónico",
            error: error.message,
          });
        }

        res.status(200).json({
          msg: "Datos actualizados con éxito. Pago correcto.",
        });

        break;

      default:
        console.log("Evento sin coincidencia.");
        res.status(200).json({
          msg: "Evento sin coincidencia",
        });
    }
  } catch (error) {
    console.log("Error en la generación de recibos para el usuario:", error);
    res.status(500).json({
      msg: "Hubo un problema en la generación de recibos para el usuario.",
      error: error.message,
    });
  }
};

const editCart = async (req, res) => {
  const userID = req.user.id;

  try {
    //console.log("userID", userID);

    const foundUser = await User.findById(userID).lean();
    const { products } = req.body;

    const updateCart = await Cart.findOneAndUpdate(
      foundUser.cart,
      { products },
      { new: true }
    );

    res.status(200).json({
      msg: "carrito actualizado",
      updateCart,
    });
  } catch (error) {
    res.status(500).json({
      msg: "hubo un error en servi",
    });
  }
};

const getCart = async (req, res) => {
  const userID = req.user.id;

  try {
    const foundUser = await User.findOne({ _id: userID });

    const foundcart = await Cart.findOne({
      _id: foundUser.cart,
    });

    res.status(200).json({
      msg: "carrito encontrado con exito",
      cart: foundcart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "hubo un error en servidor",
      error,
    });
  }
};
export default { createCheckoutSession, createOrder, editCart, getCart };
