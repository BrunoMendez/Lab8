let mongoose = require('mongoose');

mongoose.Promise = global.Promise;

let postSchema = mongoose.Schema({
	title : { type : String },
	content : { type : String },
    author : { type : String },
    publishDate : {type : Date }
});

let Post = mongoose.model( 'Post', postSchema );


let PostList = {
	get : function(){
		return Post.find()
				.then( posts => {
					return posts;
				})
				.catch( error => {
					throw Error( error );
				});
	},
	getByAuthor : function(author){
		return Post.findOne({author : author})
			.then(post => {
				return post;
			})
			.catch( error => {
				throw Error( error );
			});

    },
    delete : function (id) {
        return Post.remove({_id: id})
            .then(post => {
                return post;
            })
            .catch (error => {
                throw Error(error);
            });
    },
	post : function( newPost ){
		return Post.create( newPost )
				.then( post => {
					return post;
				})
				.catch( error => {
					throw Error(error);
				});
	},
	put : function( updatedPost ){
		return PostList.getByID( updatedPost._id )
			.then( post => {
				if ( post ){
					return Post.findOneAndUpdate( {_id : post._id}, {$set : updatedPost}, {new : true})
						.then( newPost => {
							return newPost;
						})
						.catch(error => {
							throw Error(error);
						});
				}
				else{
					throw Error( "404" );
				}
			})
			.catch( error => {
				throw Error(error);
			});
	}
};


module.exports = { PostList };


