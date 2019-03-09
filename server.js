const express = require('express');
const app = express();
const bp = require('body-parser');
const fs = require('fs');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');

var db = require('knex')({
    client: 'mysql',
    connection: {
      host : '127.0.0.1',
      user : 'arjun',
      password : 'Kamalakshi1998',
      database : 'smartbrain'
    }
  });



app.use(bp.json());
app.use(cors());




app.get('/',(req,res)=>{
    res.json('Its working!');
})

app.post('/signin',(req,res)=>{
    db.select('email','hash').from('login').where('email','=',req.body.email)
    .then(data=>{
        const isValid = bcrypt.compareSync(req.body.password,data[0].hash);
        if(isValid)
        {
            db.select('*').from('users')
            .where('email','=',req.body.email)
            .then(user=>{
                res.json(user[0]);
            })
            .catch(err=>{
                res.status(400).json('failed2')
            })
        }
        else{
            res.status(400).json('failed2')
        }
    })
    .catch(err=>{
        res.status(400).json('failed1');
    })
});


app.post('/register',(req,res)=>{

    const body = req.body;

    const hash = bcrypt.hashSync(body.password);
    

    db('login').insert({
        hash: hash,
        email: body.email
    }).then(logEmail=>{
        db('users').insert({
        email: body.email,
        name: body.name,
        joined: new Date()
        }).then(resp=>{
            res.json('success')
        }).catch(err=>{
            delete('login').where('email','=',body.email)
            .then(resp=>{
                res.json('Failed to create user!')
            })
            .catch('failed to delete from login table')
        })
    }).catch(err=> {
        res.json('failed to create user/ maybe duplicate')
    })
    
});

app.get('/profile/:id',(req,res)=>{
    
    const param = req.params;
    let found = false;
    db.select('*').from('users').where({id: param.id}).then(user=>{
        if(user.length)
        {res.json(user[0]);}
        else{
            res.status(400).json('user not found');
        }
    }).catch(err=>{
        res.status(400).json('error getting user');
    });
})

app.put('/image',(req,res)=>{
    const {id} = req.body;
   db('users').where('id','=',id).increment('entries',1)
   .then(entries=>{
       db.select('entries').from('users').where('id','=',id)
       .then(ent=>{
           res.json(ent[0].entries);
       })
       .catch(err=>{
           res.status(400).json('User not found!');
       })
   }).catch(err=>{
       res.status(400).json('User not found!');
   })
})



app.listen(process.env.PORT || 3000,()=>{
    console.log(`app is running on port ${process.env.PORT}`);
});



/*
-->  res=This is working
--> signin : POST = success/fail
--> register: POST = return user
--> profile/: userId--> get = user
--> image-->PUT (update the score of number of submitted)
*/