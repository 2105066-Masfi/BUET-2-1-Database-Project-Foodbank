const morgan = require('morgan');
const express = require('express');
const router = require('express-promise-router')();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');

const app = express();

const PORT = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({extended:true }));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(router);


const dbConfig = {
  user: 'HR',
  password: 'hr',
  connectString: '0.0.0.0:1521/ORCL ', 
};

app.set('view engine','ejs');
app.set('views','public');


app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/noaccess',(req,res)=>{
  console.log('ok1');
  res.render('noaccess');
});
// Endpoint for user registration (Sign Up)
app.get('/ind',(req,res)=>{
  res.render('ind');
});

app.get('/restsignup',(req,res)=>{
  res.render('restsignup');
});

app.get('/reslogin',(req,res)=>{
  res.render('reslogin');
});

app.post("/ind", async(req, res) => {
  let { name, email, password, address, phone } = req.body;
  
  // Handle the user data as needed (e.g., save to a database)
  console.log("Received user data:", { name, email, password, address, phone });
  bcrypt.hash(password, 10, function(err, hash) {
    // store hash in the database
    password=hash;
});
async function hashPassword(password) {
  password = await bcrypt.hash(password, 10);
  // Store hash in the database
}

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
  
    INSERT INTO Customer ( name, email, password, address, phone_no)
  
    VALUES (:name, :email, :password, :address, :phone)
    `;
  
  const binds = { name, email, password, address, phone };

   
 const result = await connection.execute(query, binds, { autoCommit: true });
  
  
    connection.close();

 
  }
  
 catch (error) {
    console.error('Error:', error);
    return res.json({success:false});
  }
  // Send a response back to the client
  res.json({ success:true});
});

app.post("/restsignup", async(req, res) => {
  let { name, email, password, address } = req.body;
  // Handle the user data as needed (e.g., save to a database)
  console.log("Received Restaurant data:", { name, email, password, address});
  bcrypt.hash(password, 10, function(err, hash) {
    // store hash in the database
    password=hash;
});

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    INSERT INTO Restaurant ( name, email, password, address)
  
    VALUES (:name, :email, :password, :address)
    `;
  
  const binds = { name, email, password, address};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
  
  
    connection.close();

 
  }
  
 catch (error) {
    console.error('Error:', error);
     return res.json({success: false });
  }
  // Send a response back to the client
  return res.json({ success: true });
});

app.get('/cuslogin',(req,res)=>{
  res.render('cuslogin');
});

app.post("/cuslogin", async(req, res) => {
  let { email, password } = req.body;
  
  // Handle the user data as needed (e.g., save to a database)
  console.log("Received Customer data:", { email, password});

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    SELECT CUSTOMER_ID,PASSWORD FROM CUSTOMER
    WHERE EMAIL=:email
    `;
  
  const binds = {  email};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const rows = result.rows;
  await connection.close();

    if(rows.length==0)
    {
      console.log('ok');
      return res.json({ success: false });
      
    }
    else 
    bcrypt.compare(password, rows[0][1], function(err, result) {
      if (result) {
          // password is valid
          res.json({success:true,Id:rows[0][0]});
      }
      else return res.json({ success: false });
  });
      
  }
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  // Send a response back to the client
});

app.post("/reslogin", async(req, res) => {
  let{ email, password } = req.body;
  // Handle the user data as needed (e.g., save to a database)
  console.log("Received Restaurant data:", { email, password});

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    SELECT RESTAURANT_ID,PASSWORD FROM RESTAURANT
    WHERE EMAIL=:email
    `;
  
  const binds = {  email};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const rows = result.rows;
 if(rows.length==0)
    {
      console.log('ok');
      return res.json({ success: false });
      
    }
    else 
    bcrypt.compare(password, rows[0][1], function(err, result) {
      if (result) {
          // password is valid
          res.json({success:true,Id:rows[0][0]});
      }
      else return res.json({ success: false });
  });
  
      
  }
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  // Send a response back to the client
});

app.get('/res/:id/addmenu',async(req,res)=>{
  const restaurantId=req.params.id;
  res.render('addmenu',{ id: restaurantId });
});

