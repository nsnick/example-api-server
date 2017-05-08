# example api server in nodejs

create a file called config.js and add the following

```javascript
module.exports = { 
    'secret': 'bestsessiontokensecretever',
    'database': 'path/to/mongo/database',  
    'postDelayInSeconds': 180, //3 minute
    'commentDelayInSeconds': 60
};
```

npm start

