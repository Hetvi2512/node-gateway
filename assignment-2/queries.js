const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Assignment2',
  password: 'hetvi',
  port: 5432,
})


const getCars = (request, response) => {
  pool.query('SELECT c.id,c.name, m.makename,mo.modelname FROM car c left join make m on c.makeid = m.makeid left join model mo on c.modelid = mo.modelid', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}


const getCarsById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT c.id,c.name, m.makename,mo.modelname FROM car c inner join make m on c.makeid = m.makeid inner join model mo on c.modelid = mo.modelid WHERE c.id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    if(results.rowCount<=0)
    {
      response.json("No data found");
    }
    response.status(200).json(results.rows)
  })
}

const createCar = async (request, response) => {
  let carname  = (request.body.carname).toString().toLowerCase();
  let makename = (request.body.makename).toString().toLowerCase();
  let modelname = (request.body.modelname).toString().toLowerCase();
  let newmodelid;
  let newmakeid;
   const oldCar = await pool.query("select name from car where name = $1",[carname]);
   if(oldCar.rowCount>=1)
   {
    response.send("Car Already Exists !");
   }
   else{
    const oldMakeId = await pool.query("select makeid,makename from make where  makename = $1",[makename]);
    const oldModelId = await pool.query("select modelid,modelname from model where modelname =$1",[modelname]);

    if(oldMakeId.rowCount >=1)
    {
      newmakeid = oldMakeId.rows[0].makeid;
      console.log(oldMakeId.rows[0].makeid);
    }
    else{
       const result2 = await pool.query('INSERT INTO make (makename) VALUES ($1) returning makeid', [makename]);
       newmakeid = result2.rows[0].makeid;
     }
    if(oldModelId.rowCount >=1)
    {
      newmodelid = oldModelId.rows[0].modelid;
      console.log(oldModelId.rows[0].modelid);
    }
    else{
      const result1 = await pool.query('INSERT INTO model (modelname) VALUES ($1) returning modelid', [modelname]);
       newmodelid = result1.rows[0].modelid;
    }
   
    pool.query('insert into car (name,makeid,modelid) values ($1,$2,$3)',[carname, newmakeid, newmodelid], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`Car added successfully`)
    });
   }
    
}

const updateCar = async(request, response) => {
  const id = parseInt(request.params.id)
  let carname = (request.body.carname).toString().toLowerCase();
  let makename = (request.body.makename).toString().toLowerCase();
  let modelname = (request.body.modelname).toString().toLowerCase();

  const oldCar = await pool.query("select name,makeid,modelid from car where name = $1",[carname]);
  let modelid = oldCar.rows[0].modelid;
  let makeid =  oldCar.rows[0].makeid;
  
  pool.query(
      'UPDATE make SET makename = $1 WHERE makeid = $2',[makename, makeid],
      (error, results) => {
        if (error) {        
          throw error
        }
       }
    )
    pool.query(
      'UPDATE model SET modelname = $1 WHERE modelid = $2',[modelname, modelid],
      (error, results) => {
        if (error) {        
          throw error
        }
      }
    )
    pool.query(
      'UPDATE car SET name = $1 WHERE id = $2',[carname, id],
      (error, results) => {
        if (error) {        
          throw error
        }
        response.status(200).send(`Car modified with ID: ${id}`)
      }
    )
  }
  

const deleteCar = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('DELETE FROM car WHERE id = $1', [id], (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).send(`Car deleted with ID: ${id}`)
  })
}

module.exports = {
    getCars,
    getCarsById,
    createCar,
    deleteCar,
    updateCar
 
}




/*
index.js => app.post('/users', db.createUser)




app.put('/users/:id', db.updateUser)



const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  let username = request.body.username;

  pool.query(
    'UPDATE users SET username = $1 WHERE id = $2',
    [username, id],
    (error, results) => {
      if (error) {        
        throw error
      }
      response.status(200).send(`User modified with ID: ${id}`)
    }
  )
}




*/