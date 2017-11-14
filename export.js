let db = require('./db_config');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let User = require('./models/user');
let Business = require('./models/business');
let Review = require('./models/review')
let dataSource = [{
        file_name: "Las_Vegas-Hotels_reviews.json",
        name: 'review',
        model: Review,
        category_id: '1'
    },
    {
        file_name: "Las_Vegas-Hotels_businesses.json",
        name: 'business',
        model: Business,
        category_id: '1'
    },
    {
        file_name: "Las_Vegas-Hotels_users.json",
        name: 'user',
        model: User,
        category_id: '1'
    },
    {
        file_name: "Las_Vegas-Food_reviews.json",
        name: 'review',
        model: Review,
        category_id: '2'
    },
    {
        file_name: "Las_Vegas-Food_businesses.json",
        name: 'business',
        model: Business,
        category_id: '2'

    },
    {
        file_name: "Las_Vegas-food_users.json",
        name: 'user',
        model: User,
        category_id: '2'
    }

]




var options = {
    useMongoClient: true
};
var connectionString = `mongodb://${db.username}:${db.password}@${db.url}:${db.port}/${db.db_name}?authSource=admin`

let fs = require('fs')
var StreamArray = require("stream-json/utils/StreamArray");
mongoose.connect(connectionString, options)
    .then((db) => {
        dataSource.forEach((source) => {
            console.log(source.file_name + " export start");
            startExport(source, (err, status) => {
                console.log(source.file_name + " export end ===> ");
                console.log(status);
            });
        })
    })
    .catch((err) => {
        console.log(err);
    });

startExport = (source, next) => {
    var stream = StreamArray.make();
    let objects = 0;
    stream.output.on("data", (object) => {
        ++objects;
        let entity = object.value;
        entity['_id'] = entity[`${source.name}_id`];
        entity['category_id'] = source.category_id;
        delete entity[`${source.name}_id`]
        instance = new source.model(entity)
        instance.save((err, res) => {
            if (err) {

                // console.log('error', err, res);
            } else {
                console.log("new", instance)
            }
        })
    });
    stream.output.on('end', () => {
        console.log("found:", objects);
        next(null, {
            "saved ": objects
        });
    })
    fs.createReadStream(`./Yelp Las Vegas/${source.file_name}`).pipe(stream.input);

}