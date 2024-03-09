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
    res.render('home2');
});

app.get('/noaccess',(req,res)=>{
  console.log('ok1');
  res.render('noaccess');
});

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
  console.log("Received user data:", { name, email, password, address, phone });
  

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
  res.json({ success:true});
});

app.post("/restsignup", async(req, res) => {
  let { name, email, password, address } = req.body;
  // Handle the user data as needed (e.g., save to a database)
  console.log("Received Restaurant data:", { name, email, password, address});
  

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    INSERT INTO Restaurant ( name, email, password, address)
  
    VALUES (:name, :email, :password, :address)
    `;
  
  const binds = { name, email, password, address};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
    const query2=`select restaurant_id from restaurant where
      email=:email and password=:password`;
      const result2 = await connection.execute(query2, {email,password}, { autoCommit: true });
    connection.close();
    console.log(result2.rows[0][0]);
    return res.json({ success: true,rid:result2.rows[0][0] });

 
  }
  
 catch (error) {
    console.error('Error:', error);
     return res.json({success: false });
  }
  return res.json({ success: true });
});

app.get('/addprimarydetails/:id',(req,res)=>{
  const restaurantId=req.params.id;
  res.render('addprimarydetails',{restaurantId});
})

app.post('/initialrestdetails', async (req, res) => { 
  const { category, foodName, price,resid } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    const sql = 'INSERT INTO MENU (category, restaurant_id) VALUES (:category, :resid)';
    const bindParams = { category, resid };
 
    const result = await connection.execute(sql, bindParams, { autoCommit: true });
    const sql2=`INSERT INTO FOOD (FOOD_NAME, FOOD_PRICE, MENU_ID) 
    VALUES (:foodName, :price,(SELECT MENU_ID FROM menu where category=:category and restaurant_id=:resid))`;
    const result2=await connection.execute(sql2, { category, foodName, price,resid }, { autoCommit: true });
    await connection.close();
 
    res.json({ message: 'Data inserted into Oracle Database successfully!' });
  } catch (error) { 
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/riderSignUp',(req,res)=>{
    res.render('riderSignUp');
});

app.get('/cuslogin',(req,res)=>{
  res.render('cuslogin');
});

app.get('/riderLogin',(req,res)=>{
    res.render('riderLogin');
});

app.post("/cuslogin", async(req, res) => {
  let { email, password } = req.body;
  
  // Handle the user data as needed (e.g., save to a database)
  console.log("Received Customer data:", { email, password});

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    SELECT CUSTOMER_ID,PASSWORD FROM CUSTOMER
    WHERE EMAIL=:email AND PASSWORD =: password
    `;
  
  const binds = {  email,password};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const rows = result.rows;
  await connection.close();

    if(rows.length==0)
    {
      console.log('ok');
      return res.json({ success: false });
      
    }
    else 
    res.json({success:true,Id:rows[0][0]});
  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  // Send a response back to the client
});

app.post("/riderSignUp", async(req, res) => {
    const { name, email, password,  phone } = req.body; 
    console.log("Received rider data:", { name, email, password,  phone });

    try {
        const connection = await oracledb.getConnection(dbConfig);


        const query = `
  
    INSERT INTO RIDER ( name, email, password, phone_no)
  
    VALUES (:name, :email, :password, :phone)
    `;

        const binds = { name, email, password, phone };


        const result = await connection.execute(query, binds, { autoCommit: true });


        connection.close();


    }

    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
    // Send a response back to the client
    res.json({ message: "Rider signed up successfully!" });
});

