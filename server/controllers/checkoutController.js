import dotenv from "dotenv";
import stripe from "stripe";
import User from "../models/Users.js";
import Cart from "../models/Cart.js";
dotenv.config();

const stripeKey = stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  console.log("accediste...");

  // 1. OBTENER EL USUARIO Y SU ID CON CORREO

  const userID = req.user.id;

  const foundUser = await User.findById(userID).lean();
  //console.log("foundUser", foundUser);

  const foudCart = await Cart.findById(foundUser.cart).lean().populate();
  //console.log("foundcart", foudCart);

  //acomodar los datos para stripe

  const line_items = foudCart.products.map((productToBuy) => {
    return {
      price: productToBuy.priceID,
      quantity: productToBuy.quantity,
    };
  });

  //console.log("stripeKey", stripeKey);
  //console.log("line_items", line_items);
  //CREACIÓN DE CHECKOUT EN STRIPE
  try {
    const session = await stripeKey.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: "https://google.com",
      cancel_url: "https://yahoo.com",
      customer_email: foundUser.email,
    });
    //console.log("session", session);

    res.status(200).json({
      msg: "Accede a este link para la sesión de pago",
      session_url: session.url,
      session,
    });
  } catch (error) {
    console.log("error", error);
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
    //console.log(sig);
    //console.log(endpointSecret);

    // 2. CONSTRUIR EL EVENTO CON TODOS LOS DATOS SENSIBLES DE STRIPE
    // EL EVENTO ES EL OBJETO QUE INCLUYE LOS RECIBOS Y LAS CONFIRMACIONES DE PAGO DEL USUARIO (DE SU ÚLTIMO STRIPE CHECKOUT)
    let event = stripeKey.webhooks.constructEvent(
      req.body,
      sig,
      endpointSecret
    );

    //console.log(event);

    // 3. EVALUAMOS EL EVENTO DE STRIPE
    switch (event.type) {
      // A. SI EL EVENTO FUE UN CARGO EXITOSO AL USUARIO
      case "charge.succeeded":
        // GENERAR VARIABLES PARA ARMAR NUESTRO GUARDADO EN BASE DE DATOS
        const paymentIntent = event.data.object;
        //console.log(paymentIntent);

        const email = paymentIntent.billing_details.email;
        //console.log(email);

        const receiptURL = paymentIntent.receipt_url; // https://receipt.stripe.com/12312/!2312/23123
        console.log(receiptURL);

        const receiptID = receiptURL
          .split("/")
          .filter((item) => item)
          .pop(); // !2312
        console.log(receiptID);

        const amount = paymentIntent.amount;
        //console.log(amount);

        const date_created = paymentIntent.created;
        //console.log(date_created);

        const paymentDB = await User.findOneAndUpdate(
          { email },
          {
            $push: {
              receipts: {
                receiptID,
                receiptURL,
                date_created,
                amount,
              },
            },
          },
          { new: true }
        ).lean();

        console.log(paymentDB);

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

    return;
  } catch (error) {
    console.log("error en el manejo de eventos", error);
    res.status(500).json({
      msg: "Hubo un problema en la generación de recibos para el usuario.",
    });
  }
};

const editCart = async (req, res) => {
  const userID = req.user.id;

  try {
    console.log("userID", userID);

    const foundUser = await User.findById(userID).lean();
    console.log("foundUser", foundUser);
    const { products } = req.body;
    console.log("products", products);

    const updateCart = await Cart.findOneAndUpdate(
      foundUser.cart,
      { products },
      { new: true }
    );
    console.log("updateCart", updateCart);

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

export default { createCheckoutSession, createOrder, editCart };
