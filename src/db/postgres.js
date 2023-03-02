const pg = require("pg").Pool;
const config = require("../../config");

const pool = new pg({ connectionString: config.databaseUrl });

pool.connect((err,connection)=> {
  if(err) {
    console.log("[ERROR DB]", err);
    return;
  }
  console.log('Database connected successfully');
  connection.release();
});


function getItemCustomWhere(table, where){
  return new Promise((resolve, reject) => {
    let query = `SELECT * FROM ${table} WHERE ${where}`;

    pool.query(query, (err, data) => {
      if(err) return reject(err);
      resolve(data.rows);
    });   
  });
}

function createItem(table, data){
  return new Promise((resolve, reject) => {
    let queryColumns = "";
    let queryValues = "";

    data.columns.forEach((element, index) => {
      queryColumns += element;
      queryValues += `'${data.values[index]}'`;

      if(index !== data.columns.length - 1){
        queryColumns += ", ";
        queryValues += ", ";
      }
    })

    const query = `INSERT INTO ${table}(${queryColumns}) VALUES(${queryValues})`

    pool.query(query, (err, data) => {
      if(err) return reject(err);
      resolve(data.rowCount);
    });
  });
}

function deleteOldMessages(){
  return new Promise((resolve, reject) => {
    pool.query('SELECT id FROM chats', (err, data) => {
      const length = data.rowCount;
      if(length < 30) return resolve(false)

      const minId = data.rows[(length - 20)].id;
      pool.query(`DELETE FROM chats WHERE id < ${minId}`, (err, data) => {
        if(err) return reject(err);
        resolve(data.rowCount);
      });
    });
  });
}

function getAllChats(){
  return new Promise((resolve, reject) => {
    pool.query('SELECT c.username, c.message, c.date, u.image FROM chats as c INNER JOIN users as u ON c.username = u.username;', (err, data) => {
      if(err) return reject(err);
      resolve(data.rows);
    });
  });
}

module.exports = {
  getAllChats,
  getCustomWhere: getItemCustomWhere, 
  create: createItem,
  deleteOldMessages: deleteOldMessages
}