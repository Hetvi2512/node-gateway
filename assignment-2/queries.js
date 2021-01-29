var datetime = require('node-datetime');

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

  // to check if car with same name exists or not
   const oldCar = await pool.query("select name from car where name = $1",[carname]);
   if(oldCar.rowCount>=1)
   {
    response.send("Car Already Exists !");
   }
   else{
     //To check if makename and model name exists or not
    const oldMakeId = await pool.query("select makeid,makename from make where  makename = $1",[makename]);
    const oldModelId = await pool.query("select modelid,modelname from model where modelname =$1",[modelname]);

    if(oldMakeId.rowCount >=1)
    {
      // if make name exists then fetching its ID
      newmakeid = oldMakeId.rows[0].makeid;
    }
    else{
      // If make name is new then inserting it and getting new ID
       const result2 = await pool.query('INSERT INTO make (makename) VALUES ($1) returning makeid', [makename]);
       newmakeid = result2.rows[0].makeid;
     }
    if(oldModelId.rowCount >=1)
    {
      // if model name exists then fetching its ID
      newmodelid = oldModelId.rows[0].modelid;
    }
    else{
       // If make name is new then inserting it and getting new ID
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
  const carImageUpload = (request,response,next)=>{
    
    const id = parseInt(request.params.id);
   if (!request.file) {
    response.status(500);
    return next(err);
  } 
  var dt = datetime.create();
   var formatted = dt.format('m/d/Y H:M:S');
  var name = request.file.filename;
  var details = `/uploads/images/${request.file.filename}`;
  console.log(details);
  pool.query('INSERT INTO carimage (imagename,createddate,carid,imagePath) VALUES ($1,$2,$3,$4) ', [name,formatted,id,details]);
  response.json({ fileUrl: 'http://localhost:3000/uploads/images/' + request.file.filename });
  }
const getCarWithImage = (request, response) => {
  pool.query('SELECT c.id,c.name, m.makename,mo.modelname,img.imagename,img.imagepath FROM car c left join make m on c.makeid = m.makeid left join model mo on c.modelid = mo.modelid left join carimage img on c.id = img.carid', (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
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
    updateCar,
    carImageUpload,
    getCarWithImage
 
}
