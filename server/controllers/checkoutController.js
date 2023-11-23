import dotenv from "dotenv";
import stripe from "stripe";
import User from "../models/Users.js";
dotenv.config();

const stripeKey = stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  const user = {
    id: 123,
    email: "juan@hola.com",
  };

  const line_items = [{ price: "price_1O9vx6AtIcHbNlyg18H39Og8", quantity: 1 }];

  try {
    const session = await stripeKey.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: "https://google.com",
      cancel_url: "https://yahoo.com",
      customer_email: user.email,
    });

    res.status(200).json({
      msg: "Accede a este link para realizar tu pago",
      session_url: session.url,
      session,
    });
  } catch (error) {
    console.log("error", error);
    res.status(400).json({
      msg: "Hubo un error",
      error,
    });
  }
};

//se va a recibir una peticion por stripe, el cual va a incluir todos los datos de la orden que hizo el usuario
//generando el bd el recibo

const createOrder = async (req, res) => {
  // 1. OBTENER LA FIRMA DE STRIPE SECRETA WEBHOOKS
  // (SIEMPRE ES ASÍ)

  // TODO: EVALUAR LA FIRMA DE SEGURIDAD CON WEBHOOKS
  //const sig = req.headers["stripe-signature"]
  //const endpointSecret = process.env.STRIPE_WH_SIGNING_SECRET
  // console.log(req.body)
  // console.log(sig)
  // console.log(endpointSecret)

  // let event

  // 2. VERIFICACIÓN DEL EVENTO DE STRIPE (VERIFICAR QUE SÍ ES STRIPE Y NO UN ATACANTE)
  // try {
  // CONSTRUIR EL EVENTO DE STRIPE Y CONFIRMARLO
  // event = stripeKey.webhooks.constructEvent(req.body, sig, endpointSecret)
  // } catch (error) {
  //   console.log("error", error)
  //   res.status(400).json({
  //     msg: error,
  //   })
  //   return
  // }

  // 3. EVALUAR EL EVENTO
  // A. SI EL PAGO EXITOSO, OBTENER EL INVOICE ( EL RECIBO)

  //console.log("req.body.data", req.body.data);
  //console.log("req.body.object", req.body.data.object);

  let event = req.body.type; // "charge.succeeded"

  try {
    switch (event) {
      // SI EL PAGO SE EJECUTÓ CORRECTAMENTE
      case "charge.succeeded":
        const paymentIntent = req.body.data.object;

        // PULIR DATOS PARA ENTREGA A BD
        const email = paymentIntent.billing_details.email;
        const receiptURL = paymentIntent.receipt_url;
        const receiptID = receiptURL
          .split("/")
          .filter((item) => item)
          .pop();
        const amount = paymentIntent.amount;
        const date_created = paymentIntent.created;

        //console.log("email", email);
        //console.log("receiptURL", receiptURL);
        //console.log("receiptID", receiptID);
        //console.log("amount", amount);
        //console.log("data_created", date_created);

        // GUARDAR EN BASE DE DATOS
        const paymentDB = await User.findOneAndUpdate(
          {
            email,
          },
          {
            $push: {
              receipts: {
                receiptURL,
                receiptID,
                date_created,
                amount,
              },
            },
          },
          { new: true }
        );

        console.log("paymentDB", paymentDB);

        break;

      default:
        console.log("Evento no encontrado");

        res.status(200).json({
          msg: "Evento no encontrado.",
        });
    }
  } catch (error) {
    console.log("error", error);
    res.status(400).json({
      msg: error,
    });
  }

  // ACTUALIZAR A BASE DE DATOS
  //B. SI EL PAGO FUE FALLIDO, REGRESAR UN MENSAJE DE ERROR
};

export default { createCheckoutSession, createOrder };