app.post("/res/:id/addmenu", async(req, res) => {
  const restaurantId=req.params.id;
  const { category} = req.body;
  // Handle the user data as needed (e.g., save to a database)
  console.log("Received Menu data:", {category});

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    INSERT INTO MENU ( restaurant_Id,category)
  
    VALUES (:restaurantId,:category)
    `;
  
  const binds = {  restaurantId, category};

   
 const result = await connection.execute(query, binds, { autoCommit: true });

  
 await connection.close();

    }
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  // Send a response back to the client
});

app.get('/cusview/:id',async(req, res) => {
  const custId=req.params.id;

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    SELECT RESTAURANT_ID,NAME,ADDRESS,RATING,EMAIL
    FROM RESTAURANT
    `;
  
  const binds = {  };

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const menus = result.rows.map(row => ({
  id: row[0],
  name: row[1],
  address:row[2],
  rating:row[3],
  email:row[4],
}))
  
 await connection.close();
 res.render('cusview',{ Restaurants: menus, id: custId });

    }
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  // Send a response back to the client
});

app.get('/cus/:custId/viewres/:restId',async(req, res) => {
  const custId=req.params.custId;
  const restId=req.params.restId;


  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    SELECT MENU_ID,CATEGORY
    FROM MENU
    WHERE RESTAURANT_ID=:restId
    `;
  
  const binds = { restId };

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const menus = result.rows.map(row => ({
  id: row[0],
  category: row[1],
}));
const query2 = `
SELECT NAME
FROM RESTAURANT
WHERE RESTAURANT_ID=:restId
`;

const result2 = await connection.execute(query2, binds, { autoCommit: true });

 await connection.close();
 res.render('cusviewres',{ restname:result2.rows[0][0] ,menus: menus, id: custId });

    }
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  // Send a response back to the client
});
app.get('/cus/:custId/viewmenu/:menuId',async(req, res) => {
  const custId=req.params.custId;
  const menuId=req.params.menuId;


  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    
    const query = `
    SELECT FOOD_ID,FOOD_NAME,FOOD_PRICE FROM FOOD
    WHERE MENU_ID=:menuId
    `;
  
  const binds = { menuId };

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const FOODS = result.rows.map(row => ({
  FOOD_ID: row[0],
  FOOD_NAME: row[1],
  FOOD_PRICE: row[2],
}));
 await connection.close();
res.render('cusviewmenu',{ FOODS:FOODS, custId: custId });

    }
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  // Send a response back to the client
});

app.get('/res/:id',async(req,res)=>{
  const id=req.params.id;
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    SELECT MENU_ID,CATEGORY FROM MENU
    WHERE RESTAURANT_ID=:id
    `;
  
  const binds = {id};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const menus = result.rows.map(row => ({
  menu_id: row[0],
  category: row[1],
}));
 await connection.close();
res.render('resview',{ menus: menus, id: id });


  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/menu/:id',async(req,res)=>{
  const id=req.params.id;
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    SELECT FOOD_ID,FOOD_NAME,FOOD_PRICE FROM FOOD
    WHERE MENU_ID=:id
    `;
  
  const binds = {id};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const FOODS = result.rows.map(row => ({
  FOOD_ID: row[0],
  FOOD_NAME: row[1],
  FOOD_PRICE: row[2],
}));
 await connection.close();
res.render('menu',{ FOODS:FOODS, menuId: id });


  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.delete('/menu/:id',async(req,res)=>{
  const id=req.params.id;
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    DELETE FROM FOOD
    WHERE FOOD_ID=:id
    `;
  
  const binds = {id};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 await connection.close();


  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

});

app.delete('/delmenu/:id',async(req,res)=>{
  const id=req.params.id;
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    DELETE FROM FOOD
    WHERE MENU_ID=:id
    `;
  
  const binds = {id};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const query2 = `
    DELETE FROM MENU
    WHERE MENU_ID=:id
    `;
    
 const result2 = await connection.execute(query2, binds, { autoCommit: true });
 await connection.close();


  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/addfood/:id',(req,res)=>{
  const id=req.params.id;
  
res.render('addfood',{ id: id });
});

app.post("/addfood/:id", async(req, res) => {
 // const id=req.params.id;
  const { id,name,price} = req.body;
  // Handle the user data as needed (e.g., save to a database)
  console.log("Received Menu data:", {id,name,price});

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    INSERT INTO FOOD ( MENU_ID,FOOD_NAME,FOOD_PRICE)
  
    VALUES (:id,:name,:price)
    `;
  
  const binds = {  id,name,price};

   
 const result = await connection.execute(query, binds, { autoCommit: true });

  
 await connection.close();

    }
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  // Send a response back to the client
});


app.listen(PORT, () => {
  console.log('Server is running on http://localhost:${PORT}');
});