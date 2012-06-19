var sys = require('sys');
var http = require('http');
var pg=require('pg');

//Function calling itself recursively as it traverses the path
//res=response object to return oid
//client=postgres connection
//path=array of path elements
//handle="current" directory
//index="current" element index
function traverse(res, client, path, handle, index){
  console.log(path);
  var sql;
  if (index<path.length){
    sql='SELECT handleid FROM parent WHERE (handleidparent=\''+ handle+'\' AND name=\''+path[index]+'\')';
        console.log(sql);
        client.query(sql, function(err, result){
          if(err){
            console.log(err);
          }else{
            console.log(result);
            if (result.rowCount>0){
              traverse(res, client, path, result.rows[0].handleid, index+1);
            }
          }
        });
        } else {
          //on leaf...
          sql='SELECT inode FROM handle WHERE handleid='+handle;
          console.log(sql);
          client.query(sql, function(err,result){
            if(err){
              console.log(err);
            } else {
              res.end(result.rows[0].inode);
            }
          });
        }
}

var connectionString = "pg://djn:test@localhost:5432/ovfs";
//Create web server...
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  pg.connect(connectionString, function(err,client){
    if(err){
      console.log(err);
    } else {
      //traverse the directory structure assuming the filesystem root
      //has handleidparent==1
      traverse(res, client, req.url.split('/'), 1, 1);
    }
  });
}).listen(1337, "127.0.0.1");
console.log('Server running at http://127.0.0.1:1337/');
