import User from "./../models/Users.js";
import Cart from "./../models/Cart.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const readAll = (req, res) => {
  res.json({
    msg: "Datos obtenidos con exito",
    data: data,
  });
};

const create = async (req, res) => {
  const { name, lastname, country, address, zipcode, email, password } =
    req.body;

  try {
    // 1. CAPA DE CONTRASEÑA
    // ESTABLECER EL NIVEL DE DIFICULTAD DE ENCRIPTAMIENTO DEL PASSWORD
    const salt = await bcryptjs.genSalt(10);
    // 1A. CREAR CARRITO DE COMPRAS
    const newCart = await Cart.create({});
    // ENCRIPTAR EL PASSWORD
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await User.create({
      name,
      lastname,
      country,
      address,
      zipcode,
      email,
      password: hashedPassword,
      cart: newCart,
    });

    // CAPA DE SEGURIDAD JWT
    // 1. GENERAR UNA ELECCIÓN DE DATOS (ID) - PAYLOAD
    const payload = {
      user: {
        id: newUser._id,
      },
    };

    // 2. ESTABLECER LA FIRMA JWT (SUPER SECRETA. SOLO LA TIENE EL CLIENTE Y EL SERVER)
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: 3600000,
      },
      (error, token) => {
        if (error) {
          console.log("error", error);
          return new Error(error);
        }

        return res.json({
          msg: "Usuario creado con éxito y super seguro. guiño guiño",
          data: token,
        });
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Hubo un problema en el servidor",
      error,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    //confirmamos que este en db

    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(400).json({
        msg: "El usuario o la contraseña incorrectos. Codigo 5840",
      });
    }
    const dbUserPassword = foundUser.password;
    const verifiedPass = await bcryptjs.compare(password, dbUserPassword);

    if (!verifiedPass) {
      return await res.status(400).json({
        msg: "El usuario o la contraseña incorrectos. Pruebe mas tarde... Codigo 5840",
      });
    }

    const payload = {
      user: {
        id: foundUser._id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      {
        expiresIn: "1y",
      },
      (error, token) => {
        if (error) {
          console.log("error", error);
          return new Error(error);
        }
        return res.json({
          msg: "usuario con inicio de sesion exitoso",
          data: token,
        });
      }
    );
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      msg: "Hubo un problema de conexion",
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    const foundUser = await User.findById(req.user.id);

    return res.json({
      msg: "Datos de usuario encontrados.",
      data: foundUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "El usuario no se encontró.",
    });
  }
};

export default { readAll, create, login, verifyToken };
