let express = require("express");
let morgan = require("morgan");
let bodyParser = require('body-parser');
let mongoose = require( "mongoose" );
let { PostList } = require('./blog-post-model');
const { DATABASE_URL, PORT } = require( './config' );

let app = express();
let jsonParser = bodyParser.json();
mongoose.Promise = global.Promise;

app.use(express.static('public'));
app.use(morgan("dev"));


app.get("/blog-posts", (req, res, next) => {
    PostList.get()
        .then( posts => {
            return res.status( 200 ).json (posts);
        })
        .catch( error => {
            res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
        });
});

app.get("/blog-post", (req, res, next) => {
    let author = req.query.author;
    if (! author) {
        res.statusMessage = "Missing author in params";
        return res.status(406).json({
            message: "Missing author in params",
            status: 406
        });
    }
    PostList.getByAuthor(author)
        .then(post => {
            if (post) {
                return res.status(200).json( {
                    message: "Success!",
                    status: 202,
                    post: post
                });
            } else {
                res.statusMessage = "Post not found in file "

                return res.status(404).json({
                    message : "Author not found",
                    message: 404
                })
            }
        })
        .catch( err => {
			res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
        });
});

app.post("/blog-posts", jsonParser, (req, res, next) => {
    let title = req.body.title;
    let content = req.body.content;
    let author = req.body.author;
    let publishDate = new Date(req.body.publishDate);

    if ( !title || !content || !author || !publishDate ) {
        return res.status(406).json({
            message: "Missing data",
            status: 406
        });
    }

    let newPost = {
        title: title,
        content: content,
        author: author,
        publishDate: publishDate,
    }

    PostList.post(newPost)
        .then(post => {
            return res.status(200).json({
                message: "Posted!",
                status:201,
                post: post
            });
        })
        .catch( err => {
			res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
        });
});

app.delete("/blog-posts/:id", (req, res, next) => {
    let id = req.params.id;

    PostList.delete(id)
        .then(post => {
            return res.status(200).json({
                message: "Deleted!",
                status:200
            });
        })
        .catch( err => {
			res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
        });
});


app.put("/blog-posts/:id", jsonParser, (req, res, next) => {
    let paramId = req.params.id;
    let id = req.body._id;

    if (!id) {
        return res.status(406).json({
            message: "Missing id in body",
            status: 406
        });
    }
    if (id != paramId) {
        return res.status(409).json({
            message: "Ids do not match",
            status: 409
        })
    }

    let newPost = req.body;

    PostList.put(newPost)
        .then(post => {
            return res.status(200).json({
                message: "Updated!",
                status:200,
                post: post
            });
        })
        .catch( err => {
			res.statusMessage = "Something went wrong with the DB. Try again later.";
			return res.status( 500 ).json({
				status : 500,
				message : "Something went wrong with the DB. Try again later."
			})
        });
});


let server;

function runServer(port, databaseUrl){
	return new Promise( (resolve, reject ) => {
		mongoose.connect(databaseUrl, response => {
			if ( response ){
				return reject(response);
			}
			else{
				server = app.listen(port, () => {
					console.log( "App is running on port " + port );
					resolve();
				})
				.on( 'error', err => {
					mongoose.disconnect();
					return reject(err);
				})
			}
		});
	});
}

function closeServer(){
	return mongoose.disconnect()
		.then(() => {
			return new Promise((resolve, reject) => {
				console.log('Closing the server');
				server.close( err => {
					if (err){
						return reject(err);
					}
					else{
						resolve();
					}
				});
			});
		});
}

runServer( PORT, DATABASE_URL )
	.catch( err => {
		console.log( err );
	});

module.exports = { app, runServer, closeServer };