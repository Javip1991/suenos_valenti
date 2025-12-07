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

//SERVIDOR ESTATICO (/PUBLIC)



app.set("view engine", "ejs");
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

    let errores = [];
    let validaciones = [];

    //VALIDACION DE ERRORES

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

    req.session.user = {
        ...req.session.user, 
        nombre,
        email,
        edad,
        ciudad,
        intereses
    };
    
    res.redirect("/perfil");
   
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
        return res.redirect("/perfil");
    }
    res.status(401).render("login", {error: "Usuario o contraseña incorrectos"});
});



//GET DEL PERFIL

app.get("/perfil", requiereAuth, (req, res) => {
    const user = req.session.user;
    

    res.render("perfil", {user});
});


//POST DEL PERFIL-LOGOUT

app.post("/logout", (req, res) => {
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
//CREACION DE LAS TAJETAS DE SESIONES
//================================



app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto: ${PORT}`);

});