app.post("/reslogin", async(req, res) => {
  let{ email, password } = req.body;
  // Handle the user data as needed (e.g., save to a database)
  console.log("Received Restaurant data:", { email, password});

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    SELECT RESTAURANT_ID,PASSWORD FROM RESTAURANT
    WHERE EMAIL=:email AND PASSWORD =: password
    `;
  
  const binds = {  email,password};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const rows = result.rows;
 if(rows.length==0)
    {
      console.log('ok');
      return res.json({ success: false });
      
    }
    else 
     res.json({success:true,Id:rows[0][0]}); 
  
      
  }
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  // Send a response back to the client
});

app.post("/riderLogin", async(req, res) => {
    const { email, password } = req.body; 
    console.log("Received Rider data:", { email, password});

    try {
        const connection = await oracledb.getConnection(dbConfig);


        const query = `
    SELECT RIDER_ID FROM RIDER
    WHERE EMAIL=:email AND PASSWORD=:password
    `;

        const binds = {  email, password};


        const result = await connection.execute(query, binds, { autoCommit: true });
        const rows = result.rows;


        await connection.close();

        if(rows.length==0)
        {
            console.log('ok');
            return res.render('noaccess.ejs');

        }
        const path='/rid/'+rows[0][0];
        res.redirect(path);

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
});

app.get('/cusview/:id',async(req, res) => {
  const custId=req.params.id;

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    SELECT RESTAURANT_ID,NAME,ADDRESS,RATING,EMAIL,TO_CHAR(CAST(CREATED_ON AS DATE)) as od
    FROM RESTAURANT
    Order by od
    `;
  
  const binds = {  };

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const menus = result.rows.map(row => ({
  id: row[0],
  name: row[1],
  address:row[2],
  rating:row[3],
  email:row[4],
  Opening_date:row[5]
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
    SELECT FOOD_ID, FOOD_NAME, FOOD_PRICE, TO_CHAR(CAST(LAST_UPDATED_ON AS DATE), 'YYYY-MM-DD') AS ud
      FROM FOOD
      WHERE MENU_ID = :menuId
      ORDER BY LAST_UPDATED_ON
    `;
  
  const binds = { menuId };

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const FOODS = result.rows.map(row => ({
  FOOD_ID: row[0],
  FOOD_NAME: row[1],
  FOOD_PRICE: row[2],
  Updated_ON:row[3]
}));
 await connection.close();
res.render('cusviewmenu',{ FOODS:FOODS, custId: custId,menuId:menuId });

    }
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  // Send a response back to the client
});

app.get('/updatefooddetails/:id/:menu',async(req, res) => {
  const foodId=req.params.id;
  const menu=req.params.menu;
 res.render('updatefood',{ menuId: menu, id: foodId });

});

app.post('/update_food', async (req, res) => {
  try { 
    const { food_name, price, menuId, food_id } = req.body;
 
    const connection = await oracledb.getConnection(dbConfig);
 
    const sql = `
      UPDATE food
      SET food_name = :food_name, food_price = :price,LAST_UPDATED_ON=CURRENT_TIMESTAMP
      WHERE menu_Id = :menuId AND food_id = :food_id
    `;

    const binds = { food_name, price, menuId, food_id };
    const options = { autoCommit: true };

    const result = await connection.execute(sql, binds, options);
 
    await connection.close();
 
    res.json({ success: true, message: 'Food details updated successfully.' });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
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

app.get('/rid/:id',async(req,res)=>{
  const id=req.params.id;
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const query = `BEGIN  validate_orders; END; `;
   binds={};
 const result = await connection.execute(query, binds, { autoCommit: true });

 const query1 = `INSERT INTO LOG_RECORDS (TYPE, TYPE_NAME, PARAMETERS, CALLER_TYPE, CALLER_ID)
  VALUES ('PROCEDURE', 'validate_orders', 'NONE', 'RIDER', :id)`;

const result1 = await connection.execute(query1, { id }, { autoCommit: true });



    const query2=`
    SELECT O."Order_ID",p.PAYMENT_AMOUNT,c.ADDRESS ,c.PHONE_NO ,c.NAME 
    FROM "Order" O JOIN CUSTOMER c ON O."Customer_ID" =c.CUSTOMER_ID LEFT JOIN PAYMENT p ON O."Payment_ID"=p.PAYMENT_ID
    WHERE O."Status"='PREPARED' and O."Rider_ID" is null
    `;
    
 const result2 = await connection.execute(query2, binds, { autoCommit: true });
 const orders = result2.rows.map(row => ({
  ORDER_ID: row[0],
  PAYMENT_AMOUNT: row[1],
  ADDRESS: row[2],
  PHONE_NO: row[3],
  NAME:row[4]
}));
 await connection.close();
res.render('riderview',{ orders: orders, id: id });


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

app.get('/writeReview/:custId/:resId',async(req,res)=>{
  const custId=req.params.custId;
  const resId=req.params.resId;
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `SELECT VALID_REVIEWER(:custId,:resId) from dual `;
  
  const binds = { custId, resId };

   const parameters='{'+custId+','+resId+'}';
 const result = await connection.execute(query, binds, { autoCommit: true });
 
 const query2=`INSERT INTO LOG_RECORDS (TYPE,TYPE_NAME,PARAMETERS,CALLER_TYPE, CALLER_ID)
  values ('FUNCTION','VALID_REVIEWER',:parameters,'CUSTOMER',:custId)`;
  const result2= await connection.execute(query2, {parameters,custId}, { autoCommit: true });
 await connection.close(); 
 console.log(result.rows[0][0]);
    if(result.rows[0][0]=="YES")
    res.json({success:true});
    else 
    res.json({success:false});
  }
    
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/validwriteReview/:custId/:resId',async(req,res)=>{
  const custId=req.params.custId;
  const resId=req.params.resId;
  
res.render('writeReview',{ custId: custId,resId:resId });
});

app.post('/reviews', async(req, res) => {
  const { customer_id, restaurant_id, rating, review } = req.body;
 
  console.log('Received review:', {
      customer_id,
      restaurant_id, 
      rating,
      review
  });

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    INSERT INTO REVIEW_SYSTEM ( RATING,COMMENTS,CUSTOMER_ID,RESTAURANT_ID)
  
    VALUES (:rating,:review,:customer_id,:restaurant_id)
    `;
  
  const binds = {  rating, review,customer_id, restaurant_id };

   
 const result = await connection.execute(query, binds, { autoCommit: true });

  
 await connection.close();
 res.json({success:true});

  }
    
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
 
});

app.post('/deletegift', async(req, res) => {
  const { foodId } = req.body;
 let offerid=foodId;
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    DELETE FROM GIFT  where OFFER_ID=:offerid
    `;
  
  const binds = {  offerid };

   
 const result = await connection.execute(query, binds, { autoCommit: true });

  
 await connection.close();
 res.json({success:true});

  }
    
  
 catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
 
});


app.post("/addfood/:id", async(req, res) => { 
  const { id,name,price} = req.body; 
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

app.get('/addoffers/:id',async(req,res)=>{
  const id=req.params.id;
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `    
    SELECT F.FOOD_ID,F.FOOD_NAME,F.FOOD_PRICE 
    FROM RESTAURANT R JOIN MENU m ON R.RESTAURANT_ID =m.RESTAURANT_ID 
    	JOIN FOOD F ON m.MENU_ID =F.MENU_ID 
    WHERE R.RESTAURANT_ID=:id

    `;
  
  const binds = {id};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const FOODS = result.rows.map(row => ({
  FOOD_ID: row[0],
  FOOD_NAME: row[1],
  FOOD_PRICE: row[2],
}));
 await connection.close();
res.render('addoffers',{ FOODS:FOODS });


  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/viewOffer/:id',async(req,res)=>{
  const id=req.params.id;
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `    
     SELECT  G.QUANTITY,F2.FOOD_NAME,G.OFFER_ID
      FROM GIFT G RIGHT JOIN FOOD F ON G.MAIN_FOOD =F.FOOD_ID  
      JOIN FOOD F2 ON G.GIFT_ID= F2.FOOD_ID
      WHERE F.FOOD_ID=:id

    `;
  
  const binds = {id};
  const result = await connection.execute(query, binds, { autoCommit: true });
  const query1=`
  SELECT DISCOUNT_PERCENTAGE 
  FROM OFFER WHERE MAIN_FOOD=:id`;
  const result1 = await connection.execute(query1, binds, { autoCommit: true });
  const FOODS = result.rows.map(row => ({
    QUANTITY: row[0],
    FOOD_NAME: row[1], 
    OFFER_ID:row[2]
  }));
  await connection.close();
  if(result1.rows.length==0)
  {res.render('viewoffers',{ FOODS:FOODS ,discount:false});}
  else 
  {res.render('viewoffers',{ FOODS:FOODS ,discount:true, percent:result1.rows[0][0]});}


  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/addoffertofood/:id',async(req,res)=>{
  const id=req.params.id;
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `    
    SELECT F.FOOD_ID,F.FOOD_NAME,F.FOOD_PRICE 
    FROM RESTAURANT R JOIN MENU m ON R.RESTAURANT_ID =m.RESTAURANT_ID 
    	JOIN FOOD F ON m.MENU_ID =F.MENU_ID 
    WHERE R.RESTAURANT_ID=
    (SELECT R1.RESTAURANT_ID 
      FROM RESTAURANT R1 JOIN MENU m1 ON R1.RESTAURANT_ID =m1.RESTAURANT_ID 
    	JOIN FOOD F1 ON m1.MENU_ID =F1.MENU_ID 
    WHERE F1.FOOD_ID=:id)

    `;
  
  const binds = {id};

   
 const result = await connection.execute(query, binds, { autoCommit: true });
 const FOODS = result.rows.map(row => ({
  FOOD_ID: row[0],
  FOOD_NAME: row[1],
  FOOD_PRICE: row[2],
}));
 await connection.close();
res.render('addofferstofood',{ FOODS:FOODS ,mainfood:id});


  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/applyDiscount/:id',async(req,res)=>{
  const id=req.params.id;
  const discountPercentage = req.body.discount;
  const offerName = req.body.offerName;

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
    const query1=`SELECT MAIN_FOOD FROM OFFER WHERE MAIN_FOOD=:id`;
    const binds1={id};
    const result1 = await connection.execute(query1, binds1, { autoCommit: true });
    if(result1.rows.length==0)
    {
      const query = `    
      INSERT INTO OFFER (OFFER_NAME, DISCOUNT_PERCENTAGE,MAIN_FOOD) VALUES (:offerName,  :discountPercentage,:id )
        `;
      const binds = {offerName,discountPercentage,id};
      const result = await connection.execute(query, binds, { autoCommit: true });
      await connection.close();
    }
    else{
      const query = `  
      UPDATE OFFER
      SET
        OFFER_NAME = :offerName,
        DISCOUNT_PERCENTAGE = :discountPercentage
      WHERE MAIN_FOOD=:id
      `;
      const binds = {offerName,discountPercentage,id};
      const result = await connection.execute(query, binds, { autoCommit: true });
      await connection.close();
    }
 
    res.redirect(`/addoffertofood/${id}`);

  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/addoffer/:id/tofood/:mainfood',async(req,res)=>{
  const id=req.params.id;
  const mainfood=req.params.mainfood; 

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
    const query1=`SELECT MAIN_FOOD,QUANTITY FROM GIFT WHERE MAIN_FOOD=:mainfood AND GIFT_ID=:id`;
    const binds1={mainfood,id};
    const result1 = await connection.execute(query1, binds1, { autoCommit: true });
    if(result1.rows.length==0)
    {
      const query = `    
      INSERT INTO GIFT (QUANTITY, GIFT_ID,MAIN_FOOD) VALUES (1,:id,:mainfood )
        `;
      const binds = { id,mainfood};
      const result = await connection.execute(query, binds, { autoCommit: true });
      await connection.close();
    }
    else{
      const query = `  
      UPDATE GIFT
      SET
        QUANTITY= :new_quantity
      WHERE MAIN_FOOD=:mainfood AND GIFT_ID=:id
      `;
      console.log(result1.rows[0][1]);
      const new_quantity=result1.rows[0][1]+1;
      const binds = {new_quantity,mainfood,id};
      const result = await connection.execute(query, binds, { autoCommit: true });
      await connection.close();
    }
 
    res.redirect(`/addoffertofood/${mainfood}`);

  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/addtocart',async(req,res)=>{
  const foodId=req.body.foodId;
  const custid=req.body.custid; 
  const menuId=req.body.menuId; 

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
    const query1=`Begin
                        Add_food(:custid,:foodId);
                  END;`;
    const binds1={custid,foodId};
    const parameters='{'+custid+','+foodId+'}';
    const result1 = await connection.execute(query1, binds1, { autoCommit: true });
    
    const query2=`INSERT INTO LOG_RECORDS (TYPE,TYPE_NAME,PARAMETERS,CALLER_TYPE, CALLER_ID)
     values ('PROCEDURE','Add_food',:parameters,'CUSTOMER',:custid)`;
     const result2= await connection.execute(query2, {parameters,custid}, { autoCommit: true });
    
 
    res.redirect(`/cus/${custid}/viewmenu/${menuId}`);

  }
  catch (error) 
  {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/placeorder',async(req,res)=>{ 
  const custid=req.body.custId; 

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
      const query = `  
      UPDATE "Order"
      SET
      "Status" ='PLACED'
      WHERE "Customer_ID"=:custid AND "Status" ='NOT PLACED' 
      `;  
      const binds = {custid};
      const result = await connection.execute(query, binds, { autoCommit: true });
      await connection.close();
    
 
    res.json({success:true,Id: custid});

  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/rid/:Id/viewpickedorder',async(req,res)=>{
  const id=req.params.Id; 
  try {
    const connection = await oracledb.getConnection(dbConfig);
   const query=`SELECT "Order_ID"  from "Order"
   Where "Status"='PICKED UP' and "Rider_ID"=:id`;
   const result= await connection.execute(query, {id}, { autoCommit: true });
   const orderId=result.rows[0][0];
    const query2=`
    SELECT OI.QUANTITY , F.FOOD_NAME,R.NAME as name
        FROM "Order" O JOIN ORDER_ITEM OI ON O."Order_ID"=OI.ORDER_ID join FOOD F ON OI.FOOD_ID=F.FOOD_ID
           Join  MENU M ON F.MENU_ID=M.MENU_ID JOIN RESTAURANT R ON M.RESTAURANT_ID = R.RESTAURANT_ID
        WHERE  O."Order_ID"= :orderId 
    UNION
    SELECT OI.QUANTITY * G.QUANTITY,F.FOOD_NAME, R.NAME as name
    FROM "Order" O JOIN ORDER_ITEM OI ON O."Order_ID"=OI.ORDER_ID  join GIFT G ON OI.FOOD_ID=G.MAIN_FOOD JOIN FOOD F ON G.GIFT_ID=F.FOOD_ID
    Join  MENU M ON F.MENU_ID=M.MENU_ID JOIN RESTAURANT R ON M.RESTAURANT_ID = R.RESTAURANT_ID
    WHERE  O."Order_ID"= :orderId
    order by name
    `;
    const binds2={orderId,orderId};
    const result2 = await connection.execute(query2, binds2, { autoCommit: true });
  const FOODS = result2.rows.map(row => ({
    QUANTITY: row[0],
    FOOD_NAME: row[1], 
    RESTAURANT: row[2]
  }));
  await connection.close();
  res.render('ridviewsorder',{ FOODS:FOODS,ridid:id,orderId:orderId });
}
catch (error) {
  console.error('Error:', error);
  res.status(500).json({ message: 'You have not picked any orders' });
}
})

app.post('/pickorder',async(req,res)=>{ 
  const orderId=req.body.orderId; 
  const RiderId=req.body.Id; 

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
      const binds = {RiderId,orderId};
      console.log(binds);
      const parameters='{'+RiderId+','+orderId+'}'
      console.log("OK");
      let query = `  BEGIN
                    pick_order(:orderId ,:RiderId);
                    END;
      `;  
      const result = await connection.execute(query, binds, { autoCommit: true });
      const query2=`INSERT INTO LOG_RECORDS (TYPE,TYPE_NAME,PARAMETERS,CALLER_TYPE, CALLER_ID)
     values ('PROCEDURE','pick_order',:parameters,'RIDER',:RiderId)`;
     const result2= await connection.execute(query2, {parameters,RiderId}, { autoCommit: true });
    
      
      await connection.close();
    
 
    res.json({success:true});

  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/rid/:Id/viewsorder/:orderId',async(req,res)=>{
  const id=req.params.Id; 
  const orderId=req.params.orderId; 
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
    const query2=`
    SELECT OI.QUANTITY , F.FOOD_NAME,R.NAME as name
        FROM "Order" O JOIN ORDER_ITEM OI ON O."Order_ID"=OI.ORDER_ID join FOOD F ON OI.FOOD_ID=F.FOOD_ID
           Join  MENU M ON F.MENU_ID=M.MENU_ID JOIN RESTAURANT R ON M.RESTAURANT_ID = R.RESTAURANT_ID
        WHERE  O."Order_ID"= :orderId 
    UNION
    SELECT OI.QUANTITY * G.QUANTITY,F.FOOD_NAME, R.NAME as name
    FROM "Order" O JOIN ORDER_ITEM OI ON O."Order_ID"=OI.ORDER_ID  join GIFT G ON OI.FOOD_ID=G.MAIN_FOOD JOIN FOOD F ON G.GIFT_ID=F.FOOD_ID
    Join  MENU M ON F.MENU_ID=M.MENU_ID JOIN RESTAURANT R ON M.RESTAURANT_ID = R.RESTAURANT_ID
    WHERE  O."Order_ID"= :orderId
    order by name
    `;
    const binds2={orderId,orderId};
    const result2 = await connection.execute(query2, binds2, { autoCommit: true });
  const FOODS = result2.rows.map(row => ({
    QUANTITY: row[0],
    FOOD_NAME: row[1], 
    RESTAURANT: row[2]
  }));
  await connection.close();
  res.render('ridviewsorder',{ FOODS:FOODS,ridid:id,orderId:orderId });
}
catch (error) {
  console.error('Error:', error);
  res.status(500).json({ message: 'Internal server error' });
}
})

app.post('/deliverorder',async(req,res)=>{ 
  const orderId=req.body.orderId; 
  const RiderId=req.body.Id; 

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
      const binds = {RiderId,orderId};
      console.log(binds);
      console.log("OK");
      let query = `  
      UPDATE "Order" SET "Status" ='DELIVERED'  WHERE "Order_ID"=:orderId 
      `;  
      const result = await connection.execute(query, {orderId}, { autoCommit: true });
      await connection.close();
    
 
    res.json({success:true});

  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/prepareOrder',async(req,res)=>{ 
  const orderID=req.body.orderID;
  const resid=req.body.resid; 

  try {
    const connection = await oracledb.getConnection(dbConfig);
   
      const query = `  
      UPDATE ORDER_ITEM
      SET
      PREPARED ='YES'
      WHERE ORDER_ID=:orderID AND FOOD_ID IN (SELECT F.FOOD_ID FROM FOOD F JOIN MENU m ON F.menu_id=m.menu_id JOIN RESTAURANT r ON m.restaurant_id=r.restaurant_id
        WHERE r.restaurant_id=:resid)
      `;  
      const binds = {orderID,resid};
      const result = await connection.execute(query, binds, { autoCommit: true });
      await connection.close();
    
 
    res.json({success:true });

  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/viewcart/:id',async(req,res)=>{
  const id=req.params.id;
  const name='Food';
  const amount=1;
  let gift={name,amount};
  let gifts=[gift];
  gifts.splice(0, gifts.length);
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
    const query2=`
    SELECT OI.QUANTITY , F.FOOD_NAME, F.FOOD_PRICE,ROUND((OI.QUANTITY * F.FOOD_PRICE) *(1-NVL(O.DISCOUNT_PERCENTAGE/100,0)),2),OI.FOOD_ID
        FROM ORDER_ITEM OI join FOOD F ON OI.FOOD_ID=F.FOOD_ID
          Left Join  OFFER O ON F.FOOD_ID=O.MAIN_FOOD
        WHERE  OI.Order_ID=(SELECT "Order_ID" FROM "Order" WHERE "Customer_ID"=:id AND "Status"='NOT PLACED' )`;
    const binds2={id};
    const result2 = await connection.execute(query2, binds2, { autoCommit: true });
  const FOODS = result2.rows.map(row => ({
    QUANTITY: row[0],
    FOOD_NAME: row[1], 
    ITEM_PRICE: row[2], 
    TOTAL_PRICE: row[3],
    FOOD_ID:row[4]
  }));
  FOODS.forEach(async food => { 
    const FOOD_ID=food.FOOD_ID;
    const binds={FOOD_ID};
    const query=`
    SELECT F.FOOD_NAME,G.QUANTITY
    FROM FOOD F JOIN GIFT G ON G.GIFT_ID =F.FOOD_ID
    WHERE G.MAIN_FOOD =:FOOD_ID
      `
      const result = await connection.execute(query, binds, { autoCommit: true });
      const rows=result.rows;
      for(i=0;i<rows.length;i++)
      {
        gift={  name:rows[i][0], amount:rows[i][1]*food.QUANTITY};
        gifts.push(gift);
      }
  });
  await connection.close();

  res.render('viewcart',{ FOODS:FOODS ,custId:id, gifts:gifts});


  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/reviews/:id',async(req,res)=>{
  const id=req.params.id; 
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
    const query2=`
    SELECT C.NAME,R.rating,R.comments
    from REVIEW_SYSTEM R JOIN CUSTOMER C ON C.CUSTOMER_ID=R.CUSTOMER_ID
        WHERE  R.RESTAURANT_ID = :id
    `;
    const binds2={id,id};
    const result2 = await connection.execute(query2, binds2, { autoCommit: true });
  const comments = result2.rows.map(row => ({
    name: row[0],
    rating: row[1], 
    review: row[2]
  }));
  await connection.close();

  res.render('resreview',{ comments:comments,resid:id });


  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/trackOrders/:id',async(req,res)=>{
  const id=req.params.id; 
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
    const query2=`
    SELECT R.name,R.phone_no,P.Payment_amount,O."Status",O."Order_ID"
    from RIDER R RIGht JOIN "Order" O ON O."Rider_ID"=R.RIDER_ID JOIN PAYMENT P ON O."Payment_ID"=P.PAyment_ID
        WHERE  O."Customer_ID" = :id and O."Status" <>'NOT PLACED'
    `;
    const binds2={id};
    const result2 = await connection.execute(query2, binds2, { autoCommit: true });
  const comments = result2.rows.map(row => ({
    riderName: row[0],
    PHONE_No: row[1], 
    paymentBill: row[2],
    orderStatus:row[3],
    ORDER_ID:row[4]
  }));
  await connection.close();

  res.render('trackorders',{ orders:comments,cusid:id });


  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/vieworders/:id',async(req,res)=>{
  const id=req.params.id; 
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
    const query2=`
    SELECT OI.QUANTITY , F.FOOD_NAME, F.FOOD_PRICE,OI.ORDER_ID
        FROM "Order" O JOIN ORDER_ITEM OI ON O."Order_ID"=OI.ORDER_ID join FOOD F ON OI.FOOD_ID=F.FOOD_ID
           Join  MENU M ON F.MENU_ID=M.MENU_ID JOIN RESTAURANT R ON M.RESTAURANT_ID = R.RESTAURANT_ID
        WHERE  R.RESTAURANT_ID = :id and O."Status"='PLACED' and OI.PREPARED='NO'
    UNION
    SELECT OI.QUANTITY * G.QUANTITY,F.FOOD_NAME, 0,OI.ORDER_ID
    FROM "Order" O JOIN ORDER_ITEM OI ON O."Order_ID"=OI.ORDER_ID  join GIFT G ON OI.FOOD_ID=G.MAIN_FOOD JOIN FOOD F ON G.GIFT_ID=F.FOOD_ID
    Join  MENU M ON F.MENU_ID=M.MENU_ID 
    WHERE  M.RESTAURANT_ID = :id and O."Status"='PLACED' and OI.PREPARED='NO'
    `;
    const binds2={id,id};
    const result2 = await connection.execute(query2, binds2, { autoCommit: true });
  const FOODS = result2.rows.map(row => ({
    QUANTITY: row[0],
    FOOD_NAME: row[1], 
    ITEM_PRICE: row[2],
    ORDER_ID :row[3] 
  }));
  await connection.close();

  res.render('vieworders',{ FOODS:FOODS,resid:id });


  }
  catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const adminCredentials = {
  username: 'admin',
  password: 'pass'
};
app.get('/login', (req, res) => {
  res.render('adlogin');
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === adminCredentials.username && password === adminCredentials.password) { 
    res.redirect('/logs');
  } else { 
    res.redirect('/login');
  }
});

app.get('/logs', async(req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
   
 
    const query = `
    SELECT LOG_ID,CALLER_TYPE,CALLER_ID,TYPE ,TYPE_NAME, PARAMETERS  ,CALL_TIME  FROM LOG_RECORDS 
    order by log_id
    `;
    
   
 const result = await connection.execute(query,{}, { autoCommit: true });
 const logRecords = result.rows.map(row => ({
  LOG_ID: row[0],
  CALLER_TYPE: row[1],
  CALLER_ID:row[2],
  TYPE:row[3],
  TYPE_NAME:row[4],
  PARAMETERS:row[5],
  CALL_TIME:row[6]
}));
 await connection.close();
  res.render('logs', { logRecords });
}
catch (error) {
  console.error('Error:', error);
  res.status(500).json({ message: 'Internal server error' });
}
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});