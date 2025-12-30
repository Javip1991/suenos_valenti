const express = require("express");
const app = express();
const path = require("path");
const PORT = 3000;

//LIBRERIA PARA MODIFICAR FECHAS

const dayjs = require("dayjs");
require("dayjs/locale/es");

dayjs.locale("es");

//LIBRERIA PARA COOKIES

const cookieParser = require("cookie-parser");

//LIBRERIA PARA LAS SESIONES

const session = require("express-session");

//RUTA PARA GUARDAR LOS DATOS DE USUARIO

const fs = require("fs");
const rutaUsuarios = path.join(__dirname, "data", "usuarios.json");

//CREACION DE LOGS

const rutaLogs = path.join(__dirname, "data", "logs.txt");

function registrarLogs (mensaje) {
    const fecha = new Date().toLocaleString("es-ES");
    const linea = `[${fecha}] ${mensaje}\n`;

    fs.appendFile(rutaLogs, linea, (err) => {
        if (err){
            console.error("Error escribiendo log: ", err);
        }
    });
}

//SERVIDOR ESTATICO (/PUBLIC)

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//CREACION DE COOKIES

app.use(cookieParser());
app.use(
    session({
        secret: "clave de sesiones",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 30 * 30
        },

    })
);

app.use((req, res, next) => {
    console.log("ID de sesión:", req.sessionID);
    console.log("Contenido de sesión:", req.session);
    next();
});


app.use(express.static(path.join(__dirname, "public")));

function requiereAuth(req,  res, next) {
    if (req.session.user) return next();
    res.redirect("/login");
}

function requiereLogin(req, res, next) {
    if(!req.session.user){
        return res.redirect("/login");
    }
    next();
}

//RUTA GET DE REGISTRO

app.get("/registro", requiereLogin, (req, res) => {
    

    res.render("registro", {
        nombre: "",
        email: "",
        edad: "",
        ciudad: "",
        intereses: [],

    });

});

//RUTA POST DE REGISTRO

app.post("/registro", requiereLogin, (req, res) => {

    const nombre = req.body.nombre;
    const email = req.body.email;
    const edad = req.body.edad;
    const ciudad = req.body.ciudad;

    let intereses = req.body.intereses || [];

    if (!Array.isArray(intereses)) {
        intereses = [intereses];
    }

    //VALIDACION DE ERRORES

    let errores = [];
    let validaciones = [];


    //VALIDACION DE NOMBRE

    if (!nombre || nombre.trim().length < 2){
        errores.push("El nombre tiene que contener minimo 2 caracteres!")
    }

    //VALIDACION DE EMAIL

    if(!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
        errores.push("El email introducido no es valido");
    }else {
        validaciones.push("El email introducido es correcto");
    }

    //VALIDACION DE EDAD

    if (edad <= 0){
        errores.push("La edad no puede ser 0!")
    } if (!edad){
        errores.push("La edad no puede quedar vacia!")
    } 
    
    //ERRORES BAD REQUEST

    if (errores.length){
        return res
        .status(400)
        .render("registro", {nombre, email, edad, ciudad, intereses, errores});
    }

    //CREAR USUARIO

    const usuario = { nombre, email, edad, ciudad, intereses};
    
    //GUARDAR EN EL JSON

    fs.readFile(rutaUsuarios, "utf-8", (err, data) => {
        if (err) return res.status(500).send("Error leyendo usuarios");
        let usuarios = [];

        try{
            usuarios = JSON.parse(data);

        }catch {
            usuarios = [];
        }

        const exisite = usuarios.find(u => u.email === email);
        if (exisite){
            return res.status(400).render("Registro", {nombre, email, edad, ciudad, intereses, errores: ["El email ya esta registrado"]});

        }

        usuarios.push(usuario);

        fs.writeFile(rutaUsuarios, JSON.stringify(usuarios, null, 2),  (err) => {
            if (err) 
                return res.status(500).send("Error guardando usuario");
        });

        req.session.user = usuario;

        registrarLogs(`Nuevo registro: ${usuario.nombre} (${usuario.email})`);

        res.redirect("/perfil");

    });

    
   
});

//GET DEL LOGIN

app.get("/login", (req, res) => {
    if(req.session.user){
        return res.redirect("/perfil");
    }
    res.render("login", {error: null});
});

//POST DEL LOGIN

app.post("/login", (req, res) => {
    const { usuario, password} = req.body;

    if (password === "abcd") {
        req.session.user = req.session.user || {nombre: usuario || "Usuario"};
        //INICIALIZA CARRITO SI NO EXISTE
        if (!req.session.carrito) req.session.carrito = [];
        return res.redirect("/perfil");
    }
    res.status(401).render("login", {error: "Usuario o contraseña incorrectos"});

    registrarLogs(`Login exitoso: ${req.session.user.nombre || usuario}`);

    registrarLogs(`Login fallido: ${usuario || "Desconocido"}`);

});

//GET DEL CARRITO (JSON)

app.get("/carrito", (req, res) => {
    if(!req.session.user)
        return res.status(401).json({ error: "No autorizado"});
    res.json(req.session.carrito || []);
});

//POST PARA AGREGAR AL CARRITO

app.post("/carrito", (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "No autorizado" });

    const { id, nombre, precio, cantidad = 1 } = req.body;

    if (!req.session.carrito) req.session.carrito = [];

    const linea = req.session.carrito.find(l => l.id === id);
    if (linea) {
        linea.cantidad += cantidad;
        linea.subtotal = +(linea.cantidad * precio).toFixed(2);
    } else {
        req.session.carrito.push({ id, nombre, cantidad, subtotal: +(precio * cantidad).toFixed(2) });
    }

    res.json(req.session.carrito);
});

//POST PARA VACIAR EL CARRITO

app.post("/carrito/vaciar", (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "No autorizado" });
    req.session.carrito = [];
    res.json([]);
});

//ELIMINAR PRODUCTOS DEL CARRITO

app.post("/carrito/eliminar", (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: "No autorizado" });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "ID requerido" });

  const index = req.session.carrito.findIndex(l => l.id === id);
  if (index !== -1) {
    req.session.carrito.splice(index, 1);
  }

  res.json(req.session.carrito);
});



//GET DEL PERFIL

app.get("/perfil", requiereAuth, (req, res) => {
    const user = req.session.user;
    

    res.render("perfil", {user});
});


//POST DEL PERFIL-LOGOUT

app.post("/logout", (req, res) => {
    if(req.session.user) {
        registrarLogs(`Logout: ${req.session.user.nombre} (${req.session.user.email || "sin email"})`);
}

    req.session.destroy(() => {
        res.redirect("/");
    });
});

//GET DEL CAMBIO DE TEMA

app.get("/tema/:modo", (req, res) => {

    const modo = req.params.modo;

    res.cookie("tema", modo, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    });

registrarLogs(`Cambio de tema a ${modo} por ${req.session.user?.nombre || "Invitado"}`);   

res.redirect("/temas");

});

app.get("/borrar-tema", (req, res) => {

    res.clearCookie("tema");
    res.redirect("/temas");
});

app.get("/temas", (req, res) => {
    const tema = req.cookies.tema || "claro";
    res.render("temas", {tema});
});

//GET DE SESIONES

app.get("/sesiones", (req, res) => {

    res.render("sesiones");
    
});

//POST DE SESIONES

app.post("/sesiones", (req, res) => {

    res.render("sesiones")
})

//================================
//CREACION DE LAS TARJETAS DE SESIONES
//================================



app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto: ${PORT}`);

});