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

/*db.select('*').from('users').then(data=>{
    console.log(data);
}); */




const database = {
    users: [
        {
            id: 123,
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: 124,
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ],
    login:[
        {
            id: '987',
            hash: '',
            email: 'john@gmail.com'
        }
    ]
}


app.use(bp.json());
app.use(cors());




app.get('/',(req,res)=>{
    res.json(database.users);
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

    /*bcrypt.hash(body.password, null, null, function(err, hash) {
        // Store hash in your password DB.
        console.log(hash);
    });*/

    const hash = bcrypt.hashSync(body.password);
    /* db.transaction(trx=>{
         trx
         .returning('email')
         .insert({
             hash: hash,
             email : body.email
         })
         .into('login')
         .then(loginEmail=>{
            trx('users').insert({
                email: loginEmail[0],
                name: body.name,
                joined: new Date()
            }).then(response=>{
                res.json('success');
            }).catch(err=>{
                res.status(400).json('failed')
            });
         })
         .then(trx.commit)
         .catch(trx.rollback)
     })*/

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

//bcrypt.hash("bacon", null, null, function(err, hash) {
    // Store hash in your password DB.
//});

// Load hash from your password DB.
/*bcrypt.compare("bacon", hash, function(err, res) {
    // res == true
});
bcrypt.compare("veggies", hash, function(err, res) {
    // res = false
});*/


app.listen(3000,()=>{
    console.log('app is running on port 3000');
});



/*
-->  res=This is working
--> signin : POST = success/fail
--> register: POST = return user
--> profile/: userId--> get = user
--> image-->PUT (update the score of number of submitted)
*/