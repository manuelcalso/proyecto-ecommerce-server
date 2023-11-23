import Products from "./../models/Products.js";
import stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripeKey = stripe(process.env.STRIPE_SECRET_KEY);

//console.log(stripeKey);

const readAll = async (req, res) => {
  try {
    const playeras = await Products.find();

    return res.json({
      msg: "Productos leídos con éxito",
      data: playeras,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Hubo un error obteniendo los datos.",
    });
  }
};

const readOne = async (req, res) => {
  const { id } = req.params;

  try {
    const playeras = await Products.findOne({
      _id: id,
    });

    if (!playeras) {
      return res.status(400).json({
        msg: "Playera no encontrada",
      });
    }

    res.json({
      msg: "Playera obtenida con éxito.",
      data: playeras,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Hubo un error obteniendo los datos.",
    });
  }
};

const create = async (req, res) => {
  const { name, currency, prices, img, description, slug } = req.body;

  //console.log(req.body);

  // A. GENERACIÓN DE PRODUCTO EN STRIPE
  // 1. CREAR EL PRODUCTO EN STRIPE

  try {
    const product = await stripeKey.products.create({
      name,
      description,
      images: [...img],
      metadata: {
        productDescription: description,
        slug,
      },
    });

    //console.log("product", product);

    // 2. CREAR PRECIOS PARA EL PRODUCTO DE STRIPE
    const stripePrices = await Promise.all(
      prices.map(async (priceObj) => {
        return await stripeKey.prices.create({
          currency,
          product: product.id,
          unit_amount: priceObj.price,
          nickname: priceObj.size,
          metadata: {
            size: priceObj.size,
            priceDescription: priceObj.description,
          },
        });
      })
    );

    //console.log("stripePrices", stripePrices);

    // 3. CREACIÓN DE PRODUCTO EN BASE DE DATOS
    // A. ADAPTACIÓN DE VARIABLE. EN LUGAR DE PASAR LOS 50 MIL PROPIEDADES. SOLO NECESITO 4 PARA LA BASE DE DATOS CON RESPECTO A PRICING.
    const productPrices = stripePrices.map((priceObj) => {
      return {
        id: priceObj.id,
        size: priceObj.metadata.size,
        priceDescription: priceObj.metadata.priceDescription,
        price: priceObj.unit_amount,
      };
    });

    // B. CREACIÓN DE PIZZA DE BASE DE DATOS

    const newProductDB = await Products.create({
      idStripe: product.id,
      name: product.name,
      prices: productPrices,
      img,
      currency,
      description: product.description,
      slug,
    });

    return res.status(200).json({
      msg: "Playera creada en Stripe y base de datos. ;)",
      data: newProductDB,
    });
  } catch (error) {
    console.log("error", error);
  }

  // 3. CREAR PRODUCTO EN BASE DE DATOS CON DATOS DE STRIPE
  // try {
  //   const { name } = req.body

  //   const newPizza = await Pizza.create({
  //     name,
  //   })

  //   return res.json({
  //     msg: "Pizza creada",
  //     data: newPizza,
  //   })
  // } catch (error) {
  //   console.log(error)
  //   res.status(500).json({
  //     msg: "Hubo un error obteniendo los datos.",
  //   })
  // }
};

const edit = async (req, res) => {
  const { id } = req.params;

  const { name } = req.body;

  try {
    const updatedProduct = await Products.findByIdAndUpdate(
      id,
      {
        name,
      },
      { new: true }
    );

    return res.json({
      msg: "Playera actualizada con éxito",
      data: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Hubo un error obteniendo los datos.",
    });
  }
};

const deleteOne = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Products.findByIdAndRemove({
      _id: id,
    });

    if (deletedProduct === null) {
      return res.json({
        msg: "Playera no existe o ya fue borrada con anterioridad",
      });
    }

    return res.json({
      msg: "Playera borrada exitosamente.",
      data: deletedProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Hubo un error obteniendo los datos.",
    });
  }
};

export default {
  readAll,
  create,
  readOne,
  edit,
  deleteOne,
};
